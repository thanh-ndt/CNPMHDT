const TestDriveAppointment = require('../models/TestDriveAppointment');

const createAppointment = async (req, res) => {
    try {
        const { vehicle, appointmentDate, timeSlot, note, customerId, guestName, guestPhone } = req.body;
        
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
        });

        await newAppointment.save();
        res.status(201).json({ success: true, message: 'Đặt lịch thay mẫu thành công!', data: newAppointment });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', errorMsg: error.message });
    }
}

module.exports = { createAppointment };
