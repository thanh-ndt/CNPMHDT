const express = require('express');
const router = express.Router();
const { createReview, checkReviewed, getVehicleReviews } = require('../controllers/reviewController');

// POST /api/reviews — Tạo đánh giá mới
router.post('/', createReview);

// GET /api/reviews/check?email=...&vehicleId=... — Kiểm tra đã đánh giá chưa
router.get('/check', checkReviewed);

// GET /api/reviews/vehicle/:vehicleId — Lấy đánh giá của xe
router.get('/vehicle/:vehicleId', getVehicleReviews);

module.exports = router;
