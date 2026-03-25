import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { addAddress, resetAddressState } from '../redux/addressSlice';
// import { useNavigate } from 'react-router-dom';

const AddAddress = () => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    phone: '',
    diaChi: '',
    ghiChu: '',
  });

  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.address);
  // const navigate = useNavigate();

  useEffect(() => {
    // Dọn dẹp state khi unmount
    return () => {
      dispatch(resetAddressState());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?._id) {
      alert('Vui lòng đăng nhập để lưu địa chỉ.');
      return;
    }
    dispatch(addAddress({ ...formData, customer: user._id }));
  };


  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h4 className="mb-0">Thêm Địa Chỉ Giao Hàng</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Đã lưu địa chỉ thành công!</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAddress">
                  <Form.Label>Địa chỉ giao hàng</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="diaChi"
                    value={formData.diaChi}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ nhận hàng (Số nhà, đường, phường/xã...)"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formNote">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="ghiChu"
                    value={formData.ghiChu}
                    onChange={handleChange}
                    placeholder="Ghi chú thêm (vd: Giao giờ hành chính, gọi trước khi giao...)"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu Địa Chỉ Mới'
                    )}
                  </Button>
                  <Button variant="outline-secondary" type="button" onClick={() => window.history.back()} disabled={loading}>
                    Hủy
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddAddress;
