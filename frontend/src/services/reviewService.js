import api from '../api/axiosConfig';

/**
 * Review service - wraps backend /api/reviews endpoints.
 */
export const reviewService = {
    /**
     * Create a new review for a vehicle.
     * @param {Object} data - { email, orderId, vehicleId, rating, comment }
     */
    createReview: async (data) => {
        try {
            const response = await api.post('/reviews', data);
            return response.data;
        } catch (error) {
            console.error('reviewService.createReview error:', error);
            return error.response?.data || { success: false, message: 'Lỗi khi gửi đánh giá.' };
        }
    },

    /**
     * Check if a user has already reviewed a vehicle.
     * @param {string} email
     * @param {string} vehicleId
     */
    checkReviewed: async (email, vehicleId) => {
        try {
            const response = await api.get('/reviews/check', { params: { email, vehicleId } });
            return response.data;
        } catch (error) {
            console.error('reviewService.checkReviewed error:', error);
            return { success: false, reviewed: false };
        }
    },

    /**
     * Fetch all reviews for a specific vehicle.
     * @param {string} vehicleId
     */
    getVehicleReviews: async (vehicleId) => {
        try {
            const response = await api.get(`/reviews/vehicle/${vehicleId}`);
            return response.data;
        } catch (error) {
            console.error('reviewService.getVehicleReviews error:', error);
            return { success: false, data: [] };
        }
    }
};
