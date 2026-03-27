const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');

// POST /api/orders (tạo đơn hàng)
router.post('/', createOrder);

// GET /api/orders/my-orders?email=...
router.get('/my-orders', getMyOrders);

// GET /api/orders/:id (chi tiết đơn hàng)
router.get('/:id', getOrderById);

// PUT /api/orders/:id/cancel (hủy đơn hàng)
router.put('/:id/cancel', cancelOrder);

module.exports = router;
