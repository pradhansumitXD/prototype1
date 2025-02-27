import React, { useState } from 'react';
import './signup.css';  // Import the CSS file

function Signup({ closeModal }) {
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState('user');  // Default role is 'user'
  const [errorMessage, setErrorMessage] = useState(''); // For error handling

  // Validate email format
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validate phone format (basic check)
  const validatePhone = (phone) => {
    const regex = /^\d{10}$/; // Ensures a 10-digit phone number
    return regex.test(phone);
  };

  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error message

    // Input validation
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

    const userData = {
      username: signupName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
      role: role,  // Send the role along with other details
    };

    try {
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Signup successful!');
        closeModal(); // Close the signup modal after successful signup
      } else {
        setErrorMessage(data.message || 'Error during signup');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setErrorMessage('Error registering user');
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

        {/* Role Selection Dropdown */}
        <div className="input-container">
          <label htmlFor="signup-role">Role</label>
          <select
            id="signup-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Show error message */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="signup-btn">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
