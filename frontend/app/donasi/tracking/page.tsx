"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io } from "socket.io-client";
const socket = io("projectuassoftdev-production.up.railway.app");

const API = "projectuassoftdev-production.up.railway.app";

function Navbar({ user, notifs, onLogout, onRequireLogin, onNotifAction }: any) {
  const unread = notifs?.filter((n: any) => !n.dibaca).length || 0;
  const markRead = async () => {
    const token = localStorage.getItem("token");
    if (token && user) {
      await fetch(`${API}/api/notif/baca/${user._id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
    }
  };

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
            <li className="nav-item"><span className="nav-link" style={{ cursor: "pointer" }} onClick={() => onRequireLogin("/donasi/upload")}>🎁 Donasi</span></li>
            <li className="nav-item"><Link className="nav-link active" href="/donasi/tracking">📍 Tracking</Link></li>
            <li className="nav-item"><span className="nav-link" style={{ cursor: "pointer" }} onClick={() => onRequireLogin("/chat")}>💬 Chat</span></li>
            {user?.role === "Admin" && (<li className="nav-item"><Link className="nav-link" href="/admin">⚙️ Admin</Link></li>)}
          </ul>
          
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-light position-relative" data-bs-toggle="dropdown" onClick={markRead}>
                    🔔
                    {unread > 0 && (<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "9px" }}>{unread}</span>)}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4" style={{ minWidth: "320px", maxHeight: "380px", overflowY: "auto" }}>
                    <li className="px-3 py-2 border-bottom"><strong className="text-dark small">🔔 Notifikasi</strong></li>
                    {notifs?.length === 0 ? (
                      <li className="px-3 py-3 text-muted small text-center">Tidak ada notifikasi</li>
                    ) : (
                      notifs?.slice(0, 8).map((n: any) => (
                        <li key={n._id} className={`px-3 py-2 border-bottom small ${!n.dibaca ? "bg-light" : ""}`} style={{ cursor: "pointer" }} onClick={() => { if(onNotifAction) onNotifAction(n.pesan); }}>
                          <div className="fw-semibold text-dark" style={{ fontSize: "12px" }}>{n.pesan}</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <span className="text-white bg-white bg-opacity-25 px-3 py-1 rounded-pill small">
                  👤 <strong>{user.nama}</strong>
                </span>
                <button onClick={onLogout} className="btn btn-sm btn-outline-light fw-bold px-3">Keluar</button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link href="/login" className="btn btn-sm btn-outline-light fw-bold px-4 rounded-pill">Masuk</Link>
                <Link href="/register" className="btn btn-sm btn-light text-success fw-bold px-4 rounded-pill">Daftar Akun</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function TrackingPage() {
  const [user, setUser] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [transaksiList, setTransaksiList] = useState<any[]>([]);
  
  const [infoModal, setInfoModal] = useState(""); 
  const [successModal, setSuccessModal] = useState("");
  const [errorModal, setErrorModal] = useState("");
  
  const [cancelPromptData, setCancelPromptData] = useState<any>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");

  const router = useRouter();

  const loadData = useCallback(async (token: string, storedUser: any) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const notifRes = await fetch(`${API}/api/notif/${storedUser._id}`, { headers });
      if (notifRes.ok) setNotifs(await notifRes.json());
      const txRes = await fetch(`${API}/api/transaksi/${storedUser._id}`, { headers });
      if (txRes.ok) {
        const data = await txRes.json();
        setTransaksiList(data.reverse());
      }
    } catch (error) {
      console.error("Gagal mengambil data tracking:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (token && storedUser) {
      setUser(storedUser);
      loadData(token, storedUser);
    } else {
      router.push("/login");
    }
  }, [loadData, router]);

  useEffect(() => {
    if (!user) return;
    socket.emit("join_user_global", user._id); 
    socket.on("notification", (data: any) => {
      setInfoModal(data.message); 
      const token = localStorage.getItem("token");
      if(token) loadData(token, user);
    });
    socket.on("refresh_notif", () => {
      const token = localStorage.getItem("token");
      if(token) loadData(token, user);
    });
    return () => { 
      socket.off("notification"); 
      socket.off("refresh_notif"); 
    };
  }, [user, loadData]);

  const requireLogin = (actionOrPath: (() => void) | string) => {
    if (typeof actionOrPath === "string") router.push(actionOrPath);
    else actionOrPath();
  };

  const handleNotifAction = (pesan: string) => {
    if (pesan.includes("💬") || pesan.toLowerCase().includes("pesan")) {
      requireLogin("/chat");
    } else if (pesan.includes("📦") || pesan.toLowerCase().includes("formulir")) {
      requireLogin("/dashboard");
    } else {
      window.location.reload();
    }
  };

  const handleLogout = () => { localStorage.clear(); router.push("/"); };

  const handleUpdateLiveTracking = async (tx: any, newTrackingText: string, customStatus?: string) => {
    const token = localStorage.getItem("token");
    const finalStatus = customStatus || tx.status;
    const isPenerima = user._id === tx.peminatId;
    const targetNotifId = isPenerima ? tx.donaturId : tx.peminatId;

    try {
      const res = await fetch(`${API}/api/transaksi/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txId: tx._id, status: finalStatus, tracking: newTrackingText, peminatId: targetNotifId }),
      });
      if (res.ok) {
        setSuccessModal(`Status berhasil diupdate: "${newTrackingText}"`);
        loadData(token!, user);
      } else { setErrorModal("Gagal memperbarui."); }
    } catch { setErrorModal("Terjadi kesalahan jaringan."); }
  };

  const handleCancelTransaksi = async (tx: any, alasan: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/transaksi/request-cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txId: tx._id, alasan, peminatId: tx.peminatId, donaturId: tx.donaturId }),
      });
      if (res.ok) {
        setSuccessModal("Permintaan pembatalan telah dikirim ke Donatur.");
        loadData(token!, user);
      } else { setErrorModal("Gagal membatalkan transaksi."); }
    } catch { setErrorModal("Terjadi kesalahan jaringan."); }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar user={user} notifs={notifs} onLogout={handleLogout} onRequireLogin={requireLogin} onNotifAction={handleNotifAction} />

      <div className="container my-5">
        <div className="bg-white p-4 rounded-4 shadow-sm mb-4 border-start border-success border-5">
          <h3 className="fw-bold text-dark mb-1">📍 Pelacakan Barang (Tracking)</h3>
        </div>

        {transaksiList.length === 0 ? (
          <div className="card text-center p-5 border-0 text-muted shadow-sm rounded-4">
            <h5>Belum ada aktivitas transaksi.</h5>
          </div>
        ) : (
          <div className="row g-4">
            {transaksiList.map((tx: any) => {
              const isPenerima = user._id === tx.peminatId;
              let statusColor = "bg-warning text-dark";
              let statusIcon = "⏳";
              if (tx.status === "Disetujui") { statusColor = "bg-success text-white"; statusIcon = "🚀"; }
              if (tx.status === "Ditolak") { statusColor = "bg-danger text-white"; statusIcon = "❌"; }
              if (tx.status === "Selesai") { statusColor = "bg-primary text-white"; statusIcon = "✅"; }
              if (tx.status === "Dibatalkan") { statusColor = "bg-secondary text-white"; statusIcon = "⚠️"; }
              if (tx.status === "Menunggu Konfirmasi Batal") { statusColor = "bg-danger text-white"; statusIcon = "⚠️"; }

              return (
                <div className="col-md-6" key={tx._id}>
                  <div className={`card h-100 shadow-sm border-0 rounded-4 p-3 ${tx.status === 'Selesai' || tx.status === 'Dibatalkan' ? 'bg-light opacity-75' : ''}`}>
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                      <span className={`badge ${isPenerima ? "bg-primary" : "bg-info text-dark"} px-3 py-2 rounded-pill`}>{isPenerima ? "👇 Permintaan Anda" : "🎁 Donasi Anda"}</span>
                      <span className={`badge ${statusColor} px-3 py-2 rounded-pill fw-bold`}>{statusIcon} {tx.status}</span>
                    </div>
                    
                    <h5 className="fw-bold text-dark mb-2">{tx.barangNama}</h5>
                    
                    <div className="mt-auto">
                      <span className="text-muted small fw-bold">Live Tracking:</span>
                      <div className={`alert py-2 mt-1 mb-0 border-0 shadow-sm d-flex align-items-center gap-2 ${tx.status === 'Selesai' ? 'alert-primary' : 'alert-secondary'}`}>
                        <span className="small fw-semibold">{tx.tracking}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-top">
                      {tx.status === "Disetujui" && (
                        <>
                           {!isPenerima ? (
                            <div className="d-flex flex-wrap gap-2">
                              <button onClick={() => handleUpdateLiveTracking(tx, "📦 Barang sedang disiapkan")} className="btn btn-sm btn-outline-secondary fw-semibold">Siapkan</button>
                              <button onClick={() => handleUpdateLiveTracking(tx, "🚚 Barang sedang dikirim")} className="btn btn-sm btn-outline-primary fw-semibold">Kirim</button>
                              <button onClick={() => handleUpdateLiveTracking(tx, "📍 Barang sampai")} className="btn btn-sm btn-outline-success fw-semibold">Sampai</button>
                            </div>
                          ) : (
                            <button onClick={() => handleUpdateLiveTracking(tx, "✅ Diterima", "Selesai")} className="btn btn-sm btn-success w-100 fw-bold">✓ Barang Diterima</button>
                          )}
                        </>
                      )}

                      {/* TOMBOL KONFIRMASI BATAL UNTUK DONATUR */}
                      {tx.status === "Menunggu Konfirmasi Batal" && !isPenerima && (
                        <div className="d-flex gap-2">
                          <button onClick={async () => {
                             const res = await fetch(`${API}/api/transaksi/confirm-cancel`, { method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({txId: tx._id, disetujui: true, donaturId: tx.donaturId, peminatId: tx.peminatId})});
                             if(res.ok) { setSuccessModal("Pembatalan disetujui."); loadData(localStorage.getItem("token")!, user); }
                          }} className="btn btn-sm btn-danger w-100 fw-bold">Setujui Batal</button>
                          
                          <button onClick={async () => {
                             const res = await fetch(`${API}/api/transaksi/confirm-cancel`, { method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({txId: tx._id, disetujui: false, donaturId: tx.donaturId, peminatId: tx.peminatId})});
                             if(res.ok) { setSuccessModal("Pembatalan ditolak."); loadData(localStorage.getItem("token")!, user); }
                          }} className="btn btn-sm btn-outline-secondary w-100 fw-bold">Tolak Batal</button>
                        </div>
                      )}

                      {/* TOMBOL REQUEST BATAL UNTUK PENERIMA */}
                      {tx.status === "Disetujui" && isPenerima && (
                        <button onClick={() => {
                          setCancelPromptData(tx);
                          setCancelReasonInput("");
                        }} className="btn btn-sm btn-outline-danger w-100 mt-2 fw-bold">Batalkan Transaksi</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POP-UP CUSTOM UNTUK ALASAN BATAL */}
      {cancelPromptData && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h5 className="fw-bold text-danger m-0">Batalkan Transaksi</h5>
                <button onClick={() => setCancelPromptData(null)} className="btn-close"></button>
              </div>
              <p className="small text-muted mb-3">Silakan masukkan alasan pembatalan untuk <strong className="text-dark">{cancelPromptData.barangNama}</strong>:</p>
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Ketik alasan pembatalan..." autoFocus value={cancelReasonInput} onChange={(e) => setCancelReasonInput(e.target.value)} />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button onClick={() => setCancelPromptData(null)} className="btn btn-sm btn-outline-secondary px-3 fw-bold">Batal</button>
                <button onClick={() => {
                  if (cancelReasonInput.trim()) {
                    handleCancelTransaksi(cancelPromptData, cancelReasonInput);
                    setCancelPromptData(null);
                  }
                }} className="btn btn-sm btn-danger px-4 fw-bold" disabled={!cancelReasonInput.trim()}>
                  Kirim Permintaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTIFIKASI & INFO LAINNYA */}
      {infoModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }} role="dialog">
           <div className="modal-dialog modal-dialog-centered"><div className="modal-content p-4 text-center">
             <div className="mb-3 d-flex justify-content-center">
                <div className="d-flex justify-content-center align-items-center bg-info bg-opacity-25 rounded-circle" style={{ width: "70px", height: "70px" }}><span style={{ fontSize: "35px" }}>🔔</span></div>
             </div>
             <h4 className="fw-bold text-dark mb-3">Pemberitahuan Baru</h4>
             <p className="text-muted mb-4">{infoModal}</p>
             <button onClick={() => setInfoModal("")} className="btn btn-info text-white fw-bold px-5 rounded-pill shadow-sm">OK, Mengerti</button>
           </div></div>
        </div>
      )}
      
      {successModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered"><div className="modal-content p-5 text-center"><h3 className="text-success fw-bold">Berhasil!</h3><p>{successModal}</p><button onClick={() => setSuccessModal("")} className="btn btn-success fw-bold px-4 rounded-pill">OK</button></div></div>
        </div>
      )}

      {errorModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered"><div className="modal-content p-4 text-center"><h4 className="text-danger fw-bold">Error</h4><p>{errorModal}</p><button onClick={() => setErrorModal("")} className="btn btn-secondary fw-bold px-4 rounded-pill">Tutup</button></div></div>
        </div>
      )}
    </div>
  );
}