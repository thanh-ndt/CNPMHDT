import { useDispatch } from 'react-redux'
import { addToCart } from '../redux'

export default function VehicleCard({ vehicle, formatPrice }) {
  const dispatch = useDispatch()

  const imgUrl = vehicle.images?.[0]
    ? `https://placehold.co/400x260/1d3557/fff?text=${encodeURIComponent(vehicle.name?.slice(0, 20) || 'Xe')}`
    : `https://placehold.co/400x260/1d3557/fff?text=${encodeURIComponent(vehicle.brand?.name || '')}+${encodeURIComponent(vehicle.name?.slice(0, 15) || '')}`

  const handleAddToCart = (e) => {
    e.preventDefault()
    dispatch(addToCart({ vehicle, quantity: 1 }))
  }

  return (
    <div className="card h-100 border-0 shadow-sm overflow-hidden">
      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
        <img
          src={imgUrl}
          alt={vehicle.name}
          className="w-100 h-100 object-fit-cover"
          loading="lazy"
        />
        {vehicle.status === 'available' && (
          <span className="position-absolute top-0 start-0 badge bg-success m-2">Còn hàng</span>
        )}
      </div>
      <div className="card-body">
        <span className="text-muted small">{vehicle.brand?.name}</span>
        <h5 className="card-title mt-1 mb-2">{vehicle.name}</h5>
        <p className="text-muted small mb-2">
          {vehicle.vehicleModel?.engineType} • {vehicle.vehicleModel?.fuelType} • {vehicle.manufacture}
        </p>
        <p className="fw-bold text-danger fs-5 mb-0">{formatPrice(vehicle.price)}</p>
      </div>
      <div className="card-footer bg-white border-0 pt-0 d-grid gap-2">
        <button type="button" className="btn btn-danger rounded-pill" onClick={handleAddToCart}>
          Thêm vào giỏ
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill">
          Xem chi tiết
        </button>
      </div>
    </div>
  )
}
