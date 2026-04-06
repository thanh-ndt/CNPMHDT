const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
const VehicleModel = require('../models/VehicleModel');

/**
 * ═══════════════════════════════════════════════════════════════
 * HÀM TÌM KIẾM VÀ LỌC XE - API: GET /api/vehicles
 * ═══════════════════════════════════════════════════════════════
 * Chức năng: Tìm kiếm xe theo nhiều tiêu chí và trả về kết quả có phân trang
 * 
 * Các tham số query có thể nhận:
 * - search: Tìm kiếm theo tên xe (case-insensitive)
 * - category: Lọc theo loại xe (có thể nhiều loại, phân cách bằng dấu phẩy)
 * - minPrice, maxPrice: Lọc theo khoảng giá
 * - engine: Lọc theo phân khối ('small' hoặc 'large')
 * - brand: Lọc theo hãng xe (Brand ObjectId)
 * - ids: Lọc theo danh sách ID (dùng cho tính năng so sánh)
 * - page: Số trang hiện tại (mặc định = 1)
 * - limit: Số lượng xe mỗi trang (mặc định = 8)
 * 
 * Kết quả trả về:
 * - data: Danh sách xe đã được populate brand
 * - pagination: Thông tin phân trang (currentPage, totalPages, totalVehicles)
 * ═══════════════════════════════════════════════════════════════
 */
