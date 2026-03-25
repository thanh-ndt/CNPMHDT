import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';
import ChatWidget from './components/ChatWidget';

// Auth pages (no Header)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// App pages (with Header via AppLayout)
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ComparePage from './pages/ComparePage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import AddAddress from './pages/AddAddress';
import OrderHistory from './pages/OrderHistory';
import ScheduleViewing from './pages/ScheduleViewing';
import ProfilePage from './pages/ProfilePage';

const App = () => {
    const { token } = useSelector((state) => state.auth);

    return (
        <BrowserRouter>
            <ChatWidget />
            <Routes>
                {/* ─── Public auth routes (NO Header) ─── */}
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* ─── App routes (WITH Header via AppLayout) ─── */}
                <Route element={<AppLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={token ? <Navigate to="/profile" /> : <LoginPage />} />
                    <Route path="/register" element={token ? <Navigate to="/profile" /> : <RegisterPage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/add-address" element={<AddAddress />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/schedule-viewing" element={<ScheduleViewing />} />
                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                </Route>

                {/* Default route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
