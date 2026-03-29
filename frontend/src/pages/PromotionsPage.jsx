import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { getActivePromotionsApi } from '../api/promotionApi';
import { useNavigate } from 'react-router-dom';

const PromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await getActivePromotionsApi();
                if (res.success) {
                    setPromotions(res.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải khuyến mãi:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromos();
    }, []);

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price);

    const getDaysRemaining = (validTo) => {
        const now = new Date();
        const end = new Date(validTo);
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getDiscountLabel = (promo) => {
        if (promo.type === 'percentage') return `${promo.discountValue}%`;
        return formatPrice(promo.discountValue);
    };

    const getApplicableLabel = (promo) => {
        if (!promo.applicableModels || promo.applicableModels.length === 0) {
            return 'Tất cả các dòng xe';
        }
        return promo.applicableModels.map(m => (typeof m === 'object' ? m.name : m)).join(', ');
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                .promo-hero {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    padding: 60px 0 80px;
                    position: relative;
                    overflow: hidden;
                }
                .promo-hero::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -20%;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(227,0,43,0.15) 0%, transparent 70%);
                    border-radius: 50%;
                }
                .promo-hero::after {
                    content: '';
                    position: absolute;
                    bottom: -30%;
                    left: -10%;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%);
                    border-radius: 50%;
                }
                .promo-hero-content {
                    position: relative;
                    z-index: 1;
                }
                .promo-hero h1 {
                    font-size: 2.8rem;
                    font-weight: 800;
                    color: #fff;
                    margin-bottom: 16px;
                    letter-spacing: -0.5px;
                }
                .promo-hero h1 span {
                    background: linear-gradient(135deg, #e3002b, #ff6b6b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .promo-hero p {
                    color: rgba(255,255,255,0.7);
                    font-size: 1.15rem;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.7;
                }
                .promo-stats-row {
                    display: flex;
                    gap: 40px;
                    justify-content: center;
                    margin-top: 32px;
                }
                .promo-stat-item {
                    text-align: center;
                }
                .promo-stat-number {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #ff6b6b;
                }
                .promo-stat-label {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.5);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 4px;
                }

                .promo-section {
                    margin-top: -40px;
                    position: relative;
                    z-index: 2;
                    padding-bottom: 60px;
                }

                /* Coupon Card */
                .coupon-card {
                    background: #fff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,0.04);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .coupon-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 16px 48px rgba(227,0,43,0.12);
                    border-color: rgba(227,0,43,0.1);
                }

                .coupon-top {
                    background: linear-gradient(135deg, #e3002b 0%, #cc0022 100%);
                    padding: 24px 24px 20px;
                    position: relative;
                    overflow: hidden;
                }
                .coupon-top::before {
                    content: '';
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 100px;
                    height: 100px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 50%;
                }
                .coupon-top::after {
                    content: '';
                    position: absolute;
                    bottom: -30px;
                    left: 30%;
                    width: 60px;
                    height: 60px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                }
                .coupon-discount {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: #fff;
                    line-height: 1;
                    position: relative;
                    z-index: 1;
                }
                .coupon-discount-label {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.8);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-top: 4px;
                    position: relative;
                    z-index: 1;
                }
                .coupon-type-badge {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(255,255,255,0.2);
                    color: #fff;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 4px 12px;
                    border-radius: 20px;
                    backdrop-filter: blur(4px);
                    z-index: 1;
                }

                /* Zigzag separator */
                .coupon-separator {
                    height: 12px;
                    background: 
                        radial-gradient(circle at 6px 0, transparent 5px, #fff 5.5px) repeat-x left top / 12px 6px,
                        radial-gradient(circle at 6px 6px, transparent 5px, #fff 5.5px) repeat-x left bottom / 12px 6px;
                    background-color: #e3002b;
                    position: relative;
                }

                .coupon-body {
                    padding: 20px 24px 24px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .coupon-code-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                }
                .coupon-code-box {
                    flex: 1;
                    background: #f8f9fa;
                    border: 2px dashed #dee2e6;
                    border-radius: 10px;
                    padding: 10px 16px;
                    font-family: 'Courier New', monospace;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #e3002b;
                    letter-spacing: 2px;
                    text-align: center;
                }
                .coupon-copy-btn {
                    background: linear-gradient(135deg, #e3002b, #cc0022);
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    padding: 10px 18px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .coupon-copy-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(227,0,43,0.3);
                }
                .coupon-copy-btn.copied {
                    background: linear-gradient(135deg, #27ae60, #219a52);
                }

                .coupon-desc {
                    color: #555;
                    font-size: 0.92rem;
                    line-height: 1.5;
                    margin-bottom: 16px;
                    flex: 1;
                }

                .coupon-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    border-top: 1px solid #f0f0f0;
                    padding-top: 16px;
                }
                .coupon-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.82rem;
                    color: #777;
                }
                .coupon-meta-item i {
                    color: #e3002b;
                    font-size: 0.9rem;
                    width: 18px;
                    text-align: center;
                }
                .coupon-meta-item .meta-value {
                    font-weight: 600;
                    color: #333;
                }

                .coupon-days-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 3px 10px;
                    border-radius: 20px;
                }
                .coupon-days-badge.urgent {
                    background: #fff0f0;
                    color: #e3002b;
                }
                .coupon-days-badge.normal {
                    background: #f0f9f4;
                    color: #27ae60;
                }

                /* How to use section */
                .how-to-use {
                    background: #f8f9fa;
                    border-radius: 20px;
                    padding: 48px 40px;
                    margin-top: 50px;
                }
                .how-to-use h3 {
                    font-weight: 700;
                    color: #1a1a2e;
                    margin-bottom: 32px;
                    text-align: center;
                }
                .step-card {
                    text-align: center;
                    padding: 24px 16px;
                }
                .step-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #e3002b, #ff6b6b);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    font-size: 1.6rem;
                    color: #fff;
                    box-shadow: 0 8px 20px rgba(227,0,43,0.2);
                }
                .step-number {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #e3002b;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }
                .step-title {
                    font-weight: 700;
                    color: #1a1a2e;
                    font-size: 1rem;
                    margin-bottom: 8px;
                }
                .step-desc {
                    font-size: 0.85rem;
                    color: #777;
                    line-height: 1.5;
                }

                /* Empty state */
                .promo-empty {
                    text-align: center;
                    padding: 60px 20px;
                    background: #fff;
                    border-radius: 20px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                }
                .promo-empty-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    opacity: 0.3;
                }
                .promo-empty h3 {
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 12px;
                }
                .promo-empty p {
                    color: #888;
                    max-width: 400px;
                    margin: 0 auto 24px;
                }
                .promo-empty-btn {
                    background: linear-gradient(135deg, #e3002b, #cc0022);
                    color: #fff;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 30px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .promo-empty-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(227,0,43,0.3);
                }
            ` }} />

            {/* Hero Section */}
            <div className="promo-hero">
                <Container>
                    <div className="promo-hero-content text-center">
                        <h1>Ưu Đãi <span>Cực Sốc</span></h1>
                        <p>
                            Tổng hợp các mã giảm giá đang hiệu lực. Sao chép mã và sử dụng khi thanh toán 
                            để nhận ngay ưu đãi hấp dẫn cho chiếc xe trong mơ của bạn!
                        </p>
                        {!loading && promotions.length > 0 && (
                            <div className="promo-stats-row">
                                <div className="promo-stat-item">
                                    <div className="promo-stat-number">{promotions.length}</div>
                                    <div className="promo-stat-label">Mã đang hoạt động</div>
                                </div>
                                <div className="promo-stat-item">
                                    <div className="promo-stat-number">
                                        {Math.max(...promotions.map(p => p.type === 'percentage' ? p.discountValue : 0))}%
                                    </div>
                                    <div className="promo-stat-label">Giảm tối đa</div>
                                </div>
                                <div className="promo-stat-item">
                                    <div className="promo-stat-number">
                                        {promotions.filter(p => !p.applicableModels || p.applicableModels.length === 0).length}
                                    </div>
                                    <div className="promo-stat-label">Áp dụng mọi xe</div>
                                </div>
                            </div>
                        )}
                    </div>
                </Container>
            </div>

            {/* Promotions Grid */}
            <div className="promo-section">
                <Container>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="danger" />
                            <p className="mt-3 text-muted">Đang tải các ưu đãi mới nhất...</p>
                        </div>
                    ) : promotions.length === 0 ? (
                        <div className="promo-empty">
                            <div className="promo-empty-icon">🎫</div>
                            <h3>Hiện chưa có mã giảm giá nào</h3>
                            <p>Hãy thường xuyên quay lại để không bỏ lỡ các ưu đãi hấp dẫn từ chúng tôi nhé!</p>
                            <button className="promo-empty-btn" onClick={() => navigate('/products')}>
                                <i className="bi bi-arrow-right me-2"></i> Khám phá xe ngay
                            </button>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {promotions.map((promo) => {
                                const daysLeft = getDaysRemaining(promo.validTo);
                                const isCopied = copiedCode === promo.code;

                                return (
                                    <Col key={promo._id} md={6} lg={4}>
                                        <div className="coupon-card">
                                            {/* Coupon Top */}
                                            <div className="coupon-top">
                                                <span className="coupon-type-badge">
                                                    {promo.type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                                                </span>
                                                <div className="coupon-discount">
                                                    GIẢM {getDiscountLabel(promo)}
                                                </div>
                                                <div className="coupon-discount-label">
                                                    {promo.type === 'percentage' ? 'Trên giá trị đơn hàng' : 'Trực tiếp vào đơn hàng'}
                                                </div>
                                            </div>

                                            {/* Zigzag separator */}
                                            <div className="coupon-separator"></div>

                                            {/* Coupon Body */}
                                            <div className="coupon-body">
                                                {/* Code + Copy */}
                                                <div className="coupon-code-row">
                                                    <div className="coupon-code-box">{promo.code}</div>
                                                    <button
                                                        className={`coupon-copy-btn ${isCopied ? 'copied' : ''}`}
                                                        onClick={() => handleCopy(promo.code)}
                                                    >
                                                        <i className={`bi ${isCopied ? 'bi-check-lg' : 'bi-clipboard'}`}></i>
                                                        {isCopied ? 'Đã chép' : 'Sao chép'}
                                                    </button>
                                                </div>

                                                {/* Description */}
                                                <div className="coupon-desc">
                                                    {promo.description || 'Ưu đãi đặc biệt dành cho bạn khi mua xe tại cửa hàng.'}
                                                </div>

                                                {/* Meta info */}
                                                <div className="coupon-meta">
                                                    <div className="coupon-meta-item">
                                                        <i className="bi bi-calendar-event"></i>
                                                        <span>Hiệu lực:</span>
                                                        <span className="meta-value">
                                                            {new Date(promo.validFrom).toLocaleDateString('vi-VN')} - {new Date(promo.validTo).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <div className="coupon-meta-item">
                                                        <i className="bi bi-bicycle"></i>
                                                        <span>Áp dụng:</span>
                                                        <span className="meta-value">{getApplicableLabel(promo)}</span>
                                                    </div>
                                                    <div className="coupon-meta-item">
                                                        <i className="bi bi-clock-history"></i>
                                                        <span>Còn lại:</span>
                                                        <span className={`coupon-days-badge ${daysLeft <= 3 ? 'urgent' : 'normal'}`}>
                                                            <i className={`bi ${daysLeft <= 3 ? 'bi-exclamation-triangle' : 'bi-check-circle'}`}></i>
                                                            {daysLeft <= 0 ? 'Hết hạn hôm nay' : `${daysLeft} ngày`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}

                    {/* How to use section */}
                    <div className="how-to-use">
                        <h3><i className="bi bi-lightbulb me-2" style={{ color: '#e3002b' }}></i>Cách sử dụng mã giảm giá</h3>
                        <Row className="g-3">
                            <Col md={3}>
                                <div className="step-card">
                                    <div className="step-icon"><i className="bi bi-clipboard-check"></i></div>
                                    <div className="step-number">Bước 1</div>
                                    <div className="step-title">Sao chép mã</div>
                                    <div className="step-desc">Nhấn nút "Sao chép" trên mã giảm giá bạn muốn sử dụng</div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="step-card">
                                    <div className="step-icon"><i className="bi bi-cart-plus"></i></div>
                                    <div className="step-number">Bước 2</div>
                                    <div className="step-title">Chọn xe yêu thích</div>
                                    <div className="step-desc">Thêm xe vào giỏ hàng và tiến hành đặt hàng</div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="step-card">
                                    <div className="step-icon"><i className="bi bi-input-cursor-text"></i></div>
                                    <div className="step-number">Bước 3</div>
                                    <div className="step-title">Nhập mã giảm giá</div>
                                    <div className="step-desc">Dán mã vào ô "Mã Giảm Giá" tại trang thanh toán</div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="step-card">
                                    <div className="step-icon"><i className="bi bi-gift"></i></div>
                                    <div className="step-number">Bước 4</div>
                                    <div className="step-title">Nhận ưu đãi</div>
                                    <div className="step-desc">Giá đơn hàng sẽ được giảm tự động. Hoàn tất đặt hàng!</div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default PromotionsPage;
