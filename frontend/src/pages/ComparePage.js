import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CompareModal from '../components/CompareModal';
import './ComparePage.css';

const ComparePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const idsParam = params.get('ids');

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!idsParam) { setVehicles([]); setLoading(false); return; }
    const fetchCompareData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/vehicles?ids=${idsParam}`);
        if (res.data.success) {
          const idArray = idsParam.split(',').filter(Boolean);
          const ordered = idArray.map(id => res.data.data.find(v => (v._id || v.id) === id)).filter(Boolean);
          setVehicles(ordered);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchCompareData();
  }, [idsParam]);

  const handleRemoveItem = (idToRemove) => {
    const newIds = idsParam.split(',').filter(Boolean).filter(id => id !== idToRemove);
    newIds.length === 0 ? navigate('/san-pham') : navigate(`/so-sanh?ids=${newIds.join(',')}`);
  };

  const handleAddFromModal = (newSelectedIds) => {
    setShowModal(false);
    navigate(`/so-sanh?ids=${newSelectedIds.join(',')}`);
  };

  // Xóa sạch lựa chọn và quay lại trang sản phẩm
  const handleGoBack = () => {
    // Xóa khỏi localStorage nếu có lưu
    localStorage.removeItem('compareIds');
    localStorage.removeItem('compare_ids');
    navigate('/san-pham');
  };

  // Spec groups definition
  const specGroups = [
    {
      id: 'dong-co',
      title: 'ĐỘNG CƠ',
      specs: [
        { key: 'dong_co', label: 'Loại động cơ' },
        { key: 'cong_suat', label: 'Công suất tối đa' },
        { key: 'phanh', label: 'Hệ thống phanh' },
      ]
    },
    {
      id: 'cong-nghe',
      title: 'CÔNG NGHỆ',
      specs: [
        { key: 'cong_nghe', label: 'Công nghệ nổi bật' },
      ]
    },
    {
      id: 'thong-so',
      title: 'THÔNG SỐ KỸ THUẬT',
      specs: [
        { key: 'chieu_cao_yen', label: 'Chiều cao yên' },
        { key: 'binh_xang', label: 'Dung tích bình xăng' },
        { key: 'tieu_hao', label: 'Mức tiêu hao nhiên liệu' },
      ]
    },
  ];

  const columns = [...vehicles];
  while (columns.length < 3) columns.push(null);

  return (
    <main className="compare-page">
      <div className="compare-container">

        {/* Top bar */}
        <div className="compare-top-header">
          <span className="compare-max-text">So sánh ({vehicles.length}/3 sản phẩm)</span>
          <button className="compare-clear-all" onClick={handleGoBack}>← Quay lại danh sách</button>
        </div>

        {loading ? (
          <div className="compare-loading">Đang tải dữ liệu...</div>
        ) : vehicles.length === 0 ? (
          <div className="compare-empty">Chưa có sản phẩm nào để so sánh.</div>
        ) : (
          <div className="compare-table-wrapper">

            {/* ══ HÀNG 1: STICKY HEADER — chỉ Ảnh + Tên ══ */}
            <div className="cv-row cv-header-row">
              {columns.map((bike, index) => (
                <div key={bike ? bike._id || bike.id : `e-${index}`} className="cv-col">
                  {bike ? (
                    <div className="cv-card">
                      <button className="remove-item-btn" onClick={() => handleRemoveItem(bike._id || bike.id)}>&times;</button>

                      {/* Ảnh */}
                      <div className="cv-img-wrap">
                        <img src={bike.images?.[0]} alt={bike.name}
                          onError={(e) => { e.target.src = `https://placehold.co/200x150?text=${encodeURIComponent(bike.name)}`; }}
                        />
                        {bike.status === 'available' && <span className="cv-badge">MỚI</span>}
                      </div>

                      {/* Link XEM CHI TIẾT — ngay dưới ảnh */}
                      <Link to={`/product/${bike._id || bike.id}`} className="cv-detail-link">
                        XEM CHI TIẾT XE &rarr;
                      </Link>

                      {/* Tên xe */}
                      <h3 className="cv-name">{bike.name}</h3>

                      {/* Giá bán lẻ */}
                      <div className="cv-price-block">
                        <span className="cv-price-label">Giá bán lẻ đề xuất</span>
                        <span className="cv-price">{bike.formattedPrice}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="cv-empty-slot">
                      <svg viewBox="0 0 24 24" fill="#ddd" width="56" height="56"><path d="M19 12h-2v-2h-2v-1h-6v1H7v2H5v2h14v-2zm-9 6H7v-2h3v2zm6 0h-3v-2h3v2z" /></svg>
                      <button className="add-more-btn" onClick={() => setShowModal(true)}>
                        CHỌN THÊM SẢN PHẨM +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ══ CÁC NHÓM THÔNG SỐ (Label-Value Stack) ══ */}
            {specGroups.map(group => (
              <React.Fragment key={group.id}>

                {/* Tiêu đề nhóm — span toàn bộ 3 cột, nền hồng, chữ đỏ */}
                <div className="cv-group-header">
                  <span>{group.title}</span>
                </div>

                {/* Hàng thông số — label xám trên, value đậm dưới trong mỗi cột */}
                {group.specs.map((spec, si) => (
                  <div key={spec.key} className={`cv-row cv-spec-row ${si % 2 === 1 ? 'cv-alt' : ''}`}>
                    {columns.map((bike, ci) => (
                      <div key={ci} className="cv-col cv-spec-cell">
                        {bike ? (
                          <>
                            <span className="cv-spec-label">{spec.label}</span>
                            <span className="cv-spec-value">{bike.specifications?.[spec.key] || '–'}</span>
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </React.Fragment>
            ))}

          </div>
        )}
      </div>

      {showModal && (
        <CompareModal
          selectedIds={idsParam ? idsParam.split(',').filter(Boolean) : []}
          onClose={() => setShowModal(false)}
          onConfirm={handleAddFromModal}
        />
      )}
    </main>
  );
};

export default ComparePage;
