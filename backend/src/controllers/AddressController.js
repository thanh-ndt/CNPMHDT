const Address = require('../models/Address');

// Thêm địa chỉ giao hàng mới
const createAddress = async (req, res) => {
  try {
    const { phone, diaChi, ghiChu, customer } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!phone || !diaChi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ số điện thoại và địa chỉ'
      });
    }

    // Nếu có middleware xác thực, ID khách hàng thường lấy từ req.user._id
    // Tuy nhiên ở đây tạm lấy từ req.body.customer nếu không có req.user
    const customerId = req.user ? req.user._id : customer;
    
    if (!customerId) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu thông tin khách hàng (customer ID)'
        });
    }

    // Tạo địa chỉ mới
    const newAddress = new Address({
      customer: customerId,
      phone,
      diaChi,
      ghiChu: ghiChu || '',
    });

    const savedAddress = await newAddress.save();

    res.status(201).json({
      success: true,
      message: 'Lưu địa chỉ thành công',
      data: savedAddress
    });
  } catch (error) {
    console.error('Lỗi khi lưu địa chỉ:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lưu địa chỉ',
      error: error.message
    });
  }
};

// Lấy danh sách địa chỉ của một khách hàng
const getAddressesByCustomer = async (req, res) => {
  try {
    const customerId = req.user ? req.user._id : req.params.customerId;

    if (!customerId) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu thông tin khách hàng'
        });
    }

    const addresses = await Address.find({ customer: customerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách địa chỉ:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách địa chỉ',
      error: error.message
    });
  }
};

module.exports = {
  createAddress,
  getAddressesByCustomer
};
