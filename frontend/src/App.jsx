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

import Checkout from './pages/Checkout';
import AddAddress from './pages/AddAddress';
import OrderHistory from './pages/OrderHistory';
import ScheduleViewing from './pages/ScheduleViewing';

const App = () => {
    const { token } = useSelector((state) => state.auth);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public auth routes */}
                <Route path="/login" element={token ? <Navigate to="/profile" /> : <LoginPage />} />
                <Route path="/register" element={token ? <Navigate to="/profile" /> : <RegisterPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* Protected auth routes */}
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                {/* App routes */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/add-address" element={<AddAddress />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/schedule-viewing" element={<ScheduleViewing />} />

                {/* Default route */}
                <Route path="*" element={<Navigate to={token ? '/profile' : '/login'} replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
