import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { priceFormatter } from '../utils/priceFormatter';

const CompareTable = ({ vehicles, handleRemoveItem, setShowModal }) => {
  const specGroups = [
    {
      id: 'dong-co',
      title: 'ĐỘNG CƠ & VẬN HÀNH',
      specs: [
        { key: 'dong_co', label: 'Loại động cơ' },
        { key: 'cong_suat', label: 'Công suất tối đa' },
        { key: 'tieu_hao', label: 'Mức tiêu hao nhiên liệu' },
      ]
    },
    {
      id: 'khung-gam',
      title: 'KHUNG GẦM & KÍCH THƯỚC',
      specs: [
        { key: 'chieu_cao_yen', label: 'Chiều cao yên' },
        { key: 'binh_xang', label: 'Dung tích bình xăng' },
        { key: 'phanh', label: 'Hệ thống phanh' },
      ]
    },
    {
      id: 'cong-nghe',
      title: 'CÔNG NGHỆ & TÍNH NĂNG',
      specs: [
        { key: 'cong_nghe', label: 'Công nghệ nổi bật' },
      ]
    },
  ];

  const columns = [...vehicles];
  while (columns.length < 3) columns.push(null);

  return (
    <Table bordered hover striped responsive className="bg-white shadow-sm mt-3" style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr className="sticky-top bg-white" style={{ zIndex: 10 }}>
          {columns.map((bike, index) => (
            <th key={bike ? bike._id || bike.id : `e-${index}`} className="text-center position-relative p-4" style={{ width: '33.33%' }}>
              {bike ? (
                <>
                  <Button 
                    variant="link" 
                    className="position-absolute top-0 end-0 m-2 text-danger text-decoration-none fw-bold fs-5 p-0" 
                    onClick={() => handleRemoveItem(bike._id || bike.id)}
                    title="Xóa lựa chọn"
                  >
                    &times;
                  </Button>
                  
                  <div className="d-flex flex-column align-items-center">
                    <img 
                      src={bike.images?.[0]} 
                      alt={bike.name}
                      onError={(e) => { e.target.src = `https://placehold.co/200x150?text=${encodeURIComponent(bike.name)}`; }}
                      style={{ height: '150px', objectFit: 'contain', marginBottom: '1rem' }}
                    />
                    
                    <Link to={`/product/${bike._id || bike.id}`} className="text-danger fw-bold text-decoration-none mb-2 fs-6">
                      XEM CHI TIẾT XE &rarr;
                    </Link>
                    
                    <h4 className="fs-5 text-dark fw-bold">{bike.name}</h4>
                    
                    <div className="mt-2">
                      <span className="text-muted d-block small">Giá bán lẻ đề xuất</span>
                      <span className="text-danger fw-bold fs-5">
                        {bike.price ? priceFormatter(bike.price) : (bike.formattedPrice || 'Liên hệ')}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 bg-light rounded border border-dashed">
                  <svg viewBox="0 0 24 24" fill="#ccc" width="60" height="60" className="mb-3">
                    <path d="M19 12h-2v-2h-2v-1h-6v1H7v2H5v2h14v-2zm-9 6H7v-2h3v2zm6 0h-3v-2h3v2z" />
                  </svg>
                  <Button variant="outline-danger" className="fw-bold px-4" onClick={() => setShowModal(true)}>
                    CHỌN THÊM SẢN PHẨM +
                  </Button>
                </div>
              )}
            </th>
          ))}
        </tr>
      </thead>
      
      <tbody>
        {specGroups.map(group => (
          <React.Fragment key={group.id}>
            <tr>
              <td colSpan={3} className="bg-danger text-white fw-bold py-2 px-3 text-uppercase fs-6">
                {group.title}
              </td>
            </tr>
            {group.specs.map((spec) => (
              <tr key={spec.key}>
                {columns.map((bike, ci) => (
                  <td key={ci} className="py-3 px-4">
                    {bike ? (
                      <div>
                        <span className="text-secondary small fw-semibold d-block mb-1">{spec.label}</span>
                        <span className="text-dark fw-bold fs-6">{bike.specifications?.[spec.key] || '–'}</span>
                      </div>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </Table>
  );
};

export default CompareTable;
