const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const router = express.Router();
const { sendVerificationEmail, sendConfirmationEmail, sendPasswordResetEmail } = require('../../utils/emailService');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const tempUser = {
      username,
      email: email.toLowerCase(),
      password,
      phone,
      verificationToken
    };

    req.app.locals.tempUsers = req.app.locals.tempUsers || {};
    req.app.locals.tempUsers[verificationToken] = {
      ...tempUser,
      expires: Date.now() + 3600000 // 1 hour expiry
    };

    // Remove the email sending from here
    res.status(200).json({
      message: 'Please check your email to verify your account',
      email: email.toLowerCase()
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.message || 'Error during registration'
    });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Verification attempt with token:', token);

    const tempUsers = req.app.locals.tempUsers || {};
    const tempUser = tempUsers[token];

    console.log('Found temp user:', tempUser);

    if (!tempUser || tempUser.expires < Date.now()) {
      console.log('Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(tempUser.password, salt);

    const user = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: hashedPassword,
      phone: tempUser.phone,
      role: 'user',
      isVerified: true
    });

    await user.save();
    console.log('User created successfully:', user.email);

    await sendConfirmationEmail('pradhansumit957@gmail.com', {
      username: tempUser.username,
      email: tempUser.email,
      phone: tempUser.phone,
      verificationTime: new Date().toLocaleString()
    });

    delete req.app.locals.tempUsers[token];

    // Instead of redirect, send JSON response
    res.json({ 
      success: true,
      message: 'Email verified successfully. You can now login.',
      verified: true,
      email: user.email
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during verification',
      error: error.message 
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Received forgot password request for:', email);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in temporary storage
    req.app.locals.resetTokens = req.app.locals.resetTokens || {};
    req.app.locals.resetTokens[email.toLowerCase()] = {
      otp,
      expires: Date.now() + 600000 // 10 minutes expiry
    };

    // Send OTP to admin email
    await sendPasswordResetEmail(
      'pradhansumit957@gmail.com', 
      otp,
      email.toLowerCase()
    );

    res.json({ 
      success: true,
      message: 'Password reset code sent to admin. Please contact admin for the code.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending reset code. Please try again.' 
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('Reset password attempt for:', email);

    const resetTokens = req.app.locals.resetTokens || {};
    const resetData = resetTokens[email.toLowerCase()];

    if (!resetData || resetData.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    if (resetData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Clean up reset token
    delete req.app.locals.resetTokens[email.toLowerCase()];

    console.log('Password reset successful for user:', email);
    res.json({ 
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, verificationToken } = req.body;
    console.log('Verification attempt:', { email, verificationToken });

    const tempUsers = req.app.locals.tempUsers || {};
    const tempUser = Object.values(tempUsers).find(user => 
      user.email === email.toLowerCase() && 
      user.verificationToken === verificationToken
    );

    if (!tempUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired verification code' 
      });
    }

    // Log the temp user data for debugging
    console.log('Found temp user data:', {
      email: tempUser.email,
      passwordLength: tempUser.password.length
    });

    // Create new user with isVerified set to true
    const user = new User({
      username: tempUser.username,
      email: tempUser.email.toLowerCase(),
      password: tempUser.password, // Let the User model handle password hashing
      phone: tempUser.phone,
      role: 'user',
      isVerified: true
    });

    await user.save();
    console.log('User created and verified:', user.email);

    // Clean up temp user data
    delete req.app.locals.tempUsers[verificationToken];

    res.json({ 
      success: true,
      message: 'Email verified successfully. You can now login.' 
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during verification' 
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('Reset password attempt:', { email, otp });

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    console.log('Password reset successful for user:', email);
    res.json({ 
      message: 'Password reset successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const adminEmail = 'pradhansumit957@gmail.com';
    
    // Find the temporary user data
    const tempUsers = req.app.locals.tempUsers || {};
    const tempUser = Object.values(tempUsers).find(user => user.email === email.toLowerCase());

    if (!tempUser) {
      return res.status(404).json({ 
        success: false,
        message: 'No pending registration found for this email' 
      });
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    tempUser.verificationToken = verificationCode;
    tempUser.expires = Date.now() + 600000; // 10 minutes expiry

    try {
      // Send verification email to admin only
      await sendVerificationEmail(adminEmail, verificationCode, adminEmail, {
        username: tempUser.username,
        email: tempUser.email,
        phone: tempUser.phone
      });

      res.json({ 
        success: true,
        message: 'Verification code sent to admin. Please contact admin for the code.' 
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ 
        success: false,
        message: 'Failed to send verification code to admin' 
      });
    }
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing verification request' 
    });
  }
});

module.exports = router;

