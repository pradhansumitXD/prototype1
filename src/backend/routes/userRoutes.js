const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/userController');
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

// Get user by ID route
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

module.exports = router;
