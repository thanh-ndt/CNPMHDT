const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAllRead } = require('../controllers/notificationController');

// GET /api/notifications?email=... — Lấy thông báo của user
router.get('/', getNotifications);

// POST /api/notifications — Tạo thông báo
router.post('/', createNotification);

// PUT /api/notifications/mark-read — Đánh dấu tất cả đã đọc
router.put('/mark-read', markAllRead);

module.exports = router;
