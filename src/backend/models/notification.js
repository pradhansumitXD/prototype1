const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  read: { type: Boolean, default: false },
  sellerInfo: {
    username: String,
    email: String,
    phone: String
  },
  buyerInfo: {
    username: String,
    email: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);