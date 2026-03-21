require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
const VehicleModel = require('../models/VehicleModel');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI ? process.env.MONGO_URI.replace('localhost', '127.0.0.1') : 'mongodb://127.0.0.1:27017/motorcycle_shop';
    await mongoose.connect(uri);
    console.log('MongoDB Connected for Real Data Seeder');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomRating = () => parseFloat((Math.random() * 1.0 + 4.0).toFixed(1));

const seedData = async () => {
  await connectDB();

  try {
    // Đọc file data cũ
    const dataPath = path.join(__dirname, '../../data/vehicles_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const oldVehicles = JSON.parse(rawData);

    console.log('Đang xóa dữ liệu cũ...');
    await Vehicle.deleteMany({});
    await Brand.deleteMany({});
    await VehicleModel.deleteMany({});

    // Phân tách các Thương hiệu tự động từ chữ đầu của Tên Xe (VD: Honda, Yamaha...)
    const brandNames = [...new Set(oldVehicles.map(v => v.name.split(' ')[0]))];
    console.log(`Đang tạo ${brandNames.length} Thương hiệu:`, brandNames);
    
    const brandsToInsert = brandNames.map(name => ({
      name,
      country: name === 'Honda' || name === 'Yamaha' || name === 'Suzuki' ? 'Nhật Bản' :
               name === 'Vespa' || name === 'Piaggio' ? 'Ý' :
               name === 'VinFast' ? 'Việt Nam' : 'Đài Loan'
    }));
    
    const insertedBrands = await Brand.insertMany(brandsToInsert);
    const brandMap = {};
    insertedBrands.forEach(b => brandMap[b.name] = b._id);

    // Phân tách Dòng xe (Model) tự động từ chữ thứ 2 trở đi
    const modelNames = [...new Set(oldVehicles.map(v => {
      const parts = v.name.split(' ');
      return parts[1] || 'Standard';
    }))];
    console.log(`Đang tạo ${modelNames.length} Dòng xe...`);
    
    const modelsToInsert = modelNames.map(name => ({ name }));
    const insertedModels = await VehicleModel.insertMany(modelsToInsert);
    const modelMap = {};
    insertedModels.forEach(m => modelMap[m.name] = m._id);

    // Lắp ráp 32 Xe thực tế 
    const finalVehiclesToInsert = oldVehicles.map(v => {
      const brandName = v.name.split(' ')[0];
      const modelName = v.name.split(' ')[1] || 'Standard';

      // Định dạng lại đường dẫn ảnh (loại bỏ dẫu / ở đầu để không phụ thuộc base_url)
      // Nhưng theo yêu cầu cũ thì frontend/public/images/ đã có tên đúng, ta giữ nguyên array images
      // Trong file JSON cũ, mảng images là ["/images/honda_vision.png"] 
      // Ta đảm bảo nó có hình ảnh thực

      return {
        name: v.name,
        brand: brandMap[brandName],
        vehicleModel: modelMap[modelName],
        category: v.category,
        engineCapacity: v.engineCapacity,
        price: v.price,
        description: v.description,
        specifications: v.specifications,
        images: v.images, // Giữ nguyên mảng hình ảnh gốc
        status: 'available',
        stockQuantity: getRandomInt(10, 50),
        soldCount: getRandomInt(10, 500),         // Số lượng bán ngẫu nhiên 10-500
        rating: getRandomRating(),                // Số sao ngẫu nhiên 4.0 - 5.0
      };
    });

    console.log('Đang nạp 32 xe với Hình Ảnh thật, Specs thật, Doanh số & Số Sao ngẫu nhiên...');
    await Vehicle.insertMany(finalVehiclesToInsert);

    console.log(`[Thành công] Đã nạp chính xác ${finalVehiclesToInsert.length} xe vào Database!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi trong quá trình Seed data:', error);
    process.exit(1);
  }
};

seedData();
