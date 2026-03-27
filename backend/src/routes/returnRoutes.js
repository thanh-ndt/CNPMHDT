const express = require('express');
const router = express.Router();
const { createReturnRequest, getReturnByOrderId } = require('../controllers/returnController');

// POST /api/returns — Gửi yêu cầu trả hàng
router.post('/', createReturnRequest);

// GET /api/returns/order/:orderId — Kiểm tra yêu cầu trả hàng theo đơn
router.get('/order/:orderId', getReturnByOrderId);

module.exports = router;
