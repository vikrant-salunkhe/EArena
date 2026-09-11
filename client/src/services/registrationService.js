import api from '../api/axios';

export const registrationService = {
    registerTeam: async (data) => {
        const response = await api.post('/registrations', data);
        return response.data;
    },

    getRegistrations: async (params = {}) => {
        const response = await api.get('/registrations', { params });
        return response.data;
    },

    getMyRegistrations: async () => {
        const response = await api.get('/registrations/my-registrations');
        return response.data;
    },

    checkRegistrationStatus: async (tournamentId) => {
        const response = await api.get(`/registrations/check/${tournamentId}`);
        return response.data;
    },

    getRegistrationById: async (registrationId) => {
        const response = await api.get(`/registrations/${registrationId}`);
        return response.data;
    },

    updateRegistrationStatus: async (registrationId, data) => {
        const response = await api.patch(`/registrations/${registrationId}/status`, data);
        return response.data;
    },

    cancelRegistration: async (registrationId) => {
        const response = await api.delete(`/registrations/${registrationId}`);
        return response.data;
    }
};
