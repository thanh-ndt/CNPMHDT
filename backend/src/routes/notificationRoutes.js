const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAllRead, markRead } = require('../controllers/notificationController');

// GET /api/notifications?email=... — Lấy thông báo của user
router.get('/', getNotifications);

// POST /api/notifications — Tạo thông báo
router.post('/', createNotification);

// PUT /api/notifications/mark-read — Đánh dấu tất cả đã đọc
router.put('/mark-read', markAllRead);

// PUT /api/notifications/:id/mark-read — Đánh dấu 1 thông báo là đã đọc
router.put('/:id/mark-read', markRead);

module.exports = router;
