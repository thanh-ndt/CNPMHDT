import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vehicleService } from '../services/vehicleService';
import { priceFormatter } from '../utils/priceFormatter';
import { addToCartAsync } from '../redux/cartSlice';

const FAVORITES_KEY = 'honda-store-favorites';

export const getFavorites = () => {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
};

export const toggleFavorite = (vehicleId) => {
    const favs = getFavorites();
    const idx = favs.indexOf(vehicleId);
    if (idx > -1) {
        favs.splice(idx, 1);
    } else {
        favs.push(vehicleId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return favs;
};

export const isFavorite = (vehicleId) => getFavorites().includes(vehicleId);

const FavoritesPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(getFavorites());

    useEffect(() => {
        const loadFavorites = async () => {
            setLoading(true);
            const ids = getFavorites();
            if (ids.length === 0) {
                setVehicles([]);
                setLoading(false);
                return;
            }

            const results = await Promise.allSettled(
                ids.map(id => vehicleService.getVehicleById(id))
            );

            const loaded = results
                .filter(r => r.status === 'fulfilled' && r.value?.success)
                .map(r => r.value.data);

            setVehicles(loaded);
            setLoading(false);
        };

        loadFavorites();
    }, [favorites]);

    const handleRemoveFavorite = (vehicleId) => {
        const updated = toggleFavorite(vehicleId);
        setFavorites([...updated]);
    };

    const handleAddToCart = async (vehicle) => {
        if (!user?.email) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng.');
            navigate('/login');
            return;
        }
        try {
            await dispatch(addToCartAsync({ customerEmail: user.email, vehicleId: vehicle._id, quantity: 1 })).unwrap();
            alert('Đã thêm vào giỏ hàng!');
        } catch (err) {
            alert('Có lỗi khi thêm vào giỏ hàng.');
        }
    };

    return (
        <Container className="my-5 py-3">
            <Row className="mb-4 align-items-end">
                <Col>
                    <h2 className="mb-1 fw-bold">
                        <i className="bi bi-heart-fill me-2 text-danger"></i>Sản phẩm yêu thích
                    </h2>
                    <p className="text-muted mb-0">Những chiếc xe bạn đã đánh dấu yêu thích</p>
                </Col>
                <Col xs="auto">
                    <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => navigate('/products')}>
                        Tiếp tục tìm xe
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted">Đang tải danh sách yêu thích...</p>
                </div>
            ) : vehicles.length === 0 ? (
                <div className="text-center py-5 my-4">
                    <div className="display-1 mb-3 text-secondary opacity-50">🤍</div>
                    <h4 className="fw-bold text-dark">Chưa có sản phẩm yêu thích</h4>
                    <p className="text-muted">Hãy bấm vào biểu tượng ❤️ trên trang chi tiết xe để lưu vào đây nhé!</p>
                    <Button variant="danger" className="mt-3 rounded-pill px-5 py-2 fw-bold" onClick={() => navigate('/products')}>
                        Khám phá xe ngay
                    </Button>
                </div>
            ) : (
                <Row className="g-4">
                    {vehicles.map(vehicle => (
                        <Col key={vehicle._id} sm={6} lg={4} xl={3}>
                            <Card className="h-100 border-0 shadow-sm rounded-3 overflow-hidden" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
                            >
                                {/* Image */}
                                <div
                                    className="position-relative"
                                    style={{ height: '190px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                                    onClick={() => navigate(`/product/${vehicle._id}`)}
                                >
                                    <img
                                        src={vehicle.images?.[0] || `https://placehold.co/400x300/e3002b/fff?text=${encodeURIComponent(vehicle.name?.slice(0,10) || 'Honda')}`}
                                        alt={vehicle.name}
                                        className="w-100 h-100"
                                        style={{ objectFit: 'contain', padding: '12px' }}
                                        onError={e => { e.target.src = `https://placehold.co/400x300/e3002b/fff?text=Honda`; }}
                                    />
                                    {vehicle.status === 'available' && (
                                        <Badge bg="danger" className="position-absolute top-0 start-0 m-2">Còn hàng</Badge>
                                    )}
                                    {vehicle.status === 'out_of_stock' && (
                                        <Badge bg="secondary" className="position-absolute top-0 start-0 m-2">Hết hàng</Badge>
                                    )}
                                    {/* Nút bỏ yêu thích */}
                                    <button
                                        className="position-absolute top-0 end-0 m-2 btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '32px', height: '32px', border: 'none' }}
                                        title="Bỏ yêu thích"
                                        onClick={e => { e.stopPropagation(); handleRemoveFavorite(vehicle._id); }}
                                    >
                                        <i className="bi bi-heart-fill text-danger"></i>
                                    </button>
                                </div>

                                <Card.Body className="d-flex flex-column p-3">
                                    <h6 className="fw-bold mb-1 text-dark" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${vehicle._id}`)}>
                                        {vehicle.name}
                                    </h6>
                                    <p className="text-muted small mb-2">
                                        {vehicle.brand?.name} {vehicle.vehicleModel?.name ? `• ${vehicle.vehicleModel.name}` : ''}
                                    </p>
                                    <p className="fw-bold text-danger mb-2 fs-5">{priceFormatter(vehicle.price)}</p>

                                    <div className="d-flex gap-2 mt-auto">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="rounded-pill flex-fill"
                                            onClick={() => navigate(`/product/${vehicle._id}`)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="rounded-pill flex-fill"
                                            disabled={vehicle.status !== 'available'}
                                            onClick={() => handleAddToCart(vehicle)}
                                        >
                                            Thêm vào giỏ
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default FavoritesPage;
