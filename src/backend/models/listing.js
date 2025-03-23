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
  makeYear: { type: String, required: true },
  transmission: { type: String, required: true },
  kmsDriven: { type: String, required: true },
  engine: { type: String, required: true },
  ownership: { type: String, required: true },
  price: { type: String, required: true },
  imageUrl: { type: String, required: true },
  adTitle: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Listing', listingSchema);
