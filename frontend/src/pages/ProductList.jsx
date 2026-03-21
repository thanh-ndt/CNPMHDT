import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { toggleCompare, resetCompare, setIsCompareMode } from '../redux/compareSlice';
import FilterSidebar from '../components/FilterSidebar.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import './css/ProductList.css';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get('search') || '';

  const { compareIds, isCompareMode } = useSelector((state) => state.compare);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeMainTab, setActiveMainTab] = useState('xe-may');
  const availableCategories = ['Xe ga', 'Xe số', 'Xe thể thao', 'Phân khối lớn', 'Phân khối nhỏ cổ điển'];
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const [pendingMin, setPendingMin] = useState('');
  const [pendingMax, setPendingMax] = useState('');
  const [appliedMin, setAppliedMin] = useState('');
  const [appliedMax, setAppliedMax] = useState('');
  
  const [engineFilter, setEngineFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      try {
        // Tách business logic: Xây dựng queryParams thông qua vehicleService
        const queryParams = vehicleService.buildQueryParams(
          currentPage, searchQuery, activeMainTab, selectedCategories, appliedMin, appliedMax, engineFilter
        );

        // Gọi API fetch
        const data = await vehicleService.fetchVehiclesData(queryParams);
        if (data.success) {
          setVehicles(data.data);
          setTotalItems(data.pagination.totalVehicles);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu xe:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, [searchQuery, currentPage, activeMainTab, selectedCategories, appliedMin, appliedMax, engineFilter]);

  const handleMainTabChange = (tab) => {
    setActiveMainTab(tab);
    handleResetFilters();
    setCurrentPage(1);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) return prev.filter(c => c !== cat);
      return [...prev, cat];
    });
    setCurrentPage(1);
  };

  const handleApplyPrice = () => {
    let min = pendingMin !== '' ? parseInt(pendingMin, 10) : null;
    let max = pendingMax !== '' ? parseInt(pendingMax, 10) : null;
    if (min !== null && max !== null && max < min && max > 0) {
      const temp = min; min = max; max = temp;
      setPendingMin(min.toString()); setPendingMax(max.toString());
    }
    setAppliedMin(min !== null ? min.toString() : '');
    setAppliedMax(max !== null ? max.toString() : '');
    setCurrentPage(1);
  };

  const handleEngineChange = (val) => {
    setEngineFilter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]); setPendingMin(''); setPendingMax('');
    setAppliedMin(''); setAppliedMax(''); setEngineFilter('');
    setCurrentPage(1);
  };

  return (
    <main className="product-list-page py-5 bg-light min-vh-100">
      <Container fluid="lg">
        {/* TAB CHÍNH VÀ TIÊU ĐỀ */}
        <Row className="mb-4">
          <Col lg={activeMainTab === 'xe-may' ? { span: 9, offset: 3 } : 12}>
            <div className="d-flex align-items-center mb-3 border-bottom border-2 border-danger pb-3">
              <h2 className="fs-3 fw-bold mb-0 me-4 text-dark d-none d-md-block">DANH MỤC SẢN PHẨM</h2>
              <div className="d-flex ms-md-auto">
                <Button
                  variant={activeMainTab === 'xe-may' ? 'danger' : 'outline-danger'}
                  className="me-2 px-4 py-2 fw-bold text-uppercase border-2"
                  onClick={() => handleMainTabChange('xe-may')}
                >
                  Xe máy
                </Button>
                <Button
                  variant={activeMainTab === 'xe-dien' ? 'danger' : 'outline-danger'}
                  className="px-4 py-2 fw-bold text-uppercase border-2"
                  onClick={() => handleMainTabChange('xe-dien')}
                >
                  Xe điện
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          {/* CỘT SIDEBAR LỌC: CHỈ HIỆN KHI LÀ XE MÁY */}
          {activeMainTab === 'xe-may' && (
            <Col lg={3} className="mb-4 mb-lg-0">
              <FilterSidebar 
                availableCategories={availableCategories}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                pendingMin={pendingMin}
                pendingMax={pendingMax}
                setPendingMin={setPendingMin}
                setPendingMax={setPendingMax}
                handleApplyPrice={handleApplyPrice}
                engineFilter={engineFilter}
                handleEngineChange={handleEngineChange}
                handleResetFilters={handleResetFilters}
              />
            </Col>
          )}

          {/* CỘT NỘI DUNG CHÍNH GỒM GRID SẢN PHẨM */}
          <Col lg={activeMainTab === 'xe-may' ? 9 : 12}>
            
            {/* THANH TOP BAR: KẾT QUẢ VÀ NÚT SO SÁNH */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-3 bg-white rounded shadow-sm border border-light">
              <div className="result-count mb-3 mb-md-0 fs-5 text-secondary">
                Tìm thấy <strong className="text-danger fs-4 mx-1">{totalItems}</strong> xe phù hợp
              </div>
              
              <div className="d-flex gap-3">
                <Button variant="outline-dark" className="fw-bold px-3 py-2 border-2 text-uppercase">BẢNG GIÁ SẢN PHẨM →</Button>
                <Button variant="outline-danger" className="fw-bold px-3 py-2 border-2 text-uppercase" onClick={() => dispatch(setIsCompareMode(true))}>
                  SO SÁNH NGAY →
                </Button>
              </div>
            </div>

            {/* FLOATING COMPARE BAR KHI BẬT CHẾ ĐỘ SO SÁNH */}
            {isCompareMode && (
              <div className="floating-compare-bar shadow-lg border-top border-danger border-3">
                <div className="container-lg d-flex flex-column flex-md-row justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                    <div>
                      <span className="fw-bold d-block fs-5 text-dark">Đã chọn {compareIds.length}/3 xe</span>
                      <Button variant="link" className="text-secondary p-0 small text-decoration-underline" onClick={() => dispatch(resetCompare())}>
                        Hủy So Sánh
                      </Button>
                    </div>
                    {/* HÌNH ẢNH CỦA CÁC XE ĐÃ CHỌN TRONG REDUX */}
                    <div className="d-flex ms-2">
                      {compareIds.map((item, idx) => (
                        <div key={item.id} className="selected-image-bubble border border-white border-2 bg-light shadow-sm" style={{ zIndex: 3 - idx }}>
                          {item.image ? (
                            <img src={item.image} alt="Selected" />
                          ) : (
                            <div className="empty-bubble">+</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="danger"
                    className="fw-bold px-4 py-3 text-uppercase shadow-sm compare-action-btn"
                    onClick={() => {
                      if (compareIds.length > 0) navigate(`/so-sanh?ids=${compareIds.map(i => i.id).join(',')}`);
                      else alert('Vui lòng chọn ít nhất 1 xe để so sánh!');
                    }}
                  >
                    XEM BẢNG SO SÁNH SẢN PHẨM →
                  </Button>
                </div>
              </div>
            )}

            {/* GRID HIỂN THỊ CÁC XE */}
            <ProductGrid 
              vehicles={vehicles}
              loading={loading}
              isCompareMode={isCompareMode}
              compareIds={compareIds}
              toggleCompare={(payload) => dispatch(toggleCompare(payload))}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
            
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ProductList;
