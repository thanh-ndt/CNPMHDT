/**
 * ═══════════════════════════════════════════════════════════════
 * PRODUCT LIST PAGE - TRANG DANH SÁCH SẢN PHẨM
 * ═══════════════════════════════════════════════════════════════
 * Trang này hiển thị danh sách xe với các tính năng:
 * - Tìm kiếm theo từ khóa (từ URL param)
 * - Lọc theo loại xe, khoảng giá, phân khối
 * - Lọc theo hãng xe (từ URL param)
 * - Phân trang kết quả
 * - So sánh tối đa 3 xe
 * - Thêm xe vào giỏ hàng
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { vehicleService } from '../services/vehicleService';
import { addToCartAsync } from '../redux/cartSlice';

import FilterSidebar from '../components/FilterSidebar';
import ProductGrid from '../components/ProductGrid';
import CompareModal from '../components/CompareModal';

// Danh sách các loại xe có sẵn để lọc
const AVAILABLE_CATEGORIES = ['Xe ga', 'Xe số', 'Xe thể thao', 'Phân khối lớn', 'Xe điện'];

export default function ProductListPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const customerEmail = user?.email;

    // ═══════════════════════════════════════════════════════════
    // STATE QUẢN LÝ DỮ LIỆU XE
    // ═══════════════════════════════════════════════════════════
    const [vehicles, setVehicles] = useState([]);           // Danh sách xe hiện tại
    const [loading, setLoading] = useState(true);           // Trạng thái đang tải
    const [pagination, setPagination] = useState({ 
        currentPage: 1, 
        totalPages: 1 
    });                                                      // Thông tin phân trang

    // ═══════════════════════════════════════════════════════════
    // STATE QUẢN LÝ BỘ LỌC
    // ═══════════════════════════════════════════════════════════
    const [selectedCategories, setSelectedCategories] = useState([]);  // Các loại xe đã chọn
    const [pendingMin, setPendingMin] = useState('');                  // Giá tối thiểu đang nhập
    const [pendingMax, setPendingMax] = useState('');                  // Giá tối đa đang nhập
    const [appliedMin, setAppliedMin] = useState('');                  // Giá tối thiểu đã áp dụng
    const [appliedMax, setAppliedMax] = useState('');                  // Giá tối đa đã áp dụng
    const [engineFilter, setEngineFilter] = useState('');              // Bộ lọc phân khối (small/large)

    // ═══════════════════════════════════════════════════════════
    // STATE QUẢN LÝ CHỨC NĂNG SO SÁNH
    // ═══════════════════════════════════════════════════════════
    const [isCompareMode, setIsCompareMode] = useState(false);         // Chế độ so sánh có bật không
    const [compareIds, setCompareIds] = useState([]);                  // Danh sách ID xe đã chọn để so sánh
    const [showCompareModal, setShowCompareModal] = useState(false);   // Hiển thị modal chọn xe so sánh

    // ═══════════════════════════════════════════════════════════
    // LẤY THAM SỐ TÌM KIẾM TỪ URL
    // ═══════════════════════════════════════════════════════════
    const searchTerm = searchParams.get('search') || '';  // Từ khóa tìm kiếm từ URL: ?search=...
    const brandId = searchParams.get('brand') || '';      // ID hãng xe từ URL: ?brand=...

    /**
     * ═══════════════════════════════════════════════════════════
     * HÀM TẢI DỮ LIỆU XE TỪ SERVER
     * ═══════════════════════════════════════════════════════════
     * Hàm này gọi API để lấy danh sách xe dựa trên các bộ lọc hiện tại
     * 
     * @param {number} page - Số trang cần tải (mặc định = 1)
     * 
     * Các bộ lọc được áp dụng:
     * - searchTerm: Từ khóa tìm kiếm từ URL
     * - selectedCategories: Các loại xe đã chọn
     * - appliedMin/appliedMax: Khoảng giá đã áp dụng
     * - engineFilter: Phân khối động cơ
     * - brandId: Hãng xe từ URL
     * ═══════════════════════════════════════════════════════════
     */
    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        
        // Xây dựng object params để gửi lên API
        const params = { page, limit: 8 };
        if (searchTerm) params.search = searchTerm;
        if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
        if (appliedMin) params.minPrice = appliedMin;
        if (appliedMax) params.maxPrice = appliedMax;
        if (engineFilter) params.engine = engineFilter;
        if (brandId) params.brand = brandId;

        // Gọi API qua vehicleService
        const res = await vehicleService.fetchVehiclesData(params);
        if (res.success) {
            setVehicles(res.data);
            setPagination(res.pagination || { currentPage: page, totalPages: 1 });
        }
        setLoading(false);
    }, [searchTerm, selectedCategories, appliedMin, appliedMax, engineFilter, brandId]);

    // Tự động tải dữ liệu khi component mount hoặc khi các dependency thay đổi
    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    // ═══════════════════════════════════════════════════════════
    // XỬ LÝ CÁC THAO TÁC VỚI BỘ LỌC
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Bật/tắt lọc theo loại xe
     * Nếu loại xe đã được chọn -> bỏ chọn
     * Nếu chưa được chọn -> thêm vào danh sách chọn
     */
    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    /**
     * Áp dụng bộ lọc giá
     * Chuyển giá từ trạng thái "đang nhập" sang "đã áp dụng"
     * để kích hoạt tìm kiếm lại
     */
    const handleApplyPrice = () => {
        setAppliedMin(pendingMin);
        setAppliedMax(pendingMax);
    };

    /**
     * Thay đổi bộ lọc phân khối động cơ
     * Click lại vào cùng một option sẽ bỏ chọn (toggle behavior)
     */
    const handleEngineChange = (val) => {
        setEngineFilter((prev) => (prev === val ? '' : val));
    };

    /**
     * Xóa tất cả bộ lọc, reset về trạng thái ban đầu
     */
    const handleResetFilters = () => {
        setSelectedCategories([]);
        setPendingMin('');
        setPendingMax('');
        setAppliedMin('');
        setAppliedMax('');
        setEngineFilter('');
    };

    /**
     * Chuyển trang và cuộn về đầu trang
     */
    const handlePageChange = (page) => {
        fetchData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ═══════════════════════════════════════════════════════════
    // XỬ LÝ CHỨC NĂNG SO SÁNH XE
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Thêm/bỏ xe khỏi danh sách so sánh
     * Giới hạn tối đa 3 xe có thể so sánh cùng lúc
     */
    const toggleCompare = (item) => {
        setCompareIds((prev) => {
            const exists = prev.some((c) => (c.id || c) === (item.id || item));
            // Nếu xe đã được chọn -> bỏ chọn
            if (exists) return prev.filter((c) => (c.id || c) !== (item.id || item));
            
            // Nếu đã chọn đủ 3 xe -> không cho chọn thêm
            if (prev.length >= 3) {
                alert('Bạn chỉ được chọn tối đa 3 sản phẩm để so sánh!');
                return prev;
            }
            
            // Thêm xe vào danh sách so sánh
            return [...prev, item];
        });
    };

    /**
     * Chuyển đến trang so sánh với các xe đã chọn
     * URL sẽ có dạng: /compare?ids=id1,id2,id3
     */
    const goToCompare = () => {
        const ids = compareIds.map((c) => c.id || c).join(',');
        navigate(`/compare?ids=${ids}`);
    };

    // ═══════════════════════════════════════════════════════════
    // XỬ LÝ THÊM XE VÀO GIỎ HÀNG
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Thêm xe vào giỏ hàng
     * Yêu cầu người dùng phải đăng nhập
     */
    const handleAddToCart = async (vehicleId) => {
        if (!customerEmail) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
            navigate('/login');
            return;
        }
        try {
            await dispatch(addToCartAsync({ customerEmail, vehicleId, quantity: 1 })).unwrap();
            alert('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (err) {
            alert(err || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
        }
    };

    return (
        <>
            <Container fluid className="py-4 px-3 px-lg-5">
                <Row className="g-4">
                    {/* Sidebar */}
                    <Col lg={3} xl={2}>
                        <FilterSidebar
                            availableCategories={AVAILABLE_CATEGORIES}
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

                    {/* Main */}
                    <Col lg={9} xl={10}>
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h2 className="fw-bold mb-0">
                                {searchTerm ? `Kết quả cho "${searchTerm}"` : (brandId ? 'Sản phẩm theo hãng' : 'Tất cả sản phẩm')}
                            </h2>
                            <Button
                                variant={isCompareMode ? 'danger' : 'outline-danger'}
                                className="rounded-pill px-4 fw-bold"
                                onClick={() => { setIsCompareMode(!isCompareMode); if (isCompareMode) setCompareIds([]); }}
                            >
                                {isCompareMode ? 'Tắt so sánh' : '⇋ So sánh sản phẩm'}
                            </Button>
                        </div>

                        <ProductGrid
                            vehicles={vehicles}
                            loading={loading}
                            isCompareMode={isCompareMode}
                            compareIds={compareIds}
                            toggleCompare={toggleCompare}
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            handlePageChange={handlePageChange}
                            onAddToCart={handleAddToCart}
                        />
                    </Col>
                </Row>
            </Container>

            {/* Floating compare bar */}
            {isCompareMode && compareIds.length > 0 && (
                <div
                    className="position-fixed bottom-0 start-0 w-100 bg-dark text-white py-3 px-4 d-flex align-items-center justify-content-between"
                    style={{ zIndex: 1050 }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <span className="fw-bold">Đã chọn {compareIds.length}/3 xe</span>
                        <div className="d-flex gap-2">
                            {compareIds.map((c) => (
                                <div
                                    key={c.id || c}
                                    className="bg-white rounded overflow-hidden"
                                    style={{ width: 50, height: 40 }}
                                >
                                    {c.image && (
                                        <img src={c.image} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-light" size="sm" onClick={() => setShowCompareModal(true)}>
                            Thêm xe
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            className="fw-bold px-4"
                            disabled={compareIds.length < 2}
                            onClick={goToCompare}
                        >
                            SO SÁNH NGAY →
                        </Button>
                    </div>
                </div>
            )}

            {/* Compare Modal */}
            {showCompareModal && (
                <CompareModal
                    selectedIds={compareIds.map((c) => c.id || c)}
                    onClose={() => setShowCompareModal(false)}
                    onConfirm={(ids) => {
                        setCompareIds(ids.map((id) => ({ id })));
                        setShowCompareModal(false);
                    }}
                />
            )}
        </>
    );
}
