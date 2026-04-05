import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { vehicleService } from '../services/vehicleService';
import { addToCartAsync } from '../redux/cartSlice';

import FilterSidebar from '../components/FilterSidebar';
import ProductGrid from '../components/ProductGrid';
import CompareModal from '../components/CompareModal';

const AVAILABLE_CATEGORIES = ['Xe ga', 'Xe số', 'Xe thể thao', 'Phân khối lớn', 'Xe điện'];

export default function ProductListPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const customerEmail = user?.email;

    // Data
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    // Filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [pendingMin, setPendingMin] = useState('');
    const [pendingMax, setPendingMax] = useState('');
    const [appliedMin, setAppliedMin] = useState('');
    const [appliedMax, setAppliedMax] = useState('');
    const [engineFilter, setEngineFilter] = useState('');

    // Compare
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [compareIds, setCompareIds] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const searchTerm = searchParams.get('search') || '';
    const brandId = searchParams.get('brand') || '';

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        const params = { page, limit: 8 };
        if (searchTerm) params.search = searchTerm;
        if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
        if (appliedMin) params.minPrice = appliedMin;
        if (appliedMax) params.maxPrice = appliedMax;
        if (engineFilter) params.engine = engineFilter;
        if (brandId) params.brand = brandId;

        const res = await vehicleService.fetchVehiclesData(params);
        if (res.success) {
            setVehicles(res.data);
            setPagination(res.pagination || { currentPage: page, totalPages: 1 });
        }
        setLoading(false);
    }, [searchTerm, selectedCategories, appliedMin, appliedMax, engineFilter, brandId]);

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    // Filter handlers
    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const handleApplyPrice = () => {
        setAppliedMin(pendingMin);
        setAppliedMax(pendingMax);
    };

    const handleEngineChange = (val) => {
        setEngineFilter((prev) => (prev === val ? '' : val));
    };

    const handleResetFilters = () => {
        setSelectedCategories([]);
        setPendingMin('');
        setPendingMax('');
        setAppliedMin('');
        setAppliedMax('');
        setEngineFilter('');
    };

    const handlePageChange = (page) => {
        fetchData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Compare handlers
    const toggleCompare = (item) => {
        setCompareIds((prev) => {
            const exists = prev.some((c) => (c.id || c) === (item.id || item));
            if (exists) return prev.filter((c) => (c.id || c) !== (item.id || item));
            if (prev.length >= 3) {
                alert('Bạn chỉ được chọn tối đa 3 sản phẩm để so sánh!');
                return prev;
            }
            return [...prev, item];
        });
    };

    const goToCompare = () => {
        const ids = compareIds.map((c) => c.id || c).join(',');
        navigate(`/compare?ids=${ids}`);
    };

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
