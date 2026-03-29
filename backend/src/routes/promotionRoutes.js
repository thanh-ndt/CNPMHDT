const express = require('express');
const router = express.Router();
const {
    createPromotion,
    getAllPromotions,
    getActivePromotions,
    updatePromotion,
    deletePromotion,
    validatePromotion
} = require('../controllers/promotionController');

// Quản lý bởi Admin (Cần thêm middleware protect/adminOnly nếu có, hiện tại đang mở)
router.post('/', createPromotion);
router.get('/all', getAllPromotions);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

// Dành cho Client
router.get('/active', getActivePromotions);
router.post('/validate', validatePromotion);

module.exports = router;
