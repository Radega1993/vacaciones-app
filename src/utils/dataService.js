// Simulación de servicio de datos usando localStorage para el MVP

const dataService = {
    // Inicializar datos
    initializeData: () => {
        if (!localStorage.getItem('users')) {
            fetch(process.env.PUBLIC_URL + '/data.json')
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('users', JSON.stringify(data.users));
                    localStorage.setItem('vacationRequests', JSON.stringify(data.vacationRequests));
                })
                .catch(error => console.error('Error al cargar datos iniciales:', error));
        }
    },

    // Obtener todos los usuarios
    getAllUsers: () => {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    },

    // Obtener un usuario por ID
    getUserById: (id) => {
        const users = dataService.getAllUsers();
        return users.find(user => user.id === id);
    },

    // Login de usuario
    loginUser: (username, password) => {
        const users = dataService.getAllUsers();
        return users.find(u => u.username === username && u.password === password) || null;
    },

    // Obtener todas las solicitudes de vacaciones
    getAllVacationRequests: () => {
        const requests = localStorage.getItem('vacationRequests');
        return requests ? JSON.parse(requests) : [];
    },

    // Obtener solicitudes pendientes
    getPendingVacationRequests: () => {
        const requests = dataService.getAllVacationRequests();
        return requests.filter(request => request.status === 'pending');
    },

    // Obtener solicitudes aprobadas
    getApprovedVacationRequests: () => {
        const requests = dataService.getAllVacationRequests();
        return requests.filter(request => request.status === 'approved');
    },

    // Crear una nueva solicitud de vacaciones
    createVacationRequest: (request) => {
        const requests = dataService.getAllVacationRequests();
        const newRequest = {
            ...request,
            id: Date.now().toString(),
            status: 'pending'
        };
        requests.push(newRequest);
        localStorage.setItem('vacationRequests', JSON.stringify(requests));
        return newRequest;
    },

    // Aprobar una solicitud de vacaciones
    approveVacationRequest: (requestId) => {
        const requests = dataService.getAllVacationRequests();
        const request = requests.find(r => r.id === requestId);
        if (request) {
            request.status = 'approved';
            localStorage.setItem('vacationRequests', JSON.stringify(requests));
            return request;
        }
        return null;
    },

    // Rechazar una solicitud de vacaciones
    rejectVacationRequest: (requestId) => {
        const requests = dataService.getAllVacationRequests();
        const request = requests.find(r => r.id === requestId);
        if (request) {
            request.status = 'rejected';
            localStorage.setItem('vacationRequests', JSON.stringify(requests));
            return request;
        }
        return null;
    },

    // Calcular días de vacaciones restantes
    getRemainingVacationDays: (userId) => {
        const user = dataService.getUserById(userId);
        if (!user) return 0;

        const approvedRequests = dataService.getAllVacationRequests().filter(
            request => request.userId === userId && request.status === 'approved'
        );

        const usedDays = approvedRequests.reduce((total, request) => {
            const start = new Date(request.startDate);
            const end = new Date(request.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return total + days;
        }, 0);

        return user.totalVacationDays - usedDays;
    },

    // Obtener solicitudes de vacaciones de un usuario
    getUserVacationRequests: (userId) => {
        const requests = dataService.getAllVacationRequests();
        return requests.filter(request => request.userId === userId);
    },

    // Obtener todas las solicitudes pendientes
    getPendingRequests: () => {
        const requests = dataService.getAllVacationRequests();
        return requests
            .filter(request => request.status === 'pending')
            .map(request => {
                const user = dataService.getUserById(request.userId);
                return {
                    ...request,
                    userName: user ? user.name : 'Usuario desconocido'
                };
            });
    },

    // Verificar si un día está solicitado y por quién
    checkDateAvailability: (date) => {
        const requests = dataService.getAllVacationRequests();
        const dateObj = new Date(date);

        // Array para almacenar usuarios que han solicitado esta fecha
        const usersWithRequests = [];

        requests.forEach(request => {
            const start = new Date(request.startDate);
            const end = new Date(request.endDate);

            if (dateObj >= start && dateObj <= end) {
                usersWithRequests.push({
                    userId: request.userId,
                    name: request.name,
                    username: request.username
                });
            }
        });

        return usersWithRequests;
    },

    // Validar una solicitud de vacaciones
    validateVacationRequest: (requestId, status, adminId) => {
        const requests = dataService.getAllVacationRequests();
        const request = requests.find(r => r.id === requestId);
        const admin = dataService.getUserById(adminId);

        if (!request) return { success: false, message: 'Solicitud no encontrada' };
        if (!admin || !admin.isAdmin) return { success: false, message: 'No tienes permisos de administrador' };
        if (request.status !== 'pending') return { success: false, message: 'La solicitud ya ha sido procesada' };

        // Actualizar el estado de la solicitud
        request.status = status;
        request.validatedBy = adminId;
        request.validationDate = new Date().toISOString();

        // Si se rechaza la solicitud, devolver los días usados al usuario
        if (status === 'rejected') {
            const user = dataService.getUserById(request.userId);
            if (user) {
                const start = new Date(request.startDate);
                const end = new Date(request.endDate);
                let workingDays = 0;

                for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
                    const dayOfWeek = day.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
                }

                user.usedVacationDays -= workingDays;
                const users = dataService.getAllUsers();
                const updatedUsers = users.map(u => u.id === user.id ? user : u);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
            }
        }

        localStorage.setItem('vacationRequests', JSON.stringify(requests));

        return {
            success: true,
            message: `Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`,
            request
        };
    }
};

export default dataService;