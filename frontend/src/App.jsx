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

export default App;
