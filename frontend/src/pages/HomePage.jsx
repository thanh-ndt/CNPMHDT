import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchVehicles,
    setSelectedModel,
    selectModels,
    selectLoading,
    selectSelectedModel,
    selectFilteredVehicles,
} from '../redux/vehicleSlice'
import VehicleCard from '../components/VehicleCard'
import HeroSection from '../components/HeroSection'

export default function HomePage() {
    const dispatch = useDispatch()
    const models = useSelector(selectModels)
    const loading = useSelector(selectLoading)
    const selectedModel = useSelector(selectSelectedModel)
    const filteredVehicles = useSelector(selectFilteredVehicles)

    useEffect(() => {
        dispatch(fetchVehicles())
    }, [dispatch])

    const handleModelFilter = (modelId) => {
        dispatch(setSelectedModel(modelId || ''))
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price)
    }

    return (
        <>
            <HeroSection />
            <section className="py-5 bg-light" id="xe-noi-bat">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-2">Xe máy nổi bật</h2>
                        <p className="text-muted">Khám phá những mẫu xe máy hot nhất hiện nay</p>
                    </div>
                    <div className="mb-4 d-flex flex-wrap gap-2 justify-content-center">
                        <button
                            className={`btn ${!selectedModel ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4`}
                            onClick={() => handleModelFilter('')}
                        >
                            Tất cả
                        </button>
                        {models.map((m) => (
                            <button
                                key={m._id || m.name}
                                className={`btn ${selectedModel === (m._id || m.name) ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4`}
                                onClick={() => handleModelFilter(m._id || m.name)}
                            >
                                {m.name}
                            </button>
                        ))}
                    </div>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filteredVehicles.map((v) => (
                                <div key={v._id} className="col-sm-6 col-lg-4 col-xl-3">
                                    <VehicleCard vehicle={v} formatPrice={formatPrice} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <section className="py-5" id="thuong-hieu">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-2">Các dòng xe máy</h2>
                        <p className="text-muted">Xe số, xe tay ga, xe côn tay - Đầy đủ phân khúc</p>
                    </div>
                    <div className="row g-3 justify-content-center">
                        {models.map((m) => (
                            <div key={m._id || m.name} className="col-6 col-md-4 col-lg-2">
                                <div className="card h-100 border-0 shadow-sm text-center py-4 px-3">
                                    <span className="fw-bold text-secondary">{m.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-5 text-white" style={{ backgroundColor: '#e3002b' }}>
                <div className="container text-center">
                    <h2 className="display-6 fw-bold mb-3">Ưu đãi đặc biệt hôm nay</h2>
                    <p className="mb-4 opacity-90">Giảm đến 15% khi mua xe trong tháng này. Liên hệ ngay để nhận tư vấn!</p>
                    <a href="tel:19001234" className="btn btn-light btn-lg px-5 rounded-pill fw-bold">
                        Gọi ngay: 1900 1234
                    </a>
                </div>
            </section>
        </>
    )
}