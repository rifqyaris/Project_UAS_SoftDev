import mongoose from 'mongoose';

const NotifikasiSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  judul:  { type: String, required: true },
  pesan:  { type: String, required: true },
  tipe:   { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  dibaca: { type: Boolean, default: false },
  relasi: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true });

export default mongoose.models.Notifikasi || mongoose.model('Notifikasi', NotifikasiSchema);