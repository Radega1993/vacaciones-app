import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dataService from '../utils/dataService';

const Calendar = ({ onDateSelect, selectedStartDate, selectedEndDate }) => {
    const { currentUser } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);
    const [vacationRequests, setVacationRequests] = useState([]);
    const [hoveredDate, setHoveredDate] = useState(null);

    useEffect(() => {
        const requests = dataService.getAllVacationRequests();
        setVacationRequests(requests);
    }, []);

    useEffect(() => {
        generateCalendarDays();
    }, [currentMonth, vacationRequests, selectedStartDate, selectedEndDate]);

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Rellenar días del mes anterior
        for (let i = 0; i < startingDay; i++) {
            const prevMonthDay = new Date(year, month, -i);
            days.push({
                date: prevMonthDay,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isOccupied: false,
                occupiedBy: null
            });
        }

        // Rellenar días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            const isToday = currentDate.toDateString() === new Date().toDateString();
            const isSelected = selectedStartDate && selectedEndDate &&
                currentDate >= selectedStartDate && currentDate <= selectedEndDate;

            // Verificar si el día está ocupado
            const occupiedRequest = vacationRequests.find(request => {
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);
                return currentDate >= startDate && currentDate <= endDate;
            });

            days.push({
                date: currentDate,
                isCurrentMonth: true,
                isToday,
                isSelected,
                isOccupied: !!occupiedRequest,
                occupiedBy: occupiedRequest ? occupiedRequest.name : null
            });
        }

        setCalendarDays(days);
    };

    const handleDateClick = (day) => {
        if (!day.isCurrentMonth) return;
        onDateSelect(day.date);
    };

    const handleDateHover = (day) => {
        if (!day.isCurrentMonth) return;
        setHoveredDate(day);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Anterior
                </button>
                <h2 className="text-xl font-semibold">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Siguiente
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center font-semibold py-2">
                        {day}
                    </div>
                ))}
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`
                            relative p-2 text-center cursor-pointer rounded
                            ${day.isCurrentMonth ? 'hover:bg-gray-100' : 'text-gray-400'}
                            ${day.isToday ? 'bg-blue-100' : ''}
                            ${day.isSelected ? 'bg-blue-500 text-white' : ''}
                            ${day.isOccupied ? 'bg-red-100' : ''}
                        `}
                        onClick={() => handleDateClick(day)}
                        onMouseEnter={() => handleDateHover(day)}
                        onMouseLeave={() => setHoveredDate(null)}
                    >
                        {day.date.getDate()}
                        {hoveredDate === day && day.isOccupied && (
                            <div className="absolute z-10 bg-gray-800 text-white p-2 rounded mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                Ocupado por: {day.occupiedBy}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;