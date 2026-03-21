import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductList.css';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get('search') || '';

  // State chung
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab chính
  const [activeMainTab, setActiveMainTab] = useState('xe-may');

  // --- Sidebar Filter States ---
  const availableCategories = ['Xe ga', 'Xe số', 'Xe thể thao', 'Phân khối lớn', 'Phân khối nhỏ cổ điển'];
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const [pendingMin, setPendingMin] = useState('');
  const [pendingMax, setPendingMax] = useState('');
  const [appliedMin, setAppliedMin] = useState('');
  const [appliedMax, setAppliedMax] = useState('');
  
  const [engineFilter, setEngineFilter] = useState('');
  const [compareIds, setCompareIds] = useState([]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const toggleCompare = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) return prev; // silent block when max reached
        return [...prev, id];
      }
    });
  };

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch data
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        let url = `http://localhost:5000/api/vehicles?page=${currentPage}&limit=8`;

        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        if (activeMainTab === 'xe-dien') {
          url += `&category=${encodeURIComponent('Xe điện')}`;
        } else {
          if (selectedCategories.length > 0) {
            url += `&category=${encodeURIComponent(selectedCategories.join(','))}`;
          }
          if (appliedMin) url += `&minPrice=${appliedMin}`;
          if (appliedMax) url += `&maxPrice=${appliedMax}`;
          if (engineFilter) url += `&engine=${engineFilter}`;
        }

        const response = await axios.get(url);
        if (response.data.success) {
          setVehicles(response.data.data);
          setTotalItems(response.data.pagination.totalVehicles);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu xe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [searchQuery, currentPage, activeMainTab, selectedCategories, appliedMin, appliedMax, engineFilter]);

  // Handlers
  const handleMainTabChange = (tab) => {
    setActiveMainTab(tab);
    handleResetFilters();
    setCurrentPage(1);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
    setCurrentPage(1);
  };

  const handleApplyPrice = () => {
    let min = pendingMin !== '' ? parseInt(pendingMin, 10) : null;
    let max = pendingMax !== '' ? parseInt(pendingMax, 10) : null;

    // Auto swap if max is smaller than min
    if (min !== null && max !== null && max < min && max > 0) {
      const temp = min;
      min = max;
      max = temp;
      setPendingMin(min.toString());
      setPendingMax(max.toString());
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
    setSelectedCategories([]);
    setPendingMin('');
    setPendingMax('');
    setAppliedMin('');
    setAppliedMax('');
    setEngineFilter('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="product-list-page">
      <div className="product-page-inner">
        
        {/* SIDEBAR FILTER */}
        {activeMainTab === 'xe-may' && (
          <aside className="sidebar-filter">
            <h3 className="filter-heading">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M3 4c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v2c0 .28-.11.53-.29.71L15 12.41V20c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-7.59l-5.71-5.7A.996.996 0 0 1 3 6V4z"></path>
              </svg>
              BỘ LỌC TÌM KIẾM
            </h3>

            <div className="filter-group">
              <h4 className="group-title">Loại xe</h4>
              <div className="category-buttons">
                {availableCategories.map(cat => (
                  <button 
                    key={cat}
                    className={`cat-btn ${selectedCategories.includes(cat) ? 'active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4 className="group-title">Khoảng Giá (VNĐ)</h4>
              <div className="price-inputs">
                <input 
                  type="number" 
                  min="0"
                  placeholder="Từ" 
                  value={pendingMin}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setPendingMin('');
                    else setPendingMin(Math.max(0, parseInt(val, 10)).toString());
                  }}
                />
                <span className="separator">-</span>
                <input 
                  type="number" 
                  min="0"
                  placeholder="Đến" 
                  value={pendingMax}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setPendingMax('');
                    else setPendingMax(Math.max(0, parseInt(val, 10)).toString());
                  }}
                />
              </div>
              <button className="apply-price-btn" onClick={handleApplyPrice}>ÁP DỤNG</button>
            </div>

            <div className="filter-group">
              <h4 className="group-title">Phân khối</h4>
              <div className="radio-list">
                <label className="radio-item">
                  <input 
                    type="radio" 
                    name="engine"
                    value="small"
                    checked={engineFilter === 'small'}
                    onChange={() => handleEngineChange('small')}
                  />
                  <span>Dưới 175cc</span>
                </label>
                <label className="radio-item">
                  <input 
                    type="radio" 
                    name="engine"
                    value="large"
                    checked={engineFilter === 'large'}
                    onChange={() => handleEngineChange('large')}
                  />
                  <span>Trên 175cc</span>
                </label>
              </div>
            </div>

            <button className="reset-filter-btn" onClick={handleResetFilters}>
              XÓA TẤT CẢ
            </button>
          </aside>
        )}

        {/* CỘT NỘI DUNG CHÍNH */}
        <div className="main-content">
          <div className="main-tab-row">
            <button
              className={`main-tab ${activeMainTab === 'xe-may' ? 'main-tab-active' : ''}`}
              onClick={() => handleMainTabChange('xe-may')}
            >
              Xe máy
            </button>
            <button
              className={`main-tab ${activeMainTab === 'xe-dien' ? 'main-tab-active' : ''}`}
              onClick={() => handleMainTabChange('xe-dien')}
            >
              Xe điện
            </button>
          </div>

          <div className="filter-row">
            <div className="result-count">
              Kết quả: <strong>{totalItems} sản phẩm</strong>
            </div>
            
            <div className="action-btns">
              <button className="outline-btn">BẢNG GIÁ SẢN PHẨM →</button>
              <button className="outline-btn" onClick={() => setIsCompareMode(true)}>
                SO SÁNH SẢN PHẨM →
              </button>
            </div>
          </div>

          {isCompareMode && (
            <div className="compare-floating-bar">
              <div className="compare-bar-left">
                <span className="compare-text">Chọn tối đa 3 sản phẩm để so sánh ({compareIds.length}/3)</span>
                <button className="compare-clear" onClick={() => {
                  setIsCompareMode(false);
                  setCompareIds([]);
                }}>
                  Hủy So Sánh
                </button>
              </div>
              <button 
                className="btn-primary"
                onClick={() => {
                  if (compareIds.length > 0) navigate(`/so-sanh?ids=${compareIds.join(',')}`);
                  else alert('Vui lòng chọn xe để so sánh');
                }}
              >
                SO SÁNH SẢN PHẨM →
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">Đang tải dữ liệu...</div>
          ) : vehicles.length === 0 ? (
            <div className="no-result">Không tìm thấy sản phẩm phù hợp.</div>
          ) : (
          <div className="product-grid">
              {vehicles.map((bike) => {
                const id = bike._id || bike.id;
                const isSelected = compareIds.includes(id);
                const maxReached = compareIds.length >= 3;
                // Dim when compare mode active AND 3 selected AND this one isn't selected
                const isDimmed = isCompareMode && maxReached && !isSelected;
                // Blocked from selection when max reached and not currently selected
                const isBlocked = isCompareMode && maxReached && !isSelected;
                
                return (
                  <div
                    key={id}
                    className={`product-card-wrapper ${isDimmed ? 'dimmed' : ''} ${isSelected ? 'selected-for-compare' : ''} ${isBlocked ? 'blocked' : ''}`}
                    onClick={isCompareMode ? (e) => {
                      if (isBlocked) return;
                      e.preventDefault();
                      toggleCompare(id);
                    } : undefined}
                    style={isCompareMode ? { cursor: isBlocked ? 'not-allowed' : 'pointer' } : {}}
                  >
                    <Link
                      to={`/product/${id}`}
                      className="product-card"
                      onClick={isCompareMode ? (e) => e.preventDefault() : undefined}
                    >
                      <div className="card-image-wrapper">
                        <img
                          src={bike.images && bike.images.length > 0 ? bike.images[0] : ''}
                          alt={bike.name}
                          className="card-image"
                          onError={(e) => {
                            e.target.src = `https://placehold.co/320x200/f5f5f5/aaa?text=${encodeURIComponent(bike.name)}`;
                          }}
                        />
                        {bike.status === 'available' && (
                          <span className="badge-new">MỚI</span>
                        )}
                      </div>

                      <div className="card-info">
                        <span className="card-name">{bike.name}</span>
                        <span className="card-price">
                          Giá từ: {bike.formattedPrice || 'Liên hệ'}
                        </span>
                      </div>

                      <div className="card-stats">
                        <span className="card-rating">
                          ⭐ {bike.rating ? bike.rating.toFixed(1) : '5.0'}
                        </span>
                        <span className="card-sold">
                          Đã bán {bike.soldCount ? bike.soldCount.toLocaleString('vi-VN') : 0}
                        </span>
                      </div>
                    </Link>
                    
                    {/* Dấu tick SO SÁNH - chỉ hiện khi isCompareMode = true */}
                    {isCompareMode && (
                      <div className={`compare-circle-btn ${isSelected ? 'active' : ''}`}>
                        {isSelected ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="#999" strokeWidth="2.5" fill="none"><circle cx="12" cy="12" r="10"/></svg>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-nav-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`page-num-btn ${pageNumber === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                className="page-nav-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default ProductList;
