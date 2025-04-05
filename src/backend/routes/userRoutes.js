const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { loginUser, registerUser, updateProfile } = require('../controllers/userController');
const User = require('../models/user');
const Service = require('../models/serviceModels');
const Listing = require('../models/listing'); 

// Auth routes with error handling
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

// Add this PUT route for updating user profile
router.put('/:id', async (req, res) => {
  try {
    const { username, phone, oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If password change is requested
    if (oldPassword && newPassword) {
      try {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
        user.password = await bcrypt.hash(newPassword, 12);
      } catch (error) {
        console.error('Password update error:', error);
        return res.status(400).json({ message: 'Error updating password' });
      }
    }

    // Update other fields
    if (username) user.username = username;
    if (phone) user.phone = phone;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
});

module.exports = router;