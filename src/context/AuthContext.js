import React, { createContext, useContext, useState, useEffect } from 'react';
import dataService from '../utils/dataService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Inicializar datos
        dataService.initializeData();

        // Verificar si hay un usuario en localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        const user = dataService.loginUser(username, password);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const getRemainingDays = () => {
        if (!currentUser) return 0;
        return dataService.getRemainingVacationDays(currentUser.id);
    };

    const value = {
        currentUser,
        loading,
        login,
        logout,
        getRemainingDays
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;