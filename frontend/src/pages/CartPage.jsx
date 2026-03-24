import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    fetchCartAsync,
    setCustomerEmail,
    clearCartAsync,
    removeFromCartAsync,
    updateCartQuantityAsync,
    selectCustomerEmail,
    selectCartItems,
    selectCartTotalPrice,
    selectCartLoading,
    selectCartError,
} from '../redux/cartSlice'

export default function CartPage() {
    const dispatch = useDispatch()
    const customerEmail = useSelector(selectCustomerEmail)
    const items = useSelector(selectCartItems)
    const totalPrice = useSelector(selectCartTotalPrice)
    const loading = useSelector(selectCartLoading)
    const error = useSelector(selectCartError)

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

    if (!customerEmail) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h1 className="h4 fw-bold mb-3">Giỏ hàng</h1>
                                <p className="text-muted mb-4">
                                    Để test giỏ hàng, vui lòng nhập <strong>email khách hàng</strong>. (Seed đang có sẵn các email mẫu.)
                                </p>
                                <label className="form-label small text-muted">Email khách hàng</label>
                                <input
                                    className="form-control"
                                    placeholder="Ví dụ: nguyenvana@gmail.com"
                                    value={customerEmail}
                                    onChange={(e) => dispatch(setCustomerEmail(e.target.value))}
                                />
                                <div className="mt-3 small text-secondary">
                                    Ví dụ seed: <br />
                                    <span className="fw-semibold">nguyenvana@gmail.com</span> <br />
                                    <span className="fw-semibold">tranthib@gmail.com</span> <br />
                                    <span className="fw-semibold">levanc@gmail.com</span>
                                </div>
                                <div className="mt-4">
                                    <Link to="/" className="btn btn-danger rounded-pill px-4 fw-bold">
                                        Quay lại trang chủ
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
                            <ul className="list-group list-group-flush">
                                {items.map((item) => (
                                    <li key={item.vehicleId} className="list-group-item py-4">
                                        <div className="row align-items-center g-3">
                                            <div className="col-md-2 col-4">
                                                <img
                                                    src={`https://placehold.co/160x120/e3002b/fff?text=${encodeURIComponent(item.name?.slice(0, 12) || 'Honda')}`}
                                                    alt={item.name}
                                                    className="rounded w-100 object-fit-cover"
                                                    style={{ maxHeight: '100px' }}
                                                />
                                            </div>
                                            <div className="col-md-4 col-8">
                                                <h3 className="h6 mb-1">{item.name}</h3>
                                                <p className="text-muted small mb-0">
                                                    {item.brandName} • {item.vehicleModelName} • {item.manufacture}
                                                </p>
                                                <p className="fw-bold text-danger mb-0 mt-2">{formatPrice(item.price)}</p>
                                            </div>
                                            <div className="col-md-3 col-6">
                                                <label className="form-label small text-muted mb-1">Số lượng</label>
                                                <div className="input-group input-group-sm" style={{ maxWidth: '140px' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() =>
                                                            dispatch(
                                                                updateCartQuantityAsync({
                                                                    customerEmail,
                                                                    vehicleId: item.vehicleId,
                                                                    quantity: item.quantity - 1,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        −
                                                    </button>
                                                    <input type="text" readOnly className="form-control text-center" value={item.quantity} />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() =>
                                                            dispatch(
                                                                updateCartQuantityAsync({
                                                                    customerEmail,
                                                                    vehicleId: item.vehicleId,
                                                                    quantity: item.quantity + 1,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-5 text-md-end">
                                                <p className="small text-muted mb-0">Thành tiền</p>
                                                <p className="fw-bold mb-0">{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                            <div className="col-md-1 col-1 text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-danger p-0"
                                                    title="Xóa"
                                                    onClick={() =>
                                                        dispatch(
                                                            removeFromCartAsync({
                                                                customerEmail,
                                                                vehicleId: item.vehicleId,
                                                            })
                                                        )
                                                    }
                                                >
                                                    ✕
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
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: '88px' }}>
                        <div className="card-body p-4">
                            <h2 className="h5 fw-bold mb-4">Tóm tắt đơn hàng</h2>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tạm tính</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 small text-muted">
                                <span>Phí vận chuyển</span>
                                <span>Liên hệ</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bold">Tổng cộng</span>
                                <span className="fw-bold text-danger fs-5">{formatPrice(totalPrice)}</span>
                            </div>
                            <button type="button" className="btn btn-danger w-100 rounded-pill py-3 fw-bold mb-2">
                                Tiến hành đặt hàng
                            </button>
                            <Link to="/" className="btn btn-outline-secondary w-100 rounded-pill">
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}