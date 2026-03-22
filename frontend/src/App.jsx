import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Checkout from './pages/Checkout';
import AddAddress from './pages/AddAddress';
import OrderHistory from './pages/OrderHistory';
import ScheduleViewing from './pages/ScheduleViewing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/add-address" element={<AddAddress />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/schedule-viewing" element={<ScheduleViewing />} />
        <Route path="/" element={<Navigate to="/checkout" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
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
