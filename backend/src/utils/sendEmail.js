const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER) {
        console.log("-----------------------------------------------------");
        console.log("Mock Email Sending:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content:\n${html}`);
        console.log("-----------------------------------------------------");
        return;
    }

    console.log(`Đang khởi tạo gửi email qua Brevo tới: ${to}...`);

    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER, // Brevo Login Email
            pass: process.env.BREVO_API_KEY, // Brevo SMTP Key
        },
    });

    const mailOptions = {
        from: `"Web Bán Xe Máy" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email đã được gửi thành công tới: ${to}`);
        console.log(`Phản hồi từ Server: ${info.response}`);
    } catch (error) {
        console.error(`Lỗi thực tế khi Nodemailer gửi thư tới ${to}:`, error.message);
        throw error; // Ném lỗi để AuthController bắt được
    }
};

module.exports = sendEmail;
