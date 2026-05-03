const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'video', 'both'], default: 'both' },
  activeUsers: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
