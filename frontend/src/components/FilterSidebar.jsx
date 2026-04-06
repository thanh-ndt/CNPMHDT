/**
 * ═══════════════════════════════════════════════════════════════
 * FILTER SIDEBAR - THANH BỘ LỌC TÌM KIẾM XE
 * ═══════════════════════════════════════════════════════════════
 * Component này hiển thị các bộ lọc cho tìm kiếm xe:
 * - Lọc theo loại xe (Xe ga, Xe số, Xe thể thao, ...)
 * - Lọc theo khoảng giá (từ min đến max)
 * - Lọc theo phân khối động cơ (Dưới 175cc / Trên 175cc)
 * - Nút xóa tất cả bộ lọc
 * 
 * Props:
 * - availableCategories: Danh sách các loại xe có thể lọc
 * - selectedCategories: Danh sách các loại xe đang được chọn
 * - toggleCategory: Hàm bật/tắt lọc theo loại xe
 * - pendingMin/pendingMax: Giá đang nhập
 * - setPendingMin/setPendingMax: Hàm set giá đang nhập
 * - handleApplyPrice: Hàm áp dụng khoảng giá
 * - engineFilter: Bộ lọc phân khối đang chọn
 * - handleEngineChange: Hàm thay đổi bộ lọc phân khối
 * - handleResetFilters: Hàm xóa tất cả bộ lọc
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Form, Button } from 'react-bootstrap';

const ProductSidebar = ({
    availableCategories, selectedCategories, toggleCategory,
    pendingMin, pendingMax, setPendingMin, setPendingMax, handleApplyPrice,
    engineFilter, handleEngineChange, handleResetFilters
}) => {
    return (
        <aside className="h-100 bg-white p-4 rounded shadow-sm border border-secondary border-opacity-25">
            {/* Tiêu đề bộ lọc */}
            <h5 className="filter-heading d-flex align-items-center mb-4 fw-bold">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="me-2 text-danger">
                    <path d="M3 4c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v2c0 .28-.11.53-.29.71L15 12.41V20c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-7.59l-5.71-5.7A.996.996 0 0 1 3 6V4z"></path>
                </svg>
                BỘ LỌC TÌM KIẾM
            </h5>

            {/* ═══════════════════════════════════════════════════ */}
            {/* BỘ LỌC THEO LOẠI XE */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="filter-group mb-4 pb-3 border-bottom border-light">
                <h6 className="fw-bold mb-3 text-secondary">LOẠI XE</h6>
                <div className="d-flex flex-wrap gap-2">
                    {/* Hiển thị các nút loại xe, đổi màu khi được chọn */}
                    {availableCategories.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategories.includes(cat) ? 'danger' : 'outline-danger'}
                            size="sm"
                            onClick={() => toggleCategory(cat)}
                            className="rounded-pill px-3 py-1 fw-semibold"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* BỘ LỌC THEO KHOẢNG GIÁ */}
            {/* ═══════════════════════════════════════════════════ */}

            <div className="filter-group mb-4 pb-3 border-bottom border-light">
                <h6 className="fw-bold mb-3 text-secondary">KHOẢNG GIÁ (VNĐ)</h6>
                <div className="d-flex align-items-center mb-3 gap-2">
                    {/* Input giá tối thiểu */}
                    <Form.Control
                        type="number"
                        min="0"
                        placeholder="Từ"
                        value={pendingMin}
                        onChange={(e) => {
                            const val = e.target.value;
                            // Chỉ cho phép giá >= 0
                            setPendingMin(val === '' ? '' : Math.max(0, parseInt(val, 10)).toString());
                        }}
                        className="shadow-none border-secondary"
                    />
                    <span className="text-muted fw-bold">-</span>
                    {/* Input giá tối đa */}
                    <Form.Control
                        type="number"
                        min="0"
                        placeholder="Đến"
                        value={pendingMax}
                        onChange={(e) => {
                            const val = e.target.value;
                            // Chỉ cho phép giá >= 0
                            setPendingMax(val === '' ? '' : Math.max(0, parseInt(val, 10)).toString());
                        }}
                        className="shadow-none border-secondary"
                    />
                </div>
                {/* Nút áp dụng khoảng giá */}
                <Button variant="danger" className="w-100 fw-bold" onClick={handleApplyPrice}>
                    ÁP DỤNG
                </Button>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* BỘ LỌC THEO PHÂN KHỐI ĐỘNG CƠ */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="filter-group mb-4">
                <h6 className="fw-bold mb-3 text-secondary">PHÂN KHỐI</h6>
                <Form>
                    {/* Radio button cho xe phân khối nhỏ (< 175cc) */}
                    <Form.Check
                        type="radio"
                        id="engine-small"
                        label="Dưới 175cc"
                        name="engine"
                        checked={engineFilter === 'small'}
                        onChange={() => handleEngineChange('small')}
                        className="mb-2 text-dark fw-medium"
                    />
                    {/* Radio button cho xe phân khối lớn (> 175cc) */}
                    <Form.Check
                        type="radio"
                        id="engine-large"
                        label="Trên 175cc"
                        name="engine"
                        checked={engineFilter === 'large'}
                        onChange={() => handleEngineChange('large')}
                        className="text-dark fw-medium"
                    />
                </Form>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* NÚT XÓA TẤT CẢ BỘ LỌC */}
            {/* ═══════════════════════════════════════════════════ */}
            <Button variant="outline-dark" className="w-100 fw-bold mt-2" onClick={handleResetFilters}>
                XÓA TẤT CẢ LỌC
            </Button>
        </aside>
    );
};

export default ProductSidebar;