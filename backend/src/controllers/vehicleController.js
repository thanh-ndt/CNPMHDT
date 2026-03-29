const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
const VehicleModel = require('../models/VehicleModel');

const getVehicles = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      engine,
      brand,
      page = 1,
      limit = 8,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // ── Build Match Stage ──────────────────────────────────────
    const matchStage = { isPublished: true };

    // 0. Lọc trực tiếp theo danh sách IDs (Cho tính năng Compare)
    if (req.query.ids) {
      const idsArray = req.query.ids.split(',').filter(Boolean);
      matchStage._id = { $in: idsArray.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // 1. Tìm kiếm theo tên xe (case-insensitive)
    if (search) {
      matchStage.name = { $regex: search, $options: 'i' };
    }
    
    // 1.5 Lọc theo Hãng xe (Brand Object ID)
    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      matchStage.brand = new mongoose.Types.ObjectId(brand);
    }

    // 2. Lọc theo loại xe — dùng trường category, hỗ trợ nhiều loại (comma-separated)
    if (category && category !== 'all') {
      const categories = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        matchStage.category = { $in: categories };
      }
    }

    // 3. Lọc theo khoảng giá — $gte và $lte trên trường price
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = parseInt(minPrice, 10);
      if (maxPrice) matchStage.price.$lte = parseInt(maxPrice, 10);
    }

    // 4. Lọc theo phân khối — Dùng ngưỡng giá 100 triệu làm heuristic theo yêu cầu (do dữ liệu engineCapacity có thể chưa đủ)
    //    'small'  => Dưới 175cc (Quy ước: giá <= 100.000.000 VNĐ)
    //    'large'  => Trên 175cc (Quy ước: giá > 100.000.000 VNĐ)
    if (engine === 'small') {
      matchStage.price = matchStage.price || {};
      // Nếu đã có lọc maxPrice thì giữ min(100tr, maxPrice)
      matchStage.price.$lte = matchStage.price.$lte ? Math.min(matchStage.price.$lte, 100000000) : 100000000;
    } else if (engine === 'large') {
      matchStage.price = matchStage.price || {};
      // Nếu đã có lọc minPrice thì giữ max(100tr, minPrice)
      matchStage.price.$gt = matchStage.price.$gt ? Math.max(matchStage.price.$gt, 100000000) : 100000000;
    }

    // ── Aggregation Pipeline ───────────────────────────────────
    const pipeline = [
      { $match: matchStage },
      { $sort: { soldCount: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: (pageNumber - 1) * limitNumber },
            { $limit: limitNumber },
          ],
        },
      },
    ];

    const result = await Vehicle.aggregate(pipeline);

    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const rawData = result[0].data;

    // Hydrate để lấy virtual field formattedPrice và populate brand
    const hydratedData = rawData.map((doc) => Vehicle.hydrate(doc));
    await Vehicle.populate(hydratedData, { path: 'brand', select: 'name' });
    const populatedData = hydratedData.map((doc) => doc.toJSON());

    res.status(200).json({
      success: true,
      data: populatedData,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalVehicles: total,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách xe:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy gợi ý xe dựa trên từ khóa tìm kiếm (Autocomplete)
const getSuggestions = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(200).json({ success: true, data: [] });
    }

    // 1. Tìm kiếm tối đa 3 hãng xe khớp tên
    const brandMatches = await Brand.find(
      { name: { $regex: keyword.trim(), $options: 'i' } }
    ).limit(3);

    // 2. Tìm kiếm tối đa 5 xe khớp tên, không phân biệt hoa thường
    const vehicleMatches = await Vehicle.find(
      { 
        name: { $regex: keyword.trim(), $options: 'i' },
        isPublished: true 
      }
    )
    .select('name images formattedPrice price')
    .limit(5);

    // Chuyển đổi để có chứa virtual formattedPrice + gắn type
    const brandSuggestions = brandMatches.map(b => ({
      _id: b._id,
      name: b.name,
      images: b.logo ? [b.logo] : [],
      type: 'brand'
    }));

    const vehicleSuggestions = vehicleMatches.map(v => ({
      ...v.toJSON(),
      type: 'vehicle'
    }));

    res.status(200).json({
      success: true,
      data: [...brandSuggestions, ...vehicleSuggestions]
    });
  } catch (error) {
    console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Tăng số lượt yêu thích cho 1 xe
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $inc: { favoritesCount: 1 } },
      { new: true }
    );
    
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

// Lấy chi tiết 1 xe theo ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    const vehicle = await Vehicle.findOne({ _id: id, isPublished: true })
      .populate('brand', 'name')
      .populate('vehicleModel', 'name');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe hoặc xe đã bị ẩn' });
    }

    res.status(200).json({
      success: true,
      data: vehicle.toJSON() // toJSON gọi virtuals (để lấy formattedPrice)
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết xe:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách tất cả xe (dạng rút gọn ID + Name) để dùng cho dropdown/select
const getAllVehicleList = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isPublished: true })
      .select('name brand')
      .populate('brand', 'name')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách xe rút gọn:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  getSuggestions,
  toggleFavorite,
  getAllVehicleList,
};
