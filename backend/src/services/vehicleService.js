const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
// Lớp Service: Chịu trách nhiệm toàn bộ logic xử lý dữ liệu và thuật toán với Model.

const fetchVehicles = async (query) => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      engine,
      page = 1,
      limit = 8,
      ids
    } = query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // ── Build Match Stage ──────────────────────────────────────
    const matchStage = {};

    // 0. Lọc trực tiếp theo danh sách IDs 
    if (ids) {
      const idsArray = ids.split(',').filter(Boolean);
      matchStage._id = { $in: idsArray.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // 1. Tìm kiếm theo tên xe
    if (search) {
      matchStage.name = { $regex: search, $options: 'i' };
    }

    // 2. Lọc theo loại xe
    if (category && category !== 'all') {
      const categories = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        matchStage.category = { $in: categories };
      }
    }

    // 3. Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = parseInt(minPrice, 10);
      if (maxPrice) matchStage.price.$lte = parseInt(maxPrice, 10);
    }

    // 4. Lọc theo phân khối (Heuristic 100 triệu)
    if (engine === 'small') {
      matchStage.price = matchStage.price || {};
      matchStage.price.$lte = matchStage.price.$lte ? Math.min(matchStage.price.$lte, 100000000) : 100000000;
    } else if (engine === 'large') {
      matchStage.price = matchStage.price || {};
      matchStage.price.$gt = matchStage.price.$gt ? Math.max(matchStage.price.$gt, 100000000) : 100000000;
    }

    // ── Aggregation Pipeline ───────────────────────────────────
    const pipeline = [
      { $match: matchStage },
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

    return {
      data: populatedData,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalVehicles: total,
      }
    };
};

// Tìm kiếm danh sách gợi ý 
const getVehicleDetails = async (keyword) => {
    if (!keyword || keyword.trim() === '') {
      return [];
    }

    const suggestions = await Vehicle.find(
      { name: { $regex: keyword.trim(), $options: 'i' } }
    )
    .select('name images formattedPrice price')
    .limit(5);

    const formattedSuggestions = suggestions.map(doc => doc.toJSON());
    return formattedSuggestions;
};

// Tăng số lượt yêu thích
const incrementFavorite = async (id) => {
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $inc: { favoritesCount: 1 } },
      { new: true }
    );
    return vehicle;
};

module.exports = {
  fetchVehicles,
  getVehicleDetails,
  incrementFavorite
};
