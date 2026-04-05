const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const http = require('http');
const server = http.createServer(app);
const setupSocket = require('./socket');
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://cnpmhdt.onrender.com',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Kết nối MongoDB
connectDB();

// Route kiểm tra server
app.get('/', (req, res) => {
  res.json({ message: 'API web bán xe máy đang hoạt động!' });
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

// Setup Socket.IO Server
const io = setupSocket(server);
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT} (Có tích hợp Socket.io)`);
});

module.exports = app;
