import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyEmailApi } from '../api/authApi';
import '../styles/Auth.css';

const VerifyEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get email from query parameters
    const queryParams = new URLSearchParams(location.search);
    const initialEmail = queryParams.get('email') || '';

    const [form, setForm] = useState({ email: initialEmail, otp: '' });
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value.replace(/\D/g, '') });
        if (e.target.name === 'email') {
             setForm({ ...form, email: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setStatus('loading');

        try {
            const res = await verifyEmailApi({ email: form.email, otp: form.otp });
            setMessage(res.data.message);
            setStatus('success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
            setStatus('error');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card login-card text-center">
                <div className="auth-card-body">
                    {status === 'success' ? (
                        <>
                            <div className="icon-wrapper icon-success" style={{ width: 64, height: 64 }}>
                                <i className="bi bi-check-lg fs-2"></i>
                            </div>
                            <h4 className="auth-title text-success">Xác thực thành công!</h4>
                            <p className="auth-subtitle mb-4">{message}</p>
                            <Link to="/login" className="btn btn-danger px-4 mt-3">Đăng nhập ngay</Link>
                        </>
                    ) : (
                        <>
                            <div className="icon-wrapper icon-danger" style={{ width: 64, height: 64 }}>
                                <i className="bi bi-shield-lock-fill fs-2"></i>
                            </div>
                            <h4 className="auth-title mt-3">Xác thực Email</h4>
                            <p className="auth-subtitle mb-4">Nhập mã OTP (6 số) được gửi đến email của bạn.</p>

                            {status === 'error' && (
                                <div className="alert alert-danger py-2 small d-flex align-items-center justify-content-center">
                                    <i className="bi bi-x-circle me-2"></i>{message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-semibold small">Địa chỉ Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <i className="bi bi-envelope text-muted"></i>
                                        </span>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            className="form-control border-start-0 ps-0" 
                                            placeholder="example@gmail.com" 
                                            value={form.email} 
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="mb-4 text-start">
                                    <label className="form-label fw-semibold small">Mã OTP (6 Số)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <i className="bi bi-hash text-muted"></i>
                                        </span>
                                        <input 
                                            type="text" 
                                            name="otp" 
                                            className="form-control border-start-0 ps-0 text-center fw-bold fs-5 tracking-widest" 
                                            maxLength="6"
                                            placeholder="------" 
                                            value={form.otp} 
                                            onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                                            required 
                                            pattern="[0-9]{6}"
                                            title="Vui lòng nhập 6 số OTP"
                                            style={{ letterSpacing: '8px' }}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-danger w-100 fw-semibold py-2" disabled={status === 'loading'}>
                                    {status === 'loading' ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Đang xác thực...</>
                                    ) : (
                                        'Xác thực ngay'
                                    )}
                                </button>
                            </form>
                            
                            <p className="text-center small mt-4 mb-0">
                                <Link to="/login" className="text-muted text-decoration-none">
                                    <i className="bi bi-arrow-left me-1"></i> Quay lại Đăng nhập
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
