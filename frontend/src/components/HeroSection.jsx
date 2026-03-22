export default function HeroSection() {
  return (
    <section
      className="position-relative overflow-hidden text-white py-5"
      style={{
        background: 'linear-gradient(135deg, #e3002b 0%, #ff1a3d 50%, #b80022 100%)',
        minHeight: '420px',
      }}
    >
      <div className="position-absolute top-0 end-0 w-50 h-100 opacity-10">
        <svg viewBox="0 0 200 200" className="w-100 h-100">
          <circle cx="100" cy="100" r="80" fill="currentColor" />
        </svg>
      </div>
      <div className="container position-relative py-5">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <h1 className="display-4 fw-bold mb-3">
              Honda Store
              <br />
              <span className="text-warning">Xe máy Honda chính hãng</span>
            </h1>
            <p className="lead mb-4 opacity-90">
              Khám phá toàn bộ mẫu xe Honda: Wave Alpha, Air Blade, Winner X và nhiều hơn nữa. 
              Bảo hành chính hãng, giao xe tận nơi, trả góp 0% lãi suất.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <a href="#xe-noi-bat" className="btn btn-warning btn-lg px-4 rounded-pill fw-bold text-dark">
                Xem xe ngay
              </a>
              <a href="#lien-he" className="btn btn-outline-light btn-lg px-4 rounded-pill">
                Liên hệ tư vấn
              </a>
            </div>
          </div>
          <div className="col-lg-5 d-none d-lg-block text-center mt-4 mt-lg-0">
            <div
              className="rounded-4 p-4 d-inline-block"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <span style={{ fontSize: '6rem' }}>🏍️</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
