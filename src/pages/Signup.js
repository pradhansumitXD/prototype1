import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signup.css'; 

function Signup({ closeModal, onLoginClick }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const [userData, setUserData] = useState(null);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone);
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      if (!signupName || !signupEmail || !signupPhone || !signupPassword) {
        setErrorMessage('All fields are required.');
        setTimeout(() => setErrorMessage(''), 2000);
        return;
      }

      if (!validateEmail(signupEmail)) {
        setErrorMessage('Please enter a valid email address.');
        setTimeout(() => setErrorMessage(''), 2000);
        return;
      }
    
      if (!validatePhone(signupPhone)) {
        setErrorMessage('Please enter a valid phone number (10 digits).');
        setTimeout(() => setErrorMessage(''), 2000);
        return;
      }
    
      if (signupPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        setTimeout(() => setErrorMessage(''), 2000);
        return;
      }

      const cleanedPassword = signupPassword.trim();
      if (cleanedPassword !== signupPassword) {
        setErrorMessage('Password cannot contain leading or trailing spaces');
        setTimeout(() => setErrorMessage(''), 2000);
        return;
      }

      // Store user data temporarily instead of creating account
      setUserData({
        username: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        phone: signupPhone.trim(),
        password: signupPassword,
        role: 'user',
        adminEmail: 'pradhansumit957@gmail.com'
      });

      // Request verification code
      const verifyResponse = await fetch('http://localhost:5002/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: signupName.trim(),
          email: signupEmail.trim().toLowerCase(),
          phone: signupPhone.trim(),
          password: signupPassword,
          adminEmail: 'pradhansumit957@gmail.com'
        })
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || 'Failed to send verification code');
      }

      setSuccessMessage('Verification code has been sent to admin. Please contact admin for the code.');
      setTimeout(() => setSuccessMessage(''), 2000);
      setStep(2);
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error.message || 'Registration failed. Please try again.');
      setTimeout(() => setErrorMessage(''), 2000);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('Verifying code...');
  
    try {
      // Only verify the OTP and create user in one step
      const verifyResponse = await axios.post('http://localhost:5002/api/auth/verify-otp', {
        email: signupEmail.toLowerCase(),
        verificationToken: verificationCode
      });
  
      if (verifyResponse.data.success) {
        setSuccessMessage('Account created and verified successfully! You can now login.');
        
        setTimeout(() => {
          closeModal();
          navigate('/', { 
            replace: true,
            state: { 
              isNewUser: true,
              message: 'Account created and verified! Please login with your credentials.',
              email: signupEmail.toLowerCase(),
              name: signupName
            }
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Verification error:', error.response?.data || error);
      setErrorMessage(error.response?.data?.message || 'Verification failed. Please try again.');
      setSuccessMessage('');
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <div className="signup-modal">
      <div className="modal-header">
        <button className="close-btn" onClick={closeModal}>×</button>
        <h2>Signup</h2>
      </div>
      {step === 1 ? (
        <form onSubmit={handleInitialSubmit}>
          <div className="input-container">
            <label htmlFor="signup-name">Name</label>
            <input
              type="text"
              id="signup-name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="signup-email">Email</label>
            <input
              type="email"
              id="signup-email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="signup-phone">Phone Number</label>
            <input
              type="text"
              id="signup-phone"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="signup-btn">Next</button>
        </form>
      ) : (
        <form onSubmit={handleVerification}>
          <div className="input-container">
            <label htmlFor="verification-code">Verification Code</label>
            <input
              type="text"
              id="verification-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              required
            />
          </div>
          <button type="submit" className="signup-btn">Verify</button>
        </form>
      )}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      
      <div className="login-link">
        <p>Already have an account? 
          <button onClick={handleLoginClick}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;