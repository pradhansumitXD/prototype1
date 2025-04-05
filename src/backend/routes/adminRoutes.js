const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// Middleware to check admin role
const isAdmin = async (req, res, next) => {
  try {
    const user = JSON.parse(req.headers['user']);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all users 
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Update user 
router.put("/users/:id", isAdmin, async (req, res) => {
  try {
    const { username, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Delete user 
router.delete("/users/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

module.exports = router;