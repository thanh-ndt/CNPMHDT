import api from './axiosConfig';

export const returnApi = {
    createReturnRequest: async (data) => {
        const response = await api.post('/returns', data);
        return response.data;
    },
    getReturnByOrderId: async (orderId) => {
        const response = await api.get(`/returns/order/${orderId}`);
        return response.data;
    }
};
