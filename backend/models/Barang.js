import mongoose from 'mongoose';

const BarangSchema = new mongoose.Schema({
  namaBarang: { type: String, required: true },
  kategori: { type: String, required: true }, // Sampah Anorganik / Barang Bekas
  deskripsi: { type: String, required: true },
  fotoUrl: { type: String, default: '' },
  status: { type: String, default: 'Tersedia' }, // Tersedia, Diproses, Selesai
  donaturId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Barang || mongoose.model('Barang', BarangSchema);