const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cartController')

// GET giỏ hàng
router.get('/', cartController.getCart)

// Thêm xe vào giỏ
router.post('/items', cartController.addCartItem)

// Cập nhật số lượng xe trong giỏ
router.put('/items/:vehicleId', cartController.updateCartItemQuantity)

// Xóa 1 xe khỏi giỏ
router.delete('/items/:vehicleId', cartController.removeCartItem)

// Xóa toàn bộ giỏ
router.delete('/', cartController.clearCart)

module.exports = router

