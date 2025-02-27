import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; 
import './navbar.css';
import Login from './Login';
import Signup from './Signup';

function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <NavLink to="/" className="logo-link">Gaadi Nest</NavLink>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/buy" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Buy
          </NavLink>
        </li>
        <li>
          <NavLink to="/sell" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Sell
          </NavLink>
        </li>
        <li>
          <NavLink to="/compare" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Compare Car
          </NavLink>
        </li>
        <li>
          <NavLink to="/service" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Car Service
          </NavLink>
        </li>
      </ul>
      <div className="auth-buttons">
        <button className="login-btn" onClick={openLoginModal}>Login</button>
        <button className="signup-btn" onClick={openSignupModal}>Signup</button>
      </div>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="login-modal-container">
          <Login closeModal={closeLoginModal} />
        </div>
      )}

      {/* Signup Modal */}
      {isSignupModalOpen && (
        <div className="signup-modal-container">
          <Signup closeModal={closeSignupModal} />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
