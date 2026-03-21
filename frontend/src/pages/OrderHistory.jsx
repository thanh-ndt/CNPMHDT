import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const navigate = useNavigate();

  // Mock data cho danh sách đơn hàng
  const orders = [
    {
      id: 'DH-20231015-01',
      date: '15/10/2023 14:30',
      total: 450000,
      status: 'Đã giao',
      items: 3,
    },
    {
      id: 'DH-20231102-05',
      date: '02/11/2023 09:15',
      total: 1250000,
      status: 'Đang vận chuyển',
      items: 1,
    },
    {
      id: 'DH-20231120-12',
      date: '20/11/2023 16:45',
      total: 300000,
      status: 'Chờ xác nhận',
      items: 2,
    },
    {
      id: 'DH-20231125-08',
      date: '25/11/2023 10:00',
      total: 550000,
      status: 'Đã hủy',
      items: 4,
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đã giao':
        return <Badge bg="success">Đã giao</Badge>;
      case 'Đang vận chuyển':
        return <Badge bg="primary">Đang vận chuyển</Badge>;
      case 'Chờ xác nhận':
        return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
      case 'Đã hủy':
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleReturnToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <Container className="my-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0">Danh sách đơn hàng đã đặt</h2>
        </Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={handleReturnToCheckout}>
            Quay lại trang Checkout
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Mã đơn hàng</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3 text-center">Số SP</th>
                <th className="px-4 py-3 text-end">Tổng tiền</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="align-middle">
                  <td className="px-4 py-3 fw-bold text-primary">{order.id}</td>
                  <td className="px-4 py-3 text-muted">{order.date}</td>
                  <td className="px-4 py-3 text-center">{order.items}</td>
                  <td className="px-4 py-3 text-end text-danger fw-bold">
                    {order.total.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="outline-secondary" size="sm">
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderHistory;
