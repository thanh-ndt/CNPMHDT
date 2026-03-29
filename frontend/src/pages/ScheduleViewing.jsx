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
    guestEmail: '',
    vehicle: '',
    appointmentDate: '',
    timeSlot: '',
    note: ''
  });
  
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  useEffect(() => {
    // Lấy danh sách xe thật từ DB
    const fetchVehicles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vehicles/all-list');
            if (res.data.success) {
                setVehicles(res.data.data);
            }
        } catch(err) {
            console.error(err);
        }
    }
    const fetchAppointments = async () => {
        if (!user?._id) return;
        setFetchingHistory(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/appointments/customer/${user._id}`);
            if (res.data.success) {
                setAppointmentHistory(res.data.data);
            }
        } catch (err) {
            console.error('Lỗi khi lấy lịch sử hẹn:', err);
        } finally {
            setFetchingHistory(false);
        }
    }

    fetchVehicles();
    if (user) fetchAppointments();
  }, [user]);

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
            payload.guestEmail = formData.guestEmail;
        }

        const res = await axios.post('http://localhost:5000/api/appointments', payload);
        if (res.data.success) {
            setSuccess(true);
            setFormData({
                guestName: '',
                guestPhone: '',
                guestEmail: '',
                vehicle: '',
                appointmentDate: '',
                timeSlot: '',
                note: ''
            });
            if (user) {
                // Refresh history after new booking
                const historyRes = await axios.get(`http://localhost:5000/api/appointments/customer/${user._id}`);
                if (historyRes.data.success) setAppointmentHistory(historyRes.data.data);
            }
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
      <Row className="g-4">
        {/* Form Đăng ký */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
            <Card.Header className="bg-danger text-white text-center py-3">
              <h4 className="mb-0 text-uppercase fw-bold">Đăng Ký Đặt Lịch Xem Xe</h4>
            </Card.Header>
            <Card.Body className="p-4 bg-light text-dark">
              {success && (
                <Alert variant="success" className="text-center shadow-sm">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <b>Tuyệt vời!</b> Bạn đã đặt lịch xem xe thành công. Quản trị viên sẽ liên hệ lại để xác nhận.
                </Alert>
              )}
              {errorMsg && (
                <Alert variant="danger" className="text-center shadow-sm">{errorMsg}</Alert>
              )}
              
              <p className="text-muted text-center mb-4">
                Vui lòng điền thông tin bên dưới, chúng tôi sẽ sắp xếp xe và chuyên viên tư vấn riêng cho bạn!
              </p>

              {user ? (
                 <Alert variant="info" className="text-center py-2 border-0 bg-opacity-10 text-info" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)' }}>
                     <i className="bi bi-person-badge me-2"></i>
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

                    <Form.Group className="mb-3" controlId="formEmail">
                      <Form.Label className="fw-semibold">Địa chỉ Email (Nhận xác nhận) <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="email" 
                        name="guestEmail"
                        value={formData.guestEmail}
                        onChange={handleChange}
                        placeholder="Nhập email để nhận thông báo" 
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
                    className="form-select-lg fs-6"
                  >
                    <option value="">-- Chọn mẫu xe --</option>
                    {vehicles.map(v => (
                        <option key={v._id} value={v._id}>
                            {v.brand?.name ? `${v.brand.name} ${v.name}` : v.name}
                        </option>
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
                  <Button variant="danger" type="submit" size="lg" disabled={loading} className="fw-bold fs-5 shadow-sm rounded-pill">
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

        {/* Cột Quy định & Lưu ý */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4 overflow-hidden rounded-4">
            <Card.Header className="bg-dark text-white py-3">
              <h5 className="mb-0"><i className="bi bi-info-circle me-2"></i>Lưu ý & Quy định</h5>
            </Card.Header>
            <Card.Body className="bg-white p-4">
              <ul className="list-unstyled mb-0">
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <span><strong>Giấy tờ:</strong> Mang theo CMND/CCCD hoặc GPLX bản gốc.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <span><strong>Thời gian:</strong> Có mặt trước 10-15 phút để chuẩn bị xe.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <span><strong>Trang phục:</strong> Mặc quần dài, đi giày kín mũi nếu muốn lái thử.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <span><strong>Sức khỏe:</strong> Không sử dụng rượu bia trước khi xem xe.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <span><strong>Xác nhận:</strong> Lịch hẹn có hiệu lực sau khi nhân viên gọi điện xác nhận.</span>
                </li>
                <li className="d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <span><strong>Hủy lịch:</strong> Vui lòng báo trước ít nhất 2 giờ nếu có thay đổi.</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
          
          <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-4 text-danger text-center shadow-sm">
            <p className="small mb-0">
              <i className="bi bi-telephone-fill me-2"></i>
              Hotline hỗ trợ: <strong className="fs-5">1900 xxxx</strong>
            </p>
            <p className="small mt-1 mb-0 opacity-75">(8h00 - 20h00 hàng ngày)</p>
          </div>
        </Col>
      </Row>

      {/* Phần Lịch sử hẹn (Chỉ hiển thị cho User đã đăng nhập) */}
      {user && (
        <Row className="mt-5">
          <Col lg={12}>
            <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
              <h4 className="fw-bold mb-0">Lịch Hẹn Của Bạn</h4>
              <span className="badge bg-white text-dark shadow-sm border p-2 rounded-3">Tổng cộng: {appointmentHistory.length} lịch hẹn</span>
            </div>
            
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="px-4 py-3 border-0">Xe đăng ký</th>
                                <th className="py-3 border-0">Ngày & Giờ</th>
                                <th className="py-3 border-0">Trạng thái</th>
                                <th className="py-3 border-0">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fetchingHistory ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <Spinner animation="border" variant="danger" size="sm" />
                                        <span className="ms-2">Đang tải lịch sử...</span>
                                    </td>
                                </tr>
                            ) : appointmentHistory.length > 0 ? (
                                appointmentHistory.map(app => (
                                    <tr key={app._id}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <img 
                                                    src={app.vehicle?.images?.[0] || 'https://placehold.co/800x600/e3002b/fff?text=Xe'} 
                                                    alt="" 
                                                    style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '8px' }}
                                                    onError={(e) => { e.target.src = 'https://placehold.co/60x45/f0f0f0/888?text=Xe' }}
                                                />
                                                <div>
                                                    <div className="fw-bold text-dark">{app.vehicle?.brand?.name} {app.vehicle?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-semibold">{new Date(app.appointmentDate).toLocaleDateString('vi-VN')}</div>
                                            <div className="small text-muted"><i className="bi bi-clock me-1"></i>{app.timeSlot}</div>
                                        </td>
                                        <td className="py-3">
                                            {app.status === 'pending' && <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-xs" style={{ minWidth: '110px' }}>Chờ xác nhận</span>}
                                            {app.status === 'confirmed' && <span className="badge bg-info text-white px-3 py-2 rounded-pill shadow-xs" style={{ minWidth: '110px' }}>Đã xác nhận</span>}
                                            {app.status === 'completed' && <span className="badge bg-success text-white px-3 py-2 rounded-pill shadow-xs" style={{ minWidth: '110px' }}>Hoàn thành</span>}
                                            {app.status === 'cancelled' && <span className="badge bg-secondary text-white px-3 py-2 rounded-pill shadow-xs" style={{ minWidth: '110px' }}>Đã hủy</span>}
                                        </td>
                                        <td className="py-3">
                                            <div className="text-muted small" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.note}>
                                                {app.note || '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted bg-white">
                                        <i className="bi bi-calendar-x d-block fs-1 mb-3 opacity-25"></i>
                                        Bạn chưa có lịch hẹn xem xe nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ScheduleViewing;
