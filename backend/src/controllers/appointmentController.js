const TestDriveAppointment = require('../models/TestDriveAppointment');
const AdminNotification = require('../models/AdminNotification');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const sendEmail = require('../utils/sendEmail');

const createAppointment = async (req, res) => {
    try {
        const { vehicle, appointmentDate, timeSlot, note, customerId, guestName, guestPhone, guestEmail } = req.body;
        
        if (!vehicle || !appointmentDate || !timeSlot) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        if (!customerId && (!guestName || !guestPhone)) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp thông tin liên hệ (Họ tên và Số điện thoại)' });
        }

        const newAppointment = new TestDriveAppointment({
            vehicle,
            appointmentDate,
            timeSlot,
            note,
            customer: customerId || undefined,
            guestName: !customerId ? guestName : undefined,
            guestPhone: !customerId ? guestPhone : undefined,
            guestEmail: !customerId ? guestEmail : undefined,
        });

        await newAppointment.save();

        // 🟢 Gửi Email xác nhận cho khách hàng
        try {
            let targetEmail = guestEmail;
            let targetName = guestName;

            if (customerId) {
                const user = await User.findById(customerId);
                if (user) {
                    targetEmail = user.email;
                    targetName = user.fullName;
                }
            }

            if (targetEmail) {
                const vehicleData = await Vehicle.findById(vehicle).populate('brand');
                const vehicleName = vehicleData ? `${vehicleData.brand?.name} ${vehicleData.name}` : 'Xe máy';

                await sendEmail({
                    to: targetEmail,
                    subject: 'Xác nhận đặt lịch xem xe thành công',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <h2 style="color: #e53e3e; text-align: center;">Xác Nhận Đặt Lịch Xem Xe</h2>
                            <p>Xin chào <strong>${targetName || 'quý khách'}</strong>,</p>
                            <p>Cảm ơn bạn đã tin tưởng và đăng ký xem xe tại hệ thống của chúng tôi. Dưới đây là thông tin chi tiết lịch hẹn của bạn:</p>
                            
                            <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Mẫu xe:</strong> ${vehicleName}</p>
                                <p style="margin: 5px 0;"><strong>Ngày hẹn:</strong> ${new Date(appointmentDate).toLocaleDateString('vi-VN')}</p>
                                <p style="margin: 5px 0;"><strong>Khung giờ:</strong> ${timeSlot}</p>
                            </div>
                            
                            <p>Chuyên viên tư vấn của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lại lịch hẹn.</p>
                            <p>Nếu bạn có bất kỳ thay đổi nào, vui lòng liên hệ hotline: <strong>1900 xxxx</strong></p>
                            
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                            <p style="font-size: 12px; color: #718096; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
                        </div>
                    `
                });
            }
        } catch (emailError) {
            console.error('Lỗi khi gửi mail xác nhận:', emailError);
            // Không chặn code chính nếu lỗi gửi mail
        }

        // Tạo thông báo cho Admin
        const notification = new AdminNotification({
            title: 'Lịch hẹn mới',
            message: `Khách hàng ${guestName || 'thành viên'} vừa đặt lịch ngày ${appointmentDate} lúc ${timeSlot}`,
            type: 'APPOINTMENT',
            link: '/admin/appointments'
        });
        await notification.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('new_admin_notification', notification);
        }

        res.status(201).json({ success: true, message: 'Đặt lịch thay mẫu thành công!', data: newAppointment });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', errorMsg: error.message });
    }
}

const getAppointmentsByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;
        const appointments = await TestDriveAppointment.find({ customer: customerId })
            .populate({
                path: 'vehicle',
                select: 'name brand images',
                populate: { path: 'brand', select: 'name' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử hẹn', error: error.message });
    }
}

module.exports = { createAppointment, getAppointmentsByCustomerId };
