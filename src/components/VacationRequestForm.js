import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Calendar from './Calendar';
import dataService from '../utils/dataService';

const VacationRequestForm = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleDateSelect = (date) => {
        if (!selectedStartDate) {
            setSelectedStartDate(date);
            setSelectedEndDate(null);
        } else if (!selectedEndDate) {
            if (date < selectedStartDate) {
                setSelectedStartDate(date);
                setSelectedEndDate(null);
            } else {
                setSelectedEndDate(date);
            }
        } else {
            setSelectedStartDate(date);
            setSelectedEndDate(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedStartDate || !selectedEndDate) {
            setError('Por favor, selecciona un rango de fechas');
            return;
        }

        // Verificar que las fechas no sean en el pasado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedStartDate < today) {
            setError('No puedes solicitar vacaciones para fechas pasadas');
            return;
        }

        // Verificar que no haya solicitudes existentes en ese rango
        const existingRequests = dataService.getAllVacationRequests();
        const hasConflict = existingRequests.some(request => {
            const requestStart = new Date(request.startDate);
            const requestEnd = new Date(request.endDate);
            return (
                (selectedStartDate >= requestStart && selectedStartDate <= requestEnd) ||
                (selectedEndDate >= requestStart && selectedEndDate <= requestEnd) ||
                (selectedStartDate <= requestStart && selectedEndDate >= requestEnd)
            );
        });

        if (hasConflict) {
            setError('Ya existe una solicitud de vacaciones en ese rango de fechas');
            return;
        }

        // Calcular días laborables
        const workDays = calculateWorkDays(selectedStartDate, selectedEndDate);

        // Verificar si el usuario tiene suficientes días disponibles
        const remainingDays = dataService.getRemainingVacationDays(currentUser.id);
        if (workDays > remainingDays) {
            setError(`No tienes suficientes días disponibles. Disponibles: ${remainingDays}, Necesarios: ${workDays}`);
            return;
        }

        // Crear la solicitud
        const newRequest = {
            userId: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            startDate: selectedStartDate.toISOString().split('T')[0],
            endDate: selectedEndDate.toISOString().split('T')[0],
            status: 'pending'
        };

        dataService.createVacationRequest(newRequest);
        setSuccess('Solicitud de vacaciones creada correctamente');
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    };

    const calculateWorkDays = (start, end) => {
        let count = 0;
        const curDate = new Date(start);
        while (curDate <= end) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Solicitar Vacaciones</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <Calendar
                    onDateSelect={handleDateSelect}
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                />

                <div className="mt-6">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Enviar Solicitud
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VacationRequestForm;