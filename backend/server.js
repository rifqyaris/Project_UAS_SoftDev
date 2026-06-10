import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io"; 
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ BERHASIL TERHUBUNG KE MONGODB ATLAS CLOUD!"))
  .catch((err) => console.error("❌ GAGAL KONEKSI MONGODB:", err));

const BarangModel = mongoose.model("Barang", new mongoose.Schema({ _id: String }, { strict: false }));
const TransaksiModel = mongoose.model("Transaksi", new mongoose.Schema({ _id: String }, { strict: false }));
const UserModel = mongoose.model("User", new mongoose.Schema({ _id: String }, { strict: false }));
const NotifModel = mongoose.model("Notif", new mongoose.Schema({ _id: Number }, { strict: false }));
const ChatModel = mongoose.model("Chat", new mongoose.Schema({}, { strict: false }));
const MessageModel = mongoose.model("Message", new mongoose.Schema({}, { strict: false }));

const app = express();
const PORT = 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Kalau nanti error lagi, ganti "*" dengan link Vercel lu
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" })); 

const USERS_DB = [
  { _id: "mock_admin_99", nama: "Admin DonasiKu", email: "admin@donasiku.com", password: "admin", role: "Admin" },
  { _id: "user_1", nama: "Budi Donatur", email: "budi@email.com", password: "password123", role: "Donatur" },
  { _id: "user_2", nama: "Siti Penerima", email: "siti@email.com", password: "password123", role: "Penerima" }
];
const BARANG_DB = [];
const CHATS_DB = [];    
const MESSAGES_DB = []; 
const NOTIF_DB = [];
const TRANSACTIONS_DB = [];

async function loadDataDariMongo() {
  try {
    const b = await BarangModel.find().lean(); BARANG_DB.push(...b);
    const t = await TransaksiModel.find().lean(); TRANSACTIONS_DB.push(...t);
    const c = await ChatModel.find().lean(); CHATS_DB.push(...c);
    const m = await MessageModel.find().lean(); MESSAGES_DB.push(...m);
    const n = await NotifModel.find().lean(); NOTIF_DB.push(...n);
    const u = await UserModel.find().lean(); 
    
    if (u.length > 0) {
      USERS_DB.length = 0;
      USERS_DB.push(...u);
    } else {
      for (const user of USERS_DB) {
        await new UserModel(user).save().catch(() => {});
      }
    }
    console.log("✅ SEMUA DATA (AKUN, BARANG, TRANSAKSI, CHAT, NOTIF) SINKRON DENGAN MONGODB CLOUD!");
  } catch (err) { console.error("❌ Gagal sinkronisasi data awal:", err); }
}
loadDataDariMongo();

