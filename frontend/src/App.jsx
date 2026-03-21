import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ComparePage from './pages/ComparePage.jsx';
import ScheduleViewing from './pages/ScheduleViewing';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Header chung — hiển thị cố định trên MỌI trang */}
        <Header />

        {/* Nội dung từng trang — thay đổi theo Route */}
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/san-pham" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/so-sanh" element={<ComparePage />} />
          <Route path="/schedule-viewing" element={<ScheduleViewing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
