"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "";

function Navbar({ user, onLogout }: any) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm py-2">
      <div className="container">
        <Link href="/" className="navbar-brand fw-bold fs-4">♻️ DonasiKu</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-3 fw-semibold">
            <li className="nav-item"><Link className="nav-link" href="/dashboard">🏠 Dashboard</Link></li>
            <li className="nav-item"><Link className="nav-link active" href="/admin">⚙️ Admin</Link></li>
          </ul>
          
          <div className="d-flex align-items-center gap-2">
            {user && (
              <>
                {/* BAGIAN ROLE DI SAMPING NAMA SUDAH DIHAPUS */}
                <span className="text-white bg-white bg-opacity-25 px-3 py-1 rounded-pill small">
                  👤 <strong>{user.nama}</strong>
                </span>
                <button onClick={onLogout} className="btn btn-sm btn-outline-light fw-bold px-3">Keluar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({ totalDonasi: 0, totalPengguna: 0, barangTersalurkan: 0, users: [] });
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !storedUser || storedUser.role !== "Admin") {
      router.push("/unauthorized");
      return;
    }
    
    setUser(storedUser);

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const statsRes = await fetch(`${API}/api/admin/stats`, { headers });
        if (statsRes.ok) setStats(await statsRes.json());
        
        const txRes = await fetch(`${API}/api/admin/transaksi`, { headers });
        if (txRes.ok) setAllTransactions(await txRes.json());
      } catch (err) {
        console.error("Gagal mengambil data Admin", err);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => { localStorage.clear(); router.push("/"); };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-success m-0">Dasbor Admin Terpusat</h2>
            <p className="text-muted m-0">Pusat kendali platform DonasiKu</p>
          </div>
          <Link href="/dashboard" className="btn btn-outline-success fw-bold px-4 rounded-pill shadow-sm">Kembali ke Dasbor Utama</Link>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 border-bottom border-success border-5 text-center">
              <p className="text-muted small mb-1 fw-semibold">Total Donasi Tersedia</p>
              <h1 className="fw-bold text-success display-4 m-0">{stats.totalDonasi}</h1>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 border-bottom border-primary border-5 text-center">
              <p className="text-muted small mb-1 fw-semibold">Total Pengguna Terdaftar</p>
              <h1 className="fw-bold text-primary display-4 m-0">{stats.totalPengguna}</h1>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 border-bottom border-info border-5 text-center">
              <p className="text-muted small mb-1 fw-semibold">Barang Telah Tersalurkan</p>
              <h1 className="fw-bold text-info display-4 m-0">{stats.barangTersalurkan}</h1>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-5 overflow-hidden">
          <div className="card-header bg-white p-4 border-bottom">
            <h5 className="fw-bold text-dark m-0">📡 Semua Pelacakan (Tracking) Transaksi</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle m-0 text-nowrap">
                <thead className="bg-light text-muted small">
                  <tr>
                    <th className="px-4 py-3 fw-semibold">ID Transaksi</th>
                    <th className="px-4 py-3 fw-semibold">Nama Barang</th>
                    <th className="px-4 py-3 fw-semibold">Donatur</th>
                    <th className="px-4 py-3 fw-semibold">Penerima</th>
                    <th className="px-4 py-3 fw-semibold">Status Pengiriman</th>
                    <th className="px-4 py-3 fw-semibold">Live Tracking Terkini</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {allTransactions.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-muted">Belum ada transaksi di platform ini.</td></tr>
                  ) : (
                    allTransactions.slice().reverse().map((tx) => {
                      let statusBadge = "bg-warning text-dark";
                      if (tx.status === "Disetujui") statusBadge = "bg-success text-white";
                      if (tx.status === "Ditolak") statusBadge = "bg-danger text-white";
                      if (tx.status === "Selesai") statusBadge = "bg-primary text-white";

                      return (
                        <tr key={tx._id}>
                          <td className="px-4 py-3 text-secondary">{tx._id}</td>
                          <td className="px-4 py-3 fw-bold text-dark">{tx.barangNama}</td>
                          <td className="px-4 py-3">{tx.donaturId === "user_1" ? "Budi Donatur" : "Donatur"}</td>
                          <td className="px-4 py-3">{tx.peminatNama}</td>
                          <td className="px-4 py-3"><span className={`badge ${statusBadge} px-2 py-1`}>{tx.status}</span></td>
                          <td className="px-4 py-3 text-muted"><div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.tracking}</div></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white p-4 border-bottom">
            <h5 className="fw-bold text-success m-0">👥 Daftar Pengguna Terdaftar</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle m-0 text-nowrap">
                <thead className="bg-light text-muted small">
                  <tr>
                    <th className="px-4 py-3 fw-semibold">ID User</th>
                    <th className="px-4 py-3 fw-semibold">Nama Pengguna</th>
                    <th className="px-4 py-3 fw-semibold">Email</th>
                    <th className="px-4 py-3 fw-semibold">Peran</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {stats.users.map((u: any) => (
                    <tr key={u._id}>
                      <td className="px-4 py-3 text-secondary">{u._id}</td>
                      <td className="px-4 py-3 fw-bold text-dark">{u.nama}</td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3"><span className={`badge ${u.role === 'Admin' ? 'bg-danger' : 'bg-success'} px-3 py-1 rounded-pill`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}