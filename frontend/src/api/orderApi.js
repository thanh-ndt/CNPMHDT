import api from './axiosConfig';

export const orderApi = {
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },
    getMyOrders: async (email) => {
        const response = await api.get('/orders/my-orders', { params: { email } });
        return response.data;
    },
    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },
    // New functions for OrderHistory
    getOrdersByUserId: async (userId) => { // Assuming a new function to get orders by user ID
        const response = await api.get(`/orders/user/${userId}`);
        return response.data;
    },
    updateOrderStatus: async (orderId, statusData) => { // Assuming a new function to update order status
        const response = await api.put(`/orders/${orderId}/status`, statusData);
        return response.data;
    },
    cancelOrder: async (id) => {
        const response = await api.put(`/orders/${id}/cancel`);
        return response.data;
    }
};
