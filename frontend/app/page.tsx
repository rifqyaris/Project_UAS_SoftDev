import React from "react";

export default function LandingPage() {
  return (
    <div 
      className="min-vh-100 d-flex flex-column" 
      style={{ background: "linear-gradient(135deg, #198754 0%, #20c997 100%)" }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent pt-4">
        <div className="container">
          <a href="/" className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 text-white text-decoration-none">
            ♻️ DonasiKu
          </a>
          <div className="d-flex gap-3 ms-auto">
            
            <a href="/dashboard" className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm text-dark text-decoration-none">
              🚀 Ke Dashboard
            </a>

            <a href="/login" className="btn btn-outline-light rounded-pill px-4 fw-semibold text-decoration-none">
              Masuk
            </a>
            <a href="/register" className="btn btn-light text-success rounded-pill px-4 fw-semibold shadow-sm text-decoration-none">
              Daftar Akun
            </a>
          </div>
        </div>
      </nav>

      <div className="container flex-grow-1 d-flex align-items-center py-5">
        <div className="row w-100 align-items-center">
          
          <div className="col-lg-7 text-white mb-5 mb-lg-0 pr-lg-5">
            <div className="bg-white text-success px-3 py-2 rounded-pill d-inline-block fw-bold small mb-4 shadow-sm">
              🌿 Platform Donasi Digital Universitas Tarumanagara
            </div>
            
            <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: "1.2" }}>
              Salurkan Barang,<br />
              Ubah Menjadi<br />
              Manfaat Nyata
            </h1>
            
            <p className="fs-5 text-white-50 mb-5 pe-lg-5">
              Platform digital untuk mengelola donasi sampah anorganik dan barang bekas layak pakai. Transparan, efisien, dan berdampak sosial nyata.
            </p>
            
            <div className="d-flex flex-wrap gap-3">
              <a 
                href="/dashboard" 
                className="btn btn-light text-success fw-bold px-4 py-3 rounded-pill shadow d-flex align-items-center gap-2 text-decoration-none"
              >
                🎁 Mulai Donasi
              </a>
              
              <a 
                href="/dashboard" 
                className="btn btn-outline-light fw-bold px-4 py-3 rounded-pill d-flex align-items-center gap-2 text-decoration-none"
              >
                📦 Minta Barang
              </a>

              <a 
                href="/dashboard" 
                className="btn btn-warning text-dark fw-bold px-4 py-3 rounded-pill shadow d-flex align-items-center gap-2 text-decoration-none"
              >
                🔍 Lihat Barang Donasi
              </a>
            </div>
          </div>

          <div className="col-lg-5 d-flex justify-content-center position-relative">
            
            <div 
              className="rounded-circle d-flex justify-content-center align-items-center position-relative shadow"
              style={{ 
                width: "420px", 
                height: "420px", 
                backgroundColor: "rgba(255, 255, 255, 0.1)", 
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(5px)" 
              }}
            >
              <div className="text-white" style={{ fontSize: "110px", opacity: 0.9 }}>
                ♻️
              </div>


              <div className="position-absolute bg-white rounded-4 shadow-sm p-3 d-flex flex-column align-items-center" style={{ top: "15%", left: "-5%" }}>
                <span className="fs-5 mb-1">📦</span>
                <span className="small fw-bold text-secondary" style={{ fontSize: "12px" }}>Donasi</span>
              </div>
              
              <div className="position-absolute bg-white rounded-4 shadow-sm p-3 d-flex flex-column align-items-center" style={{ top: "15%", right: "-5%" }}>
                <span className="fs-5 mb-1">💖</span>
                <span className="small fw-bold text-secondary" style={{ fontSize: "12px" }}>Peduli</span>
              </div>

              <div className="position-absolute bg-white rounded-4 shadow-sm p-3 d-flex flex-column align-items-center" style={{ bottom: "15%", left: "-5%" }}>
                <span className="fs-5 mb-1">🌿</span>
                <span className="small fw-bold text-secondary" style={{ fontSize: "12px" }}>Hijau</span>
              </div>

              <div className="position-absolute bg-white rounded-4 shadow-sm p-3 d-flex flex-column align-items-center" style={{ bottom: "15%", right: "-5%" }}>
                <span className="fs-5 mb-1">🤝</span>
                <span className="small fw-bold text-secondary" style={{ fontSize: "12px" }}>Bersama</span>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}