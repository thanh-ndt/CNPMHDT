import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ScheduleViewing = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [vehicles, setVehicles] = useState([]);
  
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    vehicle: '',
    appointmentDate: '',
    timeSlot: '',
    note: ''
  });

  useEffect(() => {
    // Lấy danh sách xe thật từ DB
    const fetchVehicles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vehicles');
            if (res.data.success) {
                setVehicles(res.data.data);
            }
        } catch(err) {
            console.error(err);
        }
    }
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);
    
    try {
        const payload = {
            vehicle: formData.vehicle,
            appointmentDate: formData.appointmentDate,
            timeSlot: formData.timeSlot,
            note: formData.note,
        };

        if (user) {
            payload.customerId = user._id;
        } else {
            payload.guestName = formData.guestName;
            payload.guestPhone = formData.guestPhone;
        }

        const res = await axios.post('http://localhost:5000/api/appointments', payload);
        if (res.data.success) {
            setSuccess(true);
            setFormData({
                guestName: '',
                guestPhone: '',
                vehicle: '',
                appointmentDate: '',
                timeSlot: '',
                note: ''
            });
            setTimeout(() => setSuccess(false), 5000);
        }
    } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-danger text-white text-center py-3">
              <h4 className="mb-0">Đăng Ký Đặt Lịch Xem Xe</h4>
            </Card.Header>
            <Card.Body className="p-4 bg-light text-dark">
              {success && (
                <Alert variant="success" className="text-center">
                  <b>Tuyệt vời!</b> Bạn đã đặt lịch xem xe thành công. Quản trị viên sẽ liên hệ lại để xác nhận.
                </Alert>
              )}
              {errorMsg && (
                <Alert variant="danger" className="text-center">{errorMsg}</Alert>
              )}
              
              <p className="text-muted text-center mb-4">
                Vui lòng điền thông tin bên dưới, chúng tôi sẽ sắp xếp xe và chuyên viên tư vấn riêng cho bạn!
              </p>

              {user ? (
                 <Alert variant="info" className="text-center">
                     Đang đặt lịch tự động dưới tên tài khoản: <strong>{user.fullName || user.email}</strong>
                 </Alert>
              ) : null}

              <Form onSubmit={handleSubmit}>
                {!user && (
                    <>
                    <Form.Group className="mb-3" controlId="formFullName">
                      <Form.Label className="fw-semibold">Họ và tên <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="text" 
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên của bạn" 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPhone">
                      <Form.Label className="fw-semibold">Số điện thoại liên hệ <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="tel" 
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleChange}
                        placeholder="Ví dụ: 0912345678" 
                        required 
                      />
                    </Form.Group>
                    </>
                )}

                <Form.Group className="mb-3" controlId="formModel">
                  <Form.Label className="fw-semibold">Mẫu xe cần xem <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn mẫu xe --</option>
                    {vehicles.map(v => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formDate">
                      <Form.Label className="fw-semibold">Ngày xem xe <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="date" 
                        name="appointmentDate"
                        value={formData.appointmentDate}
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
                        name="timeSlot"
                        value={formData.timeSlot}
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
                    name="note"
                    value={formData.note}
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
