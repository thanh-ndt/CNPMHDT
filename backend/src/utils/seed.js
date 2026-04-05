const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Import Models
const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
const VehicleModel = require('../models/VehicleModel');

// Path to .env file
dotenv.config({ path: __dirname + '/../../.env' });

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

const getBrandInfo = (brandName) => {
  let country = 'Nhật Bản';
  if (brandName === 'VinFast') country = 'Việt Nam';
  if (brandName === 'Vespa' || brandName === 'Piaggio') country = 'Ý';
  if (brandName === 'SYM') country = 'Đài Loan';

  return {
    country,
    description: `Hãng xe ${brandName}`,
  };
};

const seedData = async ({ resetExisting = false, onlyIfEmpty = false } = {}) => {
  try {
    // Auto-seed cho môi trường production thường nên chỉ chạy khi DB trống.
    if (onlyIfEmpty) {
      const existingVehicles = await Vehicle.countDocuments();
      if (existingVehicles > 0) {
        console.log(`Bỏ qua seed vì đã có ${existingVehicles} xe trong CSDL.`);
        return { skipped: true, reason: 'DB is not empty', existingVehicles };
      }
    }

    if (resetExisting) {
      console.log('Đang xóa dữ liệu cũ...');
      await Vehicle.deleteMany();
      await Brand.deleteMany();
      await VehicleModel.deleteMany();
    }

    // 1. Tạo/upsert Brand từ tên xe
    const brandNames = [...new Set(vehiclesData.map(v => v.name.split(' ')[0]))];
    const brandMap = {};
    for (const bName of brandNames) {
      const brandInfo = getBrandInfo(bName);
      const brand = await Brand.findOneAndUpdate(
        { name: bName },
        {
          $set: {
            name: bName,
            country: brandInfo.country,
            description: brandInfo.description,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      brandMap[bName] = brand._id;
    }
    console.log(`Đã upsert ${brandNames.length} Brands.`);

    // 2. Tạo/upsert VehicleModel theo cặp brand + category
    const categoryMap = {};

    for (const bike of vehiclesData) {
      const bName = bike.name.split(' ')[0];
      const category = bike.category;
      const brandId = brandMap[bName];
      const categoryKey = `${bName}::${category}`;

      if (categoryMap[categoryKey]) continue;

      const model = await VehicleModel.findOneAndUpdate(
        { name: category, brand: brandId },
        {
          $set: {
            name: category,
            brand: brandId,
            description: `Danh mục: ${category}`,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      categoryMap[categoryKey] = model._id;
    }
    console.log(`Đã upsert ${Object.keys(categoryMap).length} Vehicle Models.`);

    // 3. Upsert danh sách xe
    let insertedOrUpdated = 0;
    for (const bike of vehiclesData) {
      const bName = bike.name.split(' ')[0];
      const categoryKey = `${bName}::${bike.category}`;
      const imageUrl = bike.images && bike.images.length > 0 ? bike.images[0] : '';

      await Vehicle.findOneAndUpdate(
        { name: bike.name },
        {
          $set: {
            name: bike.name,
            price: bike.price,
            category: bike.category,
            engineCapacity: bike.engineCapacity,
            description: bike.description,
            specifications: bike.specifications || {},
            stockQuantity: Math.floor(Math.random() * 50) + 5,
            status: 'available',
            brand: brandMap[bName],
            vehicleModel: categoryMap[categoryKey],
            images: [imageUrl],
            rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
            soldCount: Math.floor(Math.random() * 491) + 10,
            favoritesCount: Math.floor(Math.random() * 151) + 50,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      insertedOrUpdated += 1;
    }

    console.log(`✅ SEED THÀNH CÔNG: Đã upsert ${insertedOrUpdated} xe vào CSDL!`);
    return { skipped: false, insertedOrUpdated };
  } catch (error) {
    console.error('❌ LỖI SEED:', error);
    throw error;
  }
};

const runCli = async () => {
  try {
    await connectDB();

    const resetExisting = process.argv.includes('--reset');
    const onlyIfEmpty = process.argv.includes('--if-empty');

    await seedData({ resetExisting, onlyIfEmpty });
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

if (require.main === module) {
  runCli();
}

module.exports = {
  seedData,
  connectDB,
};
