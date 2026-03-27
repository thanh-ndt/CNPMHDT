const Cart = require('../models/Cart');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// Hàm Helper để format lại giỏ hàng trước khi response
const formatCartResponse = async (cart) => {
    if (!cart) return { items: [], totalItems: 0, totalPrice: 0 };
    
    await cart.populate({
        path: 'items.vehicle',
        populate: [
            { path: 'brand', select: 'name' },
            { path: 'vehicleModel', select: 'name' }
        ]
    });

    let totalPrice = 0;
    cart.items.forEach(item => {
        if (item.vehicle && item.vehicle.price) {
            totalPrice += item.vehicle.price * item.quantity;
        }
    });

    return {
        items: cart.items,
        totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0),
        totalPrice
    };
};

const getCart = async (req, res) => {
    try {
        const { customerEmail } = req.query;
        if (!customerEmail) return res.status(400).json({ success: false, message: 'Thiếu email khách hàng' });

        const user = await User.findOne({ email: customerEmail });
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

        const cart = await Cart.findOne({ customer: user._id });
        const formattedCart = await formatCartResponse(cart);

        res.json({ success: true, data: formattedCart });
    } catch (error) {
        console.error('Lỗi getCart:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const addItem = async (req, res) => {
    try {
        const { customerEmail, vehicleId, quantity = 1 } = req.body;
        
        if (!customerEmail || !vehicleId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin email hoặc ID xe' });
        }

        const user = await User.findOne({ email: customerEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại trên hệ thống' });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không còn tồn tại' });
        }

        let cart = await Cart.findOne({ customer: user._id });
        if (!cart) {
            cart = new Cart({ customer: user._id, items: [] });
        }

        // Đảm bảo so sánh string an toàn
        const strVehicleId = vehicle._id.toString();
        const itemIndex = cart.items.findIndex(item => {
            if (!item || !item.vehicle) return false;
            return item.vehicle.toString() === strVehicleId;
        });

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += Number(quantity);
        } else {
            cart.items.push({ vehicle: vehicle._id, quantity: Number(quantity) });
        }

        // Lọc bỏ rác nếu có
        cart.items = cart.items.filter(item => item && item.vehicle);
        cart.totalItems = cart.items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
        
        await cart.save();

        const formattedCart = await formatCartResponse(cart);
        res.json({ success: true, data: formattedCart });
    } catch (error) {
        console.error('Lỗi nghiêm trọng tại addItem:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thêm giỏ hàng', error: error.message });
    }
};

const updateQuantity = async (req, res) => {
    try {
        const { customerEmail, vehicleId, quantity } = req.body;
        if (!customerEmail || !vehicleId || quantity === undefined) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });

        const user = await User.findOne({ email: customerEmail });
        if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

        const cart = await Cart.findOne({ customer: user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng trống' });

        const itemIndex = cart.items.findIndex(item => item.vehicle.toString() === vehicleId);
        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
        } else {
            return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
        }

        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        await cart.save();

        const formattedCart = await formatCartResponse(cart);
        res.json({ success: true, data: formattedCart });
    } catch (error) {
        console.error('Lỗi updateQuantity:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const removeItem = async (req, res) => {
    try {
        const { customerEmail, vehicleId } = req.body;
        if (!customerEmail || !vehicleId) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });

        const user = await User.findOne({ email: customerEmail });
        if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

        const cart = await Cart.findOne({ customer: user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng trống' });

        cart.items = cart.items.filter(item => item.vehicle.toString() !== vehicleId);
        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        await cart.save();

        const formattedCart = await formatCartResponse(cart);
        res.json({ success: true, data: formattedCart });
    } catch (error) {
        console.error('Lỗi removeItem:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const clearCart = async (req, res) => {
    try {
        const { customerEmail } = req.body;
        if (!customerEmail) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });

        const user = await User.findOne({ email: customerEmail });
        if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

        const cart = await Cart.findOne({ customer: user._id });
        if (cart) {
            cart.items = [];
            cart.totalItems = 0;
            await cart.save();
        }

        res.json({ success: true, data: { items: [], totalItems: 0, totalPrice: 0 } });
    } catch (error) {
        console.error('Lỗi clearCart:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { getCart, addItem, updateQuantity, removeItem, clearCart };
