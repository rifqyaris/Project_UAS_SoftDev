"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "https://project-uas-soft-dev-production.up.railway.app";

export default function RegisterPage() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, role: "Donatur" }), 
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        const data = await response.json();
        setError(data.message || "Gagal melakukan registrasi.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow border-0 rounded-4 p-5" style={{ maxWidth: "450px", width: "100%" }}>
        <h2 className="text-center fw-bold text-success mb-2">Registrasi Akun</h2>
        <p className="text-center text-muted small mb-4">Buat akun untuk mulai menyalurkan donasi.</p>

        {error && (
          <div className="alert alert-danger py-2 px-3 small rounded-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Nama Lengkap</label>
            <input type="text" className="form-control form-control-sm rounded-3 py-2 px-3 border-light-subtle" placeholder="Nama Lengkap Anda" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Email</label>
            <input type="email" className="form-control form-control-sm rounded-3 py-2 px-3 border-light-subtle" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Kata Sandi</label>
            <input type="password" className="form-control form-control-sm rounded-3 py-2 px-3 border-light-subtle" placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button type="submit" className="btn btn-success w-100 fw-bold py-2 rounded-pill shadow-sm mt-3">
            Daftar Sekarang
          </button>
        </form>

        <p className="text-center text-muted small mt-4 mb-0">
          Sudah punya akun? <Link href="/login" className="text-success fw-bold text-decoration-none">Masuk Disini</Link>
        </p>
      </div>

      {showSuccess && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center border-0 rounded-4 shadow-lg">
              <div className="mb-3 d-flex justify-content-center">
                <div className="d-flex justify-content-center align-items-center bg-success bg-opacity-25 rounded-circle" style={{ width: "70px", height: "70px" }}>
                  <span style={{ fontSize: "35px" }}>✅</span>
                </div>
              </div>
              <h4 className="fw-bold text-dark mb-2">Registrasi Berhasil!</h4>
              <p className="text-muted mb-4 small">Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.</p>
              <button onClick={() => router.push("/login")} className="btn btn-success fw-bold px-5 rounded-pill shadow-sm">Ke Halaman Login</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}