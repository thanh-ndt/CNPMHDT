const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');
const Cart = require('../models/Cart');
const User = require('../models/User');

const createOrder = async (req, res) => {
    try {
        const { customerEmail, shippingAddress, paymentMethod, orderItems } = req.body;

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

        // 3. Tạo Order
        const newOrder = new Order({
            customer: user._id,
            totalAmount,
            shippingAddress,
            status: 'pending' // Chờ xác nhận
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
            amount: totalAmount,
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

        return res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            data: {
                orderId: newOrder._id,
                totalAmount
            }
        });

    } catch (error) {
        console.error('Lỗi createOrder:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi đặt hàng', errorMsg: error.message, stack: error.stack });
    }
};

module.exports = { createOrder };
