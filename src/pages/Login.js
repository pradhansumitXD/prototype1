import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./login.css"; 

function Login({ closeModal }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    
    try {
      if (!loginEmail || !loginPassword) {
        throw new Error("Email and password are required.");
      }

      console.log('Attempting login with:', { email: loginEmail.trim().toLowerCase() }); 

      const response = await fetch('http://localhost:5002/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword
        }),
      });

      const data = await response.json();
      console.log('Login response:', data); 

      if (!response.ok) {
        throw new Error(data.message || "Invalid login credentials.");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", `Bearer ${data.token}`); 
      
      setSuccessMessage("Login successful!");
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);

      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/";
        }
      }, 1500);

      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please try again.');
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      
      const response = await fetch('http://localhost:5002/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginEmail.toLowerCase(),
          adminEmail: 'pradhansumit957@gmail.com'
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResetStep(3);
        setSuccessMessage('Reset code sent to admin. Please enter the code and new password.');
        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setErrorMessage(error.message || 'User not found or server error');
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!otp || otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit reset code');
      }

      // Update the reset password endpoint
      const response = await fetch('http://localhost:5002/api/users/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: loginEmail.toLowerCase().trim(),
          otp: otp.trim(),
          newPassword: newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccessMessage('Password reset successful! Please login with your new password.');
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
      
      setNewPassword('');
      setOtp('');
      setLoginPassword('');
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep(1);
        closeModal();
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message);
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal">
      {!showForgotPassword ? (
        <div className="login-content">
          <button className="close-btn" onClick={closeModal}>✖</button>
          <h2>Login</h2>
  
          {successMessage && <p className="success-message">{successMessage}</p>}
  
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
  
            {errorMessage && <p className="error-message">{errorMessage}</p>}
  
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="forgot-password-link">
            <button onClick={() => {
              setShowForgotPassword(true);
              handleForgotPassword();
            }}>
              Forgot Password?
            </button>
          </div>
        </div>
      ) : (
        <div className="forgot-password-form">
          <h2>Reset Password</h2>
          {successMessage && <p className="success-message">{successMessage}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          
          <form onSubmit={handleResetPassword}>
            <div className="input-container">
              <label htmlFor="otp">Reset Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter reset code from admin"
                required
              />
            </div>
            <div className="input-container">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <button type="submit" className="reset-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          
          <button 
            onClick={() => {
              setShowForgotPassword(false);
              setResetStep(1);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="back-btn"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
