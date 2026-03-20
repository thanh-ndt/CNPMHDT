const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Import tất cả models
const User = require('../models/User');
const Brand = require('../models/Brand');
const VehicleModel = require('../models/VehicleModel');
const Vehicle = require('../models/Vehicle');
const Cart = require('../models/Cart');
const Promotion = require('../models/Promotion');

const seedDB = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Kết nối MongoDB thành công!');

    // Xóa dữ liệu cũ (cẩn thận khi dùng trong production)
    await Promise.all([
      User.deleteMany({}),
      Brand.deleteMany({}),
      VehicleModel.deleteMany({}),
      Vehicle.deleteMany({}),
      Cart.deleteMany({}),
      Promotion.deleteMany({}),
    ]);
    console.log('Đã xóa dữ liệu cũ.');

    // ========================
    // 1. Tạo Owner (Chủ cửa hàng)
    // ========================
    const owner = await User.create({
      email: 'admin@xemay.vn',
      password: 'admin123',
      phoneNumber: '0901234567',
      role: 'owner',
      fullName: 'Admin',
      adminCode: 'ADMIN001',
    });
    console.log('Đã tạo Owner:', owner.email);

    // ========================
    // 2. Tạo Customers (Khách hàng)
    // ========================
    const customers = await User.insertMany([
      {
        email: 'nguyenvana@gmail.com',
        password: 'password123',
        phoneNumber: '0912345678',
        role: 'customer',
        fullName: 'Nguyễn Văn A',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        dob: new Date('1995-05-15'),
      },
      {
        email: 'tranthib@gmail.com',
        password: 'password123',
        phoneNumber: '0987654321',
        role: 'customer',
        fullName: 'Trần Thị B',
        address: '456 Lê Lợi, Quận 3, TP.HCM',
        dob: new Date('1998-08-20'),
      },
      {
        email: 'levanc@gmail.com',
        password: 'password123',
        phoneNumber: '0976543210',
        role: 'customer',
        fullName: 'Lê Văn C',
        address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
        dob: new Date('1992-12-01'),
      },
    ]);
    console.log(`Đã tạo ${customers.length} khách hàng.`);

    // ========================
    // 3. Tạo Brands (Thương hiệu)
    // ========================
    const brands = await Brand.insertMany([
      { name: 'Honda', country: 'Nhật Bản', description: 'Thương hiệu xe máy hàng đầu thế giới' },
      { name: 'Yamaha', country: 'Nhật Bản', description: 'Thương hiệu xe máy nổi tiếng về hiệu năng' },
      { name: 'Suzuki', country: 'Nhật Bản', description: 'Thương hiệu xe máy đa dạng phân khúc' },
      { name: 'Piaggio', country: 'Ý', description: 'Thương hiệu xe tay ga cao cấp' },
      { name: 'VinFast', country: 'Việt Nam', description: 'Thương hiệu xe điện Việt Nam' },
    ]);
    console.log(`Đã tạo ${brands.length} thương hiệu.`);

    // ========================
    // 4. Tạo VehicleModels (Dòng xe)
    // ========================
    const vehicleModels = await VehicleModel.insertMany([
      { name: 'Wave Alpha', engineType: 'Xe số', fuelType: 'Xăng', description: 'Xe số phổ thông tiết kiệm xăng' },
      { name: 'Air Blade', engineType: 'Xe tay ga', fuelType: 'Xăng', description: 'Xe tay ga thể thao' },
      { name: 'Winner X', engineType: 'Xe côn tay', fuelType: 'Xăng', description: 'Xe côn tay mạnh mẽ' },
      { name: 'Exciter', engineType: 'Xe côn tay', fuelType: 'Xăng', description: 'Xe côn tay thể thao Yamaha' },
      { name: 'NVX', engineType: 'Xe tay ga', fuelType: 'Xăng', description: 'Xe tay ga thể thao Yamaha' },
      { name: 'Raider', engineType: 'Xe côn tay', fuelType: 'Xăng', description: 'Xe côn tay Suzuki' },
      { name: 'Vespa', engineType: 'Xe tay ga', fuelType: 'Xăng', description: 'Xe tay ga cổ điển Ý' },
      { name: 'Klara', engineType: 'Xe tay ga điện', fuelType: 'Điện', description: 'Xe máy điện VinFast' },
    ]);
    console.log(`Đã tạo ${vehicleModels.length} dòng xe.`);

    // ========================
    // 5. Tạo Vehicles (Xe máy)
    // ========================
    const vehicles = await Vehicle.insertMany([
      {
        name: 'Honda Wave Alpha 110cc 2024',
        brand: brands[0]._id,
        vehicleModel: vehicleModels[0]._id,
        manufacture: 2024,
        price: 18490000,
        status: 'available',
        stockQuantity: 15,
        images: ['wave-alpha-1.jpg', 'wave-alpha-2.jpg'],
      },
      {
        name: 'Honda Air Blade 125cc 2024',
        brand: brands[0]._id,
        vehicleModel: vehicleModels[1]._id,
        manufacture: 2024,
        price: 41190000,
        status: 'available',
        stockQuantity: 10,
        images: ['air-blade-1.jpg', 'air-blade-2.jpg'],
      },
      {
        name: 'Honda Winner X 150cc 2024',
        brand: brands[0]._id,
        vehicleModel: vehicleModels[2]._id,
        manufacture: 2024,
        price: 46190000,
        status: 'available',
        stockQuantity: 8,
        images: ['winner-x-1.jpg', 'winner-x-2.jpg'],
      },
      {
        name: 'Yamaha Exciter 155 VVA 2024',
        brand: brands[1]._id,
        vehicleModel: vehicleModels[3]._id,
        manufacture: 2024,
        price: 50990000,
        status: 'available',
        stockQuantity: 12,
        images: ['exciter-155-1.jpg', 'exciter-155-2.jpg'],
      },
      {
        name: 'Yamaha NVX 155 VVA 2024',
        brand: brands[1]._id,
        vehicleModel: vehicleModels[4]._id,
        manufacture: 2024,
        price: 53490000,
        status: 'available',
        stockQuantity: 7,
        images: ['nvx-155-1.jpg', 'nvx-155-2.jpg'],
      },
      {
        name: 'Suzuki Raider R150 Fi 2024',
        brand: brands[2]._id,
        vehicleModel: vehicleModels[5]._id,
        manufacture: 2024,
        price: 49990000,
        status: 'available',
        stockQuantity: 5,
        images: ['raider-r150-1.jpg', 'raider-r150-2.jpg'],
      },
      {
        name: 'Piaggio Vespa Sprint 150cc 2024',
        brand: brands[3]._id,
        vehicleModel: vehicleModels[6]._id,
        manufacture: 2024,
        price: 78500000,
        status: 'available',
        stockQuantity: 4,
        images: ['vespa-sprint-1.jpg', 'vespa-sprint-2.jpg'],
      },
      {
        name: 'VinFast Klara S 2024',
        brand: brands[4]._id,
        vehicleModel: vehicleModels[7]._id,
        manufacture: 2024,
        price: 39900000,
        status: 'available',
        stockQuantity: 20,
        images: ['klara-s-1.jpg', 'klara-s-2.jpg'],
      },
    ]);
    console.log(`Đã tạo ${vehicles.length} xe máy.`);

    // ========================
    // 6. Tạo Carts (Giỏ hàng)
    // ========================
    for (const customer of customers) {
      await Cart.create({
        customer: customer._id,
        totalItems: 0,
      });
    }
    console.log('Đã tạo giỏ hàng cho tất cả khách hàng.');

    // ========================
    // 7. Tạo Promotions (Khuyến mãi)
    // ========================
    await Promotion.insertMany([
      {
        code: 'GIAMGIA10',
        discountValue: 10,
        type: 'percentage',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2026-12-31'),
      },
      {
        code: 'GIAM500K',
        discountValue: 500000,
        type: 'fixed',
        validFrom: new Date('2024-06-01'),
        validTo: new Date('2026-06-30'),
      },
      {
        code: 'TETAMLICH',
        discountValue: 15,
        type: 'percentage',
        validFrom: new Date('2026-01-15'),
        validTo: new Date('2026-02-28'),
      },
    ]);
    console.log('Đã tạo 3 mã khuyến mãi.');

    // ========================
    // Hoàn thành
    // ========================
    console.log('\n========================================');
    console.log('Seed dữ liệu mẫu thành công!');
    console.log('========================================');
    console.log(`- 1 Owner (admin)`);
    console.log(`- ${customers.length} Customers`);
    console.log(`- ${brands.length} Brands`);
    console.log(`- ${vehicleModels.length} Vehicle Models`);
    console.log(`- ${vehicles.length} Vehicles`);
    console.log(`- ${customers.length} Carts`);
    console.log(`- 3 Promotions`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error.message);
    process.exit(1);
  }
};

seedDB();
