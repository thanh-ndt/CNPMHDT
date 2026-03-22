import { vehicleApi } from '../api/vehicleApi';

export const vehicleService = {
  // Lấy dữ liệu xe chung
  fetchVehiclesData: async (queryParams) => {
    try {
      const response = await vehicleApi.getVehicles(queryParams);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi fetch data xe:', error);
      throw error;
    }
  },

  // Lấy dữ liệu danh sách xe so sánh
  fetchCompareData: async (ids) => {
    try {
      const response = await vehicleApi.getVehiclesByIds(ids);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi fetch data so sánh:', error);
      throw error;
    }
  },

  // Lấy 1 xe duy nhất (do backend chưa có endpoint /:id nên lọc qua /vehicles)
  fetchVehicleById: async (id) => {
    try {
      const response = await vehicleApi.getVehicles({ page: 1, limit: 100 });
      if (response.data.success) {
        return response.data.data.find((v) => (v._id || v.id).toString() === id) || null;
      }
      return null;
    } catch (error) {
      console.error('Lỗi chi tiết xe:', error);
      throw error;
    }
  },

  // Thả tim
  toggleFavorite: async (id) => {
    const response = await vehicleApi.favoriteVehicle(id);
    return response.data;
  },

  // Logic lọc và tìm kiếm xe - Xử lý tính toán Param trước khi gọi API
  buildQueryParams: (currentPage, searchQuery, activeMainTab, selectedCategories, appliedMin, appliedMax, engineFilter) => {
    const queryParams = { page: currentPage, limit: 8 };
    if (searchQuery) queryParams.search = searchQuery;
    
    if (activeMainTab === 'xe-dien') {
      queryParams.category = 'Xe điện';
    } else {
      if (selectedCategories.length > 0) queryParams.category = selectedCategories.join(',');
      if (appliedMin) queryParams.minPrice = appliedMin;
      if (appliedMax) queryParams.maxPrice = appliedMax;
      if (engineFilter) queryParams.engine = engineFilter;
    }
    return queryParams;
  }
};
