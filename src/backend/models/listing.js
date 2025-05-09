const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: { type: String, required: true },
  model: { type: String, required: true }, 
  carType: { type: String, required: true },
  fuelType: { type: String, required: true },
  makeYear: { type: Number, required: true }, 
  transmission: { type: String, required: true },
  kmsDriven: { type: Number, required: true }, 
  engine: { type: String, required: true },
  ownership: { type: String, required: true },
  price: { type: Number, required: true }, 
  imageUrl: {
    type: [String], 
    required: true
  },
  adTitle: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  },
  interests: [{
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Listing', listingSchema);