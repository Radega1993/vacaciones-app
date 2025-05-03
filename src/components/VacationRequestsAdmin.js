import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dataService from '../utils/dataService';

const VacationRequestsAdmin = () => {
    const { currentUser } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (currentUser?.isAdmin) {
            loadPendingRequests();
        }
    }, [currentUser]);

    const loadPendingRequests = () => {
        const requests = dataService.getPendingRequests();
        setPendingRequests(requests);
    };

    const handleValidation = async (requestId, status) => {
        const result = dataService.validateVacationRequest(requestId, status, currentUser.id);
        setMessage(result.message);
        setIsSuccess(result.success);
        if (result.success) {
            loadPendingRequests();
        }
    };

    if (!currentUser?.isAdmin) {
        return <div className="p-4 text-red-600">No tienes permisos de administrador</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Gestión de Solicitudes de Vacaciones</h2>

            {message && (
                <div className={`p-4 mb-4 rounded ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            {pendingRequests.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No hay solicitudes pendientes</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingRequests.map(request => (
                        <div key={request.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold">{request.name}</h3>
                                    <p className="text-gray-600">{request.username}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleValidation(request.id, 'approved')}
                                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleValidation(request.id, 'rejected')}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VacationRequestsAdmin; 