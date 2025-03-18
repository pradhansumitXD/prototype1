import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./login.css"; 

function Login({ closeModal }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 

  const navigate = useNavigate();  

  // Update API URL to match the backend route
  const API_URL = "http://localhost:5002/api/users/login";

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    
    try {
      const response = await fetch(API_URL, {  // Use the API_URL constant
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      console.log('Login response data:', data); // Debug the entire response

      if (!response.ok) {
        throw new Error(data.message || "Invalid login credentials.");
      }

      // Explicitly check the user role
      const userRole = data.user?.role;
      console.log('User role:', userRole); // Debug the role

      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccessMessage("Login successful!");

      // Clear form and handle redirection
      setLoginEmail("");
      setLoginPassword("");

      if (userRole === "admin") {
        console.log("Admin user detected");
        window.location.href = "/admin-dashboard";
      } else {
        console.log("Regular user detected");
        window.location.href = "/";
      }

      if (closeModal) closeModal();
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal">
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
    </div>
  );
}

export default Login;
