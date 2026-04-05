const nodemailer = require('nodemailer');
const postmark = require('postmark');

/**
 * Gửi email sử dụng Nodemailer (SMTP) hoặc Postmark
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    const service = process.env.EMAIL_SERVICE || 'gmail'; // Mặc định là gmail nếu không cấu hình

    console.log(`Đang khởi tạo gửi email (${service}) tới: ${to}...`);

    try {
        if (service === 'postmark') {
            // Sử dụng Postmark API
            if (!process.env.POSTMARK_SERVER_TOKEN) {
                throw new Error("Thiếu POSTMARK_SERVER_TOKEN trong file .env");
            }
            const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
            const response = await client.sendEmail({
                "From": process.env.POSTMARK_FROM_EMAIL || "admin@cnpmhdt.com",
                "To": to,
                "Subject": subject,
                "HtmlBody": html,
                "MessageStream": "outbound"
            });
            console.log(`Email đã gửi thành công qua Postmark! MessageID: ${response.MessageID}`);
            return response;
        } else {
            // Sử dụng Nodemailer (Cho Brevo, Gmail, v.v.)
            let transporterConfig;

            if (service === 'brevo' || service === 'sendinblue') {
                transporterConfig = {
                    host: 'smtp-relay.brevo.com',
                    port: 587,
                    secure: false, // true for 465, false for 587
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                };
            } else if (service === 'gmail') {
                transporterConfig = {
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                };
            } else {
                // Cấu hình SMTP tùy chỉnh
                transporterConfig = {
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT || 587,
                    secure: process.env.EMAIL_PORT == 465,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                };
            }

            const transporter = nodemailer.createTransport(transporterConfig);

            const mailOptions = {
                from: process.env.POSTMARK_FROM_EMAIL || process.env.EMAIL_USER,
                to: to,
                subject: subject,
                html: html,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`Email đã gửi thành công qua ${service}! MessageID: ${info.messageId}`);
            return info;
        }
    } catch (error) {
        console.error(`Lỗi thực tế khi gửi thư tới ${to}:`, error.message);
        // Thêm gợi ý sửa lỗi nếu là lỗi Token của Postmark
        if (error.message.includes("Server token")) {
            console.error("Gợi ý: Kiểm tra lại POSTMARK_SERVER_TOKEN trong file .env hoặc chuyển sang dùng Brevo/Gmail.");
        }
        throw error;
    }
};

module.exports = sendEmail;

