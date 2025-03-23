const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: { 
    type: String, 
    required: true,
    enum: ['Car Wash', 'Car Repair', 'Car Towing', 'Car Inspection', 'Other']
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  location: { 
    type: String, 
    required: true,
    trim: true 
  },
  contactNumber: { 
    type: String, 
    required: true,
    trim: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Service', serviceSchema);