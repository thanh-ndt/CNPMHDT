import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
    const { token } = useSelector((state) => state.auth);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={token ? <Navigate to="/profile" /> : <LoginPage />} />
                <Route path="/register" element={token ? <Navigate to="/profile" /> : <RegisterPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* Protected routes */}
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                {/* Mặc định chuyển về trang đăng nhập */}
                <Route path="*" element={<Navigate to={token ? '/profile' : '/login'} />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
