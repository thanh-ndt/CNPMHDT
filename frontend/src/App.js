import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ComparePage from './pages/ComparePage';
import './App.css';

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
