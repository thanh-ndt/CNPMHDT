import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmailApi } from '../api/authApi';
import '../styles/Auth.css';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await verifyEmailApi(token);
                setMessage(res.data.message);
                setStatus('success');
            } catch (err) {
                setMessage(err.response?.data?.message || 'Link xác thực không hợp lệ hoặc đã hết hạn.');
                setStatus('error');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="auth-wrapper">
            <div className="auth-card login-card text-center">
                <div className="auth-card-body">
                    {status === 'loading' && (
                        <>
                            <div className="spinner-border text-danger mb-3" style={{ width: 48, height: 48 }}></div>
                            <h4 className="auth-title">Đang xác thực email...</h4>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <div className="icon-wrapper icon-success" style={{ width: 64, height: 64 }}>
                                <i className="bi bi-check-lg fs-2"></i>
                            </div>
                            <h4 className="auth-title text-success">Xác thực thành công!</h4>
                            <p className="auth-subtitle">{message}</p>
                            <Link to="/login" className="btn btn-danger px-4 mt-3">Đăng nhập ngay</Link>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <div className="icon-wrapper icon-danger" style={{ width: 64, height: 64 }}>
                                <i className="bi bi-x-lg fs-2"></i>
                            </div>
                            <h4 className="auth-title text-danger">Xác thực thất bại!</h4>
                            <p className="auth-subtitle">{message}</p>
                            <Link to="/login" className="btn btn-outline-danger px-4 mt-3">Về trang đăng nhập</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
