import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './AdminDashboard.css';
import ManageUsers from './ManageUsers';
import ManageListings from './ManageListings';
import ManageServices from './ManageServices';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalServices: 0  
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      fetchUserStats();
    }
  }, [navigate]);

  const fetchUserStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5002/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${user?.id || ''}`,
          'user': JSON.stringify({ id: user?.id, role: user?.role })
        }
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('Received stats:', data);
        setUserStats({
          totalUsers: data.totalUsers || 0,
          totalListings: data.totalListings || 0,
          totalServices: data.totalServices || 0  
        });
      } else {
        console.error('Failed to fetch stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-nav">
          <li>
            <Link to="/admin-dashboard" className={isActive("/admin-dashboard")}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin-dashboard/manageusers" className={isActive("/admin-dashboard/manageusers")}>
              Manage Users
            </Link>
          </li>
          <li>
            <Link to="/admin-dashboard/listings" className={isActive("/admin-dashboard/listings")}>
              Manage Listings
            </Link>
          </li>
          <li>
            <Link to="/admin-dashboard/manageservices" className={isActive("/admin-dashboard/manageservices")}>
              Manage Services
            </Link>
          </li>
          <li className="logout-item">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          <Routes>
            <Route path="" element={
              <div className="dashboard-welcome">
                <h1>Welcome to the Admin Dashboard</h1>
                <p>Use the sidebar to manage users, cars, listings, and view platform activities.</p>
                
                <div className="stats-container">
                  <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-number">{userStats.totalUsers}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Services</h3>
                    <p className="stat-number">{userStats.totalServices}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Listings</h3>
                    <p className="stat-number">{userStats.totalListings}</p>
                  </div>
                </div>
              </div>
            } />
            <Route path="manageusers/*" element={<ManageUsers />} />
            <Route path="listings/*" element={<ManageListings />} />
            <Route path="manageservices/*" element={<ManageServices />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