const getVehicles = async (req, res) => {
  try {
    // Lấy các tham số tìm kiếm và phân trang từ query string
    const {
      search,      // Từ khóa tìm kiếm theo tên xe
      category,    // Loại xe cần lọc
      minPrice,    // Giá tối thiểu
      maxPrice,    // Giá tối đa
      engine,      // Phân khối động cơ (small/large)
      brand,       // ID hãng xe
      page = 1,    // Trang hiện tại
      limit = 8,   // Số xe mỗi trang
    } = req.query;

    // Chuyển đổi page và limit sang số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // ══════════════════════════════════════════════════════════════
    // BƯỚC 1: XÂY DỰNG ĐIỀU KIỆN LỌC (Match Stage)
    // ══════════════════════════════════════════════════════════════
    // Chỉ hiển thị xe đã được xuất bản
    const matchStage = { isPublished: true };

    // ─────────────────────────────────────────────────────────────
    // LỌC THEO DANH SÁCH IDS (Dùng cho tính năng So Sánh Xe)
    // ─────────────────────────────────────────────────────────────
    // Nếu có tham số ids, chỉ lấy các xe có ID trong danh sách
    // Ví dụ: ?ids=id1,id2,id3
    if (req.query.ids) {
      const idsArray = req.query.ids.split(',').filter(Boolean);
      matchStage._id = { $in: idsArray.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // ─────────────────────────────────────────────────────────────
    // TÌM KIẾM THEO TÊN XE (Không phân biệt hoa thường)
    // ─────────────────────────────────────────────────────────────
    // Sử dụng regex để tìm kiếm tên xe chứa từ khóa
    // Ví dụ: ?search=SH -> tìm "SH 125", "SH 350i", "SH Mode"
    if (search) {
      matchStage.name = { $regex: search, $options: 'i' };
    }
    
    // ─────────────────────────────────────────────────────────────
    // LỌC THEO HÃNG XE (Brand ObjectId)
    // ─────────────────────────────────────────────────────────────
    // Kiểm tra xem brand có phải ObjectId hợp lệ không
    // Ví dụ: ?brand=507f1f77bcf86cd799439011
    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      matchStage.brand = new mongoose.Types.ObjectId(brand);
    }

    // ─────────────────────────────────────────────────────────────
    // LỌC THEO LOẠI XE (Hỗ trợ nhiều loại cùng lúc)
    // ─────────────────────────────────────────────────────────────
    // Tham số category có thể là 1 loại hoặc nhiều loại phân cách bằng dấu phẩy
    // Ví dụ: ?category=Xe ga,Xe số -> Lọc cả Xe ga VÀ Xe số
    if (category && category !== 'all') {
      const categories = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        matchStage.category = { $in: categories };
      }
    }

    // ─────────────────────────────────────────────────────────────
    // LỌC THEO KHOẢNG GIÁ (Min - Max)
    // ─────────────────────────────────────────────────────────────
    // Cho phép lọc theo giá tối thiểu ($gte) và giá tối đa ($lte)
    // Ví dụ: ?minPrice=50000000&maxPrice=100000000
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = parseInt(minPrice, 10);
      if (maxPrice) matchStage.price.$lte = parseInt(maxPrice, 10);
    }

    // ─────────────────────────────────────────────────────────────
    // LỌC THEO PHÂN KHỐI ĐỘNG CƠ (Sử dụng ngưỡng giá)
    // ─────────────────────────────────────────────────────────────
    // Do dữ liệu engineCapacity có thể chưa đầy đủ, sử dụng giá làm heuristic
    // - 'small'  => Dưới 175cc (Quy ước: giá <= 100.000.000 VNĐ)
    // - 'large'  => Trên 175cc (Quy ước: giá > 100.000.000 VNĐ)
    if (engine === 'small') {
      matchStage.price = matchStage.price || {};
      // Nếu đã có maxPrice được set, lấy giá trị nhỏ hơn giữa maxPrice và 100tr
      matchStage.price.$lte = matchStage.price.$lte ? Math.min(matchStage.price.$lte, 100000000) : 100000000;
    } else if (engine === 'large') {
      matchStage.price = matchStage.price || {};
      // Nếu đã có minPrice được set, lấy giá trị lớn hơn giữa minPrice và 100tr
      matchStage.price.$gt = matchStage.price.$gt ? Math.max(matchStage.price.$gt, 100000000) : 100000000;
    }

    // ══════════════════════════════════════════════════════════════
    // BƯỚC 2: XÂY DỰNG AGGREGATION PIPELINE
    // ══════════════════════════════════════════════════════════════
    // Sử dụng MongoDB Aggregation để tối ưu hiệu suất truy vấn
    const pipeline = [
      // Stage 1: Lọc xe theo các điều kiện đã xây dựng
      { $match: matchStage },
      
      // Stage 2: Sắp xếp theo số lượng đã bán (từ cao đến thấp)
      // Xe bán chạy sẽ hiển thị ở đầu
      { $sort: { soldCount: -1 } },
      
      // Stage 3: Sử dụng $facet để lấy cả tổng số xe và dữ liệu phân trang
      {
        $facet: {
          // Đếm tổng số xe thỏa mãn điều kiện
          metadata: [{ $count: 'total' }],
          
          // Lấy dữ liệu cho trang hiện tại
          data: [
            { $skip: (pageNumber - 1) * limitNumber },  // Bỏ qua các xe của trang trước
            { $limit: limitNumber },                    // Giới hạn số xe trả về
          ],
        },
      },
    ];

    // Thực thi aggregation pipeline
    const result = await Vehicle.aggregate(pipeline);

    // Lấy tổng số xe và dữ liệu xe từ kết quả
    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const rawData = result[0].data;

    // ══════════════════════════════════════════════════════════════
    // BƯỚC 3: XỬ LÝ DỮ LIỆU TRẢ VỀ
    // ══════════════════════════════════════════════════════════════
    // Hydrate để lấy virtual fields (như formattedPrice) và populate brand
    const hydratedData = rawData.map((doc) => Vehicle.hydrate(doc));
    await Vehicle.populate(hydratedData, { path: 'brand', select: 'name' });
    const populatedData = hydratedData.map((doc) => doc.toJSON());

    // Trả về kết quả với thông tin phân trang
    res.status(200).json({
      success: true,
      data: populatedData,
      pagination: {
        currentPage: pageNumber,                    // Trang hiện tại
        totalPages: Math.ceil(total / limitNumber), // Tổng số trang
        totalVehicles: total,                       // Tổng số xe tìm thấy
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách xe:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/**
 * ═══════════════════════════════════════════════════════════════
 * HÀM LẤY GỢI Ý TÌM KIẾM - API: GET /api/vehicles/suggestions
 * ═══════════════════════════════════════════════════════════════
 * Chức năng: Tự động gợi ý xe và hãng xe khi người dùng nhập từ khóa
 * 
 * Tham số query:
 * - keyword: Từ khóa người dùng nhập vào thanh tìm kiếm
 * 
 * Kết quả trả về:
 * - Tối đa 3 hãng xe khớp với từ khóa
 * - Tối đa 5 xe khớp với từ khóa
 * - Mỗi gợi ý có trường 'type' để phân biệt ('brand' hoặc 'vehicle')
 * 
 * Sử dụng cho: Autocomplete trong thanh tìm kiếm
 * ═══════════════════════════════════════════════════════════════
 */
const getSuggestions = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // Nếu không có từ khóa hoặc từ khóa rỗng, trả về mảng rỗng
    if (!keyword || keyword.trim() === '') {
      return res.status(200).json({ success: true, data: [] });
    }

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 1: TÌM KIẾM HÃNG XE KHỚP VỚI TỪ KHÓA
    // ─────────────────────────────────────────────────────────────
    // Tìm tối đa 3 hãng xe có tên chứa từ khóa (không phân biệt hoa thường)
    // Ví dụ: keyword="hon" -> "Honda", "Hongdao"
    const brandMatches = await Brand.find(
      { name: { $regex: keyword.trim(), $options: 'i' } }
    ).limit(3);

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 2: TÌM KIẾM XE KHỚP VỚI TỪ KHÓA
    // ─────────────────────────────────────────────────────────────
    // Tìm tối đa 5 xe có tên chứa từ khóa và đã được xuất bản
    // Chỉ lấy các trường cần thiết để giảm dung lượng dữ liệu
    // Ví dụ: keyword="sh" -> "SH 125", "SH 350i", "SH Mode"
    const vehicleMatches = await Vehicle.find(
      { 
        name: { $regex: keyword.trim(), $options: 'i' },
        isPublished: true 
      }
    )
    .select('name images formattedPrice price')
    .limit(5);

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 3: ĐỊNH DẠNG DỮ LIỆU TRẢ VỀ
    // ─────────────────────────────────────────────────────────────
    // Thêm trường 'type' để frontend phân biệt gợi ý là hãng xe hay sản phẩm xe
    const brandSuggestions = brandMatches.map(b => ({
      _id: b._id,
      name: b.name,
      images: b.logo ? [b.logo] : [],
      type: 'brand'  // Đánh dấu đây là hãng xe
    }));

    const vehicleSuggestions = vehicleMatches.map(v => ({
      ...v.toJSON(),
      type: 'vehicle'  // Đánh dấu đây là sản phẩm xe
    }));

    // Gộp kết quả: Hãng xe hiển thị trước, sau đó đến sản phẩm xe
    res.status(200).json({
      success: true,
      data: [...brandSuggestions, ...vehicleSuggestions]
    });
  } catch (error) {
    console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * ═══════════════════════════════════════════════════════════════
 * HÀM TĂNG SỐ LƯỢT YÊU THÍCH - API: PATCH /api/vehicles/:id/favorite
 * ═══════════════════════════════════════════════════════════════
 * Chức năng: Tăng số lượt yêu thích khi người dùng click nút tim
 * 
 * Tham số:
 * - id: ID của xe cần tăng lượt yêu thích
 * 
 * Kết quả:
 * - favoritesCount: Số lượt yêu thích mới sau khi tăng
 * ═══════════════════════════════════════════════════════════════
 */
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm xe và tăng favoritesCount lên 1 (sử dụng $inc operator)
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $inc: { favoritesCount: 1 } },
      { new: true } // Trả về document sau khi update
    );
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }

    res.status(200).json({
      success: true,
      favoritesCount: vehicle.favoritesCount
    });
  } catch (error) {
    console.error('Lỗi khi tăng lượt yêu thích:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * ═══════════════════════════════════════════════════════════════
 * HÀM LẤY CHI TIẾT XE - API: GET /api/vehicles/:id
 * ═══════════════════════════════════════════════════════════════
 * Chức năng: Lấy thông tin chi tiết của 1 xe để hiển thị trên trang chi tiết
 * 
 * Tham số:
 * - id: ID của xe cần xem
 * 
 * Kết quả trả về:
 * - Thông tin đầy đủ của xe
 * - Đã populate brand và vehicleModel
 * - Bao gồm virtual field formattedPrice
 * - Chỉ trả về xe đã được publish (isPublished: true)
 * ═══════════════════════════════════════════════════════════════
 */
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ─────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE ObjectId
    // ─────────────────────────────────────────────────────────────
    // Kiểm tra xem ID có đúng định dạng MongoDB ObjectId không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 2: TÌM XE VÀ POPULATE DỮ LIỆU LIÊN KẾT
    // ─────────────────────────────────────────────────────────────
    const vehicle = await Vehicle.findOne({ 
      _id: id, 
      isPublished: true // Chỉ lấy xe đã được xuất bản
    })
      .populate('brand', 'name')           // Lấy tên hãng xe
      .populate('vehicleModel', 'name');   // Lấy tên model

    // Không tìm thấy xe hoặc xe chưa được publish
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe hoặc xe đã bị ẩn' });
    }

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 3: TRẢ VỀ DỮ LIỆU
    // ─────────────────────────────────────────────────────────────
    // toJSON() để kích hoạt virtual fields (formattedPrice)
    res.status(200).json({
      success: true,
      data: vehicle.toJSON()
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết xe:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/**
 * ═══════════════════════════════════════════════════════════════
 * HÀM LẤY DANH SÁCH XE RÚT GỌN - API: GET /api/vehicles/all-list
 * ═══════════════════════════════════════════════════════════════
 * Chức năng: Lấy danh sách tất cả xe dạng rút gọn (chỉ ID và tên)
 * 
 * Sử dụng cho:
 * - Dropdown select trong form
 * - Autocomplete
 * - Compare modal
 * 
 * Kết quả: Danh sách xe đã sắp xếp theo tên (A-Z)
 * ═══════════════════════════════════════════════════════════════
 */
const getAllVehicleList = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isPublished: true })
      .select('name brand')              // Chỉ lấy trường name và brand
      .populate('brand', 'name')         // Populate tên hãng
      .sort({ name: 1 });                // Sắp xếp theo tên A-Z

    res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách xe rút gọn:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  getSuggestions,
  toggleFavorite,
  getAllVehicleList,
};
