const vehicleService = require('../services/vehicleService');

// Lớp Controller: "Skinny Controller" chỉ làm nhiệm vụ nhận Request và trả Response.

const getVehicles = async (req, res) => {
  try {
    const result = await vehicleService.fetchVehicles(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách xe:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const data = await vehicleService.getVehicleDetails(req.query.keyword);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const vehicle = await vehicleService.incrementFavorite(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }

    res.status(200).json({
      success: true,
      favoritesCount: vehicle.favoritesCount
    });
  } catch (error) {
    console.error('Lỗi khi tăng lượt yêu thích:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getVehicles,
  getSuggestions,
  toggleFavorite,
};
