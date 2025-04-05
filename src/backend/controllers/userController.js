const User = require("../models/user");
const bcrypt = require("bcryptjs");


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Please try again." });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Please try again." });
    }

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone  
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { username, email, phone } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (phone) user.phone = phone.trim();

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;

    console.log('Received registration request:', {
      username: username || 'missing',
      email: email || 'missing',
      phone: phone || 'missing',
      role: role || 'missing',
      hasPassword: !!password
    });

    if (!username || !email || !phone || !password) {
      const missingFields = [];
      if (!username) missingFields.push('username');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone');
      if (!password) missingFields.push('password');
      
      console.log('Validation failed: Missing fields:', missingFields);
      return res.status(400).json({ 
        message: "All fields are required.",
        missingFields 
      });
    }

    if (!User.db.readyState) {
      console.error('Database connection not ready');
      return res.status(500).json({ message: "Database connection error" });
    }

    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(409).json({ message: "Email already in use. Please log in." });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password.trim(), 12);

    console.log('Creating new user object...');
    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      role: role?.trim() || "user",
    });

    console.log('Attempting to save user...');
    const savedUser = await newUser.save();
    console.log('User saved successfully:', {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role
    });

    res.status(201).json({ 
      message: "User registered successfully!",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error("Detailed signup error:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      details: error.errors 
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return res.status(409).json({ message: "Email already exists" });
      }
      return res.status(500).json({ message: "Database error" });
    }

    res.status(500).json({ 
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, role } = req.body;

    // Validate admin user from request
    const adminUser = JSON.parse(req.headers.user);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username.trim();
    if (role && ['user', 'admin'].includes(role)) user.role = role;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  updateUserByAdmin  
};