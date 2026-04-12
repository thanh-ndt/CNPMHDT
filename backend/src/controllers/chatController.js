const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

// Lấy danh sách room chat của Owner
const getChatRooms = async (req, res) => {
    try {
        const { userId, role } = req.query;
        
        if (role === 'owner') {
            // Lấy tất cả phòng chat, hiển thị khách hàng tương ứng
            const rooms = await ChatRoom.find({ owner: userId })
                .populate('customer', 'fullName email avatar')
                .sort({ updatedAt: -1 });
            return res.json({ success: true, data: rooms });
        } else {
            // Nếu là customer bình thường, lấy phòng của họ
            const rooms = await ChatRoom.find({ customer: userId })
                .populate('owner', 'fullName email avatar')
                .sort({ updatedAt: -1 });
            return res.json({ success: true, data: rooms });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server getChatRooms' });
    }
};

// Lấy tin nhắn trong 1 room cụ thể
const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ chatRoom: roomId }).sort({ sendTime: 1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server getRoomMessages' });
    }
};

// Khách hàng cần tìm hoặc tạo phòng chat với Owner
const getCustomerRoomInfo = async (req, res) => {
    try {
        const { customerId } = req.params;
        // Tìm 1 admin bất kỳ trong hệ thống
        const owner = await User.findOne({ role: 'owner' });
        if (!owner) return res.status(404).json({ success: false, message: 'Hệ thống chưa có tài khoản Owner/Admin' });
        
        let room = await ChatRoom.findOne({ customer: customerId, owner: owner._id });
        if (!room) {
            room = new ChatRoom({ customer: customerId, owner: owner._id });
            await room.save();
        }
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server getCustomerRoomInfo' });
    }
}

module.exports = { getChatRooms, getRoomMessages, getCustomerRoomInfo };
