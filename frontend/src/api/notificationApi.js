import api from './axiosConfig';

export const notificationApi = {
    getNotifications: async (email) => {
        const response = await api.get('/notifications', { params: { email } });
        return response.data;
    },
    markAllRead: async (email) => {
        const response = await api.put('/notifications/mark-read', { email });
        return response.data;
    },
    markRead: async (id) => {
        const response = await api.put(`/notifications/${id}/mark-read`);
        return response.data;
    }
};
