const express = require('express');
const router = express.Router();
const addressController = require('../controllers/AddressController');

// Đảm bảo bạn có middleware import ở đây nếu dự án dùng xác thực JWT
// const { protect } = require('../middleware/authMiddleware');

// Route thêm địa chỉ mới (Thực tế nên có middleware verify token: router.post('/', protect, addressController.createAddress))
router.post('/', addressController.createAddress);

// Route lấy danh sách địa chỉ của khách hàng cụ thể
router.get('/:customerId', addressController.getAddressesByCustomer);

module.exports = router;
