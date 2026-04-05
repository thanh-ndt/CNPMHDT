import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { orderApi } from '../api/orderApi';
import { returnApi } from '../api/returnApi';
import { reviewApi } from '../api/reviewApi';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // States cho yêu cầu trả hàng
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnForm, setReturnForm] = useState({ reason: '', description: '' });
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [existingReturn, setExistingReturn] = useState(null);

    // States cho đánh giá
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', vehicleId: null, vehicleName: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewedItems, setReviewedItems] = useState({});

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const res = await axios.get(`https://cnpmhdt.onrender.com/api/orders/${id}`);
                if (res.data.success) {
                    setOrderData(res.data.data);
                } else {
                    setError('Không thể tải chi tiết đơn hàng.');
                }
            } catch (err) {
                console.error("Lỗi fetch chi tiết đơn hàng:", err);
                setError('Lỗi khi lấy dữ liệu đơn hàng: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetail();
    }, [id]);

    useEffect(() => {
        const checkReviews = async () => {
            if (!orderData || !user?.email || orderData.order.status !== 'delivered') return;
            const checks = {};
            for (const item of orderData.items) {
                if (item.vehicle) {
                    try {
                        const res = await reviewApi.checkReviewed(user.email, item.vehicle._id);
                        if (res.success && res.reviewed) {
                            checks[item.vehicle._id] = true;
                        }
                    } catch (e) {}
                }
            }
            setReviewedItems(checks);
        };
        checkReviews();
    }, [orderData, user]);

    // Kiểm tra yêu cầu trả hàng hiện có
    useEffect(() => {
        const checkExistingReturn = async () => {
            try {
                const res = await returnApi.getReturnByOrderId(id);
                if (res.success) setExistingReturn(res.data);
            } catch {
                // Không có yêu cầu nào — im lặng
            }
        };
        if (id) checkExistingReturn();
    }, [id]);

    const handleSubmitReturn = async (e) => {
        e.preventDefault();
        if (!returnForm.reason) {
            alert('Vui lòng chọn lý do trả hàng.');
            return;
        }
        setSubmittingReturn(true);
        try {
            const res = await returnApi.createReturnRequest({
                orderId: id,
                reason: returnForm.reason,
                description: returnForm.description
            });
            if (res.success) {
                alert(res.message);
                setShowReturnModal(false);
                setExistingReturn({ status: 'pending', reason: returnForm.reason + (returnForm.description ? ': ' + returnForm.description : '') });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi gửi yêu cầu trả hàng.');
        } finally {
            setSubmittingReturn(false);
        }
    };

    const handleOpenReview = (vehicle) => {
        setReviewForm({ rating: 5, comment: '', vehicleId: vehicle._id, vehicleName: vehicle.name });
        setShowReviewModal(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await reviewApi.createReview({
                email: user.email,
                orderId: id,
                vehicleId: reviewForm.vehicleId,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            if (res.success) {
                alert(res.message);
                setShowReviewModal(false);
                setReviewedItems(prev => ({ ...prev, [reviewForm.vehicleId]: true }));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi gửi đánh giá.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.')) return;
        setCancelling(true);
        try {
            const res = await orderApi.cancelOrder(id);
            if (res.success) {
                alert('Đã hủy đơn hàng thành công! Số lượng xe đã được hoàn lại vào kho.');
                window.location.reload();
            } else {
                alert(res.message || 'Không thể hủy đơn hàng.');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi hủy đơn hàng.');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': { text: 'Chờ xác nhận', bg: 'warning', textClass: 'dark' },
            'confirmed': { text: 'Đã xác nhận', bg: 'info', textClass: 'white' },
            'shipping': { text: 'Đang giao hàng', bg: 'primary', textClass: 'white' },
            'delivered': { text: 'Đã giao', bg: 'success', textClass: 'white' },
            'cancelled': { text: 'Đã hủy', bg: 'danger', textClass: 'white' }
        };
        const st = statusMap[status] || { text: status, bg: 'secondary', textClass: 'white' };
        return <Badge bg={st.bg} text={st.textClass} className="fs-6 py-2 px-3">{st.text}</Badge>;
    };

    if (loading) return (
        <Container className="my-5 text-center min-vh-100">
            <Spinner animation="grow" variant="danger" />
            <p className="mt-3 text-muted">Đang tải chi tiết đơn hàng...</p>
        </Container>
    );

    if (error || !orderData) return (
        <Container className="my-5 min-vh-100">
            <Alert variant="danger">{error || 'Không tìm thấy đơn hàng.'}</Alert>
            <Button variant="outline-secondary" onClick={() => navigate('/orders')}>Quay lại danh sách</Button>
        </Container>
    );

    const { order, items, payment } = orderData;

    // Xử lý tách chuỗi để lấy đúng SDT và Địa chỉ từ db lưu trữ dạng "SDT - Địa chỉ"
    let displayPhone = order.customer?.phoneNumber || user?.phoneNumber || 'N/A';
    let displayAddress = order.shippingAddress || 'N/A';

    // Xử lý lỗi db lưu email vào sđt
    if (displayPhone.includes('@')) {
        displayPhone = 'N/A';
    }

    if (displayAddress.includes(' - ')) {
        const parts = displayAddress.split(' - ');
        // Nếu phần đầu là 1 dãy số điện thoại (chứa toàn số tĩnh)
        if (/^\d+$/.test(parts[0].replace(/[\s\+]/g, ''))) {
            displayPhone = parts[0];
            displayAddress = parts.slice(1).join(' - ');
        }
    }

    return (
        <>
        <Container className="my-5 py-4">
            <Button variant="link" className="text-decoration-none text-muted mb-4 px-0" onClick={() => navigate('/orders')}>
                <i className="bi bi-arrow-left me-2"></i>Quay lại danh sách đơn hàng
            </Button>

            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h2 className="mb-1 text-danger fw-bold">Chi Tiết Đơn Hàng</h2>
                    <p className="text-muted mb-0">
                        Mã đơn: <strong className="text-dark">#{order._id.substring(order._id.length - 8).toUpperCase()}</strong> 
                        <span className="mx-2">•</span> 
                        Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}
                    </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    {getStatusText(order.status)}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-pill px-3"
                            disabled={cancelling}
                            onClick={handleCancelOrder}
                        >
                            {cancelling ? <Spinner animation="border" size="sm" className="me-1" /> : <i className="bi bi-x-circle me-1"></i>}
                            Hủy đơn
                        </Button>
                    )}
                    {order.status === 'delivered' && (
                        existingReturn ? (
                            <Badge bg={existingReturn.status === 'pending' ? 'warning' : existingReturn.status === 'approved' ? 'success' : 'danger'}
                                text={existingReturn.status === 'pending' ? 'dark' : 'white'}
                                className="fs-6 py-2 px-3">
                                <i className="bi bi-arrow-counterclockwise me-1"></i>
                                {existingReturn.status === 'pending' ? 'Đang xử lý yêu cầu trả' : existingReturn.status === 'approved' ? 'Đã duyệt trả hàng' : 'Yêu cầu bị từ chối'}
                            </Badge>
                        ) : (
                            <Button
                                variant="outline-warning"
                                size="sm"
                                className="rounded-pill px-3"
                                onClick={() => setShowReturnModal(true)}
                            >
                                <i className="bi bi-arrow-counterclockwise me-1"></i>
                                Yêu cầu trả hàng
                            </Button>
                        )
                    )}
                </div>
            </div>

            <Row className="g-4 mb-5">
                <Col lg={4}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-person-lines-fill text-danger me-2"></i>Thông tin người nhận</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <span className="text-muted d-block small mb-1">Tên người nhận</span>
                                <strong className="fs-6">{order.customer?.fullName || user?.fullName || 'N/A'}</strong>
                            </div>
                            <div className="mb-3">
                                <span className="text-muted d-block small mb-1">Số điện thoại</span>
                                <strong>{displayPhone}</strong>
                            </div>
                            <div className="mb-3">
                                <span className="text-muted d-block small mb-1">Email</span>
                                <strong>{order.customer?.email || user?.email || 'N/A'}</strong>
                            </div>
                            <div>
                                <span className="text-muted d-block small mb-1">Địa chỉ giao hàng</span>
                                <strong>{displayAddress}</strong>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-credit-card-2-front text-danger me-2"></i>Thanh toán</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <span className="text-muted d-block small mb-1">Phương thức</span>
                                <strong>{payment?.method === 'credit_card' ? 'Thẻ Tín Dụng' : 'Thanh toán trực tiếp nhận xe (Tiền mặt/Chuyển khoản / ATM)'}</strong>
                            </div>
                            <div className="mb-3">
                                <span className="text-muted d-block small mb-1">Trạng thái thanh toán</span>
                                {payment?.status === 'pending' ? <Badge bg="warning" text="dark">Chờ thanh toán</Badge> 
                                : payment?.status === 'completed' ? <Badge bg="success">Đã thanh toán</Badge> 
                                : <Badge bg="secondary">{payment?.status}</Badge>}
                            </div>
                            <div className="mt-4 pt-3 border-top">
                                <h6 className="text-muted">Tổng cộng</h6>
                                <h3 className="text-danger fw-bold mb-0">{order.totalAmount.toLocaleString('vi-VN')} đ</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Lời nhắn / Ghi chú (nếu có thể mở rộng sau này) */}
                <Col lg={4}>
                    <Card className="h-100 border-0 shadow-sm bg-light">
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-4">
                            <div className="bg-white rounded-circle p-3 mb-3 shadow-sm">
                                <i className="bi bi-headset text-danger fs-2"></i>
                            </div>
                            <h5 className="fw-bold mb-2">Cần hỗ trợ?</h5>
                            <p className="text-muted small mb-4">Vui lòng liên hệ với chúng tôi nếu bạn có bất kỳ thắc mắc nào về đơn hàng này.</p>
                            <Button variant="outline-danger" className="w-100" onClick={() => window.dispatchEvent(new Event('open-chat-widget'))}>Liên hệ CSKH</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h4 className="fw-bold mb-4">Danh sách xe đã đặt</h4>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 border-0">Sản phẩm</th>
                                <th className="px-4 py-3 border-0 text-center">Đơn giá</th>
                                <th className="px-4 py-3 border-0 text-center">Số lượng</th>
                                <th className="px-4 py-3 border-0 text-end">Thành tiền</th>
                                {order.status === 'delivered' && <th className="px-4 py-3 border-0 text-center">Đánh giá</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ width: '80px', height: '60px', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent:'center', alignItems:'center' }}>
                                                {item.vehicle?.images?.[0] ? (
                                                    <img src={item.vehicle.images[0]} alt={item.vehicle.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                ) : <i className="bi bi-image text-muted"></i>}
                                            </div>
                                            <div>
                                                <h6 className="mb-1 fw-bold">{item.vehicle?.name || 'Sản phẩm không xác định'}</h6>
                                                <span className="badge bg-secondary opacity-75">{item.vehicle?.brand?.name || 'Brand'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center fw-medium">{item.unitPrice.toLocaleString('vi-VN')} đ</td>
                                    <td className="px-4 py-3 text-center fw-bold text-dark">{item.quantity}</td>
                                    <td className="px-4 py-3 text-end text-danger fw-bold">{(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ</td>
                                    {order.status === 'delivered' && (
                                        <td className="px-4 py-3 text-center">
                                            {reviewedItems[item.vehicle?._id] ? (
                                                <Badge bg="success" className="p-2"><i className="bi bi-check-circle me-1"></i>Đã đánh giá</Badge>
                                            ) : (
                                                <Button variant="warning" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleOpenReview(item.vehicle)}>
                                                    Đánh giá <i className="bi bi-star-fill text-dark ms-1" style={{fontSize: '12px'}}></i>
                                                </Button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-light fw-bold text-dark">
                            <tr>
                                <td colSpan="3" className="px-4 py-3 text-end border-0">Tổng tiền xe:</td>
                                <td className="px-4 py-3 text-end border-0 text-danger">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                            </tr>
                        </tfoot>
                    </Table>
                </Card.Body>
            </Card>
        </Container>

        {/* Modal yêu cầu trả hàng */}
        <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">
                    <i className="bi bi-arrow-counterclockwise text-warning me-2"></i>Yêu cầu trả hàng
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitReturn}>
                <Modal.Body>
                    <Alert variant="warning" className="small">
                        <i className="bi bi-info-circle me-1"></i>
                        Chúng tôi sẽ xét duyệt yêu cầu trong vòng <strong>1-3 ngày làm việc</strong>.
                    </Alert>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Lý do trả hàng <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={returnForm.reason}
                            onChange={e => setReturnForm(prev => ({ ...prev, reason: e.target.value }))}
                            required
                        >
                            <option value="">-- Chọn lý do --</option>
                            <option value="Sản phẩm bị lỗi kỹ thuật">Sản phẩm bị lỗi kỹ thuật</option>
                            <option value="Không đúng mô tả">Không đúng mô tả sản phẩm</option>
                            <option value="Sản phẩm bị hư hỏng khi vận chuyển">Sản phẩm bị hư hỏng khi vận chuyển</option>
                            <option value="Đổi ý không muốn mua nữa">Đổi ý không muốn mua nữa</option>
                            <option value="Khác">Khác</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-1">
                        <Form.Label className="fw-semibold">Mô tả thêm (tùy chọn)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                            value={returnForm.description}
                            onChange={e => setReturnForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowReturnModal(false)}>Hủy bỏ</Button>
                    <Button type="submit" variant="warning" disabled={submittingReturn}>
                        {submittingReturn ? <Spinner animation="border" size="sm" className="me-1" /> : <i className="bi bi-send me-1"></i>}
                        Gửi yêu cầu
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>

        {/* Modal đánh giá */}
        <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">
                    Đánh giá {reviewForm.vehicleName}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitReview}>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <div className="d-flex justify-content-center gap-2 fs-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i 
                                    key={star} 
                                    className={`bi bi-star-fill cursor-pointer ${star <= reviewForm.rating ? 'text-warning' : 'text-secondary opacity-25'}`}
                                    onClick={() => setReviewForm(prev => ({...prev, rating: star}))}
                                    style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                ></i>
                            ))}
                        </div>
                        <div className="text-muted mt-2 small fw-medium">
                            {reviewForm.rating === 5 ? 'Tuyệt vời' : reviewForm.rating === 4 ? 'Rất tốt' : reviewForm.rating === 3 ? 'Bình thường' : reviewForm.rating === 2 ? 'Tệ' : 'Rất tệ'}
                        </div>
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Nhận xét của bạn</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..."
                            value={reviewForm.comment}
                            onChange={e => setReviewForm(prev => ({...prev, comment: e.target.value}))}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="px-4" onClick={() => setShowReviewModal(false)}>Hủy</Button>
                    <Button type="submit" variant="danger" className="px-4" disabled={submittingReview}>
                        {submittingReview ? <Spinner animation="border" size="sm" className="me-1" /> : <i className="bi bi-send-check me-2"></i>}
                        Gửi đánh giá
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
        </>
    );
};

export default OrderDetail;
