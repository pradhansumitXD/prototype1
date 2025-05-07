const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  resetPasswordOtp: String,
  resetPasswordExpires: Date,
  role: {
    type: String,
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String
});

// Add pre-save middleware for username
userSchema.pre('save', async function(next) {
  try {
    // Handle username modifications
    if (this.isModified('username')) {
      this.username = this.username.trim();
    }

    // Handle password modifications
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add middleware for findOneAndUpdate
userSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.username) {
    update.username = update.username.trim();
  }
  next();
});

// Method to check password validity
userSchema.methods.validatePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;