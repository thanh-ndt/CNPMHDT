import React from 'react';
import { Form, Button } from 'react-bootstrap';

const ProductSidebar = ({
    availableCategories, selectedCategories, toggleCategory,
    pendingMin, pendingMax, setPendingMin, setPendingMax, handleApplyPrice,
    engineFilter, handleEngineChange, handleResetFilters
}) => {
    return (
        <aside className="h-100 bg-white p-4 rounded shadow-sm border border-secondary border-opacity-25">
            <h5 className="filter-heading d-flex align-items-center mb-4 fw-bold">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="me-2 text-danger">
                    <path d="M3 4c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v2c0 .28-.11.53-.29.71L15 12.41V20c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-7.59l-5.71-5.7A.996.996 0 0 1 3 6V4z"></path>
                </svg>
                BỘ LỌC TÌM KIẾM
            </h5>

            <div className="filter-group mb-4 pb-3 border-bottom border-light">
                <h6 className="fw-bold mb-3 text-secondary">LOẠI XE</h6>
                <div className="d-flex flex-wrap gap-2">
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

            <div className="filter-group mb-4 pb-3 border-bottom border-light">
                <h6 className="fw-bold mb-3 text-secondary">KHOẢNG GIÁ (VNĐ)</h6>
                <div className="d-flex align-items-center mb-3 gap-2">
                    <Form.Control
                        type="number"
                        min="0"
                        placeholder="Từ"
                        value={pendingMin}
                        onChange={(e) => {
                            const val = e.target.value;
                            setPendingMin(val === '' ? '' : Math.max(0, parseInt(val, 10)).toString());
                        }}
                        className="shadow-none border-secondary"
                    />
                    <span className="text-muted fw-bold">-</span>
                    <Form.Control
                        type="number"
                        min="0"
                        placeholder="Đến"
                        value={pendingMax}
                        onChange={(e) => {
                            const val = e.target.value;
                            setPendingMax(val === '' ? '' : Math.max(0, parseInt(val, 10)).toString());
                        }}
                        className="shadow-none border-secondary"
                    />
                </div>
                <Button variant="danger" className="w-100 fw-bold" onClick={handleApplyPrice}>
                    ÁP DỤNG
                </Button>
            </div>

            <div className="filter-group mb-4">
                <h6 className="fw-bold mb-3 text-secondary">PHÂN KHỐI</h6>
                <Form>
                    <Form.Check
                        type="radio"
                        id="engine-small"
                        label="Dưới 175cc"
                        name="engine"
                        checked={engineFilter === 'small'}
                        onChange={() => handleEngineChange('small')}
                        className="mb-2 text-dark fw-medium"
                    />
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

            <Button variant="outline-dark" className="w-100 fw-bold mt-2" onClick={handleResetFilters}>
                XÓA TẤT CẢ LỌC
            </Button>
        </aside>
    );
};

export default ProductSidebar;