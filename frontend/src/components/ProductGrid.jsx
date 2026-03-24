import React from 'react';
import { Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';
import VehicleCard from './VehicleCard';

const ProductGrid = ({
    vehicles, loading, isCompareMode, compareIds, toggleCompare,
    currentPage, totalPages, handlePageChange
}) => {
    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="danger" />
                <div className="mt-3 fw-semibold text-secondary">Đang tải dữ liệu...</div>
            </div>
        );
    }

    if (vehicles.length === 0) {
        return (
            <Alert variant="warning" className="text-center py-5 fs-5">
                Không tìm thấy sản phẩm phù hợp.
            </Alert>
        );
    }

    return (
        <div>
            <Row className="g-4 mb-5">
                {vehicles.map((bike) => {
                    const id = bike._id || bike.id;
                    const isSelected = compareIds.some(item => (item.id || item) === id);
                    const maxReached = compareIds.length >= 3;
                    const isDimmed = isCompareMode && maxReached && !isSelected;
                    const isBlocked = isCompareMode && maxReached && !isSelected;

                    return (
                        <Col key={id} xs={12} sm={6} lg={4} xl={3} className="d-flex align-items-stretch">
                            <VehicleCard
                                bike={bike}
                                isCompareMode={isCompareMode}
                                isSelected={isSelected}
                                isDimmed={isDimmed}
                                isBlocked={isBlocked}
                                toggleCompare={() => toggleCompare({ id, image: bike.images?.[0] })}
                            />
                        </Col>
                    );
                })}
            </Row>

            {totalPages > 1 && (
                <Pagination className="justify-content-center mt-4">
                    <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="fw-bold"
                    />
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        return (
                            <Pagination.Item
                                key={pageNumber}
                                active={pageNumber === currentPage}
                                onClick={() => handlePageChange(pageNumber)}
                                className="fw-bold"
                            >
                                {pageNumber}
                            </Pagination.Item>
                        );
                    })}
                    <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="fw-bold"
                    />
                </Pagination>
            )}
        </div>
    );
};

export default ProductGrid;