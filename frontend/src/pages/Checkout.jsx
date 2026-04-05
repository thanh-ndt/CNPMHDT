import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addAddress, fetchAddresses, resetAddressState } from '../redux/addressSlice';
import { orderApi } from '../api/orderApi';
import { validatePromotionApi } from '../api/promotionApi';
import NotificationModal from '../components/NotificationModal';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);

    // Read items from navigation state
    const orderItems = location.state?.selectedItems || [];

    // Address state from Redux
    const { addresses: savedAddresses, loading: addressLoading, error: addressError } = useSelector((state) => state.address);

    // Address modal state
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({ phone: '', diaChi: '', ghiChu: '' });
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [paymentMethod, setPaymentMethod] = useState('payment-cod');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Promotion state
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });

    // Notification modal state
    const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'info' });

    const showNotification = (title, message, type = 'info') => {
        setNotification({ show: true, title, message, type });
    };

    const closeNotification = () => {
        setNotification({ show: false, title: '', message: '', type: 'info' });
    };

    // Load saved addresses from DB when component mounts
    useEffect(() => {
        if (user?._id) {
            dispatch(fetchAddresses(user._id));
        }
    }, [dispatch, user]);

    // Auto-select the first address when addresses are loaded
    useEffect(() => {
        if (savedAddresses.length > 0 && !selectedAddress) {
            setSelectedAddress(savedAddresses[0]);
        }
    }, [savedAddresses, selectedAddress]);

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price);

    const calculateSubtotal = () => {
        return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const shippingFee = 500000;

    const calculateDiscount = () => {
        if (!appliedPromo) return 0;
        const subtotal = calculateSubtotal();
        if (appliedPromo.type === 'fixed') {
            return appliedPromo.discountValue;
        } else {
            return Math.round((subtotal * appliedPromo.discountValue) / 100);
        }
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        return Math.max(0, (subtotal + shippingFee) - discount);
    };

    // Address modal handlers
    const handleOpenAddressModal = () => {
        dispatch(resetAddressState());
        setAddressForm({ phone: '', diaChi: '', ghiChu: '' });
        setShowAddressModal(true);
    };

    const handleCloseAddressModal = () => {
        setShowAddressModal(false);
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        if (!user?._id) {
            showNotification('Lỗi', 'Vui lòng đăng nhập để lưu địa chỉ.', 'error');
            return;
        }
        try {
            const result = await dispatch(addAddress({
                ...addressForm,
                customer: user._id,
            })).unwrap();
            // Auto-select the newly saved address
            const newAddr = result.data || addressForm;
            setSelectedAddress(newAddr);
            setShowAddressModal(false);
            showNotification('Thành công', 'Đã lưu địa chỉ giao hàng mới.', 'success');
        } catch {
            // Error is handled via Redux state
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            setPromoMessage({ text: 'Vui lòng nhập mã giảm giá', type: 'error' });
            return;
        }

        setIsApplyingPromo(true);
        setPromoMessage({ text: '', type: '' });

        try {
            // Get unique vehicle model IDs from order items for validation
            const vehicleModelIds = [...new Set(orderItems.map(item => item.vehicleModelId).filter(Boolean))];
            
            const res = await validatePromotionApi({ 
                code: promoCode,
                vehicleModelIds: vehicleModelIds
            });

            if (res.success) {
                setAppliedPromo(res.data);
                setPromoMessage({ text: 'Áp dụng mã thành công!', type: 'success' });
            } else {
                setPromoMessage({ text: res.message || 'Mã không hợp lệ', type: 'error' });
            }
        } catch (error) {
            setPromoMessage({ 
                text: error.response?.data?.message || 'Lỗi khi kiểm tra mã', 
                type: 'error' 
            });
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoMessage({ text: '', type: '' });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            showNotification('Thiếu địa chỉ', 'Vui lòng chọn hoặc thêm địa chỉ giao hàng.', 'warning');
            return;
        }

        const addressString = `${selectedAddress.phone} - ${selectedAddress.diaChi} ${selectedAddress.ghiChu ? `(${selectedAddress.ghiChu})` : ''}`;

        setIsPlacingOrder(true);
        try {
            const res = await orderApi.createOrder({
                customerEmail: user?.email,
                shippingAddress: addressString,
                paymentMethod: paymentMethod,
                promotionId: appliedPromo?.id,
                orderItems: orderItems.map(item => ({
                    vehicleId: item.vehicleId,
                    quantity: item.quantity
                }))
            });

            if (res.success) {
                showNotification('Đặt hàng thành công!', 'Đơn hàng của bạn đã được tạo. Bạn sẽ được chuyển đến trang đơn hàng.', 'success');
                setTimeout(() => navigate('/orders'), 1500);
            } else {
                showNotification('Lỗi', res.message || 'Lỗi khi đặt hàng.', 'error');
            }
        } catch (error) {
            showNotification('Lỗi', error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.', 'error');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (orderItems.length === 0) {
        return (
            <Container className="my-5 text-center">
                <div className="display-1 mb-4 opacity-50">🛒</div>
                <h3>Không có sản phẩm để đặt hàng</h3>
                <p className="text-muted mb-4">Vui lòng quay lại giỏ hàng và chọn sản phẩm.</p>
                <Button variant="danger" className="rounded-pill px-5" onClick={() => navigate('/cart')}>
                    Quay lại giỏ hàng
                </Button>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Row>
                {/* Left Column - Shipping Address + Payment */}
                <Col md={7} lg={8} className="mb-4">
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Địa Chỉ Giao Hàng</h5>
                                <Button variant="outline-primary" size="sm" onClick={handleOpenAddressModal}>
                                    + Thêm địa chỉ mới
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {addressLoading && savedAddresses.length === 0 ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang tải địa chỉ...
                                </div>
                            ) : savedAddresses.length === 0 ? (
                                <p className="text-muted mb-0">Chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ mới.</p>
                            ) : (
                                <div>
                                    {savedAddresses.map((addr, idx) => {
                                        const addrId = addr._id || idx;
                                        const isSelected = selectedAddress && (selectedAddress._id === addr._id || selectedAddress === addr);
                                        return (
                                            <div
                                                key={addrId}
                                                className={`border rounded p-3 mb-2 ${isSelected ? 'border-primary bg-light' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setSelectedAddress(addr)}
                                            >
                                                <div className="form-check mb-0">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="selectedAddr"
                                                        checked={isSelected}
                                                        onChange={() => setSelectedAddress(addr)}
                                                    />
                                                    <label className="form-check-label">
                                                        <strong>{addr.phone}</strong> — {addr.diaChi}
                                                        {addr.ghiChu && <span className="text-muted ms-2">({addr.ghiChu})</span>}
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Payment Method Section */}
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">Phương Thức Thanh Toán</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Check
                                    type="radio"
                                    id="payment-cod"
                                    label="Thanh toán khi nhận hàng (COD)"
                                    name="paymentMethod"
                                    checked={paymentMethod === 'payment-cod'}
                                    onChange={() => setPaymentMethod('payment-cod')}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    id="payment-card"
                                    label="Thanh toán qua thẻ tín dụng / Ghi nợ"
                                    name="paymentMethod"
                                    checked={paymentMethod === 'payment-card'}
                                    onChange={() => setPaymentMethod('payment-card')}
                                />
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Ordered Products Section */}
                    <Card className="shadow-sm mt-4">
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">Sản Phẩm Đặt Hàng ({orderItems.length})</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ul className="list-group list-group-flush">
                                {orderItems.map((item, idx) => (
                                    <li key={item.vehicleId || idx} className="list-group-item py-3">
                                        <div className="row align-items-center g-3">
                                            <div className="col-md-2 col-4">
                                                <img
                                                    src={
                                                        item.images && item.images.length > 0
                                                            ? item.images[0]
                                                            : `https://placehold.co/160x120/e3002b/fff?text=${encodeURIComponent(item.name?.slice(0, 12) || 'Honda')}`
                                                    }
                                                    alt={item.name}
                                                    className="rounded w-100 object-fit-cover"
                                                    style={{ maxHeight: '100px' }}
                                                    onError={(e) => {
                                                        e.target.src = `https://placehold.co/160x120/e3002b/fff?text=${encodeURIComponent(item.name?.slice(0, 12) || 'Honda')}`;
                                                    }}
                                                />
                                            </div>
                                            <div className="col-md-5 col-8">
                                                <h6 className="mb-1 fw-bold">{item.name}</h6>
                                                <p className="text-muted small mb-0">
                                                    {item.brandName} {item.vehicleModelName ? `• ${item.vehicleModelName}` : ''} {item.manufacture ? `• ${item.manufacture}` : ''}
                                                </p>
                                            </div>
                                            <div className="col-md-2 col-6 text-center">
                                                <span className="text-muted small">Số lượng</span>
                                                <div className="fw-bold">{item.quantity}</div>
                                            </div>
                                            <div className="col-md-3 col-6 text-md-end">
                                                <span className="text-muted small d-block">Thành tiền</span>
                                                <span className="fw-bold text-danger">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Order Summary */}
                <Col md={5} lg={4}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">Tóm Tắt Đơn Hàng</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {orderItems.map((item, idx) => (
                                <ListGroup.Item key={item.vehicleId || idx} className="d-flex justify-content-between lh-sm py-3">
                                    <div>
                                        <h6 className="my-0">{item.name}</h6>
                                        <small className="text-muted">SL: {item.quantity}</small>
                                    </div>
                                    <span className="text-muted">{formatPrice(item.price * item.quantity)}</span>
                                </ListGroup.Item>
                            ))}
                            <ListGroup.Item className="d-flex justify-content-between py-3">
                                <span>Phí vận chuyển</span>
                                <strong>{formatPrice(shippingFee)}</strong>
                            </ListGroup.Item>
                            
                            {appliedPromo && (
                                <ListGroup.Item className="d-flex justify-content-between py-3 text-success">
                                    <span>Mã giảm giá : <strong>{appliedPromo.code || promoCode}</strong></span>
                                    <strong>-{formatPrice(calculateDiscount())}</strong>
                                </ListGroup.Item>
                            )}

                            <ListGroup.Item className="d-flex justify-content-between py-3 bg-light">
                                <span className="fw-bold">Tổng cộng</span>
                                <strong className="text-danger fs-5">{formatPrice(calculateTotal())}</strong>
                            </ListGroup.Item>
                        </ListGroup>
                        <Card.Body className="pt-0">
                            <hr />
                            <h6 className="mb-2">Mã Giảm Giá</h6>
                            <Form.Group className="d-flex gap-2">
                                <Form.Control 
                                    type="text" 
                                    placeholder="Nhập mã giảm giá..." 
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    disabled={appliedPromo || isApplyingPromo}
                                />
                                {appliedPromo ? (
                                    <Button variant="outline-secondary" onClick={handleRemovePromo}>
                                        Gỡ
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="danger" 
                                        onClick={handleApplyPromo}
                                        disabled={isApplyingPromo}
                                    >
                                        {isApplyingPromo ? <Spinner size="sm" /> : 'Áp dụng'}
                                    </Button>
                                )}
                            </Form.Group>
                            {promoMessage.text && (
                                <div className={`text-${promoMessage.type === 'success' ? 'success' : 'danger'} small mt-2`}>
                                    {promoMessage.text}
                                </div>
                            )}
                        </Card.Body>
                        <Card.Body>
                            <div className="d-grid">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    disabled={isPlacingOrder}
                                    onClick={handlePlaceOrder}
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Đặt Hàng'
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Address Modal */}
            <Modal show={showAddressModal} onHide={handleCloseAddressModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm Địa Chỉ Giao Hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {addressError && <Alert variant="danger">{addressError}</Alert>}
                    <Form onSubmit={handleSaveAddress}>
                        <Form.Group className="mb-3" controlId="modalPhone">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={addressForm.phone}
                                onChange={handleAddressChange}
                                placeholder="Nhập số điện thoại"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="modalAddress">
                            <Form.Label>Địa chỉ giao hàng</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="diaChi"
                                value={addressForm.diaChi}
                                onChange={handleAddressChange}
                                placeholder="Nhập địa chỉ nhận hàng (Số nhà, đường, phường/xã...)"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="modalNote">
                            <Form.Label>Ghi chú</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="ghiChu"
                                value={addressForm.ghiChu}
                                onChange={handleAddressChange}
                                placeholder="Ghi chú thêm (vd: Giao giờ hành chính, gọi trước khi giao...)"
                            />
                        </Form.Group>

                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="outline-secondary" onClick={handleCloseAddressModal} disabled={addressLoading}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit" disabled={addressLoading}>
                                {addressLoading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu Địa Chỉ'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Notification Modal */}
            <NotificationModal
                show={notification.show}
                onClose={closeNotification}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </Container>
    );
};

export default Checkout;
