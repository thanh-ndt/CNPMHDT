import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vehicleService } from '../services/vehicleService';
import { priceFormatter } from '../utils/priceFormatter';
import { addToCartAsync } from '../redux/cartSlice';
import { fetchVehicles, selectRelatedVehicles } from '../redux/vehicleSlice';
import { specsLabelMap } from '../utils/constants';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import VehicleCard from '../components/VehicleCard';
import { isFavorite, toggleFavorite } from './FavoritesPage';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const customerEmail = user?.email;
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState('');
    
    // State cho tính năng yêu thích - đồng bộ với localStorage
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    
    const relatedVehicles = useSelector((state) => selectRelatedVehicles(state, id, vehicle?.category));

    const handleAddToCart = async () => {
        if (!customerEmail) {
            alert('Vui lòng đăng nhập hoặc đăng ký để bỏ sản phẩm vào giỏ hàng.');
            navigate('/login');
            return;
        }
        try {
            await dispatch(addToCartAsync({ customerEmail, vehicleId: vehicle._id || id, quantity: 1 })).unwrap();
            alert('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (err) {
            alert(err || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
        }
    };

    const handleToggleLike = () => {
        const newFavs = toggleFavorite(id);
        const liked = newFavs.includes(id);
        setIsLiked(liked);
        setLikesCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
    };

    useEffect(() => {
        const fetchVehicle = async () => {
            setLoading(true);
            try {
                const res = await vehicleService.getVehicleById(id);
                if (res.success && res.data) {
                    setVehicle(res.data);
                    // Init likes count
                    setLikesCount(res.data.favoritesCount || 0);
                    // Đọc trạng thái yêu thích từ localStorage
                    setIsLiked(isFavorite(id));

                    // Nạp danh sách xe cùng Category vào Redux Store để Selector xử lý
                    dispatch(fetchVehicles({ category: res.data.category, limit: 50 }));
                    
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

        if (id) {
            fetchVehicle();
        }
    }, [id, dispatch]);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="container py-5 text-center">
                <h4 className="text-danger">{error || 'Không tìm thấy sản phẩm.'}</h4>
                <Link to="/products" className="btn btn-outline-danger mt-3">Quay lại danh sách</Link>
            </div>
        );
    }

    const placeholderImg = `https://placehold.co/800x600/e3002b/fff?text=${encodeURIComponent(vehicle.name?.slice(0, 15)) || 'Xe'}`;
    const mainImgSrc = activeImage || placeholderImg;

    return (
        <div className="container py-5">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-danger">Trang chủ</Link></li>
                    <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none text-danger">Sản phẩm</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{vehicle.name}</li>
                </ol>
            </nav>

            <div className="row g-5">
                {/* Hình ảnh */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                        <img
                            src={mainImgSrc}
                            alt={vehicle.name}
                            className="img-fluid w-100"
                            style={{ height: '400px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = placeholderImg; }}
                        />
                    </div>
                    {/* Thumbnail images */}
                    {vehicle.images && vehicle.images.length > 1 && (
                        <div className="d-flex gap-2 overflow-auto py-2">
                            {vehicle.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`thumb ${idx}`}
                                    className={`rounded-3 cursor-pointer ${activeImage === img ? 'border border-2 border-danger shadow-sm' : ''}`}
                                    style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onClick={() => setActiveImage(img)}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Mô tả sản phẩm chi tiết */}
                    <div className="mt-5">
                        <h4 className="fw-bold mb-3 border-bottom pb-2">Mô tả sản phẩm</h4>
                        <div 
                            className="text-dark" 
                            style={{ 
                                whiteSpace: 'pre-line', 
                                textAlign: 'justify', 
                                lineHeight: '1.6'
                            }}
                        >
                            {vehicle.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
                        </div>
                    </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="col-lg-6">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                        <h1 className="fw-bold fs-2 mb-0">{vehicle.name}</h1>
                        {vehicle.status === 'available' && (
                            <span className="badge bg-success fs-6 mt-1">Còn hàng</span>
                        )}
                        {vehicle.status === 'out_of_stock' && (
                            <span className="badge bg-secondary fs-6 mt-1">Hết hàng</span>
                        )}
                    </div>

                    <div className="mb-3">
                        <span className="badge bg-light text-dark border me-2">{vehicle.brand?.name || 'Chưa rõ hãng'}</span>
                        <span className="badge bg-light text-dark border me-2">{vehicle.category}</span>
                        {vehicle.engineCapacity > 0 && (
                            <span className="badge bg-light text-dark border">
                                {vehicle.engineCapacity} cc
                            </span>
                        )}
                    </div>

                    <h2 className="text-danger fw-bold display-6 mb-4">
                        {vehicle.formattedPrice || priceFormatter(vehicle.price)}
                    </h2>

                    {/* Quantity & Actions */}
                    <div className="d-flex gap-3 mb-5">
                        <button
                            className="btn btn-danger btn-lg flex-grow-1 rounded-pill fw-bold"
                            disabled={vehicle.status !== 'available'}
                            onClick={handleAddToCart}
                        >
                            <i className="bi bi-cart-plus me-2"></i> Thêm vào giỏ hàng
                        </button>
                        
                        {/* Nút Yêu thích */}
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
                            {isLiked ? (
                                <AiFillHeart style={{ color: '#dc3545', fontSize: '1.5rem' }} />
                            ) : (
                                <AiOutlineHeart style={{ color: '#dc3545', fontSize: '1.5rem' }} />
                            )}
                            <span className="fw-bold fs-5 text-danger">{likesCount}</span>
                        </button>
                    </div>

                    {/* Thông số kỹ thuật */}
                    {vehicle.specifications && Object.keys(vehicle.specifications).length > 0 && (
                        <div>
                            <h4 className="fw-bold mb-3 border-bottom pb-2">Thông số kỹ thuật</h4>
                            <table className="table table-striped table-hover border">
                                <tbody>
                                    {Object.entries(vehicle.specifications).map(([key, val]) => (
                                        <tr key={key}>
                                            <th className="w-50 fw-bold text-dark" style={{ paddingLeft: '1rem' }}>
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

            {/* Section Có thể bạn sẽ thích */}
            {relatedVehicles.length > 0 && (
                <div className='mt-5 pt-5 border-top'>
                    <h3 className='fw-bold mb-4'>Có thể bạn sẽ thích</h3>
                    <div className='row g-4'>
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
