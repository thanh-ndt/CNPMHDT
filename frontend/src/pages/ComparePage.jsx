import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { vehicleService } from '../services/vehicleService';
import { resetCompare, setCompareIds } from '../redux/compareSlice';
import CompareTable from '../components/CompareTable.jsx';
import CompareModal from '../components/CompareModal.jsx';
import './css/ComparePage.css';

const ComparePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);
  const idsParam = params.get('ids');

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!idsParam) { setVehicles([]); setLoading(false); return; }
    const fetchCompareData = async () => {
      setLoading(true);
      try {
        const idArray = idsParam.split(',').filter(Boolean);
        const data = await vehicleService.fetchCompareData(idArray);
        if (data.success) {
          const ordered = idArray.map(id => data.data.find(v => (v._id || v.id) === id)).filter(Boolean);
          setVehicles(ordered);
          
          // Đồng bộ state Redux với items có image
          const formattedReduxPayload = ordered.map(v => ({ id: v._id || v.id, image: v.images?.[0] }));
          dispatch(setCompareIds(formattedReduxPayload));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchCompareData();
  }, [idsParam]);

  const handleRemoveItem = (idToRemove) => {
    const newIds = idsParam.split(',').filter(Boolean).filter(id => id !== idToRemove);
    newIds.length === 0 ? handleGoBack() : navigate(`/so-sanh?ids=${newIds.join(',')}`);
  };

  const handleAddFromModal = (newSelectedIds) => {
    setShowModal(false);
    navigate(`/so-sanh?ids=${newSelectedIds.join(',')}`);
  };

  const handleGoBack = () => {
    dispatch(resetCompare());
    localStorage.removeItem('compareIds');
    localStorage.removeItem('compare_ids');
    navigate('/san-pham');
  };

  return (
    <main className="compare-page py-5 bg-light min-vh-100">
      <Container fluid="lg">
        {/* Top Header Row */}
        <Row className="mb-4 align-items-center border-bottom border-danger pb-3">
          <Col xs={12} md={6}>
            <h2 className="fs-3 fw-bold mb-0 text-dark">
              SO SÁNH ({vehicles.length}/3 SẢN PHẨM)
            </h2>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
            <Button variant="outline-dark" className="fw-bold me-3" onClick={() => navigate('/san-pham')}>
              ← Quay lại danh sách
            </Button>
            <Button variant="danger" className="fw-bold" onClick={handleGoBack}>
              Xóa Lựa Chọn
            </Button>
          </Col>
        </Row>

        <Row>
          <Col>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="danger" />
                <div className="mt-3 fw-semibold text-secondary">Đang tải dữ liệu...</div>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-5 fs-5 text-muted border rounded bg-white mt-3">
                Chưa có sản phẩm nào để so sánh. 
                <Button variant="link" onClick={() => setShowModal(true)}>Chọn thêm</Button>
              </div>
            ) : (
              <CompareTable 
                vehicles={vehicles} 
                handleRemoveItem={handleRemoveItem} 
                setShowModal={setShowModal} 
              />
            )}
          </Col>
        </Row>
      </Container>

      {showModal && (
        <CompareModal
          selectedIds={idsParam ? idsParam.split(',').filter(Boolean) : []}
          onClose={() => setShowModal(false)}
          onConfirm={handleAddFromModal}
        />
      )}
    </main>
  );
};

export default ComparePage;
