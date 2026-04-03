const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const User = require('../models/User');

// POST /api/reviews — Tạo đánh giá
const createReview = async (req, res) => {
    try {
        const { email, orderId, vehicleId, rating, comment } = req.body;

        if (!email || !orderId || !vehicleId || !rating) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra đơn hàng đã giao
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá đơn hàng đã giao' });
        }

        // Kiểm tra sản phẩm có trong đơn không
        const orderDetail = await OrderDetail.findOne({ order: orderId, vehicle: vehicleId });
        if (!orderDetail) {
            return res.status(400).json({ success: false, message: 'Sản phẩm không thuộc đơn hàng này' });
        }

        // Kiểm tra đã đánh giá chưa
        const existing = await Review.findOne({ customer: user._id, vehicle: vehicleId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
        }

        const review = new Review({
            customer: user._id,
            vehicle: vehicleId,
            rating: parseInt(rating),
            comment: comment || ''
        });

        await review.save();

        res.status(201).json({ success: true, message: 'Đánh giá thành công!', data: review });
    } catch (error) {
        console.error('Lỗi createReview:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// GET /api/reviews/check?email=...&vehicleId=... — Kiểm tra đã đánh giá chưa
const checkReviewed = async (req, res) => {
    try {
        const { email, vehicleId } = req.query;

        if (!email || !vehicleId) {
            return res.status(400).json({ success: false, message: 'Thiếu email hoặc vehicleId' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: true, reviewed: false });
        }

        const existing = await Review.findOne({ customer: user._id, vehicle: vehicleId });
        res.json({ success: true, reviewed: !!existing, data: existing });
    } catch (error) {
        console.error('Lỗi checkReviewed:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// GET /api/reviews/vehicle/:vehicleId — Lấy đánh giá của xe
const getVehicleReviews = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json({ success: false, message: 'vehicleId không hợp lệ' });
        }

        const reviews = await Review.find({ vehicle: vehicleId })
            .populate('customer', 'fullName')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('Lỗi getVehicleReviews:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { createReview, checkReviewed, getVehicleReviews };
