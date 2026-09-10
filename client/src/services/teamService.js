import api from '../api/axios';

export const teamService = {
    getTeams: async (params = {}) => {
        const response = await api.get('/teams', { params });
        return response.data;
    },

    getTeamById: async (teamId) => {
        const response = await api.get(`/teams/${teamId}`);
        return response.data;
    },

    getMyTeam: async () => {
        const response = await api.get('/teams/my-team');
        return response.data;
    },

    createTeam: async (data) => {
        const response = await api.post('/teams', data);
        return response.data;
    },

    updateTeam: async (teamId, data) => {
        const response = await api.patch(`/teams/${teamId}`, data);
        return response.data;
    },

    deleteTeam: async (teamId) => {
        const response = await api.delete(`/teams/${teamId}`);
        return response.data;
    },

    joinByCode: async (joinCode) => {
        const response = await api.post('/teams/join', { joinCode });
        return response.data;
    },

    joinTeam: async (teamId) => {
        const response = await api.post(`/teams/${teamId}/join`);
        return response.data;
    },

    leaveTeam: async (teamId) => {
        const response = await api.post(`/teams/${teamId}/leave`);
        return response.data;
    },

    transferCaptain: async (teamId, newCaptainId) => {
        const response = await api.patch(`/teams/${teamId}/captain`, { newCaptainId });
        return response.data;
    },

    removeMember: async (teamId, userId) => {
        const response = await api.delete(`/teams/${teamId}/members/${userId}`);
        return response.data;
    },

    regenerateJoinCode: async (teamId) => {
        const response = await api.post(`/teams/${teamId}/join-code`);
        return response.data;
    },

    uploadLogo: async (teamId, formData) => {
        const response = await api.patch(`/teams/${teamId}/logo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getTeamStats: async (teamId) => {
        const response = await api.get(`/teams/${teamId}/dashboard`);
        return response.data;
    }
};
