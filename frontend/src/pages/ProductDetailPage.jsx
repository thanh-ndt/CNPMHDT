/**
 * ═══════════════════════════════════════════════════════════════
 * PRODUCT DETAIL PAGE - TRANG CHI TIẾT SẢN PHẨM XE
 * ═══════════════════════════════════════════════════════════════
 * Trang này hiển thị thông tin chi tiết của một xe bao gồm:
 * - Hình ảnh sản phẩm với gallery thumbnail
 * - Thông tin cơ bản: tên, giá, hãng, loại, trạng thái
 * - Thông số kỹ thuật chi tiết
 * - Mô tả sản phẩm
 * - Đánh giá từ khách hàng
 * - Danh sách xe liên quan (cùng category)
 * - Tính năng: Thêm vào giỏ hàng, Yêu thích
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vehicleService } from '../services/vehicleService';
import { priceFormatter } from '../utils/priceFormatter';
import { addToCartAsync } from '../redux/cartSlice';
import { fetchVehicles, selectRelatedVehicles } from '../redux/vehicleSlice';
import { specsLabelMap } from '../utils/constants';
import { AiOutlineHeart, AiFillHeart, AiFillStar, AiOutlineStar } from 'react-icons/ai';
import VehicleCard from '../components/VehicleCard';
import { isFavorite, toggleFavorite } from './FavoritesPage';
import { reviewService } from '../services/reviewService';

export default function ProductDetailPage() {
    // ═══════════════════════════════════════════════════════════
    // LẤY ID XE TỪ URL PARAMS
    // ═══════════════════════════════════════════════════════════
    const { id } = useParams(); // URL: /product/:id
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const customerEmail = user?.email;
    
    // ═══════════════════════════════════════════════════════════
    // STATE QUẢN LÝ DỮ LIỆU XE VÀ HÌNH ẢNH
    // ═══════════════════════════════════════════════════════════
    const [vehicle, setVehicle] = useState(null);        // Thông tin xe
    const [loading, setLoading] = useState(true);        // Trạng thái đang tải
    const [error, setError] = useState('');              // Thông báo lỗi
    const [activeImage, setActiveImage] = useState('');  // Hình ảnh đang hiển thị lớn
    
    // ═══════════════════════════════════════════════════════════
    // STATE QUẢN LÝ ĐÁNH GIÁ
    // ═══════════════════════════════════════════════════════════
    const [reviews, setReviews] = useState([]);          // Danh sách đánh giá
    const [avgRating, setAvgRating] = useState(0);       // Điểm đánh giá trung bình
    
    // ═══════════════════════════════════════════════════════════
    // STATE QUẢN LÝ YÊU THÍCH (Đồng bộ với localStorage)
    // ═══════════════════════════════════════════════════════════
    const [isLiked, setIsLiked] = useState(false);       // Xe đã được yêu thích chưa
    const [likesCount, setLikesCount] = useState(0);     // Số lượt yêu thích
    
    // ═══════════════════════════════════════════════════════════
    // LẤY DANH SÁCH XE LIÊN QUAN (Cùng category)
    // ═══════════════════════════════════════════════════════════
    const relatedVehicles = useSelector((state) => selectRelatedVehicles(state, id, vehicle?.category));

    /**
     * ═══════════════════════════════════════════════════════════
     * XỬ LÝ THÊM XE VÀO GIỎ HÀNG
     * ═══════════════════════════════════════════════════════════
     * Yêu cầu người dùng phải đăng nhập
     * Gọi Redux action để thêm vào giỏ hàng với số lượng = 1
     */
    const handleAddToCart = async () => {
        // Kiểm tra đăng nhập
        if (!customerEmail) {
            alert('Vui lòng đăng nhập hoặc đăng ký để bỏ sản phẩm vào giỏ hàng.');
            navigate('/login');
            return;
        }
        
        try {
            // Dispatch Redux action addToCartAsync
            await dispatch(addToCartAsync({ 
                customerEmail, 
                vehicleId: vehicle._id || id, 
                quantity: 1 
            })).unwrap();
            
            alert('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (err) {
            alert(err || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
        }
    };

    /**
     * ═══════════════════════════════════════════════════════════
     * XỬ LÝ BẬT/TẮT YÊU THÍCH
     * ═══════════════════════════════════════════════════════════
     * Sử dụng localStorage để lưu danh sách xe yêu thích
     * Cập nhật UI counter ngay lập tức
     */
    const handleToggleLike = () => {
        // Gọi hàm toggleFavorite từ FavoritesPage (lưu vào localStorage)
        const newFavs = toggleFavorite(id);
        const liked = newFavs.includes(id);
        
        // Cập nhật state
        setIsLiked(liked);
        // Tăng/giảm counter (không cho số âm)
        setLikesCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
    };

    // ═══════════════════════════════════════════════════════════
    // EFFECT: TẢI DỮ LIỆU XE VÀ ĐÁNH GIÁ KHI COMPONENT MOUNT
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        /**
         * Hàm tải thông tin chi tiết xe
         * - Gọi API getVehicleById
         * - Khởi tạo số lượt yêu thích
         * - Kiểm tra xe có trong danh sách yêu thích không
         * - Tải danh sách xe liên quan (cùng category)
         * - Set hình ảnh đầu tiên làm activeImage
         */
        const fetchVehicle = async () => {
            setLoading(true);
            try {
                const res = await vehicleService.getVehicleById(id);
                
                if (res.success && res.data) {
                    setVehicle(res.data);
                    
                    // Khởi tạo số lượt yêu thích từ database
                    setLikesCount(res.data.favoritesCount || 0);
                    
                    // Đọc trạng thái yêu thích từ localStorage
                    setIsLiked(isFavorite(id));

                    // Nạp danh sách xe cùng category vào Redux Store
                    // để selector xử lý và hiển thị phần "Có thể bạn sẽ thích"
                    dispatch(fetchVehicles({ 
                        category: res.data.category, 
                        limit: 50 
                    }));
                    
                    // Set hình ảnh đầu tiên làm hình chính
                    if (res.data.images && res.data.images.length > 0) {
                        setActiveImage(res.data.images[0]);
                    }
                } else {
                    setError('Không thể lấy thông tin sản phẩm.');
                }
            } catch (err) {
                setError('Lỗi khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };

        /**
         * Hàm tải danh sách đánh giá của xe
         * - Gọi API getVehicleReviews
         * - Tính điểm trung bình từ tất cả đánh giá
         */
        const fetchReviewData = async () => {
            try {
                const res = await reviewService.getVehicleReviews(id);
                if (res.success) {
                    setReviews(res.data);
                    
                    // Tính điểm đánh giá trung bình
                    if (res.data.length > 0) {
                        const sum = res.data.reduce((acc, curr) => acc + curr.rating, 0);
                        setAvgRating((sum / res.data.length).toFixed(1));
                    }
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        };

        // Chỉ fetch khi có ID
        if (id) {
            fetchVehicle();
            fetchReviewData();
        }
    }, [id, dispatch]);

    // ═══════════════════════════════════════════════════════════
    // HIỂN thị loading spinner khi đang tải dữ liệu
    // ═══════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // HIỂN thị thông báo lỗi nếu không tìm thấy xe
    // ═══════════════════════════════════════════════════════════
    if (error || !vehicle) {
        return (
            <div className="container py-5 text-center">
                <h4 className="text-danger">{error || 'Không tìm thấy sản phẩm.'}</h4>
                <Link to="/products" className="btn btn-outline-danger mt-3">Quay lại danh sách</Link>
            </div>
        );
    }

    // Tạo placeholder image nếu không có hình
    const placeholderImg = `https://placehold.co/800x600/e3002b/fff?text=${encodeURIComponent(vehicle.name?.slice(0, 15)) || 'Xe'}`;
    const mainImgSrc = activeImage || placeholderImg;

    return (
        <div className="container py-5">
            {/* ═══════════════════════════════════════════════════ */}
            {/* BREADCRUMB NAVIGATION */}
            {/* ═══════════════════════════════════════════════════ */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-danger">Trang chủ</Link></li>
                    <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none text-danger">Sản phẩm</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{vehicle.name}</li>
                </ol>
            </nav>

            <div className="row g-5">
                {/* ═══════════════════════════════════════════════ */}
                {/* PHẦN HÌNH ẢNH VÀ MÔ TẢ */}
                {/* ═══════════════════════════════════════════════ */}
                <div className="col-lg-6">
                    {/* Hình ảnh chính */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                        <img
                            src={mainImgSrc}
                            alt={vehicle.name}
                            className="img-fluid w-100"
                            style={{ height: '400px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = placeholderImg; }}
                        />
                    </div>
                    
                    {/* ───────────────────────────────────────────── */}
                    {/* THUMBNAIL IMAGES GALLERY */}
                    {/* ───────────────────────────────────────────── */}
                    {/* Chỉ hiển thị khi có nhiều hơn 1 hình */}
                    {vehicle.images && vehicle.images.length > 1 && (
                        <div className="d-flex gap-2 overflow-auto py-2">
                            {vehicle.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`thumb ${idx}`}
                                    className={`rounded-3 cursor-pointer ${activeImage === img ? 'border border-2 border-danger shadow-sm' : ''}`}
                                    style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onClick={() => setActiveImage(img)} // Click để đổi hình chính
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ))}
                        </div>
                    )}

                    {/* ───────────────────────────────────────────── */}
                    {/* MÔ TẢ SẢN PHẨM CHI TIẾT */}
                    {/* ───────────────────────────────────────────── */}
                    <div className="mt-5">
                        <h4 className="fw-bold mb-3 border-bottom pb-2">Mô tả sản phẩm</h4>
                        <div 
                            className="text-dark" 
                            style={{ 
                                whiteSpace: 'pre-line',  // Giữ nguyên line breaks
                                textAlign: 'justify', 
                                lineHeight: '1.6'
                            }}
                        >
                            {vehicle.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════ */}
                {/* PHẦN THÔNG TIN SẢN PHẨM */}
                {/* ═══════════════════════════════════════════════ */}
                <div className="col-lg-6">
                    {/* ───────────────────────────────────────────── */}
                    {/* TÊN XE VÀ TRẠNG THÁI */}
                    {/* ───────────────────────────────────────────── */}
                    <div className="d-flex align-items-start justify-content-between mb-2">
                        <h1 className="fw-bold fs-2 mb-0">{vehicle.name}</h1>
                        {/* Badge hiển thị trạng thái còn hàng/hết hàng */}
                        {vehicle.status === 'available' && (
                            <span className="badge bg-success fs-6 mt-1">Còn hàng</span>
                        )}
                        {vehicle.status === 'out_of_stock' && (
                            <span className="badge bg-secondary fs-6 mt-1">Hết hàng</span>
                        )}
                    </div>

                    {/* ───────────────────────────────────────────── */}
                    {/* THÔNG TIN CƠ BẢN: HÃNG, LOẠI, PHÂN KHỐI */}
                    {/* ───────────────────────────────────────────── */}
                    <div className="mb-3">
                        <span className="badge bg-light text-dark border me-2">{vehicle.brand?.name || 'Chưa rõ hãng'}</span>
                        <span className="badge bg-light text-dark border me-2">{vehicle.category}</span>
                        {vehicle.engineCapacity > 0 && (
                            <span className="badge bg-light text-dark border">
                                {vehicle.engineCapacity} cc
                            </span>
                        )}
                    </div>

                    {/* ───────────────────────────────────────────── */}
                    {/* GIÁ SẢN PHẨM */}
                    {/* ───────────────────────────────────────────── */}
                    <h2 className="text-danger fw-bold display-6 mb-4">
                        {vehicle.formattedPrice || priceFormatter(vehicle.price)}
                    </h2>

                    {/* ───────────────────────────────────────────── */}
                    {/* NÚT THÊM VÀO GIỎ HÀNG VÀ NÚT YÊU THÍCH */}
                    {/* ───────────────────────────────────────────── */}
                    <div className="d-flex gap-3 mb-5">
                        {/* Nút thêm vào giỏ hàng - disable nếu hết hàng */}
                        <button
                            className="btn btn-danger btn-lg flex-grow-1 rounded-pill fw-bold"
                            disabled={vehicle.status !== 'available'}
                            onClick={handleAddToCart}
                        >
                            <i className="bi bi-cart-plus me-2"></i> Thêm vào giỏ hàng
                        </button>
                        
                        {/* Nút yêu thích với counter */}
                        <button 
                            className="btn btn-lg px-4 rounded-pill d-flex align-items-center gap-2" 
                            style={{
                                backgroundColor: 'white',
                                border: '2px solid #dc3545',
                                transition: 'all 0.3s',
                                minWidth: '140px',
                                justifyContent: 'center'
                            }}
                            onClick={handleToggleLike}
                        >
                            {/* Icon đổi theo trạng thái liked/unliked */}
                            {isLiked ? (
                                <AiFillHeart style={{ color: '#dc3545', fontSize: '1.5rem' }} />
                            ) : (
                                <AiOutlineHeart style={{ color: '#dc3545', fontSize: '1.5rem' }} />
                            )}
                            <span className="fw-bold fs-5 text-danger">{likesCount}</span>
                        </button>
                    </div>

                    {/* ───────────────────────────────────────────── */}
                    {/* BẢNG THÔNG SỐ KỸ THUẬT */}
                    {/* ───────────────────────────────────────────── */}
                    {/* Chỉ hiển thị nếu có specifications */}
                    {vehicle.specifications && Object.keys(vehicle.specifications).length > 0 && (
                        <div>
                            <h4 className="fw-bold mb-3 border-bottom pb-2">Thông số kỹ thuật</h4>
                            <table className="table table-striped table-hover border">
                                <tbody>
                                    {/* Duyệt qua từng thông số và hiển thị dạng bảng */}
                                    {Object.entries(vehicle.specifications).map(([key, val]) => (
                                        <tr key={key}>
                                            <th className="w-50 fw-bold text-dark" style={{ paddingLeft: '1rem' }}>
                                                {/* Dùng specsLabelMap để chuyển key thành label tiếng Việt */}
                                                {specsLabelMap[key] || key}
                                            </th>
                                            <td className="fw-normal" style={{ paddingLeft: '1rem' }}>
                                                {val}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION ĐÁNH GIÁ SẢN PHẨM */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="mt-5 pt-5 border-top">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h3 className="fw-bold mb-0">Đánh giá sản phẩm</h3>
                    
                    {/* Hiển thị điểm trung bình và số lượng đánh giá */}
                    {reviews.length > 0 && (
                        <div className="d-flex align-items-center gap-2">
                            <span className="fs-4 fw-bold text-dark">{avgRating}</span>
                            <div className="text-warning fs-5">
                                {/* Render sao đánh giá */}
                                {[...Array(5)].map((_, i) => (
                                    i < Math.round(avgRating) ? <AiFillStar key={i} /> : <AiOutlineStar key={i} />
                                ))}
                            </div>
                            <span className="text-muted">({reviews.length} đánh giá)</span>
                        </div>
                    )}
                </div>

                {/* Danh sách đánh giá */}
                {reviews.length > 0 ? (
                    <div className="row g-4">
                        {reviews.map((rev) => (
                            <div key={rev._id} className="col-12">
                                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            {/* Avatar người đánh giá */}
                                            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '45px', height: '45px', fontSize: '1.1rem' }}>
                                                {rev.customer?.fullName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-0">{rev.customer?.fullName || 'Người dùng ẩn danh'}</h6>
                                                {/* Sao đánh giá */}
                                                <div className="text-warning small">
                                                    {[...Array(5)].map((_, i) => (
                                                        i < rev.rating ? <AiFillStar key={i} /> : <AiOutlineStar key={i} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <small className="text-muted">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</small>
                                    </div>
                                    {/* Nội dung đánh giá */}
                                    <p className="mb-0 text-dark-50" style={{ lineHeight: '1.6' }}>{rev.comment || 'Không có nhận xét.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Hiển thị khi chưa có đánh giá */
                    <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                        <div className="fs-1 text-muted mb-3 opacity-50">⭐</div>
                        <h5 className="text-muted">Chưa có đánh giá nào cho sản phẩm này</h5>
                        <p className="text-muted small">Hãy là người đầu tiên sở hữu và đánh giá sản phẩm!</p>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SECTION CÓ THỂ BẠN SẼ THÍCH (Xe liên quan) */}
            {/* ═══════════════════════════════════════════════════ */}
            {relatedVehicles.length > 0 && (
                <div className='mt-5 pt-5 border-top'>
                    <h3 className='fw-bold mb-4'>Có thể bạn sẽ thích</h3>
                    <div className='row g-4'>
                        {/* Hiển thị các xe cùng category */}
                        {relatedVehicles.map((item) => (
                            <div key={item._id} className='col-md-3'>
                                <VehicleCard vehicle={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
