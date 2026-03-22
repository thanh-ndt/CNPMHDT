const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');

// GET /api/brands - Lấy danh sách thương hiệu
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
