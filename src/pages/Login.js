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
  // Update port number if you changed it in server.js
  const API_URL = "http://localhost:5001/api/users/login";

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); 
    setSuccessMessage(""); 

    if (!loginEmail || !loginPassword) {
      setLoading(false);
      setErrorMessage("Both email and password are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword
        })
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error('Network connection failed. Please check if the server is running.');
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Invalid login credentials.");
      }

      console.log("Login successful data:", data);
      localStorage.setItem("user", JSON.stringify(data.user)); 
      setSuccessMessage("Login successful!"); 

      setTimeout(() => {
        closeModal(); 
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error.message === "Failed to fetch"
          ? "Could not connect to server. Please try again."
          : error.message
      );
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
