const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/notifications?email=... — Lấy thông báo của user
const getNotifications = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Thiếu email' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const notifications = await Notification.find({ owner: user._id })
            .sort({ sentDate: -1 })
            .limit(20);

        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Lỗi getNotifications:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// POST /api/notifications — Tạo thông báo cho user
const createNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        const notification = new Notification({
            owner: userId,
            title,
            message
        });

        await notification.save();
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        console.error('Lỗi createNotification:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// PUT /api/notifications/mark-read — Đánh dấu đã đọc (cập nhật thời gian đọc)
const markAllRead = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Thiếu email' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Update all unread notifications
        await Notification.updateMany(
            { owner: user._id, isRead: { $ne: true } },
            { $set: { isRead: true } }
        );

        res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (error) {
        console.error('Lỗi markAllRead:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { getNotifications, createNotification, markAllRead };
