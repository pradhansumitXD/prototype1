const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Register User (Signup)
const registerUser = async (req, res) => {
  const { username, email, phone, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use. Please log in." });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "user", // default to "user" if role is not provided
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: "Email already in use. Please log in." });
    }
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Register User (Signup)
const registerUser = async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;

    // Validate input
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use. Please log in." });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // Create new user
    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: role?.trim() || "user", // default to "user" if role is not provided
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: "Email already in use. Please log in." });
    }
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials. Please try again." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials. Please try again." });
    }

    // Send user details (excluding password)
    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { registerUser, loginUser };

      return res.status(400).json({ message: "User not found. Please sign up first." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials. Please try again." });
    }

    // Send user details (excluding password)
    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { registerUser, loginUser };
