import api from '../api/axios';

export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.patch('/users/profile', data);
        return response.data;
    },
    uploadAvatar: async (formData) => {
        const response = await api.patch('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deleteAvatar: async () => {
        const response = await api.delete('/users/avatar');
        return response.data;
    },
    changePassword: async (data) => {
        const response = await api.patch('/auth/change-password', data);
        return response.data;
    }
};
