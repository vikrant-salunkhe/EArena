import api from '../api/axios';

export const tournamentService = {
    getTournaments: async (params = {}) => {
        const response = await api.get('/tournaments', { params });
        return response.data;
    },

    getTournamentById: async (tournamentId) => {
        const response = await api.get(`/tournaments/${tournamentId}`);
        return response.data;
    },

    getMyTournaments: async () => {
        const response = await api.get('/tournaments/my-tournaments');
        return response.data;
    },

    createTournament: async (data) => {
        const response = await api.post('/tournaments', data);
        return response.data;
    },

    updateTournament: async (tournamentId, data) => {
        const response = await api.patch(`/tournaments/${tournamentId}`, data);
        return response.data;
    },

    deleteTournament: async (tournamentId) => {
        const response = await api.delete(`/tournaments/${tournamentId}`);
        return response.data;
    },

    publishTournament: async (tournamentId) => {
        const response = await api.patch(`/tournaments/${tournamentId}/publish`);
        return response.data;
    },

    startTournament: async (tournamentId) => {
        const response = await api.patch(`/tournaments/${tournamentId}/start`);
        return response.data;
    },

    endTournament: async (tournamentId) => {
        const response = await api.patch(`/tournaments/${tournamentId}/end`);
        return response.data;
    },

    cancelTournament: async (tournamentId) => {
        const response = await api.patch(`/tournaments/${tournamentId}/cancel`);
        return response.data;
    },

    uploadBanner: async (tournamentId, formData) => {
        const response = await api.patch(`/tournaments/${tournamentId}/banner`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
