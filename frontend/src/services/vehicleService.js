import api from '../api/axiosConfig';

/**
 * Vehicle service — wraps backend GET /api/vehicles with query params.
 */
export const vehicleService = {
    /**
     * Fetch vehicles with optional filters.
     * @param {Object} params
     * @param {string}  [params.search]
     * @param {string}  [params.category]   comma-separated categories
     * @param {number}  [params.minPrice]
     * @param {number}  [params.maxPrice]
     * @param {string}  [params.engine]     'small' | 'large'
     * @param {number}  [params.page]       default 1
     * @param {number}  [params.limit]      default 8
     * @param {string}  [params.ids]        comma-separated IDs (for compare)
     * @returns {Promise<{success: boolean, data: Array, pagination: Object}>}
     */
    fetchVehiclesData: async (params = {}) => {
        try {
            const query = {};
            if (params.search) query.search = params.search;
            if (params.category) query.category = params.category;
            if (params.minPrice) query.minPrice = params.minPrice;
            if (params.maxPrice) query.maxPrice = params.maxPrice;
            if (params.engine) query.engine = params.engine;
            if (params.page) query.page = params.page;
            if (params.limit) query.limit = params.limit;
            if (params.ids) query.ids = params.ids;

            const response = await api.get('/vehicles', { params: query });
            return response.data; // { success, data, pagination }
        } catch (error) {
            console.error('vehicleService.fetchVehiclesData error:', error);
            return { success: false, data: [], pagination: {} };
        }
    },

    /**
     * Fetch a single vehicle by ID
     * @param {string} id
     */
    getVehicleById: async (id) => {
        try {
            const response = await api.get(`/vehicles/${id}`);
            return response.data; // { success, data }
        } catch (error) {
            console.error('vehicleService.getVehicleById error:', error);
            return { success: false, data: null };
        }
    }
};
