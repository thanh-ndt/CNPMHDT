import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ScheduleViewing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    vehicleModel: '',
    date: '',
    time: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Giả lập gọi API đặt lịch
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form (tùy chọn)
      setFormData({
        fullName: '',
        phone: '',
        vehicleModel: '',
        date: '',
        time: '',
        notes: ''
      });
      // Ẩn thông báo sau 5 giây
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-dark text-white text-center py-3">
              <h4 className="mb-0">Đăng Ký Đặt Lịch Xem Xe</h4>
            </Card.Header>
            <Card.Body className="p-4 bg-light text-dark">
              {success && (
                <Alert variant="success" className="text-center">
                  <b>Tuyệt vời!</b> Bạn đã đặt lịch xem xe thành công. Nhân viên sẽ liên hệ lại để xác nhận.
                </Alert>
              )}
              <p className="text-muted text-center mb-4">
                Vui lòng điền thông tin bên dưới, chúng tôi sẽ sắp xếp xe và chuyên viên tư vấn riêng cho bạn!
              </p>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formFullName">
                  <Form.Label className="fw-semibold">Họ và tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên của bạn" 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label className="fw-semibold">Số điện thoại liên hệ <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ví dụ: 0912345678" 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formModel">
                  <Form.Label className="fw-semibold">Mẫu xe cần xem <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn mẫu xe --</option>
                    <option value="Honda Vision 2024">Honda Vision 2024</option>
                    <option value="Honda SH 150i">Honda SH 150i</option>
                    <option value="Yamaha Exciter 155">Yamaha Exciter 155 VVA</option>
                    <option value="Vespa Primavera">Vespa Primavera 125</option>
                    <option value="Khác">Dòng xe khác (Vui lòng ghi ở phần Ghi chú)</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formDate">
                      <Form.Label className="fw-semibold">Ngày xem xe <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="date" 
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formTime">
                      <Form.Label className="fw-semibold">Khung giờ dự kiến <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="time" 
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="formNotes">
                  <Form.Label className="fw-semibold">Ghi chú thêm</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Yêu cầu đặc biệt (ví dụ: tôi muốn xem màu đỏ...)" 
                  />
                </Form.Group>

                <div className="d-grid mt-4">
                  <Button variant="danger" type="submit" size="lg" disabled={loading} className="fw-bold fs-5 shadow">
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
                         Đang xử lý...
                      </>
                    ) : (
                      'Xác Nhận Đặt Lịch'
                    )}
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

export default ScheduleViewing;
