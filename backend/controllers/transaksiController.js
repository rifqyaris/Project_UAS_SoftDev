import Transaksi from '../models/Transaksi.js';
import Barang from '../models/Barang.js';

export const ajukanPermintaan = async (req, res) => {
  const { barangId } = req.body;
  try {
    const barang = await Barang.findById(barangId);
    if (!barang || barang.status !== 'Tersedia') {
      return res.status(400).json({ message: 'Barang tidak tersedia' });
    }

    barang.status = 'Diminta';
    await barang.save();

    const transaksi = await Transaksi.create({
      barang: barangId,
      donatur: barang.donatur,
      penerima: req.user._id
    });

    res.status(201).json(transaksi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTracking = async (req, res) => {
  try {
    const transaksi = await Transaksi.find({
      $or: [{ donatur: req.user._id }, { penerima: req.user._id }]
    }).populate('barang').populate('donatur', 'nama').populate('penerima', 'nama');
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};