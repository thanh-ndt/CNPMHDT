/**
 * ═══════════════════════════════════════════════════════════════
 * VEHICLE SERVICE - DỊCH VỤ GỌI API TÌM KIẾM XE
 * ═══════════════════════════════════════════════════════════════
 * Service này xử lý việc gọi API backend liên quan đến xe
 * Bao gồm: Tìm kiếm, lọc, phân trang và lấy chi tiết xe
 * ═══════════════════════════════════════════════════════════════
 */

import api from '../api/axiosConfig';

export const vehicleService = {
    /**
     * ═══════════════════════════════════════════════════════════
     * HÀM TÌM KIẾM VÀ LỌC XE
     * ═══════════════════════════════════════════════════════════
     * Gọi API GET /api/vehicles với các tham số tìm kiếm
     * 
     * @param {Object} params - Các tham số tìm kiếm và lọc
     * @param {string}  [params.search]     - Từ khóa tìm kiếm theo tên xe
     * @param {string}  [params.category]   - Loại xe (có thể nhiều loại, phân cách bằng dấu phẩy)
     *                                        Ví dụ: "Xe ga,Xe số"
     * @param {number}  [params.minPrice]   - Giá tối thiểu (VNĐ)
     * @param {number}  [params.maxPrice]   - Giá tối đa (VNĐ)
     * @param {string}  [params.engine]     - Phân khối động cơ: 'small' (dưới 175cc) | 'large' (trên 175cc)
     * @param {string}  [params.brand]      - ID hãng xe
     * @param {number}  [params.page]       - Số trang (mặc định: 1)
     * @param {number}  [params.limit]      - Số xe mỗi trang (mặc định: 8)
     * @param {string}  [params.ids]        - Danh sách ID xe phân cách bằng dấu phẩy (dùng cho so sánh)
     * 
     * @returns {Promise<{success: boolean, data: Array, pagination: Object}>}
     * - success: Trạng thái thành công
     * - data: Mảng các xe tìm được
     * - pagination: Thông tin phân trang {currentPage, totalPages, totalVehicles}
     * ═══════════════════════════════════════════════════════════
     */
    fetchVehiclesData: async (params = {}) => {
        try {
            // Xây dựng object query parameters từ params đầu vào
            const query = {};
            if (params.search) query.search = params.search;
            if (params.category) query.category = params.category;
            if (params.minPrice) query.minPrice = params.minPrice;
            if (params.maxPrice) query.maxPrice = params.maxPrice;
            if (params.engine) query.engine = params.engine;
            if (params.page) query.page = params.page;
            if (params.limit) query.limit = params.limit;
            if (params.ids) query.ids = params.ids;
            if (params.brand) query.brand = params.brand;

            // Gọi API GET /api/vehicles với các query params
            const response = await api.get('/vehicles', { params: query });
            return response.data; // { success, data, pagination }
        } catch (error) {
            console.error('vehicleService.fetchVehiclesData error:', error);
            // Trả về object rỗng nếu có lỗi
            return { success: false, data: [], pagination: {} };
        }
    },

    /**
     * ═══════════════════════════════════════════════════════════
     * HÀM LẤY CHI TIẾT MỘT XE
     * ═══════════════════════════════════════════════════════════
     * Gọi API GET /api/vehicles/:id để lấy thông tin chi tiết 1 xe
     * 
     * @param {string} id - ID của xe cần lấy thông tin
     * @returns {Promise<{success: boolean, data: Object}>}
     * - success: Trạng thái thành công
     * - data: Thông tin chi tiết của xe (hoặc null nếu không tìm thấy)
     * ═══════════════════════════════════════════════════════════
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
