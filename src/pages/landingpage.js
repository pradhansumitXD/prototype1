import React from "react";
import { useNavigate } from "react-router-dom"; 
import Navbar from "./navbar";
import "./landingpage.css";

function LandingPage() {
  const navigate = useNavigate(); 

  return (
    <div className="landing-container">
      <Navbar />
      <header className="hero">
        <h1>Find Your Perfect Car with Gaadi Nest</h1>
        <p>Buy, Sell & Compare Cars Easily</p>
        <div className="hero-buttons">
          <button className="explore-btn" onClick={() => navigate("/buy")}>
            Explore Cars
          </button>
          <button className="sell-btn" onClick={() => navigate("/sell")}>
            Sell Your Car
          </button>
        </div>
      </header>

      <section className="features">
        <h2>Why Choose Gaadi Nest?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-car"></i>
            <h3>Wide Selection</h3>
            <p>Browse through thousands of verified cars</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-shield-alt"></i>
            <h3>Secure Deals</h3>
            <p>Safe and secure transactions guaranteed</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-tools"></i>
            <h3>Car Services</h3>
            <p>Professional car maintenance services</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li onClick={() => navigate("/buy")}>Buy Cars</li>
              <li onClick={() => navigate("/sell")}>Sell Cars</li>
              <li onClick={() => navigate("/compare")}>Compare Cars</li>
              <li onClick={() => navigate("/service")}>Car Services</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: info@gaadinest.com</p>
            <p>Phone: +977 984 108 611</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Gaadi Nest. Developed by Sumit Pradhan</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;