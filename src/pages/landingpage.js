import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of BrowserRouter
import Navbar from "./navbar";
import Login from "./Login";  
import Signup from "./Signup";  
import AdminDashboard from "./AdminDashboard"; // Correct import
import "./landingpage.css";

function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const navigate = useNavigate(); // Fix navigation issue

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeSignupModal = () => setIsSignupModalOpen(false);

  const handleSubmitLogin = (e, loginEmail, loginPassword) => {
    e.preventDefault();
    alert("Login Form submitted");
    // Add login logic here
  };

  const handleSubmitSignup = (e, signupName, signupEmail, signupPhone, signupPassword) => {
    e.preventDefault();
    alert("Signup Form submitted");
    // Add signup logic here
  };

  return (
    <div className="landing-container">
      <Navbar />
      <header className="hero">
        <h1>Find Your Perfect Car with Gaadi Nest</h1>
        <p>Buy, Sell & Compare Cars Easily</p>
        <button className="explore-btn" onClick={() => navigate("/buy")}>
          Explore Now
        </button>
      </header>

      {/* Render modals */}
      {isLoginModalOpen && <Login closeLoginModal={closeLoginModal} handleSubmitLogin={handleSubmitLogin} />}
      {isSignupModalOpen && <Signup closeSignupModal={closeSignupModal} handleSubmitSignup={handleSubmitSignup} />}
    </div>
  );
}

export default LandingPage;