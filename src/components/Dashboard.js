import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dataService from '../utils/dataService';
import VacationRequestForm from './VacationRequestForm';

const Dashboard = () => {
    const { currentUser, getRemainingDays } = useAuth();
    const [remainingDays, setRemainingDays] = useState(0);
    const [userRequests, setUserRequests] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Cargar datos
    useEffect(() => {
        if (currentUser) {
            setRemainingDays(getRemainingDays());
            const requests = dataService.getUserVacationRequests(currentUser.id);
            setUserRequests(requests);
        }
    }, [currentUser, getRemainingDays, refreshTrigger]);

    // Manejar creación de nueva solicitud
    const handleRequestCreated = () => {
        // Actualizar datos
        setRefreshTrigger(prev => prev + 1);
    };

    // Formatear fechas para mostrar
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de Vacaciones</h1>
                <p className="mt-2 text-gray-600">
                    Gestiona tus días de vacaciones y solicita nuevos períodos.
                </p>
            </div>

            {/* Tarjeta informativa */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-lg font-medium text-gray-900">
                            Resumen de Vacaciones
                        </h2>
                        <p className="mt-1 text-gray-600">
                            Periodo: {new Date().getFullYear()}
                        </p>
                    </div>

                    <div className="flex flex-col items-center bg-blue-50 px-6 py-4 rounded-lg">
                        <span className="text-3xl font-bold text-blue-600">
                            {remainingDays}
                        </span>
                        <span className="text-sm text-gray-600">
                            días disponibles
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">
                        Tus solicitudes de vacaciones
                    </h3>

                    {userRequests.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Periodo
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Días
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {userRequests.map((request) => {
                                        // Calcular días laborables
                                        const start = new Date(request.startDate);
                                        const end = new Date(request.endDate);
                                        let workDays = 0;

                                        for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
                                            const dayOfWeek = day.getDay();
                                            if (dayOfWeek !== 0 && dayOfWeek !== 6) workDays++;
                                        }

                                        return (
                                            <tr key={request.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {workDays} días
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : request.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {request.status === 'approved'
                                                            ? 'Aprobada'
                                                            : request.status === 'rejected'
                                                                ? 'Rechazada'
                                                                : 'Pendiente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No tienes solicitudes de vacaciones.</p>
                    )}
                </div>
            </div>

            {/* Formulario de solicitud */}
            <VacationRequestForm onRequestCreated={handleRequestCreated} />
        </div>
    );
};

export default Dashboard;