import api from './axiosConfig';

export const reviewApi = {
    createReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    },
    checkReviewed: async (email, vehicleId) => {
        const response = await api.get('/reviews/check', { params: { email, vehicleId } });
        return response.data;
    },
    getVehicleReviews: async (vehicleId) => {
        const response = await api.get(`/reviews/vehicle/${vehicleId}`);
        return response.data;
    }
};
