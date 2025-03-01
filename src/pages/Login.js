import React, { useState } from "react";
import "./login.css"; // Import the CSS file

function Login({ closeModal }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = "http://localhost:5000/api/login"; // Change if backend runs on a different port

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // Clear previous error

    // Input validation
    if (!loginEmail || !loginPassword) {
      setLoading(false);
      setErrorMessage("Both email and password are required.");
      return;
    }

    const loginData = {
      email: loginEmail,
      password: loginPassword,
    };

    console.log("Sending login data:", loginData);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        // Handle HTTP errors like 400, 401, etc.
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid login credentials.");
      }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login successful!");
      closeModal();
    } catch (error) {
      console.error("Login error:", error);
      if (error.message.includes("Failed to fetch")) {
        setErrorMessage("Could not connect to server. Please try again.");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
