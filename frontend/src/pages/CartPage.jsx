import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
    fetchCartAsync,
    clearCartAsync,
    removeFromCartAsync,
    updateCartQuantityAsync,
    selectCartItems,
    selectCartTotalPrice,
    selectCartLoading,
    selectCartError,
} from '../redux/cartSlice'

export default function CartPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const customerEmail = user?.email

    const items = useSelector(selectCartItems)
    const totalPrice = useSelector(selectCartTotalPrice)
    const loading = useSelector(selectCartLoading)
    const error = useSelector(selectCartError)

    // Selection state
    const [selectedIds, setSelectedIds] = useState([])

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price)

    useEffect(() => {
        if (!customerEmail) return
        dispatch(fetchCartAsync(customerEmail))
    }, [customerEmail, dispatch])

    // Sync selectedIds when items change (remove ids that no longer exist)
    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => items.some((item) => item.vehicleId === id)))
    }, [items])

    const isAllSelected = items.length > 0 && selectedIds.length === items.length
    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([])
        } else {
            setSelectedIds(items.map((item) => item.vehicleId))
        }
    }
    const toggleSelectItem = (vehicleId) => {
        setSelectedIds((prev) =>
            prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]
        )
    }

    const selectedItems = items.filter((item) => selectedIds.includes(item.vehicleId))
    const selectedTotalPrice = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm để đặt hàng.')
            return
        }
        navigate('/checkout', { state: { selectedItems } })
    }

    if (!customerEmail) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body p-5">
                                <div className="display-1 mb-4 opacity-50">🛒</div>
                                <h1 className="h4 fw-bold mb-3">Vui lòng đăng nhập</h1>
                                <p className="text-muted mb-4">
                                    Tính năng giỏ hàng yêu cầu bạn phải đăng nhập để lưu trữ thông tin sản phẩm.
                                </p>
                                <div className="d-flex justify-content-center gap-3">
                                    <Link to="/login" className="btn btn-danger rounded-pill px-4 fw-bold">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="btn btn-outline-danger rounded-pill px-4 fw-bold">
                                        Đăng ký
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading && items.length === 0) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div className="display-1 mb-4">🛒</div>
                    <h1 className="h3 mb-3">Giỏ hàng trống</h1>
                    <p className="text-muted mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                    <Link to="/" className="btn btn-danger btn-lg rounded-pill px-5">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-4 py-md-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h1 className="h2 fw-bold mb-1">Giỏ hàng</h1>
                    <div className="text-muted small">Khách: {customerEmail}</div>
                </div>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => dispatch(clearCartAsync(customerEmail))}>
                    Xóa tất cả
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            {/* Select all header */}
                            <div className="d-flex align-items-center px-4 py-3 border-bottom bg-light rounded-top">
                                <div className="form-check mb-0 d-flex align-items-center gap-2">
                                    <input
                                        className="form-check-input mt-0 border-secondary border-2 shadow-sm"
                                        type="checkbox"
                                        id="selectAll"
                                        style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', borderColor: '#6c757d' }}
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                    />
                                    <label className="form-check-label fs-6 fw-semibold text-dark" htmlFor="selectAll" style={{ cursor: 'pointer' }}>
                                        Chọn tất cả ({items.length} sản phẩm)
                                    </label>
                                </div>
                            </div>

                            <ul className="list-group list-group-flush border-0">
                                {items.map((item) => (
                                    <li key={item.vehicleId} className="list-group-item p-4 border-bottom transition-all" style={{ transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#fdfdfd'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}>
                                        <div className="row align-items-center g-4">
                                            {/* Checkbox */}
                                            <div className="col-auto">
                                                <div className="form-check mb-0">
                                                    <input
                                                        className="form-check-input border-secondary border-2 shadow-sm"
                                                        type="checkbox"
                                                        style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', borderColor: '#6c757d' }}
                                                        checked={selectedIds.includes(item.vehicleId)}
                                                        onChange={() => toggleSelectItem(item.vehicleId)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-4">
                                                <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
                                                    {item.images && item.images[0] ? (
                                                        <img
                                                            src={item.images[0]}
                                                            alt={item.name}
                                                            className="w-100 h-100 object-fit-contain"
                                                        />
                                                    ) : (
                                                        <i className="bi bi-image text-muted fs-3"></i>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-8">
                                                <h3 className="h5 fw-bold mb-2 text-dark">{item.name}</h3>
                                                <div className="d-flex gap-2 flex-wrap mb-2">
                                                    <span className="badge bg-secondary opacity-75">{item.brandName}</span>
                                                    <span className="badge bg-light text-dark border">{item.vehicleModelName}</span>
                                                    <span className="badge bg-light text-dark border">{item.manufacture}</span>
                                                </div>
                                                <p className="fw-bold text-danger fs-5 mb-0 mt-2">{formatPrice(item.price)}</p>
                                            </div>
                                            <div className="col-md-3 col-6">
                                                <label className="form-label small fw-semibold text-muted mb-2">Số lượng</label>
                                                <div className="input-group input-group-sm rounded-pill overflow-hidden border" style={{ maxWidth: '130px', backgroundColor: '#fff' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-light text-dark border-0 px-3 fw-bold bg-white"
                                                        style={{ width: '40px' }}
                                                        onClick={() => dispatch(updateCartQuantityAsync({ customerEmail, vehicleId: item.vehicleId, quantity: item.quantity - 1 }))}
                                                    >
                                                        −
                                                    </button>
                                                    <input type="text" readOnly className="form-control text-center border-0 bg-white fw-bold" value={item.quantity} />
                                                    <button
                                                        type="button"
                                                        className="btn btn-light text-dark border-0 px-3 fw-bold bg-white"
                                                        style={{ width: '40px' }}
                                                        onClick={() => dispatch(updateCartQuantityAsync({ customerEmail, vehicleId: item.vehicleId, quantity: item.quantity + 1 }))}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-5 text-md-end">
                                                <p className="small fw-semibold text-muted mb-2">Thành tiền</p>
                                                <p className="fw-bold text-dark fs-6 mb-0">{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                            <div className="col-md-1 col-1 text-end d-flex justify-content-end align-items-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-light text-danger rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm"
                                                    style={{ width: '36px', height: '36px', transition: 'all 0.2s' }}
                                                    title="Xóa"
                                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#ffeeee'}
                                                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onClick={() => dispatch(removeFromCartAsync({ customerEmail, vehicleId: item.vehicleId }))}
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: '88px', borderRadius: '12px' }}>
                        <div className="card-body p-4 p-md-5">
                            <h2 className="h4 fw-bold mb-4 text-dark"><i className="bi bi-receipt me-2 text-danger"></i>Tóm tắt đơn hàng</h2>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted fw-medium">Đã chọn</span>
                                <span className="fw-bold badge bg-dark text-white rounded-pill px-3 py-2">{selectedItems.length} sản phẩm</span>
                            </div>

                            <div className="bg-light rounded p-3 mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Tạm tính</span>
                                    <span className="fw-semibold text-dark">{formatPrice(selectedTotalPrice)}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Phí vận chuyển</span>
                                    <span className="text-success fw-semibold">Liên hệ sau</span>
                                </div>
                            </div>
                            
                            <hr className="border-secondary opacity-25 mb-4" />
                            
                            <div className="d-flex justify-content-between align-items-end mb-4">
                                <span className="fw-bold text-dark fs-5">Tổng cộng</span>
                                <div className="text-end">
                                    <span className="fw-bold text-danger display-6 d-block mb-1" style={{ fontSize: '1.8rem' }}>{formatPrice(selectedTotalPrice)}</span>
                                    <small className="text-muted">(Đã bao gồm VAT nếu có)</small>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-danger w-100 rounded-pill py-3 fw-bold fs-6 mb-3 shadow-sm d-flex justify-content-center align-items-center gap-2 transition-all"
                                disabled={selectedItems.length === 0}
                                onClick={handleCheckout}
                                style={{ transform: selectedItems.length === 0 ? 'none' : 'scale(1)', transition: 'transform 0.1s' }}
                                onMouseDown={e => { if(selectedItems.length > 0) e.currentTarget.style.transform = 'scale(0.98)' }}
                                onMouseUp={e => { if(selectedItems.length > 0) e.currentTarget.style.transform = 'scale(1)' }}
                            >
                                <i className="bi bi-bag-check-fill fs-5"></i> Tiến hành đặt hàng ({selectedItems.length})
                            </button>
                            
                            <Link to="/" className="btn btn-light border w-100 rounded-pill py-2 fw-medium text-dark d-flex justify-content-center align-items-center gap-2 custom-hover-bg">
                                <i className="bi bi-arrow-left"></i> Tiếp tục mua sắm
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}