const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET  /api/users/profile  - Lấy thông tin cá nhân (yêu cầu đăng nhập)
router.get('/profile', protect, getProfile);

// PUT  /api/users/profile  - Cập nhật thông tin cá nhân (yêu cầu đăng nhập)
router.put('/profile', protect, updateProfile);

// PUT  /api/users/change-password  - Đổi mật khẩu (yêu cầu đăng nhập)
router.put('/change-password', protect, changePassword);

module.exports = router;
