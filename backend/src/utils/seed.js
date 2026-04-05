const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Import Models
const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
const VehicleModel = require('../models/VehicleModel');

// Path to .env file
dotenv.config({ path: __dirname + '/../../.env' });

// Kết nối đến MongoDB
const connectDB = async () => {
  try {
    // Ưu tiên dùng MONGO_URI trong .env, nếu không có thì dùng honda_store
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/honda_store';
    await mongoose.connect(uri);
    console.log(`Đã kết nối MongoDB thành công: ${uri}`);
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Đọc dữ liệu từ file JSON mới
const vehiclesData = require('../../data/vehicles_data.json');

const seedData = async () => {
  try {
    // 1. Kết nối DB
    await connectDB();

    // 2. Xóa dữ liệu cũ để tránh trùng lặp
    console.log('Đang xóa dữ liệu cũ...');
    await Vehicle.deleteMany();
    await Brand.deleteMany();
    await VehicleModel.deleteMany();

    // 3. Tạo các Brand tự động từ tên xe
    const brandNames = [...new Set(vehiclesData.map(v => v.name.split(' ')[0]))];
    const brandMap = {};
    for (const bName of brandNames) {
      let country = 'Nhật Bản';
      if (bName === 'VinFast') country = 'Việt Nam';
      if (bName === 'Vespa' || bName === 'Piaggio') country = 'Ý';
      if (bName === 'SYM') country = 'Đài Loan';
      
      const brand = await Brand.create({
        name: bName,
        country: country,
        description: `Hãng xe ${bName}`
      });
      brandMap[bName] = brand._id;
    }
    console.log(`Đã tạo ${brandNames.length} Brands.`);

    // 4. Tạo các VehicleModel (Danh mục / Loại xe)
    const typesToCreate = [...new Set(vehiclesData.map(v => v.category))];
    const categoryMap = {};
    
    for (const type of typesToCreate) {
      const model = await VehicleModel.create({
        name: type,
        engineType: type === 'Xe điện' ? 'Motor điện' : 'Động cơ đốt trong',
        description: `Danh mục: ${type}`,
      });
      categoryMap[type] = model._id;
    }
    console.log(`Đã tạo ${typesToCreate.length} danh mục (Vehicle Models).`);

    // 5. Chuẩn bị dữ liệu 32 xe
    const finalVehicles = vehiclesData.map((bike) => {
      const bName = bike.name.split(' ')[0];
      const imageUrl = bike.images && bike.images.length > 0 ? bike.images[0] : '';

      const rating = Math.round((4.5 + Math.random() * 0.5) * 10) / 10;
      const soldCount = Math.floor(Math.random() * 491) + 10;

      return {
        name: bike.name,
        price: bike.price,
        category: bike.category,
        engineCapacity: bike.engineCapacity,
        description: bike.description,
        specifications: bike.specifications || {},
        stockQuantity: Math.floor(Math.random() * 50) + 5,
        status: 'available',
        brand: brandMap[bName],
        vehicleModel: categoryMap[bike.category],
        images: [imageUrl],
        rating,
        soldCount,
        favoritesCount: Math.floor(Math.random() * 151) + 50, // 50-200
        numReviews: Math.floor(soldCount * 0.3), // ~30% người mua để lại đánh giá
      };
    });

    // 6. Bulk Insert vào collection vehicles
    await Vehicle.insertMany(finalVehicles);
    console.log('✅ SEED THÀNH CÔNG: Đã chèn 32 loại xe máy Honda vào CSDL!');

    // 7. Thoát an toàn
    process.exit();
  } catch (error) {
    console.error('❌ LỖI SEED:', error);
    process.exit(1);
  }
};

// Khởi chạy hàm
seedData();
