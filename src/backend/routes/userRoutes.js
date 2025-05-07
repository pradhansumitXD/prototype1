const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { loginUser, registerUser, updateProfile, forgotPassword, resetPassword } = require('../controllers/userController');
const User = require('../models/user');
const Service = require('../models/serviceModels');
const Listing = require('../models/listing');
const { sendPasswordResetEmail } = require('../utils/emailService'); 

router.post('/login', async (req, res) => {
  try {
    const result = await loginUser(req, res);
    return result;
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalServices, totalListings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Service.countDocuments(),
      Listing.countDocuments({ status: 'approved' }) 
    ]);

    console.log('Current Stats:', { 
      totalUsers, 
      activeUsers, 
      totalServices, 
      totalListings,
      timestamp: new Date().toISOString()
    });

    res.json({
      totalUsers,
      activeUsers,
      totalServices,
      totalListings,
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Error fetching user stats',
      success: false,
      error: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { username, email, mobile, phone, oldPassword, newPassword } = req.body;
    console.log('Received update request');

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (oldPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      user.password = newPassword;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (mobile || phone) user.phone = mobile || phone;

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
      ...userResponse,
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user profile', 
      error: error.message 
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    await forgotPassword(req, res);
  } catch (error) {
    console.error('Forgot password route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    await resetPassword(req, res);
  } catch (error) {
    console.error('Reset password route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
});
module.exports = router;