import React from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();

  // Mock data for display
  const orderItems = [
    { id: 1, name: 'Sản phẩm 1', price: 150000, quantity: 2 },
    { id: 2, name: 'Sản phẩm 2', price: 300000, quantity: 1 }
  ];

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAddAddress = () => {
    navigate('/add-address');
  };

  return (
    <Container className="my-5">
      <Row>
        {/* Left Column - Billing Details / Shipping Address */}
        <Col md={7} lg={8} className="mb-4">
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Địa Chỉ Giao Hàng</h5>
                <Button variant="outline-primary" size="sm" onClick={handleAddAddress}>
                  + Thêm địa chỉ mới
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* This is a placeholder for where the selected address would be shown.
                  You can fetch the user's addresses from the backend or Redux store and map them here. */}
              <p className="text-muted mb-0">Chưa có địa chỉ giao hàng nào được chọn. Vui lòng thêm địa chỉ.</p>
            </Card.Body>
          </Card>

          {/* Payment Method Section (Mock) */}
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
                  defaultChecked
                  className="mb-2"
                />
                <Form.Check 
                  type="radio" 
                  id="payment-card" 
                  label="Thanh toán qua thẻ tính dụng / Ghi nợ" 
                  name="paymentMethod" 
                />
              </Form>
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
              {orderItems.map((item) => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between lh-sm custom-py">
                  <div>
                    <h6 className="my-0">{item.name}</h6>
                    <small className="text-muted">SL: {item.quantity}</small>
                  </div>
                  <span className="text-muted">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                </ListGroup.Item>
              ))}
              <ListGroup.Item className="d-flex justify-content-between custom-py">
                <span>Phí vận chuyển</span>
                <strong>Miễn phí</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between custom-py bg-light">
                <span className="fw-bold">Tổng cộng</span>
                <strong className="text-danger fs-5">{calculateTotal().toLocaleString('vi-VN')} đ</strong>
              </ListGroup.Item>
            </ListGroup>
            <Card.Body>
              <div className="d-grid">
                <Button variant="primary" size="lg">
                  Đặt Hàng
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
