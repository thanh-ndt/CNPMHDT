import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { orderApi } from '../api/orderApi';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await orderApi.getMyOrders(user.email);
        if (res.success) {
          setOrders(res.data);
        } else {
          setError(res.message || 'Không thể lấy danh sách đơn hàng');
        }
      } catch (err) {
        setError('Lỗi kết nối hoặc không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
      case 'Đã giao':
        return <Badge bg="success px-3 py-2 rounded-pill">Đã giao</Badge>;
      case 'shipping':
      case 'Đang vận chuyển':
        return <Badge bg="primary px-3 py-2 rounded-pill">Đang vận chuyển</Badge>;
      case 'pending':
      case 'Chờ xác nhận':
        return <Badge bg="warning px-3 py-2 rounded-pill" text="dark">Chờ xác nhận</Badge>;
      case 'cancelled':
      case 'Đã hủy':
        return <Badge bg="danger px-3 py-2 rounded-pill">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary px-3 py-2 rounded-pill">{status === 'confirmed' ? 'Đã xác nhận' : status}</Badge>;
    }
  };

  const handleReturnToCheckout = () => navigate('/checkout');

  if (!user) {
    return (
      <Container className="my-5 text-center py-5">
        <Alert variant="warning" className="d-inline-block px-5 shadow-sm">
          <h4 className="mb-3">Vui lòng đăng nhập</h4>
          <p className="mb-4">Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.</p>
          <Button variant="danger" className="rounded-pill px-4" onClick={() => navigate('/login')}>Đăng nhập ngay</Button>
        </Alert>
      </Container>
    );
  }

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  if (!user) {
    return (
      <Container className="my-5 text-center py-5">
        <Alert variant="warning" className="d-inline-block px-5 shadow-sm">
          <h4 className="mb-3">Vui lòng đăng nhập</h4>
          <p className="mb-4">Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.</p>
          <Button variant="danger" className="rounded-pill px-4" onClick={() => navigate('/login')}>Đăng nhập ngay</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5 py-3">
      <Row className="mb-4 align-items-end">
        <Col>
          <h2 className="mb-1 fw-bold"><i className="bi bi-box-seam me-2 text-danger"></i>Lịch sử đơn hàng</h2>
          <p className="text-muted mb-0">Các đơn hàng bạn đã đặt trên hệ thống Honda Store</p>
        </Col>
        <Col xs="auto" className="d-none d-md-block">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleReturnToCheckout}>
            Mua thêm xe khác
          </Button>
        </Col>
      </Row>

      {/* Tabs */}
      <div className="d-flex overflow-auto border-bottom mb-4" style={{ gap: '2rem' }}>
        {tabs.map(tab => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 position-relative cursor-pointer fw-medium text-nowrap`}
            style={{
              cursor: 'pointer',
              color: activeTab === tab.key ? '#dc3545' : '#6c757d',
              transition: 'color 0.2s'
            }}
          >
            {tab.label}
            <span className="ms-2 badge rounded-pill bg-light text-dark border">
              {getCount(tab.key)}
            </span>
            {activeTab === tab.key && (
              <div
                className="position-absolute bottom-0 w-100 bg-danger"
                style={{ height: '3px', borderRadius: '3px 3px 0 0', left: 0 }}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5 my-5 text-danger">
              <Spinner animation="border" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3 text-muted">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : error ? (
            <div className="p-5 text-danger text-center bg-light">
              <i className="bi bi-exclamation-triangle fs-1 mb-3"></i>
              <h5>{error}</h5>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-5 my-4 text-center text-muted">
              <div className="display-1 mb-3 text-secondary opacity-50">📦</div>
              <h4 className="fw-bold text-dark">Bạn chưa có đơn hàng nào</h4>
              <p>Hãy dạo quanh cửa hàng và chọn cho mình chiếc xe ưng ý nhé.</p>
              <Button variant="danger" className="mt-3 rounded-pill px-5 py-2 fw-bold" onClick={() => navigate('/')}>Tiếp tục mua sắm</Button>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light text-muted">
                <tr>
                  <th className="px-4 py-3 border-0">Mã đơn hàng</th>
                  <th className="px-4 py-3 border-0">Ngày đặt</th>
                  <th className="px-4 py-3 text-center border-0">Số SP</th>
                  <th className="px-4 py-3 text-end border-0">Tổng tiền</th>
                  <th className="px-4 py-3 text-center border-0">Trạng thái</th>
                  <th className="px-4 py-3 text-center border-0">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="transition-all" style={{ transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#fdfdfd'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-4 py-4 fw-bold text-primary">{order.id}</td>
                    <td className="px-4 py-4 text-muted">{new Date(order.date).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-4 text-center">
                      <Badge bg="light" text="dark" className="border py-1 px-2">{order.items}</Badge>
                    </td>
                    <td className="px-4 py-4 text-end text-danger fw-bold fs-6">
                      {order.total.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button variant="outline-danger" className="rounded-pill px-3 py-1 fw-semibold" size="sm" onClick={() => navigate(`/order/${order.id}`)}>
                        <i className="bi bi-eye me-1"></i> Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderHistory;
