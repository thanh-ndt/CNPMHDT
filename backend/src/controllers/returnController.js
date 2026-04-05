const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const AdminNotification = require('../models/AdminNotification');

// POST /api/returns — Gửi yêu cầu trả hàng
const createReturnRequest = async (req, res) => {
    try {
        const { orderId, reason, description } = req.body;

        if (!orderId || !reason) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (orderId, reason)' });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'ID đơn hàng không hợp lệ' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể yêu cầu trả hàng với đơn hàng đã giao' });
        }

        // Kiểm tra nếu đã có yêu cầu trả hàng cho đơn này rồi
        const existing = await ReturnRequest.findOne({ order: orderId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Đơn hàng này đã có yêu cầu trả hàng trước đó' });
        }

        const fullReason = description ? `${reason}: ${description}` : reason;

        const returnRequest = new ReturnRequest({
            order: orderId,
            reason: fullReason,
            status: 'pending'
        });

        await returnRequest.save();

        // Tạo thông báo cho Admin
        const notification = new AdminNotification({
            title: 'Yêu cầu trả hàng',
            message: `Có yêu cầu trả hàng cho đơn ${orderId.toString().slice(-6)}. Lý do: ${reason}`,
            type: 'RETURN',
            link: '/admin/orders'
        });
        await notification.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('new_admin_notification', notification);
        }

        res.status(201).json({
            success: true,
            message: 'Đã gửi yêu cầu trả hàng thành công. Chúng tôi sẽ liên hệ trong 1-3 ngày làm việc.',
            data: returnRequest
        });
    } catch (error) {
        console.error('Lỗi createReturnRequest:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// GET /api/returns/order/:orderId — Kiểm tra trạng thái yêu cầu của 1 đơn
const getReturnByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'ID đơn hàng không hợp lệ' });
        }

        const returnRequest = await ReturnRequest.findOne({ order: orderId });
        if (!returnRequest) {
            return res.status(404).json({ success: false, message: 'Chưa có yêu cầu trả hàng cho đơn này' });
        }

        res.json({ success: true, data: returnRequest });
    } catch (error) {
        console.error('Lỗi getReturnByOrderId:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { createReturnRequest, getReturnByOrderId };
