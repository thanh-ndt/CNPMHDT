import { useNavigate } from 'react-router-dom';
import { priceFormatter } from '../utils/priceFormatter';

/**
 * VehicleCard — supports two usage patterns:
 *   1. HomePage style:   <VehicleCard vehicle={v} formatPrice={fn} />
 *   2. ProductGrid style: <VehicleCard bike={b} isCompareMode isSelected isDimmed isBlocked toggleCompare={fn} onAddToCart={fn} />
 */
export default function VehicleCard({
    vehicle, formatPrice,                                       // HomePage props
    bike, isCompareMode, isSelected, isDimmed, isBlocked, toggleCompare, onAddToCart // ProductGrid props
}) {
    const navigate = useNavigate();
    const v = vehicle || bike;
    if (!v) return null;

    const id = v._id || v.id;

    const imgSrc =
        v.images && v.images.length > 0
            ? v.images[0]
            : `https://placehold.co/400x300/e3002b/fff?text=${encodeURIComponent(v.name?.slice(0, 15) || 'Honda')}`;

    const displayPrice = formatPrice
        ? formatPrice(v.price)
        : priceFormatter(v.price);

    const cardStyle = {
        opacity: isDimmed ? 0.45 : 1,
        pointerEvents: isBlocked ? 'none' : 'auto',
        transition: 'all 0.3s',
        cursor: 'pointer',
    };

    const handleCompareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (toggleCompare) toggleCompare();
    };

    const handleCardClick = () => {
        navigate(`/product/${id}`);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        navigate('/checkout', {
            state: {
                selectedItems: [{
                    vehicleId: id,
                    name: v.name,
                    price: v.price,
                    quantity: 1,
                    brandName: v.brand?.name || 'Honda',
                    vehicleModelName: v.vehicleModel?.name || '',
                    manufacture: v.manufacture,
                    images: v.images || [],
                }]
            }
        });
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (onAddToCart) onAddToCart(id);
    };

    return (
        <div
            className={`card h-100 border-0 shadow-sm overflow-hidden w-100 ${isSelected ? 'border-danger border-2' : ''}`}
            style={cardStyle}
            onClick={handleCardClick}
        >
            <div className="position-relative">
                <img
                    src={imgSrc}
                    alt={v.name}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                        e.target.src = `https://placehold.co/400x300/e3002b/fff?text=${encodeURIComponent(v.name?.slice(0, 15) || 'Honda')}`;
                    }}
                />
                {v.status === 'available' && (
                    <span className="position-absolute top-0 start-0 badge bg-danger m-2">MỚI</span>
                )}

                {/* Compare checkbox overlay */}
                {isCompareMode && (
                    <button
                        type="button"
                        className="position-absolute top-0 end-0 m-2 btn btn-sm p-0 d-flex align-items-center justify-content-center"
                        style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: isSelected ? '#cc0000' : 'rgba(255,255,255,0.85)',
                            border: isSelected ? '2px solid #cc0000' : '2px solid #999',
                        }}
                        onClick={handleCompareClick}
                        title="So sánh"
                    >
                        {isSelected && (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold mb-1">{v.name}</h5>
                <p className="text-muted small mb-2">
                    {v.vehicleModel?.name || ''} {v.manufacture ? `• ${v.manufacture}` : ''}
                </p>
                {v.category && (
                    <span className="badge bg-secondary bg-opacity-10 text-secondary mb-2 align-self-start">
                        {v.category}
                    </span>
                )}
                <p className="fw-bold text-danger mt-auto mb-2 fs-5">
                    {displayPrice}
                </p>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-pill flex-fill"
                        onClick={handleBuyNow}
                    >
                        Mua ngay
                    </button>
                    {isCompareMode ? (
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill flex-fill ${isSelected ? 'btn-danger' : 'btn-outline-secondary'}`}
                            onClick={handleCompareClick}
                        >
                            {isSelected ? '✓ Đã chọn' : 'So sánh'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-danger btn-sm rounded-pill flex-fill"
                            onClick={handleAddToCartClick}
                        >
                            Thêm vào giỏ
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
