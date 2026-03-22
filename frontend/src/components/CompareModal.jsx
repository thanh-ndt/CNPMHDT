import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { priceFormatter } from '../utils/priceFormatter';
import './css/CompareModal.css';

const CompareModal = ({ currentBikeId, onClose, selectedIds, onConfirm }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedIds || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');

  useEffect(() => {
    const fetchVehiclesData = async () => {
      try {
        const res = await vehicleService.fetchVehiclesData({ limit: 100 });
        if (res.success) {
          // Lọc bỏ xe gốc
          let data = res.data;
          if (currentBikeId) {
            data = data.filter(v => (v._id || v.id) !== currentBikeId);
          }
          setVehicles(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehiclesData();
  }, [currentBikeId]);

  const tabs = ['Tất cả', 'Xe ga', 'Xe số', 'Xe thể thao', 'Phân khối lớn', 'Xe điện'];

  const filteredVehicles = vehicles.filter(v => {
    if (activeTab !== 'Tất cả' && v.category !== activeTab) return false;
    if (searchTerm && !v.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleToggle = (id) => {
    setLocalSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      // Giới hạn max tổng: currentBike + selected = 3 => localSelected max = 2 (nếu có currentBike)
      // Nếu là ComparePage gọi modal (không có currentBikeId), total max = 3.
      const currentCount = currentBikeId ? 1 : 0;
      const maxAllowed = 3 - currentCount;
      if (prev.length >= maxAllowed) {
        alert(`Bạn chỉ được chọn thêm tối đa ${maxAllowed} sản phẩm!`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(localSelectedIds);
    }
  };

  return (
    <div className="compare-modal-overlay">
      <div className="compare-modal">
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <div className="modal-tabs">
            {tabs.map(tab => (
              <button 
                key={tab} 
                className={`modal-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="modal-search">
            <input 
              type="text" 
              placeholder="Nhập tên loại xe" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">Đang tải dữ liệu...</div>
          ) : (
            <div className="modal-grid">
              {filteredVehicles.map(bike => {
                const id = bike._id || bike.id;
                const isSelected = localSelectedIds.includes(id);
                return (
                  <div key={id} className="modal-product-card" onClick={() => handleToggle(id)}>
                    <div className="modal-img-wrapper">
                      <img src={bike.images?.[0]} alt={bike.name} onError={(e) => {
                        e.target.src = `https://placehold.co/150x120?text=${encodeURIComponent(bike.name)}`;
                      }}/>
                      {bike.status === 'available' && <span className="modal-badge">MỚI</span>}
                    </div>
                    <div className="modal-product-info">
                      <h4>{bike.name}</h4>
                      <p>Giá từ: <span className="text-danger fw-bold">{bike.price ? priceFormatter(bike.price) : (bike.formattedPrice || 'Liên hệ')}</span></p>
                    </div>
                    
                    <div className={`modal-check ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="confirm-btn" onClick={handleConfirm}>
            XÁC NHẬN &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
