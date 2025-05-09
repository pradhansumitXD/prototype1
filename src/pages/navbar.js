import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 
import './navbar.css';
import Login from './Login';
import Signup from './Signup';

function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);  
  const navigate = useNavigate();

  const checkLoginStatus = async () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser && parsedUser.id) {
          const response = await fetch(`http://localhost:5002/api/users/${parsedUser.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          });

          if (!response.ok) {
            localStorage.removeItem("user");
            setIsLoggedIn(false);
            return;
          }

          const userData = await response.json();
          if (userData && userData.email === parsedUser.email) {
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem("user");
            setIsLoggedIn(false);
          }
        } else {
          localStorage.removeItem("user");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        localStorage.removeItem("user");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    checkLoginStatus(); 
  };

  const closeSignupModal = () => setIsSignupModalOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/"); 
  };

  if (isLoggedIn === null) {
    return <div>Loading...</div>;  
  }

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
        {isLoggedIn ? (
          <>
            <button className="profile-btn" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="logoutbtn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="login-btn" onClick={openLoginModal}>Login</button>
            <button className="signup-btn" onClick={openSignupModal}>Signup</button>
          </>
        )}
      </div>

      {isLoginModalOpen && (
        <div className="login-modal-container">
          <Login closeModal={closeLoginModal} onSignupClick={openSignupModal} />
        </div>
      )}

      {isSignupModalOpen && (
        <div className="signup-modal-container">
          <Signup closeModal={closeSignupModal} onLoginClick={openLoginModal} />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
