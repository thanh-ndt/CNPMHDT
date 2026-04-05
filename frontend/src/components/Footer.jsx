import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-dark text-light py-5 mt-5" id="lien-he">
            <div className="container">
                <div className="row g-4">
                    <div className="col-md-4">
                        <h5 className="fw-bold mb-3">Honda Store</h5>
                        <p className="text-secondary small">
                            Đại lý xe máy Honda chính hãng. Cam kết giá tốt nhất,
                            bảo hành chính hãng Honda, giao xe tận nơi.
                        </p>
                    </div>
                    <div className="col-md-2">
                        <h6 className="fw-bold mb-3">Liên kết</h6>
                        <ul className="list-unstyled small">
                            <li><a href="/" className="text-secondary text-decoration-none">Trang chủ</a></li>
                            <li><a href="#xe-noi-bat" className="text-secondary text-decoration-none">Sản phẩm</a></li>
                            <li><a href="#thuong-hieu" className="text-secondary text-decoration-none">Dòng xe</a></li>
                            <li><Link to="/about" className="text-secondary text-decoration-none">Điều khoản & Chính sách</Link></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h6 className="fw-bold mb-3">Liên hệ</h6>
                        <ul className="list-unstyled small text-secondary">
                            <li>123 Nguyễn Huệ, Q.1, TP.HCM</li>
                            <li>1900 1234</li>
                            <li>hotro@hondastore.vn</li>
                        </ul>
                    </div>
                </div>
                <hr className="border-secondary my-4" />
                <p className="text-center text-secondary small mb-0">© 2025 Honda Store. All rights reserved.</p>
            </div>
        </footer>
    )
}