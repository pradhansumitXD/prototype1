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
        <button className="explore-btn" onClick={() => navigate("/buy")}>
          Explore Now
        </button>
      </header>
    </div>
  );
}

export default LandingPage;