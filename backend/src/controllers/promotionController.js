const Promotion = require('../models/Promotion');
const mongoose = require('mongoose');

// ========================
// ADMIN: TẠO KHUYẾN MÃI MỚI
// ========================
const createPromotion = async (req, res) => {
    try {
        const { code, discountValue, type, validFrom, validTo, description, applicableModels } = req.body;

        if (!code || !discountValue || !type || !validFrom || !validTo) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        const existingPromo = await Promotion.findOne({ code: code.toUpperCase() });
        if (existingPromo) {
            return res.status(400).json({ success: false, message: 'Mã khuyến mãi này đã tồn tại' });
        }

        const newPromotion = new Promotion({
            code: code.toUpperCase(),
            discountValue,
            type,
            validFrom,
            validTo,
            description,
            applicableModels: applicableModels || [],
        });

        await newPromotion.save();
        res.status(201).json({ success: true, message: 'Tạo khuyến mãi thành công', data: newPromotion });
    } catch (error) {
        console.error('Lỗi createPromotion:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo khuyến mãi' });
    }
};

// ========================
// LẤY TẤT CẢ KHUYẾN MÃI (ADMIN)
// ========================
const getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find().populate('applicableModels', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: promotions });
    } catch (error) {
        console.error('Lỗi getAllPromotions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========================
// LẤY KHUYẾN MÃI ĐANG HOẠT ĐỘNG (CLIENT)
// ========================
const getActivePromotions = async (req, res) => {
    try {
        const now = new Date();
        const promotions = await Promotion.find({
            isActive: true,
            validFrom: { $lte: now },
            validTo: { $gte: now }
        }).populate('applicableModels', 'name').sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: promotions });
    } catch (error) {
        console.error('Lỗi getActivePromotions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========================
// CẬP NHẬT KHUYẾN MÃI
// ========================
const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.code) updateData.code = updateData.code.toUpperCase();

        const updatedPromotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedPromotion) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
        }

        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedPromotion });
    } catch (error) {
        console.error('Lỗi updatePromotion:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========================
// XÓA KHUYẾN MÃI
// ========================
const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Promotion.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
        }
        res.status(200).json({ success: true, message: 'Xóa khuyến mãi thành công' });
    } catch (error) {
        console.error('Lỗi deletePromotion:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========================
// KIỂM TRA MÃ KHUYẾN MÃI (CLIENT CHECKOUT)
// ========================
const validatePromotion = async (req, res) => {
    try {
        const { code, vehicleModelIds } = req.body; // vehicleModelIds is array of IDs in current checkout
        if (!code) {
            return res.status(400).json({ success: false, message: 'Thiếu mã khuyến mãi' });
        }

        const now = new Date();
        const promo = await Promotion.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: now },
            validTo: { $gte: now }
        });

        if (!promo) {
            return res.status(400).json({ success: false, message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn' });
        }

        // Kiểm tra xem mã có áp dụng cho bất kỳ xe nào trong giỏ hàng không
        if (promo.applicableModels && promo.applicableModels.length > 0) {
            const isApplicable = vehicleModelIds.some(id => 
                promo.applicableModels.some(promoModelId => promoModelId.toString() === id.toString())
            );

            if (!isApplicable) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Mã này không áp dụng cho các dòng xe bạn đã chọn' 
                });
            }
        }

        res.status(200).json({ 
            success: true, 
            message: 'Áp dụng mã thành công', 
            data: {
                id: promo._id,
                discountValue: promo.discountValue,
                type: promo.type
            }
        });

    } catch (error) {
        console.error('Lỗi validatePromotion:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    createPromotion,
    getAllPromotions,
    getActivePromotions,
    updatePromotion,
    deletePromotion,
    validatePromotion
};
