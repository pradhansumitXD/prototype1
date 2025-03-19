const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },  // Changed from 'name' to 'username'
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
