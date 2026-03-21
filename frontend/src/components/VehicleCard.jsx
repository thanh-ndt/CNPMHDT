import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { priceFormatter } from '../utils/priceFormatter';

const VehicleCard = ({ bike, isCompareMode, isSelected, isDimmed, isBlocked, toggleCompare }) => {
  const id = bike._id || bike.id;

  return (
    <div
      className={`position-relative h-100 ${isDimmed ? 'opacity-50' : ''}`}
      onClick={isCompareMode ? (e) => {
        if (isBlocked) return;
        e.preventDefault();
        toggleCompare(id);
      } : undefined}
      style={{ cursor: isCompareMode ? (isBlocked ? 'not-allowed' : 'pointer') : 'default', transition: '0.3s' }}
    >
      <Card className={`h-100 border-0 shadow-sm overflow-hidden ${isSelected ? 'border border-primary border-2' : ''}`}>
        <Link to={`/product/${id}`} className="text-decoration-none text-dark d-flex flex-column h-100" onClick={isCompareMode ? (e) => e.preventDefault() : undefined}>
          <div className="position-relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <Card.Img
              variant="top"
              src={bike.images && bike.images.length > 0 ? bike.images[0] : ''}
              onError={(e) => {
                e.target.src = `https://placehold.co/320x240/f5f5f5/aaa?text=${encodeURIComponent(bike.name)}`;
              }}
              style={{ objectFit: 'cover', height: '100%', width: '100%' }}
              className="hover-zoom"
            />
            {bike.status === 'available' && (
              <Badge bg="danger" className="position-absolute top-0 start-0 m-2 fs-6">MỚI</Badge>
            )}
          </div>
          
          <Card.Body className="d-flex flex-column bg-light">
            <Card.Title className="fs-5 fw-bold mb-2 text-dark">{bike.name}</Card.Title>
            <Card.Text className="text-danger fs-5 fw-bold mb-3 mt-auto">
              Giá từ: {bike.price ? priceFormatter(bike.price) : (bike.formattedPrice || 'Liên hệ')}
            </Card.Text>
            
            <div className="d-flex justify-content-between align-items-center text-muted small border-top border-secondary pt-3 mt-2">
              <span className="fw-semibold">⭐ {bike.rating ? bike.rating.toFixed(1) : '5.0'}</span>
              <span className="fw-semibold">Đã bán {bike.soldCount ? bike.soldCount.toLocaleString('vi-VN') : 0}</span>
            </div>
          </Card.Body>
        </Link>
      </Card>

      {isCompareMode && (
        <div 
          className={`position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm ${isSelected ? 'bg-primary border border-primary' : 'bg-white border'}`} 
          style={{ width: '32px', height: '32px', zIndex: 10, transition: '0.2s' }}
        >
          {isSelected ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="#adb5bd" strokeWidth="2.5" fill="none"><circle cx="12" cy="12" r="10"/></svg>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
