import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './css/Header.css';

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const { token } = useSelector((state) => state.auth);

    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
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

                    {/* Nút Đăng nhập / Đăng ký */}
                    <div className="hdr-auth-buttons">
                        {!token ? (
                            <>
                                <Link to="/login" className="hdr-auth-btn hdr-auth-login">Đăng nhập</Link>
                                <Link to="/register" className="hdr-auth-btn hdr-auth-register">Đăng ký</Link>
                            </>
                        ) : (
                            <Link to="/profile" className="hdr-auth-btn hdr-auth-profile">Tài khoản</Link>
                        )}
                    </div>
                </div>
            </div>

        </header>
    );
};

export default Header;