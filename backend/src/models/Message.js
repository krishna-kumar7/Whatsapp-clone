const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  wa_id: { type: String, required: true }, // WhatsApp user ID
  name: { type: String },
  number: { type: String },
  message: { type: String },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  timestamp: { type: Date, default: Date.now },
  meta_msg_id: { type: String },
  // Add any other relevant fields from the payloads
  raw: { type: Object }, // Store the raw payload for reference
});

module.exports = mongoose.model('Message', MessageSchema, 'processed_messages');
