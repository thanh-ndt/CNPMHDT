import api from './axiosConfig';

export const orderApi = {
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    }
};
