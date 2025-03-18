const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/userController');
const User = require('../models/user');

// Login route
router.post('/login', loginUser);

// Register route
router.post('/register', registerUser);

// Add this route to get user by ID
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