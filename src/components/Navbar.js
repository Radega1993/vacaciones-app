import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="hover:text-blue-200">
                        Dashboard
                    </Link>
                    <Link to="/request" className="hover:text-blue-200">
                        Solicitar Vacaciones
                    </Link>
                    {currentUser && currentUser.isAdmin && (
                        <Link to="/admin" className="hover:text-blue-200">
                            Panel de Administración
                        </Link>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">
                        {currentUser?.name}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;