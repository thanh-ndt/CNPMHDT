const { Server } = require('socket.io');
const Message = require('./models/Message');
const ChatRoom = require('./models/ChatRoom');

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected to socket:', socket.id);

        // Khách hàng hoặc Owner join vào phòng chat
        socket.on('join_room', ({ roomId }) => {
            if (roomId) {
                socket.join(roomId);
                console.log(`Socket ${socket.id} joined room ${roomId}`);
            }
        });

        // Xử lý gửi tin nhắn
        socket.on('send_message', async ({ roomId, senderId, content }) => {
            if (!roomId || !senderId || !content) return;
            try {
                const newMessage = new Message({
                    chatRoom: roomId,
                    senderId,
                    content
                });
                await newMessage.save();

                // Lưu thay đổi update thời gian cho phòng chat để biết phòng nào mới có tin nhắn (tùy chọn)
                await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() });

                // Phát tin nhắn lại cho tất cả user đang trong room (bao gồm cả người gửi để xác nhận)
                io.to(roomId).emit('receive_message', newMessage);

            } catch (error) {
                console.error('Lỗi khi lưu tin nhắn socket:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = setupSocket;
