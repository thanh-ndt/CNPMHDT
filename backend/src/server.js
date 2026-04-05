const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');


const app = express();
const http = require('http');
const server = http.createServer(app);
const setupSocket = require('./socket');
// CORS setup for multiple origins
const allowedOrigins = [
  'https://cnpmhdt.onrender.com',
  'https://sell-motorbikes.onrender.com',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Tăng giới hạn dữ liệu để upload ảnh đại diện (avatar)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));



// Route kiểm tra status API
app.get('/api/status', (req, res) => {
  res.json({ message: 'API web bán xe máy đang hoạt động!' });
});

// Route Health Check để debug 404
app.get('/api/check', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    message: 'Backend API is reachable at /api'
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/promotions', require('./routes/promotionRoutes'));
app.use('/api/vehicle-models', require('./routes/vehicleModelRoutes'));

// --- PHỤC VỤ FRONTEND ---
// 1. Phục vụ các file tĩnh (js, css, images) từ frontend/dist
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// 2. Catch-all: Trả về index.html cho tất cả các route không phải API
// Điều này giúp React Router hoạt động chính xác khi refresh trang
app.get('/*catchAll', (req, res, next) => {
  // Bỏ qua nếu là request API
  if (req.path.startsWith('/api')) {
    return next();
  }

  const indexPath = path.resolve(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('LỖI phục vụ index.html:', err);
      // Nếu không tìm thấy file build, trả về 404 thân thiện hơn
      if (process.env.NODE_ENV !== 'production') {
        res.status(404).send('Không tìm thấy frontend build. Hãy chạy "npm run build" ở thư mục frontend.');
      } else {
        res.status(404).end();
      }
    }
  });
});

// Setup Socket.IO Server
const io = setupSocket(server);
app.set('io', io);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi hệ thống không xác định.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();



    server.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT} (Có tích hợp Socket.io)`);
    });
  } catch (error) {
    console.error('Không thể khởi động server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
