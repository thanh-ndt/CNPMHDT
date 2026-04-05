import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchVehicles,
    setSelectedModel,
    selectModels,
    selectLoading,
    selectSelectedModel,
    selectVehicles,
} from '../redux/vehicleSlice'
import VehicleCard from '../components/VehicleCard'
import HeroSection from '../components/HeroSection'

export default function HomePage() {
    const dispatch = useDispatch()
    const models = useSelector(selectModels)
    const loading = useSelector(selectLoading)
    const selectedModel = useSelector(selectSelectedModel)
    const featuredVehicles = useSelector(selectVehicles)

    useEffect(() => {
        dispatch(fetchVehicles({ page: 1, limit: 8 }))
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

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {featuredVehicles.map((v) => (
                                <div key={v._id} className="col-sm-6 col-lg-4 col-xl-3">
                                    <VehicleCard vehicle={v} formatPrice={formatPrice} />
                                </div>
                            ))}
                        </div>
                    )}
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
