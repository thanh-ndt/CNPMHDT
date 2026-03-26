import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { vehicleService } from '../services/vehicleService';

import CompareTable from '../components/CompareTable';
import CompareModal from '../components/CompareModal';

export default function ComparePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const idsParam = searchParams.get('ids') || '';

    useEffect(() => {
        const fetchCompareData = async () => {
            if (!idsParam) {
                setVehicles([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            const res = await vehicleService.fetchVehiclesData({ ids: idsParam, limit: 3 });
            if (res.success) {
                setVehicles(res.data);
            }
            setLoading(false);
        };
        fetchCompareData();
    }, [idsParam]);

    const handleRemoveItem = (removeId) => {
        const currentIds = idsParam.split(',').filter(Boolean);
        const newIds = currentIds.filter((id) => id !== removeId);
        if (newIds.length > 0) {
            setSearchParams({ ids: newIds.join(',') });
        } else {
            setSearchParams({});
        }
    };

    const handleModalConfirm = (selectedIds) => {
        // Merge with existing IDs (up to 3 total)
        const currentIds = idsParam.split(',').filter(Boolean);
        const merged = [...new Set([...currentIds, ...selectedIds])].slice(0, 3);
        setSearchParams({ ids: merged.join(',') });
        setShowModal(false);
    };

    return (
        <>
            <Container fluid className="py-4 px-3 px-lg-5">
                <div className="text-center mb-4">
                    <h2 className="display-6 fw-bold text-danger mb-2">SO SÁNH XE HONDA</h2>
                    <p className="text-muted">So sánh tối đa 3 sản phẩm cùng lúc</p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                ) : (
                    <CompareTable
                        vehicles={vehicles}
                        handleRemoveItem={handleRemoveItem}
                        setShowModal={setShowModal}
                    />
                )}
            </Container>

            {showModal && (
                <CompareModal
                    selectedIds={idsParam.split(',').filter(Boolean)}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleModalConfirm}
                />
            )}
        </>
    );
}
