import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../redux/authSlice';
import './css/Header.css';

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const { token, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);

    // Close dropdowns if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (!event.target.closest('.hdr-user-menu-container')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce API call for suggestions
    useEffect(() => {
        const delayDebounceTimeout = setTimeout(async () => {
            if (searchTerm.trim().length > 0) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/vehicles/suggestions?keyword=${encodeURIComponent(searchTerm)}`);
                    if (res.data.success) {
                        setSuggestions(res.data.data);
                        setShowDropdown(true);
                    }
                } catch (error) {
                    console.error("Lỗi fetch gợi ý:", error);
                }
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceTimeout);
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setShowDropdown(false);
            navigate(`/?search=${searchTerm.trim()}`);
        }
    };

    const handleSuggestionClick = (keyword) => {
        setSearchTerm(keyword);
        setShowDropdown(false);
        navigate(`/?search=${encodeURIComponent(keyword)}`);
    };

    const handleLogout = () => {
        dispatch(logout());
        setShowUserMenu(false);
        navigate('/login');
    };

    return (
        <header className="hdr-wrapper">


            {/* Dải Logo */}
            <div className="hdr-logo-bar">
                <div className="hdr-logo-inner">
                    <Link to="/" className="hdr-logo-link">
                        <div className="hdr-logo-text">
                            <span className="hdr-brand">HONDA</span>
                            <span className="hdr-tagline">How we move you.</span>
                            <span className="hdr-sub">CREATE · TRANSCEND · AUGMENT</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Dải điều hướng đen (sticky) */}
            <div className="hdr-nav-bar">
                <div className="hdr-nav-inner">
                    <nav className="hdr-nav-links">
                        <Link to="/" className={`hdr-nav-item ${location.pathname === '/' ? 'hdr-nav-active' : ''}`}>Trang chủ</Link>
                        <Link to="/products" className={`hdr-nav-item ${location.pathname === '/products' || location.pathname.startsWith('/product/') ? 'hdr-nav-active' : ''}`}>Sản phẩm</Link>
                        <Link to="/promotions" className={`hdr-nav-item ${location.pathname === '/promotions' ? 'hdr-nav-active' : ''}`}>Khuyến mãi</Link>
                        <Link to="/schedule-viewing" className={`hdr-nav-item ${location.pathname === '/schedule-viewing' ? 'hdr-nav-active' : ''}`}>Đặt lịch xem xe</Link>
                        <Link to="/cart" className={`hdr-nav-item ${location.pathname === '/cart' ? 'hdr-nav-active' : ''}`}>Giỏ hàng</Link>
                    </nav>

                    {/* Thanh tìm kiếm */}
                    <div className="hdr-search-container" ref={searchRef}>
                        <form className="hdr-search-form" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Nhập tên loại xe"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                            />
                            <button type="submit" aria-label="Search">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </button>
                        </form>

                        {/* Dropdown Gợi ý kết quả */}
                        {showDropdown && suggestions.length > 0 && (
                            <div className="hdr-suggestions-dropdown">
                                {suggestions.map((item) => (
                                    <div
                                        key={item._id || item.id}
                                        className="hdr-suggestion-item"
                                        onClick={() => handleSuggestionClick(item.name)}
                                    >
                                        <img
                                            src={item.images && item.images[0] ? item.images[0] : ''}
                                            alt={item.name}
                                            className="hdr-sug-img"
                                            onError={(e) => { e.target.src = 'https://placehold.co/40x40/f0f0f0/888?text=Bike' }}
                                        />
                                        <div className="hdr-sug-info">
                                            <div className="hdr-sug-name">{item.name}</div>
                                            <div className="hdr-sug-price">{item.formattedPrice || 'Liên hệ'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showDropdown && searchTerm.length > 0 && suggestions.length === 0 && (
                            <div className="hdr-suggestions-dropdown empty">
                                <div className="hdr-suggestion-item non-clickable">Không tìm thấy xe phù hợp</div>
                            </div>
                        )}

                    </div>

                    {/* Nút Đăng nhập / Đăng ký hoặc User Menu */}
                    <div className="hdr-auth-buttons">
                        {!token ? (
                            <>
                                <Link to="/login" className="hdr-auth-btn hdr-auth-login">Đăng nhập</Link>
                                <Link to="/register" className="hdr-auth-btn hdr-auth-register">Đăng ký</Link>
                            </>
                        ) : (
                            <div className="hdr-user-menu-container" style={{ position: 'relative' }}>
                                <div 
                                    className="hdr-user-trigger" 
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff' }}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', background: '#cc0000', 
                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '14px'
                                    }}>
                                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{user?.fullName?.split(' ').pop() || 'Tài khoản'}</span>
                                    <i className="bi bi-chevron-down" style={{ fontSize: '12px', transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'none' }}></i>
                                </div>

                                {showUserMenu && (
                                    <div className="hdr-user-dropdown" style={{
                                        position: 'absolute', top: 'calc(100% + 15px)', right: '0', background: '#fff',
                                        borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', width: '220px',
                                        overflow: 'hidden', zIndex: 1000, border: '1px solid #eee'
                                    }}>
                                        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', background: '#f8f9fa' }}>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#222', fontSize: '14px' }}>{user?.fullName || 'Người dùng'}</p>
                                            <p style={{ margin: 0, color: '#666', fontSize: '12px', marginTop: '4px', wordBreak: 'break-all' }}>{user?.email}</p>
                                        </div>
                                        <div style={{ padding: '8px 0' }}>
                                            <Link to="/profile" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', color: '#444', textDecoration: 'none', fontSize: '14px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                <i className="bi bi-person"></i> Hồ sơ cá nhân
                                            </Link>
                                            <Link to="/orders" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', color: '#444', textDecoration: 'none', fontSize: '14px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                <i className="bi bi-box-seam"></i> Đơn hàng của tôi
                                            </Link>
                                            <Link to="/favorites" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', color: '#444', textDecoration: 'none', fontSize: '14px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                <i className="bi bi-heart"></i> Sản phẩm yêu thích
                                            </Link>
                                            <div style={{ height: '1px', background: '#f0f0f0', margin: '8px 0' }}></div>
                                            <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', color: '#dc3545', textDecoration: 'none', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fff0f0'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                <i className="bi bi-box-arrow-right"></i> Đăng xuất
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </header>
    );
};

export default Header;