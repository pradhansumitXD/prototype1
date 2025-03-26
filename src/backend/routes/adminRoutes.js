const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Add new route to get all users
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Add route to update user
router.put('/users/:id', auth, admin, async (req, res) => {
  try {
    const { username, role } = req.body;
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, role },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Add route to delete user
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists and delete
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Add login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Please try again.' });
    }

    // Compare password
    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Please try again.' });
    }

    // Send user data
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Existing create-admin route
router.post('/create-admin', auth, admin, async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    
    // Input validation
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new admin user
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: 'admin'
    });

    await user.save();
    res.status(201).json({ 
      message: 'Admin user created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
});

module.exports = router;