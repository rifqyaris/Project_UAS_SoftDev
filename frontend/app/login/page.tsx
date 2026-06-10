"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://project-uas-soft-dev-production.up.railway.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email atau password salah.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #1a7a4a 0%, #56cfb2 100%)" }}
    >
      <div className="card p-5 shadow border-0" style={{ width: "450px", borderRadius: "20px" }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: "48px" }}>♻️</div>
          <h2 className="fw-bold text-success mt-2 mb-1">DonasiKu</h2>
          <p className="text-muted small">Platform Digital Donasi Sampah Anorganik & Barang Bekas</p>
        </div>

        {error && <div className="alert alert-danger py-2 small border-0 rounded-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Email</label>
            <input
              type="email"
              className="form-control py-2"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold text-dark small">Password</label>
            <input
              type="password"
              className="form-control py-2"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100 fw-bold py-2 mb-3" disabled={loading}>
            {loading ? "Memproses..." : "🔓 Masuk"}
          </button>
          <Link href="/register" className="btn btn-outline-success w-100 fw-bold py-2">
            Daftar Akun Baru
          </Link>
        </form>
        <div className="text-center mt-3">
          <Link href="/" className="text-muted small text-decoration-none">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}