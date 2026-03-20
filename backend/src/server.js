const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./congfig/db');

const app = express();

// Cấu hình CORS cho phép Frontend kết nối
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Cho phép gửi cookie, authorization headers
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Kết nối MongoDB
connectDB();

// Route kiểm tra server
app.get('/', (req, res) => {
  res.json({ message: 'API web bán xe máy đang hoạt động!' });
});

// TODO: Thêm các routes ở đây
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/vehicles', require('./routes/vehicleRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));

// Thêm Route địa chỉ
app.use('/api/addresses', require('./routes/addressRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});

module.exports = app;
