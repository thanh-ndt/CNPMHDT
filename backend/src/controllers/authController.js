const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Tạo JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// ========================
// ĐĂNG KÝ
// ========================
const register = async (req, res) => {
    try {
        const { email, password, fullName, phoneNumber, dob } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
        }

        // Kiểm tra email tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Chuẩn bị dữ liệu user (Mặc định xác thực email là true để bypass)
        const userData = {
            email,
            password: hashedPassword,
            fullName,
            phoneNumber,
            isEmailVerified: true,
        };

        if (dob && dob.trim() !== '') {
            userData.dob = dob;
        }

        console.log(`-------------------------------------------`);
        console.log(`ĐĂNG KÝ USER MỚI (Bypass OTP): ${email}`);
        console.log(`-------------------------------------------`);

        let user;
        try {
            user = await User.create(userData);
        } catch (dbError) {
            console.error('Lỗi khi lưu User vào DB:', dbError);
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.' });
        }

        res.status(201).json({
            message: 'Đăng ký thành công! Tài khoản của bạn đã được tự động kích hoạt.',
        });
    } catch (error) {
        console.log("ERROR:", error);
        console.error('Lỗi hệ thống đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng ký. Vui lòng thử lại sau.' });
    }
};

// ========================
// XÁC THỰC EMAIL BẰNG OTP
// ========================
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP.' });
        }

        const user = await User.findOne({ email, emailVerifyToken: otp });
        if (!user) {
            return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
        }

        user.isEmailVerified = true;
        user.emailVerifyToken = undefined;
        await user.save();

        res.json({ message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.' });
    } catch (error) {
        console.error('Lỗi xác thực email:', error);
        res.status(500).json({ message: 'Lỗi server khi xác thực email.' });
    }
};

// ========================
// ĐĂNG NHẬP
// ========================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        if (!user.isEmailVerified) {
            return res.status(401).json({ message: 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                role: user.role,
                avatar: user.avatar,
                dob: user.dob,
            },
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};

// ========================
// ĐĂNG XUẤT
// ========================
const logout = (req, res) => {
    res.json({ message: 'Đăng xuất thành công!' });
};

// ========================
// QUÊN MẬT KHẨU
// ========================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập địa chỉ email.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Không tiết lộ email có tồn tại hay không
            return res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 giờ
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendEmail({
            to: email,
            subject: 'Đặt lại mật khẩu - Web Bán Xe Máy',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${user.fullName || user.email}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tiếp tục:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
            Đặt Lại Mật Khẩu
          </a>
          <p>Link này có hiệu lực trong <strong>1 giờ</strong>.</p>
          <p>Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu của bạn vẫn an toàn.</p>
        </div>
      `,
        });

        res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' });
    } catch (error) {
        console.error('Lỗi quên mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại.' });
    }
};

// ========================
// ĐẶT LẠI MẬT KHẨU
// ========================
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.' });
    } catch (error) {
        console.error('Lỗi đặt lại mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại.' });
    }
};

module.exports = { register, verifyEmail, login, logout, forgotPassword, resetPassword };
