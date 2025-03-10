const User = require("../models/user");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Update user details
const updateUser = async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Update user ID:', req.params.id);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('User not found for update');
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Updated user:', updatedUser);
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      message: "Error updating user", 
      error: error.message 
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

console.log("Admin Controller Loaded");
module.exports = { getAllUsers, updateUser, deleteUser };
