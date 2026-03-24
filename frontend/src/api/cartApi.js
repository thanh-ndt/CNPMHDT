import api from './axiosConfig';

export const cartApi = {
    getCart: async (customerEmail) => {
        // GET requires params to send query string data
        const response = await api.get(`/cart`, { params: { customerEmail } });
        return response.data;
    },
    addItem: async (data) => {
        const response = await api.post('/cart/add', data);
        return response.data;
    },
    updateQuantity: async (data) => {
        const response = await api.put('/cart/update', data);
        return response.data;
    },
    removeItem: async (data) => {
        const response = await api.post('/cart/remove', data);
        return response.data;
    },
    clearCart: async (customerEmail) => {
        const response = await api.post('/cart/clear', { customerEmail });
        return response.data;
    }
};
