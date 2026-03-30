const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');
const Cart = require('../models/Cart');
const User = require('../models/User');
const AdminNotification = require('../models/AdminNotification');
const Promotion = require('../models/Promotion');

const createOrder = async (req, res) => {
    try {
        const { customerEmail, shippingAddress, paymentMethod, orderItems, promotionId } = req.body;

        if (!customerEmail || !shippingAddress || !paymentMethod || !orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        // 1. Tìm User
        const user = await User.findOne({ email: customerEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        // 2. Tính tổng tiền và kiểm tra số lượng tồn kho
        let totalAmount = 0;
        const processedItems = [];

        for (const item of orderItems) {
            // Validate vehicleId format
            if (!item.vehicleId || !mongoose.Types.ObjectId.isValid(item.vehicleId)) {
                return res.status(400).json({ success: false, message: `ID sản phẩm không hợp lệ: ${item.vehicleId}` });
            }

            const vehicle = await Vehicle.findById(item.vehicleId);
            if (!vehicle) {
                return res.status(404).json({ success: false, message: `Sản phẩm không tồn tại (ID: ${item.vehicleId})` });
            }

            if (vehicle.stockQuantity < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Sản phẩm "${vehicle.name}" không đủ số lượng (Chỉ còn ${vehicle.stockQuantity})` 
                });
            }

            totalAmount += vehicle.price * item.quantity;
            processedItems.push({
                vehicle,
                quantity: item.quantity,
                unitPrice: vehicle.price
            });
        }

        // 2.5. Xử lý Khuyến mãi và Phí vận chuyển
        const shippingFee = 500000;
        let discountAmount = 0;
        let appliedPromotion = null;

        if (promotionId) {
            const promo = await Promotion.findById(promotionId);
            if (promo && promo.isActive) {
                appliedPromotion = promo._id;
                if (promo.type === 'fixed') {
                    discountAmount = promo.discountValue;
                } else if (promo.type === 'percentage') {
                    discountAmount = Math.round((totalAmount * promo.discountValue) / 100);
                }
            }
        }

        const finalAmount = Math.max(0, (totalAmount + shippingFee) - discountAmount);

        // 3. Tạo Order
        const newOrder = new Order({
            customer: user._id,
            totalAmount: finalAmount,
            shippingAddress,
            status: 'pending',
            promotion: appliedPromotion,
            shippingFee,
            discountAmount
        });
        await newOrder.save();

        // 4. Tạo OrderDetail và Cập nhật tồn kho (stockQuantity)
        for (const pItem of processedItems) {
            const orderDetail = new OrderDetail({
                order: newOrder._id,
                vehicle: pItem.vehicle._id,
                quantity: pItem.quantity,
                unitPrice: pItem.unitPrice
            });
            await orderDetail.save();

            // Trừ số lượng tồn kho
            pItem.vehicle.stockQuantity -= pItem.quantity;
            
            // Cập nhật trạng thái nếu hết hàng
            if (pItem.vehicle.stockQuantity === 0) {
                pItem.vehicle.status = 'out_of_stock';
            }
            
            await pItem.vehicle.save();
        }

        // 5. Tạo Payment
        let pMethodMapped = 'cash';
        if (paymentMethod === 'payment-card') pMethodMapped = 'credit_card';
        // mapping added as per current simple form design (radio ids to enum)

        const payment = new Payment({
            order: newOrder._id,
            amount: finalAmount,
            method: pMethodMapped,
            status: 'pending' // COD or wait for transaction
        });
        await payment.save();

        // 6. Xóa các sản phẩm đã mua khỏi giỏ hàng
        const cart = await Cart.findOne({ customer: user._id });
        if (cart) {
            const purchasedVehicleIds = processedItems.map(pi => pi.vehicle._id.toString());
            cart.items = cart.items.filter(item => !purchasedVehicleIds.includes(item.vehicle.toString()));
            cart.totalItems = cart.items.reduce((acc, curr) => acc + curr.quantity, 0);
            await cart.save();
        }

        // Tạo thông báo cho Admin
        const notification = new AdminNotification({
            title: 'Đơn hàng mới',
            message: `Khách hàng ${customerEmail} vừa đặt cấu hình mới với tổng ${totalAmount}đ`,
            type: 'ORDER',
            link: '/admin/orders'
        });
        await notification.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('new_admin_notification', notification);
        }

        return res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            data: {
                orderId: newOrder._id,
                totalAmount: finalAmount
            }
        });

    } catch (error) {
        console.error('Lỗi createOrder:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi đặt hàng', errorMsg: error.message, stack: error.stack });
    }
};

// ========================
// LẤY DANH SÁCH ĐƠN HÀNG CỦA USER
// ========================
const getMyOrders = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Thiếu email người dùng' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const orders = await Order.find({ customer: user._id }).sort({ orderDate: -1 });

        // Phụ thuộc vào cách frontend muốn hiển thị (hiện tại mock đang cần: id, date, total, status, items)
        // Lấy số lượng sản phẩm (items) bằng cách đếm OrderDetail
        const ordersWithItemCount = await Promise.all(orders.map(async (order) => {
            const details = await OrderDetail.find({ order: order._id });
            const itemsCount = details.reduce((acc, curr) => acc + curr.quantity, 0);
            
            return {
                id: order._id,
                date: order.orderDate,
                total: order.totalAmount,
                status: order.status,
                items: itemsCount
            };
        }));

        res.status(200).json({ success: true, data: ordersWithItemCount });
    } catch (error) {
        console.error('Lỗi getMyOrders:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========================
// LẤY CHI TIẾT 1 ĐƠN HÀNG
// ========================
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID đơn hàng không hợp lệ' });
        }

        const order = await Order.findById(id).populate('customer', 'fullName email phoneNumber');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const orderDetails = await OrderDetail.find({ order: id }).populate({
            path: 'vehicle',
            select: 'name images price category',
            populate: { path: 'brand', select: 'name' }
        });

        const payment = await Payment.findOne({ order: id });

        res.status(200).json({
            success: true,
            data: {
                order,
                items: orderDetails,
                payment
            }
        });
    } catch (error) {
        console.error('Lỗi getOrderById:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========================
// HỦY ĐƠN HÀNG
// ========================
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID đơn hàng không hợp lệ' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Chỉ cho phép hủy khi đang pending hoặc confirmed
        if (order.status !== 'pending' && order.status !== 'confirmed') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận hoặc đã xác nhận' });
        }

        order.status = 'cancelled';
        await order.save();

        // Hoàn lại số lượng tồn kho cho các sản phẩm trong đơn hàng
        const orderDetails = await OrderDetail.find({ order: id }).populate('vehicle');
        for (const detail of orderDetails) {
            if (detail.vehicle) {
                detail.vehicle.stockQuantity += detail.quantity;
                if (detail.vehicle.stockQuantity > 0 && detail.vehicle.status === 'out_of_stock') {
                    detail.vehicle.status = 'available';
                }
                await detail.vehicle.save();
            }
        }

        res.status(200).json({ success: true, message: 'Đã hủy đơn hàng và hoàn lại kho thành công' });
    } catch (error) {
        console.error('Lỗi cancelOrder:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi hủy đơn' });
    }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
