import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/authApi';
import '../styles/Auth.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', dob: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (form.password.length < 8) {
            return setError('Mật khẩu phải có ít nhất 8 ký tự.');
        }
        if (form.password !== form.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp.');
        }
        setLoading(true);
        try {
            const res = await registerApi({
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.phoneNumber,
                dob: form.dob,
                password: form.password
            });
            setSuccess(res.data.message);
            // Navigate to verify-email with email included in the navigation state or URL
            setTimeout(() => {
                navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card register-card">
                <div className="auth-card-body">
                    <div className="auth-header">
                        <div className="icon-wrapper icon-danger">
                            <i className="bi bi-person-plus-fill fs-4"></i>
                        </div>
                        <h2 className="auth-title">Đăng Ký</h2>
                        <p className="auth-subtitle">Tạo tài khoản mới</p>
                    </div>

                    {error && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
                    {success && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle me-2"></i>{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Họ và tên</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-person text-muted"></i></span>
                                <input type="text" name="fullName" className="form-control border-start-0 ps-0" placeholder="Nguyễn Văn A" value={form.fullName} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Email <span className="text-danger">*</span></label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                                <input type="email" name="email" className="form-control border-start-0 ps-0" placeholder="example@gmail.com" value={form.email} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Số điện thoại</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-telephone text-muted"></i></span>
                                <input type="tel" name="phoneNumber" className="form-control border-start-0 ps-0" placeholder="0901234567" value={form.phoneNumber} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Ngày sinh</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-calendar text-muted"></i></span>
                                <input type="date" name="dob" className="form-control border-start-0 ps-0" value={form.dob} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Mật khẩu <span className="text-danger">*</span></label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock text-muted"></i></span>
                                <input type={showPassword ? "text" : "password"} name="password" className="form-control border-start-0 border-end-0 ps-0" placeholder="Ít nhất 8 ký tự" value={form.password} onChange={handleChange} required minLength={8} />
                                <button type="button" className="btn btn-outline-secondary border-start-0 bg-white" style={{ borderColor: '#dee2e6' }} onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''} text-muted`}></i>
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-semibold small">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock-fill text-muted"></i></span>
                                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="form-control border-start-0 border-end-0 ps-0" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={handleChange} required />
                                <button type="button" className="btn btn-outline-secondary border-start-0 bg-white" style={{ borderColor: '#dee2e6' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''} text-muted`}></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-danger w-100 fw-semibold py-2" disabled={loading}>
                            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</> : 'Đăng Ký'}
                        </button>
                    </form>

                    <p className="text-center small mt-3 mb-0">
                        Đã có tài khoản? <Link to="/login" className="text-danger fw-semibold text-decoration-none">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
