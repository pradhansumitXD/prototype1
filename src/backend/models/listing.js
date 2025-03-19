const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adTitle: { type: String, required: true },  // Added adTitle field
  brand: { type: String, required: true },
  model: { type: String, required: true },
  carType: { type: String, required: true },
  transmission: { type: String, required: true },
  fuelType: { type: String, required: true },
  price: { type: Number, required: true },
  year: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'approved', 'rejected'] 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