io.on("connection", (socket) => {
  socket.on("join_user_global", (userId) => socket.join(userId));
  socket.on("join_room", (room) => socket.join(room));

  socket.on("send_message", (data) => {
    MESSAGES_DB.push({ room: data.room, author: data.author, message: data.message, time: data.time });
    new MessageModel({ room: data.room, author: data.author, message: data.message, time: data.time }).save().catch(console.log);

    const roomExist = CHATS_DB.find(c => c.room === data.room);
    if (roomExist) {
      roomExist.lastMessage = data.message;
      roomExist.time = data.time;
      ChatModel.updateOne({ room: data.room }, { lastMessage: data.message, time: data.time }).catch(console.log);

      io.to(roomExist.donaturId).emit("refresh_sidebar");
      io.to(roomExist.peminatId).emit("refresh_sidebar");
      
      const targetId = data.author === roomExist.donaturNama ? roomExist.peminatId : roomExist.donaturId;
      const notifData = { _id: Date.now(), userId: targetId, pesan: `💬 Pesan baru dari ${data.author}: ${data.message}`, dibaca: false };
      
      NOTIF_DB.push(notifData);
      new NotifModel(notifData).save().catch(console.log); 

      io.to(targetId).emit("notification", { message: `Ada pesan baru dari ${data.author}!` });
    }
    socket.to(data.room).emit("receive_message", data);
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // TAMBAHKAN DEBUG INI
  console.log("🔍 Coba login:", email, password);
  console.log("🔍 Jumlah user di DB:", USERS_DB.length);
  
  const user = USERS_DB.find((u) => u.email === email && u.password === password);
  
  if (!user) {
    console.log("❌ User tidak ditemukan!");
    return res.status(400).json({ message: "Salah." });
  }
  
  res.json({ _id: user._id, nama: user.nama, role: user.role, token: "mock_jwt_token" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // TAMBAHKAN DEBUG INI
  console.log("🔍 Coba login:", email, password);
  console.log("🔍 Jumlah user di DB:", USERS_DB.length);
  
  const user = USERS_DB.find((u) => u.email === email && u.password === password);
  
  if (!user) {
    console.log("❌ User tidak ditemukan!");
    return res.status(400).json({ message: "Salah." });
  }
  
  res.json({ _id: user._id, nama: user.nama, role: user.role, token: "mock_jwt_token" });
});

app.get("/api/admin/stats", (req, res) => {
  const tersalurkan = BARANG_DB.filter(b => b.status === "Tersalurkan").length;
  const tersedia = BARANG_DB.length - tersalurkan;
  res.json({ totalDonasi: tersedia, totalPengguna: USERS_DB.length, barangTersalurkan: tersalurkan, users: USERS_DB });
});

app.get("/api/admin/transaksi", (req, res) => res.json(TRANSACTIONS_DB));

app.get("/api/barang", (req, res) => res.json(BARANG_DB));

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // TAMBAHKAN DEBUG INI
  console.log("🔍 Coba login:", email, password);
  console.log("🔍 Jumlah user di DB:", USERS_DB.length);
  
  const user = USERS_DB.find((u) => u.email === email && u.password === password);
  
  if (!user) {
    console.log("❌ User tidak ditemukan!");
    return res.status(400).json({ message: "Salah." });
  }
  
  res.json({ _id: user._id, nama: user.nama, role: user.role, token: "mock_jwt_token" });
});

app.put("/api/barang/:id/selesai", (req, res) => {
  const b = BARANG_DB.find(x => x._id === req.params.id);
  if (b) {
    b.status = "Tersalurkan";
    BarangModel.updateOne({ _id: req.params.id }, { status: "Tersalurkan" }).catch(console.log);
    res.json({ message: "Selesai" });
  } else res.status(404).json({ message: "Barang tidak ditemukan" });
});

app.delete("/api/barang/:id", (req, res) => {
  const index = BARANG_DB.findIndex(b => b._id === req.params.id);
  if (index !== -1) {
    BARANG_DB.splice(index, 1);
    BarangModel.deleteOne({ _id: req.params.id }).catch(console.log);
    res.json({ message: "Barang berhasil dihapus" });
  } else res.status(404).json({ message: "Barang tidak ditemukan" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // TAMBAHKAN DEBUG INI
  console.log("🔍 Coba login:", email, password);
  console.log("🔍 Jumlah user di DB:", USERS_DB.length);
  
  const user = USERS_DB.find((u) => u.email === email && u.password === password);
  
  if (!user) {
    console.log("❌ User tidak ditemukan!");
    return res.status(400).json({ message: "Salah." });
  }
  
  res.json({ _id: user._id, nama: user.nama, role: user.role, token: "mock_jwt_token" });
});

app.get("/api/chat/rooms/:userId", (req, res) => res.json(CHATS_DB.filter(c => c.donaturId === req.params.userId || c.peminatId === req.params.userId)));
app.get("/api/chat/messages/:room", (req, res) => res.json(MESSAGES_DB.filter(m => m.room === req.params.room)));

app.get("/api/notif/:userId", (req, res) => res.json(NOTIF_DB.filter(n => n.userId === req.params.userId)));

app.put("/api/notif/baca/:userId", (req, res) => {
  NOTIF_DB.filter(n => n.userId === req.params.userId).forEach(n => n.dibaca = true);
  NotifModel.updateMany({ userId: req.params.userId }, { dibaca: true }).catch(console.log);
  res.json({ message: "Dibaca" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // TAMBAHKAN DEBUG INI
  console.log("🔍 Coba login:", email, password);
  console.log("🔍 Jumlah user di DB:", USERS_DB.length);
  
  const user = USERS_DB.find((u) => u.email === email && u.password === password);
  
  if (!user) {
    console.log("❌ User tidak ditemukan!");
    return res.status(400).json({ message: "Salah." });
  }
  
  res.json({ _id: user._id, nama: user.nama, role: user.role, token: "mock_jwt_token" });
});

app.put("/api/transaksi/update", (req, res) => {
  const { txId, status, tracking, peminatId } = req.body;
  const tx = TRANSACTIONS_DB.find(t => t._id === txId);
  if (tx) {
    tx.status = status; tx.tracking = tracking;
    TransaksiModel.updateOne({ _id: txId }, { status, tracking }).catch(console.log); 

    const notif = { _id: Date.now(), userId: peminatId, pesan: `📍 Update ${tx.barangNama}: ${status}`, dibaca: false };
    NOTIF_DB.push(notif);
    new NotifModel(notif).save().catch(console.log); 

    io.to(peminatId).emit("notification", { message: `Tracking barang diupdate!` });
    io.to(peminatId).emit("refresh_notif");
    res.json({ message: "Update sukses" });
  } else res.status(404).json({ message: "Gagal" });
});

app.get("/api/transaksi/:userId", (req, res) => res.json(TRANSACTIONS_DB.filter(t => t.peminatId === req.params.userId || t.donaturId === req.params.userId)));

app.put("/api/transaksi/request-cancel", (req, res) => {
  const { txId, alasan, peminatId, donaturId } = req.body;
  const tx = TRANSACTIONS_DB.find(t => t._id === txId);
  if (tx) {
    tx.status = "Menunggu Konfirmasi Batal";
    tx.tracking = `Penerima meminta pembatalan: ${alasan}`;
    TransaksiModel.updateOne({ _id: txId }, { status: tx.status, tracking: tx.tracking }).catch(console.log);
    
    const notif = { _id: Date.now(), userId: donaturId, pesan: `⚠️ Penerima meminta pembatalan untuk "${tx.barangNama}": ${alasan}`, dibaca: false };
    NOTIF_DB.push(notif);
    new NotifModel(notif).save().catch(console.log);

    io.to(donaturId).emit("notification", { message: `Ada permintaan pembatalan dari Penerima!` });
    io.to(donaturId).emit("refresh_notif");
    
    res.json({ message: "Permintaan pembatalan dikirim" });
  } else res.status(404).json({ message: "Gagal" });
});

app.put("/api/transaksi/confirm-cancel", (req, res) => {
  const { txId, disetujui, donaturId, peminatId } = req.body;
  const tx = TRANSACTIONS_DB.find(t => t._id === txId);
  if (tx) {
    if (disetujui) {
      tx.status = "Dibatalkan";
      tx.tracking = "Transaksi dibatalkan (Disetujui Donatur)";
      const notif = { _id: Date.now(), userId: peminatId, pesan: `❌ Pembatalan "${tx.barangNama}" disetujui Donatur.`, dibaca: false };
      NOTIF_DB.push(notif);
      new NotifModel(notif).save().catch(console.log);
    } else {
      tx.status = "Disetujui";
      tx.tracking = "Permintaan pembatalan ditolak. Transaksi dilanjutkan.";
      const notif = { _id: Date.now(), userId: peminatId, pesan: `✅ Pembatalan "${tx.barangNama}" ditolak Donatur. Transaksi dilanjutkan.`, dibaca: false };
      NOTIF_DB.push(notif);
      new NotifModel(notif).save().catch(console.log);
    }
    TransaksiModel.updateOne({ _id: txId }, { status: tx.status, tracking: tx.tracking }).catch(console.log);
    
    io.to(peminatId).emit("notification", { message: `Status pembatalan diupdate oleh Donatur!` });
    io.to(peminatId).emit("refresh_notif");
    res.json({ message: "Konfirmasi sukses" });
  } else res.status(404).json({ message: "Gagal" });
});

server.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`🚀 SERVER TRANSAKSI & ADMIN JALAN DI PORT ${PORT}`);
  console.log(`==========================================`);
});