import mongoose from 'mongoose';

const DonasiSchema = new mongoose.Schema({
  donatur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  namaBarang: { type: String, required: true, trim: true },
  kategori: {
    type: String,
    required: true,
    enum: ['Elektronik', 'Pakaian', 'Buku', 'Plastik', 'Logam', 'Kaca', 'Furnitur', 'Mainan', 'Lainnya'],
  },
  kondisi: {
    type: String,
    required: true,
    enum: ['Baru', 'Layak Pakai', 'Perlu Perbaikan'],
  },
  deskripsi:  { type: String, required: true },
  gambar:     { type: String, default: '' },
  status: {
    type: String,
    enum: ['Tersedia', 'Diproses', 'Disetujui', 'Ditolak', 'Dikirim', 'Diambil', 'Selesai'],
    default: 'Tersedia',
  },
  penerima:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dropPoint: { type: String, default: '' },
  catatan:   { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Donasi || mongoose.model('Donasi', DonasiSchema);