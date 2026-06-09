import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  pengirimId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  penerimaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pesan: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);