import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCartTotalQuantity } from '../redux'

export default function Navbar() {
  const location = useLocation()
  const cartCount = useSelector(selectCartTotalQuantity)

  const isActive = (path) => (location.pathname === path ? 'active' : '')

  return (
    <nav className="navbar navbar-expand-lg navbar-dark py-3 sticky-top shadow-sm" style={{ backgroundColor: '#e3002b' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" to="/">
          <span>🏍️</span>
          <span>Honda Store</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-3 align-items-lg-center">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Trang chủ</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#xe-noi-bat">Xe nổi bật</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#thuong-hieu">Dòng xe</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#lien-he">Liên hệ</a>
            </li>
            <li className="nav-item">
              <Link className={`nav-link position-relative ${isActive('/cart')}`} to="/cart">
                <span className="me-1">🛒</span>
                Giỏ hàng
                {cartCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light text-danger"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
