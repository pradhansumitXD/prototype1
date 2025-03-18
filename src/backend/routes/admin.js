const express = require("express");
const User = require("../models/user");
const router = express.Router();

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

// Get all users (Admin Only)
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Update user details (Admin Only)
 router.put("/users/:id", isAdmin, async (req, res) => {
  try {
    const updates = req.body;
    console.log('Received update data:', updates);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Updated user:', user);
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Delete a user (Admin Only)
router.delete("/users/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Add this route to handle admin listings
router.get('/listings', isAdmin, async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Fetch listings error:', error);
    res.status(500).json({ message: "Error fetching listings" });
  }
});
module.exports = router;
