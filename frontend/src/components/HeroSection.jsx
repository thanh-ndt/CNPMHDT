export default function HeroSection() {
    return (
        <section
            className="text-white position-relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #e3002b 0%, #b30022 60%, #8c001a 100%)',
                minHeight: '420px',
            }}
        >
            <div className="container py-5 position-relative" style={{ zIndex: 1 }}>
                <div className="row align-items-center min-vh-25">
                    <div className="col-lg-7 py-5">
                        <h1 className="display-4 fw-bold mb-3">
                            Honda Việt Nam
                        </h1>
                        <p className="fs-5 opacity-90 mb-4" style={{ maxWidth: '520px' }}>
                            Khám phá các dòng xe Honda chính hãng với giá tốt nhất.
                            Xe ga, xe số, xe côn tay – tất cả đều có tại đây!
                        </p>
                        <div className="d-flex flex-wrap gap-3">
                            <a
                                href="#xe-noi-bat"
                                className="btn btn-light btn-lg px-5 rounded-pill fw-bold text-danger"
                            >
                                Xem xe ngay
                            </a>
                            <a
                                href="#thuong-hieu"
                                className="btn btn-outline-light btn-lg px-4 rounded-pill"
                            >
                                Các dòng xe
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* Decorative circles */}
            <div
                className="position-absolute"
                style={{
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    top: '-150px',
                    right: '-100px',
                }}
            />
            <div
                className="position-absolute"
                style={{
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    bottom: '-80px',
                    left: '-60px',
                }}
            />
        </section>
    )
}
