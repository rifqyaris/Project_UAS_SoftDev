"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadDonasiPage() {
  const [user, setUser] = useState<any>(null);
  const [namaBarang, setNamaBarang] = useState("");
  const [kategori, setKategori] = useState("Barang Bekas");
  const [deskripsi, setDeskripsi] = useState("");
  const [stok, setStok] = useState("");
  const [kondisi, setKondisi] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/unauthorized");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!namaBarang || !deskripsi || !stok || !kondisi || !fotoBase64) {
      setErrorMsg("Harap lengkapi semua formulir dan unggah foto asli barang!");
      return;
    }

    try {
      const res = await fetch("projectuassoftdev-production.up.railway.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaBarang,
          kategori,
          deskripsi,
          stok,
          kondisi,
          foto: fotoBase64,
          donaturNama: user?.nama || "Donatur Anonim",
          donaturId: user?._id 
        }),
      });

      if (res.ok) {
        setSuccessModal(true);
      } else {
        setErrorMsg("Gagal mengunggah barang donasi ke server.");
      }
    } catch (error) {
      console.error("Error submit donasi:", error);
      setErrorMsg("Terjadi kesalahan koneksi ke server Backend.");
    }
  };

  if (!user) return null;

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-success m-0">🎁 Unggah Barang Donasi</h3>
          <Link href="/dashboard" className="btn btn-outline-secondary fw-bold rounded-pill px-4">Batal & Kembali</Link>
        </div>

        <div className="card shadow-sm border-0 rounded-4 p-4">
          {errorMsg && <div className="alert alert-danger fw-bold">{errorMsg}</div>}
          
          <form onSubmit={handleFormSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold small">Nama Barang</label>
              <input type="text" className="form-control" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} placeholder="Contoh: Kardus Bekas / Sepatu Bekas" />
            </div>
            
            <div className="row mb-3 g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small">Kategori</label>
                <select className="form-select" value={kategori} onChange={e => setKategori(e.target.value)}>
                  <option value="Barang Bekas">Barang Bekas</option>
                  <option value="Sampah Anorganik">Sampah Anorganik</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Kondisi Fisik</label>
                <input type="text" className="form-control" value={kondisi} onChange={e => setKondisi(e.target.value)} placeholder="Contoh: Layak Pakai 80%" />
              </div>
            </div>

            <div className="row mb-3 g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small">Estimasi Stok / Berat</label>
                <input type="text" className="form-control" value={stok} onChange={e => setStok(e.target.value)} placeholder="Contoh: 2 Kg / 5 Pcs" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Unggah Foto (Wajib)</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small">Deskripsi Singkat</label>
              <textarea className="form-control" rows={3} value={deskripsi} onChange={e => setDeskripsi(e.target.value)} placeholder="Jelaskan detail barang yang didonasikan..."></textarea>
            </div>

            <button type="submit" className="btn btn-success w-100 fw-bold py-2 rounded-pill shadow-sm">🚀 Unggah ke Katalog Dasbor</button>
          </form>
        </div>
      </div>

      {successModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-5 text-center">
              <div className="mb-4 d-flex justify-content-center">
                <div className="d-flex justify-content-center align-items-center bg-success bg-opacity-25 rounded-circle" style={{ width: "90px", height: "90px" }}>
                  <span style={{ fontSize: "45px" }}>✅</span>
                </div>
              </div>
              <h3 className="fw-bold text-success mb-3">Berhasil Diunggah!</h3>
              <p className="text-muted mb-4 px-2">Barang Anda sekarang tersedia di katalog Dasbor utama.</p>
              <div>
                <button onClick={() => router.push("/dashboard")} className="btn btn-success fw-bold px-5 py-3 rounded-pill shadow-sm">
                  Lihat Dasbor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}