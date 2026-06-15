import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card border-0 shadow-lg rounded-4 p-5 text-center" style={{ maxWidth: "450px" }}>
        
        <div className="mb-4 d-flex justify-content-center">
          <div 
            className="d-flex justify-content-center align-items-center bg-warning bg-opacity-25 rounded-circle" 
            style={{ width: "100px", height: "100px" }}
          >
            <span style={{ fontSize: "50px" }}>🔒</span>
          </div>
        </div>

        <h3 className="fw-bold text-success mb-3">Akses Dibatasi</h3>
        <p className="text-muted mb-4">
          Silakan <strong>Masuk (Login)</strong> terlebih dahulu untuk melanjutkan aksi ini. Halaman ini diproteksi khusus untuk pengguna terdaftar.
        </p>

        <div className="d-flex flex-column gap-3">
          <Link href="/login" className="btn btn-success fw-bold py-3 rounded-pill shadow-sm">
            Masuk ke Akun Saya
          </Link>
          <Link href="/dashboard" className="btn btn-light border text-secondary fw-bold py-2 rounded-pill">
            Kembali ke Dasbor
          </Link>
        </div>

      </div>
    </div>
  );
}