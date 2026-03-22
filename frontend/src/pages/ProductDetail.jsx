import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CompareModal from '../components/CompareModal.jsx';
import { vehicleService } from '../services/vehicleService';
import { priceFormatter } from '../utils/priceFormatter';
import './css/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [heartAnim, setHeartAnim] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBike = async () => {
      try {
        const found = await vehicleService.fetchVehicleById(id);
        if (found) {
          setBike(found);
          setFavCount(found.favoritesCount || 0);
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết xe:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBike();
  }, [id]);

  if (loading) {
    return <div className="not-found"><h2>Đang tải thông tin xe...</h2></div>;
  }

  if (!bike) {
    return (
      <div className="not-found">
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/" className="back-link">← Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <main className="detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link to="/">Sản phẩm</Link>
          <span className="bc-sep">›</span>
          <span>{bike.name}</span>
        </div>
      </div>

      {/* Main detail section */}
      <div className="detail-container">
        <div className="detail-grid">
          {/* Left: Image */}
          <div className="detail-image-col">
            <div className="detail-image-wrapper">
              {bike.status === 'available' && <span className="detail-badge">SẴN HÀNG</span>}
              <img
                src={bike.images && bike.images.length > 0 ? bike.images[0] : ''}
                alt={bike.name}
                className="detail-image"
                onError={(e) => {
                  e.target.src = `https://placehold.co/600x400/f0f0f0/888?text=${encodeURIComponent(bike.name)}`;
                }}
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="detail-info-col">
            <h1 className="detail-name">{bike.name}</h1>

            <div className="detail-price-row">
              <span className="detail-price-label">Giá từ:</span>
              <span className="detail-price text-danger fw-bold">{bike.price ? priceFormatter(bike.price) : (bike.formattedPrice || 'Liên hệ')}</span>
              <button
                className={`fav-btn ${isFavorited ? 'fav-btn--active' : ''} ${heartAnim ? 'fav-btn--pulse' : ''}`}
                title="Yêu thích"
                onClick={async () => {
                  if (isFavorited) return;
                  try {
                    const res = await vehicleService.toggleFavorite(bike._id || bike.id);
                    if (res.success) {
                      setFavCount(res.favoritesCount);
                      setIsFavorited(true);
                      setHeartAnim(true);
                      setTimeout(() => setHeartAnim(false), 600);
                    }
                  } catch (e) {
                    console.error('Lỗi yêu thích:', e);
                  }
                }}
              >
                <svg className="heart-icon" viewBox="0 0 24 24" width="18" height="18"
                  fill={isFavorited ? '#cc0000' : 'none'}
                  stroke={isFavorited ? '#cc0000' : '#cc0000'}
                  strokeWidth="2"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{favCount.toLocaleString('vi-VN')}</span>
              </button>
            </div>

            <div className="detail-specs">
              <div className="spec-row">
                <span className="spec-key">Phân loại</span>
                <span className="spec-val">{bike.category || bike.type || 'Xe máy'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Phân khối</span>
                <span className="spec-val">
                  {bike.engineCapacity === 0 ? 'Xe điện' : (bike.engineCapacity ? `${bike.engineCapacity}cc` : 'Chưa có thông tin')}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Tình trạng</span>
                <span className="spec-val">{bike.status === 'available' ? 'Đang bán' : 'Hết hàng'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Hãng xe</span>
                <span className="spec-val">{bike.brand?.name || 'Honda'}</span>
              </div>
            </div>

            <div className="detail-actions">
              <button className="btn-primary">Đặt mua ngay</button>
              <button className="btn-secondary" onClick={() => setShowCompareModal(true)}>So sánh</button>
            </div>

            <div className="detail-note">
              * Giá có thể thay đổi theo từng đại lý và khu vực. Liên hệ cửa hàng ủy nhiệm để biết thêm chi tiết.
            </div>
          </div>
        </div>
      </div>

      {/* Dưới: Layout 2 cột Thông số & Mô tả */}
      <div className="detail-bottom-section">
        <div className="detail-bottom-inner">
          
          {/* Cột trái (40%): Specs */}
          <div className="detail-specs-col">
            <h3 className="section-title">THÔNG SỐ KỸ THUẬT</h3>
            <div className="specs-table-large">
              <div className="spec-row"><div className="spec-key">Động cơ</div><div className="spec-val">eSP+ 4 van, xy-lanh đơn, 124,8cc, làm mát bằng dung dịch</div></div>
              <div className="spec-row"><div className="spec-key">Công suất / Mô-men</div><div className="spec-val">8,2 kW @ 8.500 vòng/phút / 11,7 Nm @ 5.000 vòng/phút</div></div>
              <div className="spec-row"><div className="spec-key">Hệ thống nhiên liệu</div><div className="spec-val">Phun xăng điện tử PGM-FI</div></div>
              <div className="spec-row"><div className="spec-key">Mức tiêu hao</div><div className="spec-val">2,12 lít/100km</div></div>
              <div className="spec-row"><div className="spec-key">Khung gầm</div><div className="spec-val">Khung dập thế hệ mới eSAF (Trọng lượng: 116 kg)</div></div>
              <div className="spec-row"><div className="spec-key">Kích thước (DxRxC)</div><div className="spec-val">1.950 x 669 x 1.100 mm</div></div>
              <div className="spec-row"><div className="spec-key">Độ cao yên / Gầm</div><div className="spec-val">765 mm / 151 mm</div></div>
              <div className="spec-row"><div className="spec-key">Phanh (Trước/Sau)</div><div className="spec-val">Đĩa (ABS/CBS tùy bản) / Tang trống</div></div>
              <div className="spec-row"><div className="spec-key">Giảm xóc (Trước/Sau)</div><div className="spec-val">Ống lồng / Lò xo trụ đơn</div></div>
              <div className="spec-row"><div className="spec-key">Tiện ích tiêu chuẩn</div><div className="spec-val">Smart Key, Cổng sạc USB-C, Cốp 18,5L, Đèn Full LED</div></div>
            </div>
          </div>

          {/* Cột phải (60%): Mô tả */}
          <div className="detail-desc-col">
            <h3 className="section-title">MÔ TẢ SẢN PHẨM</h3>
            <div className="desc-content">
              {bike.description ? (
                <p>{bike.description}</p>
              ) : (
                <p>Mẫu xe <strong>{bike.name}</strong> mang đến những trải nghiệm vận hành ưu việt và thiết kế phong cách vượt thời gian. Sự kết hợp hoàn hảo giữa công nghệ hiện đại và động cơ bền bỉ mang đến cho bạn tự do di chuyển trong mọi hành trình.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {showCompareModal && (
        <CompareModal 
          currentBikeId={bike._id || bike.id}
          selectedIds={[]} 
          onClose={() => setShowCompareModal(false)}
          onConfirm={(selected) => {
            const finalIds = [bike._id || bike.id, ...selected];
            navigate(`/so-sanh?ids=${finalIds.join(',')}`);
          }}
        />
      )}
    </main>
  );
};

export default ProductDetail;
