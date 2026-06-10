"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io } from "socket.io-client";
const socket = io("https://projectuassoftdev-production.up.railway.app");

const API = "https://projectuassoftdev-production.up.railway.app";

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
            <li className="nav-item"><Link className="nav-link active" href="/dashboard">🏠 Dashboard</Link></li>
            <li className="nav-item"><span className="nav-link" style={{ cursor: "pointer" }} onClick={() => onRequireLogin("/donasi/upload")}>🎁 Donasi</span></li>
            <li className="nav-item"><span className="nav-link" style={{ cursor: "pointer" }} onClick={() => onRequireLogin("/donasi/tracking")}>📍 Tracking</span></li>
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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [barangList, setBarangList] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [transaksiList, setTransaksiList] = useState<any[]>([]); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [requestTarget, setRequestTarget] = useState<any>(null);
  const [alasanRequest, setAlasanRequest] = useState("");
  const [selectedDropPoint, setSelectedDropPoint] = useState("Gedung Utama Universitas Tarumanagara");
  
  const [successModal, setSuccessModal] = useState(""); 
  const [errorModal, setErrorModal] = useState("");
  const [infoModal, setInfoModal] = useState(""); 
  const [confirmAction, setConfirmAction] = useState<{ message: React.ReactNode, onConfirm: () => void } | null>(null);

  const router = useRouter();

  const loadData = useCallback(async (token: string | null) => {
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const barangRes = await fetch(`${API}/api/barang`, { headers });
      if (barangRes.ok) setBarangList(await barangRes.json());
      if (token) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser._id) {
           const notifRes = await fetch(`${API}/api/notif/${storedUser._id}`, { headers });
           if (notifRes.ok) setNotifs(await notifRes.json());
           
           const txRes = await fetch(`${API}/api/transaksi/${storedUser._id}`, { headers });
           if (txRes.ok) setTransaksiList(await txRes.json());
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      loadData(token);
    } else {
      setUser(null);
      loadData(null); 
    }
  }, [loadData]);
  
  useEffect(() => {
    if (!user) return;
    socket.emit("join_user_global", user._id); 
    socket.on("notification", (data: any) => {
      setInfoModal(data.message); 
      const token = localStorage.getItem("token");
      if(token) loadData(token);
    });
    socket.on("refresh_notif", () => {
      const token = localStorage.getItem("token");
      if(token) loadData(token);
    });
    return () => { 
      socket.off("notification"); 
      socket.off("refresh_notif"); 
    };
  }, [user, loadData]);

  const requireLogin = (actionOrPath: (() => void) | string) => {
    if (!user) {
      router.push("/unauthorized");
    } else {
      if (typeof actionOrPath === "string") router.push(actionOrPath);
      else actionOrPath();
    }
  };

  const handleNotifAction = (pesan: string) => {
    if (pesan.includes("💬") || pesan.toLowerCase().includes("pesan")) {
      requireLogin("/chat");
    } else if (pesan.includes("📍") || pesan.toLowerCase().includes("status")) {
      requireLogin("/donasi/tracking");
    } else if (pesan.includes("📦") || pesan.toLowerCase().includes("formulir")) {
      const parts = pesan.split("untuk:");
      if (parts.length > 1) {
        const namaBarangDicari = parts[1].trim().toLowerCase();
        const targetItem = barangList.find(b => b.namaBarang.toLowerCase() === namaBarangDicari);
        if (targetItem) {
          setSelectedItem(targetItem);
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/transaksi/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          barangId: requestTarget?._id, 
          barangNama: requestTarget?.namaBarang,
          donaturId: requestTarget?.donatur?._id || "user_1",
          peminatId: user?._id || "user_2",
          peminatNama: user?.nama || "Penerima",
          alasan: alasanRequest, 
          metodeAmbil: "Ambil di Drop Point", 
          dropPoint: selectedDropPoint 
        }),
      });
      if (res.ok) {
        setSuccessModal(`Permintaan untuk "${requestTarget?.namaBarang}" berhasil diajukan! Cek notifikasi dan Tracking.`);
        setRequestTarget(null);
        setAlasanRequest("");
        loadData(token!);
      } else {
        setErrorModal("Gagal memproses permintaan dari server.");
      }
    } catch {
      setErrorModal("Terjadi kesalahan jaringan saat memproses permintaan.");
    }
  };

  const handleMarkAsSold = (id: string) => {
    setConfirmAction({
      message: (
        <>
          <h5 className="text-dark fw-bold mb-3">Tandai Tersalurkan</h5>
          <p className="mb-0">Apakah Anda yakin barang ini sudah disalurkan/diambil? Tindakan ini tidak dapat dibatalkan.</p>
        </>
      ),
      onConfirm: async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`${API}/api/barang/${id}/selesai`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
          if (res.ok) {
            setConfirmAction(null);
            setSuccessModal("Barang berhasil ditandai sebagai 'Telah Tersalurkan'!");
            setSelectedItem(null);
            loadData(token!);
          } else {
            setConfirmAction(null);
            setErrorModal("Gagal memperbarui status barang.");
          }
        } catch { 
          setConfirmAction(null); 
          setErrorModal("Kesalahan jaringan."); 
        }
      }
    });
  };

  const handleDeleteBarang = (id: string) => {
    setConfirmAction({
      message: (
        <>
          <h5 className="text-danger fw-bold mb-3">⚠️ Peringatan Admin</h5>
          <p className="mb-0">Apakah Anda yakin ingin menghapus postingan barang ini secara permanen?</p>
        </>
      ),
      onConfirm: async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`${API}/api/barang/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            setConfirmAction(null);
            setSuccessModal("Postingan berhasil dihapus oleh Admin!");
            setSelectedItem(null);
            loadData(token!);
          } else {
            setConfirmAction(null);
            setErrorModal("Gagal menghapus barang.");
          }
        } catch {
          setConfirmAction(null);
          setErrorModal("Terjadi kesalahan jaringan saat menghapus.");
        }
      }
    });
  };

  const handleKonfirmasiPermintaan = async (txId: string, statusBaru: string, namaBarang: string, peminatId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/transaksi/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          txId: txId, 
          status: statusBaru, 
          tracking: statusBaru === "Disetujui" ? "Barang sedang disiapkan oleh Donatur" : "Permintaan ditolak oleh Donatur",
          peminatId: peminatId
        }),
      });
      if (res.ok) {
        setSuccessModal(`Permintaan untuk "${namaBarang}" berhasil ${statusBaru}!`);
        loadData(token!);
      } else {
        setErrorModal("Gagal mengupdate status transaksi.");
      }
    } catch {
      setErrorModal("Terjadi kesalahan jaringan.");
    }
  };

  const handleLogout = () => { localStorage.clear(); setUser(null); router.push("/"); };

  const filteredBarang = barangList.filter((item) => {
    const matchSearch = item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) || (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTab = activeTab === "Semua" ? true : item.kategori === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="bg-light min-vh-100">
      <Navbar user={user} notifs={notifs} onLogout={handleLogout} onRequireLogin={requireLogin} onNotifAction={handleNotifAction} />

      <div className="container my-5">
        <div className="bg-white p-4 rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center border-start border-success border-5">
          <div>
            <h3 className="fw-bold text-dark mb-1">Dasbor Penyaluran Barang</h3>
            <p className="text-muted m-0 small">Platform Klasterisasi Sampah Anorganik & Sirkulasi Barang Layak Pakai</p>
          </div>
          <button onClick={() => requireLogin("/donasi/upload")} className="btn btn-success fw-bold px-4 shadow-sm">+ Buat Donasi Baru</button>
        </div>

        <div className="row mb-4 align-items-center g-3">
          <div className="col-md-7">
            <div className="btn-group shadow-sm bg-white p-1 rounded-3">
              {["Semua", "Sampah Anorganik", "Barang Bekas"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`btn px-4 fw-semibold rounded-3 border-0 btn-sm ${activeTab === tab ? "btn-success text-white shadow-sm" : "btn-light text-secondary bg-transparent"}`}>{tab}</button>
              ))}
            </div>
          </div>
          <div className="col-md-5">
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white border-end-0 text-muted ps-3">🔍</span>
              <input type="text" className="form-control border-start-0 ps-2 py-2 rounded-end-3" placeholder="Cari kata kunci barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>

        <h5 className="fw-bold text-dark mb-3">Daftar Katalog Barang Tersedia ({filteredBarang.length})</h5>

        {filteredBarang.length === 0 ? (
          <div className="card text-center p-5 border-0 text-muted shadow-sm rounded-4">
            <h5>Belum ada barang di kategori ini.</h5>
            <p className="small mb-0">Klik tombol "+ Buat Donasi Baru" untuk menambahkan barang.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredBarang.map((item: any) => {
              const isMyItem = user && item.donatur?.nama === user.nama;
              const isSold = item.status === "Tersalurkan";
              return (
                <div className="col-md-3" key={item._id}>
                  <div className={`card h-100 shadow-sm border-0 rounded-4 overflow-hidden ${isSold ? 'bg-light' : ''}`}>
                    <div style={{ cursor: "pointer" }} onClick={() => setSelectedItem(item)}>
                      <img src={item.foto} alt={item.namaBarang} className="card-img-top w-100 object-fit-cover" style={{ height: "180px", filter: isSold ? "grayscale(100%)" : "none" }} />
                    </div>
                    <div className="card-body d-flex flex-column p-3">
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        <span className={`badge px-2 py-1 ${item.kategori === "Sampah Anorganik" ? "bg-info text-dark" : "bg-warning text-dark"}`}>{item.kategori}</span>
                        {isMyItem && <span className="badge bg-primary px-2 py-1">👤 Barang Anda</span>}
                        {isSold && <span className="badge bg-secondary px-2 py-1">🛑 Telah Diambil</span>}
                      </div>
                      <h6 className="fw-bold text-dark text-truncate mb-1" style={{ cursor: "pointer", textDecoration: isSold ? "line-through" : "none" }} onClick={() => setSelectedItem(item)}>{item.namaBarang}</h6>
                      <p className="text-muted small mb-3 flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.deskripsi}</p>
                      
                      <div className="d-flex flex-column gap-2 mt-auto border-top pt-2">
                        <div className="d-flex gap-2">
                          <button onClick={() => setSelectedItem(item)} className="btn btn-light border btn-sm px-3 fw-semibold text-secondary">Detail</button>
                          {isSold ? (
                            <button disabled className="btn btn-secondary btn-sm flex-grow-1 fw-bold opacity-50">Selesai</button>
                          ) : isMyItem ? (
                            <button onClick={() => setSelectedItem(item)} className="btn btn-outline-primary btn-sm flex-grow-1 fw-bold">Kelola</button>
                          ) : (
                            <button onClick={() => requireLogin(() => setRequestTarget(item))} className="btn btn-success btn-sm flex-grow-1 fw-bold">Minta Barang Ini</button>
                          )}
                        </div>
                        {user?.role === "Admin" && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteBarang(item._id); }} className="btn btn-outline-danger btn-sm w-100 fw-bold border-0 shadow-sm" style={{ backgroundColor: "#fee2e2" }}>🗑️ Hapus Postingan (Admin)</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DETAIL BARANG */}
      {selectedItem && (() => {
        const isMyItem = user && selectedItem.donatur?.nama === user.nama;
        const isSold = selectedItem.status === "Tersalurkan";
        return (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="row g-0">
                  <div className="col-md-5 bg-dark d-flex align-items-center justify-content-center">
                    <img src={selectedItem.foto} alt="Detail" className="w-100 h-100 object-fit-cover" style={{ minHeight: "350px", maxHeight: "450px", filter: isSold ? "grayscale(100%)" : "none" }} />
                  </div>
                  <div className="col-md-7 p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge px-3 py-2 ${selectedItem.kategori === "Sampah Anorganik" ? "bg-info text-dark" : "bg-warning text-dark"}`}>{selectedItem.kategori}</span>
                      <button onClick={() => setSelectedItem(null)} className="btn-close"></button>
                    </div>
                    <h4 className="fw-bold text-dark mb-3">{selectedItem.namaBarang} {isSold && <span className="badge bg-secondary ms-2 fs-6 align-middle">🛑 Selesai</span>}</h4>
                    <div className="table-responsive small mb-3 bg-light p-3 rounded-3 border">
                      <table className="table table-sm table-borderless m-0">
                        <tbody>
                          <tr><td className="text-muted w-35 p-0 pb-1">📦 Donatur</td><td className="fw-bold p-0 pb-1">: {selectedItem.donatur?.nama} {isMyItem && "(Anda)"}</td></tr>
                          <tr><td className="text-muted p-0 pb-1">🛠 Kondisi</td><td className="fw-bold p-0 pb-1">: {selectedItem.kondisi || "Baik"}</td></tr>
                          <tr><td className="text-muted p-0 pb-1">📅 Diunggah</td><td className="fw-bold p-0 pb-1">: {selectedItem.tanggalUpload || "Baru Saja"}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="fw-semibold text-dark mb-1 small">Deskripsi:</p>
                    <p className="text-muted small flex-grow-1 border p-2 rounded bg-white overflow-auto" style={{ maxHeight: "120px" }}>{selectedItem.deskripsi}</p>
                    <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                      <button onClick={() => setSelectedItem(null)} className="btn btn-sm btn-secondary px-3 fw-bold">Tutup</button>
                      
                      {isSold ? (
                        <span className="text-danger fw-bold align-self-center mx-2 small">Tidak tersedia.</span>
                      ) : isMyItem ? (
                        
                        <div className="d-flex flex-column gap-2 w-100">
                          <div className="d-flex justify-content-end gap-2">
                            <button onClick={() => requireLogin("/chat")} className="btn btn-sm btn-outline-success px-3 fw-bold">💬 Cek Pesan</button>
                            <button onClick={() => handleMarkAsSold(selectedItem._id)} className="btn btn-sm btn-danger px-4 fw-bold">✓ Tandai Tersalurkan</button>
                          </div>
                          
                          {transaksiList.filter(t => t.barangId === selectedItem._id && t.status === "Menunggu Konfirmasi").length > 0 && (
                            <div className="mt-3 p-3 bg-light border rounded text-start">
                              <h6 className="fw-bold text-success mb-2">📋 Permintaan Masuk:</h6>
                              {transaksiList.filter(t => t.barangId === selectedItem._id && t.status === "Menunggu Konfirmasi").map(tx => (
                                <div key={tx._id} className="d-flex justify-content-between align-items-center bg-white p-2 border rounded mb-2 shadow-sm">
                                  <div>
                                    <span className="fw-bold small">{tx.peminatNama}</span> <br/>
                                    <span className="text-muted" style={{fontSize: "11px"}}>Alasan: {tx.alasan}</span>
                                  </div>
                                  <div className="d-flex gap-1">
                                    <button onClick={() => handleKonfirmasiPermintaan(tx._id, "Disetujui", tx.barangNama, tx.peminatId)} className="btn btn-sm btn-success py-0 px-2 small fw-bold">Setujui</button>
                                    <button onClick={() => handleKonfirmasiPermintaan(tx._id, "Ditolak", tx.barangNama, tx.peminatId)} className="btn btn-sm btn-outline-danger py-0 px-2 small fw-bold">Tolak</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      ) : (
                        <>
                          {user?.role === "Admin" && (
                            <button onClick={() => handleDeleteBarang(selectedItem._id)} className="btn btn-sm btn-danger px-4 fw-bold me-auto">🗑️ Hapus (Admin)</button>
                          )}
                          <button onClick={() => requireLogin(async () => {
                              if (!user || !selectedItem) return;
                              const generatedRoom = `${selectedItem._id}_${user._id}`;
                              try {
                                await fetch(`${API}/api/chat/init`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room: generatedRoom, barangId: selectedItem._id, barangNama: selectedItem.namaBarang, donaturId: selectedItem.donatur?._id || "user_1", donaturNama: selectedItem.donatur?.nama || "Donatur", peminatId: user._id, peminatNama: user.nama }) });
                                setSelectedItem(null);
                                router.push(`/chat?room=${generatedRoom}&target=${selectedItem.donatur?.nama || 'Donatur'}&barang=${selectedItem.namaBarang}`);
                              } catch (err) { console.error(err); }
                            })} className="btn btn-sm btn-outline-success px-3 fw-bold">💬 Chat Donatur</button>
                          <button onClick={() => requireLogin(() => { setRequestTarget(selectedItem); setSelectedItem(null); })} className="btn btn-sm btn-success px-4 fw-bold">Minta Barang Ini</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL REQUEST BARANG */}
      {requestTarget && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h5 className="fw-bold text-success m-0">Formulir Permintaan Barang</h5>
                <button onClick={() => setRequestTarget(null)} className="btn-close"></button>
              </div>
              <p className="small text-muted mb-3">Mengajukan permintaan untuk: <strong className="text-dark">{requestTarget.namaBarang}</strong></p>
              <form onSubmit={handleConfirmRequest}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Alasan Permintaan</label>
                  <textarea className="form-control form-control-sm" rows={3} placeholder="Jelaskan tujuan Anda..." value={alasanRequest} onChange={(e) => setAlasanRequest(e.target.value)} required />
                </div>
                
                <div className="mb-3 bg-light p-3 rounded border">
                  <label className="form-label text-success mb-1 small fw-bold">Lokasi Drop Point (Wajib Ambil Sendiri):</label>
                  <select className="form-select form-select-sm" value={selectedDropPoint} onChange={(e) => setSelectedDropPoint(e.target.value)}>
                    <option value="Gedung Utama Universitas Tarumanagara">Gedung Utama Untar</option>
                    <option value="Drop Point Aula Lantai 2">Aula Lantai 2</option>
                  </select>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                  <button type="button" onClick={() => setRequestTarget(null)} className="btn btn-sm btn-outline-secondary px-3 fw-bold">Batal</button>
                  <button type="submit" className="btn btn-sm btn-success px-4 fw-bold">Kirim Permintaan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFO & SUCCESS & CONFIRM */}
      {infoModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-4 text-center">
              <div className="mb-3 d-flex justify-content-center">
                <div className="d-flex justify-content-center align-items-center bg-info bg-opacity-25 rounded-circle" style={{ width: "70px", height: "70px" }}>
                  <span style={{ fontSize: "35px" }}>🔔</span>
                </div>
              </div>
              <h4 className="fw-bold text-dark mb-3">Pemberitahuan Baru</h4>
              <p className="text-muted mb-4">{infoModal}</p>
              <button onClick={() => setInfoModal("")} className="btn btn-info text-white fw-bold px-5 rounded-pill shadow-sm">OK, Mengerti</button>
            </div>
          </div>
        </div>
      )}
      
      {confirmAction && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-4 text-center">
              <div className="mb-4">
                {confirmAction.message}
              </div>
              <div className="d-flex justify-content-center gap-3">
                <button onClick={() => setConfirmAction(null)} className="btn btn-outline-secondary px-4 fw-bold rounded-pill">Batal</button>
                <button onClick={confirmAction.onConfirm} className="btn btn-danger px-4 fw-bold rounded-pill shadow-sm">Ya, Lanjutkan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered"><div className="modal-content p-4 text-center"><h4 className="text-danger">Error</h4><p>{errorModal}</p><button onClick={() => setErrorModal("")} className="btn btn-secondary">Tutup</button></div></div>
        </div>
      )}
      
      {successModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered"><div className="modal-content p-5 text-center"><h3 className="text-success fw-bold">Berhasil!</h3><p>{successModal}</p><button onClick={() => setSuccessModal("")} className="btn btn-success px-4 rounded-pill fw-bold">OK</button></div></div>
        </div>
      )}
    </div>
  );
}