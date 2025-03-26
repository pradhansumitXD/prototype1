import React, { useState } from 'react';
import './signup.css'; 

function Signup({ closeModal }) {
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [successMessage, setSuccessMessage] = useState(''); 

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^\d{10}$/; // Ensures a 10-digit phone number
    return regex.test(phone);
  };

  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      if (!signupName || !signupEmail || !signupPhone || !signupPassword) {
        setErrorMessage('All fields are required.');
        return;
      }
    
      if (!validateEmail(signupEmail)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    
      if (!validatePhone(signupPhone)) {
        setErrorMessage('Please enter a valid phone number (10 digits).');
        return;
      }
    
      const response = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: signupName.trim(),
          email: signupEmail.trim().toLowerCase(),
          phone: signupPhone.trim(),
          password: signupPassword,
          role: 'user'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccessMessage('Registration successful! Redirecting...');
      
      setTimeout(() => {
        setSignupName('');
        setSignupEmail('');
        setSignupPhone('');
        setSignupPassword('');
        setSuccessMessage('');
        closeModal();
        window.location.href = '/'; 
      }, 1500);
    
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    }
  };
  
  return (
    <div className="signup-modal">
      <button className="close-btn" onClick={closeModal}>✖</button>
      <h2>Signup</h2>
      <form onSubmit={handleSubmitSignup}>
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


        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="signup-btn">Signup</button>
      </form>
    </div>
  );
}

export default Signup;