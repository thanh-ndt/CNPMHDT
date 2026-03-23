const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
// Require để Mongoose đăng ký model cho populate
require('../models/VehicleModel');

// GET /api/vehicles - Lấy danh sách xe máy (có phân trang)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'available';
    let brandId = req.query.brand;
    const brandName = req.query.brandName;

    const filter = { status };
    if (brandName) {
      const brand = await Brand.findOne({ name: new RegExp(brandName, 'i') });
      if (brand) brandId = brand._id.toString();
    }
    if (brandId) filter.brand = brandId;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .populate('brand', 'name country')
        .populate('vehicleModel', 'name engineType fuelType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vehicle.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vehicles/:id - Lấy chi tiết xe
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('brand', 'name country description')
      .populate('vehicleModel', 'name engineType fuelType description')
      .lean();

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
