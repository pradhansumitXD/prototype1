import React, { useState } from 'react';
import './login.css';  // Import the CSS file

function Login({ closeModal }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Added error message state

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Clear previous error message

    // Input validation
    if (!loginEmail || !loginPassword) {
      setLoading(false);
      setErrorMessage('Both email and password are required.');
      return;
    }

    const loginData = {
      email: loginEmail,    // Corrected variable
      password: loginPassword, // Corrected variable
    };

    console.log('Sending login data:', loginData);  // Debugging log

    try {
      const response = await fetch('http://localhost:5001/api/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        // Store user data on successful login
        localStorage.setItem('user', JSON.stringify(data.user)); 
        alert('Login successful!');
        closeModal();
      } else {
        console.log('Login failed:', data.message); // Log failed login response
        setErrorMessage(data.message || 'Invalid login credentials'); // Show error below input
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-modal">
      <button className="close-btn" onClick={closeModal}>✖</button>
      <h2>Login</h2>
      <form onSubmit={handleSubmitLogin}>
        <div className="input-container">
          <label htmlFor="login-email">Email</label>
          <input
            type="email"
            id="login-email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="login-password">Password</label>
          <input
            type="password"
            id="login-password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Show error message */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
