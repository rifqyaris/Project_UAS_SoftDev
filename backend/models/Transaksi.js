import mongoose from 'mongoose';

const transaksiSchema = new mongoose.Schema({
  barang: { type: mongoose.Schema.Types.ObjectId, ref: 'Barang', required: true },
  donatur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  penerima: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dropPoint: { type: String, default: 'Drop Point Pusat Utama Gedung UNTAR' },
  statusTracking: { 
    type: String, 
    enum: ['Diajukan', 'Diterima di Drop Point', 'Dalam Pengiriman', 'Selesai'], 
    default: 'Diajukan' 
  }
}, { timestamps: true });

const Transaksi = mongoose.model('Transaksi', transaksiSchema);
export default Transaksi;