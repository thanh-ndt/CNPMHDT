const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./congfig/db');

const app = express();
const http = require('http');
const server = http.createServer(app);
const setupSocket = require('./socket');
app.use(cors({
  origin: 'http://localhost:5173',
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

// Setup Socket.IO Server
setupSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT} (Có tích hợp Socket.io)`);
});

module.exports = app;
