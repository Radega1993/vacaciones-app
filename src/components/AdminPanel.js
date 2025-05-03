import React, { useState, useEffect } from 'react';
import dataService from '../utils/dataService';

const AdminPanel = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const requests = dataService.getPendingVacationRequests();
        setPendingRequests(requests);
    }, [refreshTrigger]);

    const handleApprove = (requestId) => {
        dataService.approveVacationRequest(requestId);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleReject = (requestId) => {
        dataService.rejectVacationRequest(requestId);
        setRefreshTrigger(prev => prev + 1);
    };

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
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="mt-2 text-gray-600">
                    Gestiona las solicitudes de vacaciones pendientes.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Solicitudes Pendientes
                    </h3>
                </div>
                <div className="border-t border-gray-200">
                    {pendingRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Periodo
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Días
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingRequests.map((request) => {
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
                                                    {request.userName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {workDays} días
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                                        >
                                                            Aprobar
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                                        >
                                                            Rechazar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-4 py-5 sm:p-6">
                            <p className="text-gray-500 italic">No hay solicitudes pendientes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel; 