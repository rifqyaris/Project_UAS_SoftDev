import Barang from '../models/Barang.js';

export const uploadBarang = async (req, res) => {
  const { namaBarang, kategori, deskripsi } = req.body;
  try {
    const barang = await Barang.create({
      donatur: req.user._id,
      namaBarang,
      kategori,
      deskripsi
    });
    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.find({ status: 'Tersedia' }).populate('donatur', 'nama');
    res.json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};