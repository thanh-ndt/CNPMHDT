const express = require('express');
const router = express.Router();
const { getCart, addItem, updateQuantity, removeItem, clearCart } = require('../controllers/cartController');

router.get('/', getCart);
router.post('/add', addItem);
router.put('/update', updateQuantity);
router.post('/remove', removeItem);
router.post('/clear', clearCart);

module.exports = router;
