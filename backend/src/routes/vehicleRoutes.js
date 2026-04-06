/**
 * ═══════════════════════════════════════════════════════════════
 * VEHICLE ROUTES - ĐỊNH TUYẾN CHO TÍNH NĂNG TÌM KIẾM XE
 * ═══════════════════════════════════════════════════════════════
 * File này định nghĩa các API endpoints liên quan đến tìm kiếm xe
 * Base URL: /api/vehicles
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// ─────────────────────────────────────────────────────────────
// API GỢI Ý TÌM KIẾM (AUTOCOMPLETE)
// ─────────────────────────────────────────────────────────────
// GET /api/vehicles/suggestions?keyword=...
// Trả về gợi ý xe và hãng xe khi người dùng nhập từ khóa
router.get('/suggestions', vehicleController.getSuggestions);

// ─────────────────────────────────────────────────────────────
// API LẤY DANH SÁCH XE RÚT GỌN (CHO DROPDOWN)
// ─────────────────────────────────────────────────────────────
// GET /api/vehicles/all-list
// Trả về danh sách ID và tên xe, dùng cho dropdown select
router.get('/all-list', vehicleController.getAllVehicleList);

// ─────────────────────────────────────────────────────────────
// API TÌM KIẾM VÀ LỌC XE (CHÍNH)
// ─────────────────────────────────────────────────────────────
// GET /api/vehicles?search=...&category=...&minPrice=...&maxPrice=...
// Tìm kiếm xe theo nhiều tiêu chí với phân trang
router.get('/', vehicleController.getVehicles);

// ─────────────────────────────────────────────────────────────
// API LẤY CHI TIẾT MỘT XE
// ─────────────────────────────────────────────────────────────
// GET /api/vehicles/:id
// LƯU Ý: Route này phải đặt SAU các route có path cố định
// (như /suggestions, /all-list) để tránh conflict
router.get('/:id', vehicleController.getVehicleById);

// ─────────────────────────────────────────────────────────────
// API TĂNG SỐ LƯỢT YÊU THÍCH
// ─────────────────────────────────────────────────────────────
// PATCH /api/vehicles/:id/favorite
// Tăng số lượt yêu thích của xe
router.patch('/:id/favorite', vehicleController.toggleFavorite);

module.exports = router;
