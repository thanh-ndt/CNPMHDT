const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ========================
// LẤY THÔNG TIN CÁ NHÂN
// ========================
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            '-password -emailVerifyToken -resetPasswordToken -resetPasswordExpires'
        );
        res.json(user);
    } catch (error) {
        console.error('Lỗi lấy profile:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

// ========================
// CẬP NHẬT THÔNG TIN CÁ NHÂN
// ========================
const updateProfile = async (req, res) => {
    try {
        const { fullName, phoneNumber, dob, avatar } = req.body;

        // Chuẩn bị dữ liệu cập nhật
        const updateData = { fullName, phoneNumber, avatar };
        
        // Nếu dob là chuỗi rỗng thì không cập nhật (tránh lỗi Mongoose Date)
        if (dob && dob.trim() !== '') {
            updateData.dob = dob;
        } else if (dob === '') {
            // Hoặc có thể đặt về null nếu muốn xóa ngày sinh
            updateData.dob = null;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -emailVerifyToken -resetPasswordToken -resetPasswordExpires');

        res.json({
            message: 'Cập nhật thông tin thành công!',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Lỗi cập nhật profile:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật hồ sơ.' });
    }
};

// ========================
// ĐỔI MẬT KHẨU
// ========================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

module.exports = { getProfile, updateProfile, changePassword };
