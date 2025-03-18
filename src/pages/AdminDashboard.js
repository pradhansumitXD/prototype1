import React, { useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import ManageUsers from './ManageUsers';
import ManageListings from './ManageListings';

function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin when component mounts
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-nav">
          <li><Link to="/admin-dashboard">Dashboard</Link></li>
          <li><Link to="/admin-dashboard/users">Manage Users</Link></li>
          <li><Link to="/admin-dashboard/cars">Manage Cars</Link></li>
          <li><Link to="/admin-dashboard/listings">Manage Listings</Link></li>
        </ul>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="" element={
            <>
              <h1>Welcome to the Admin Dashboard</h1>
              <p>Use the sidebar to manage users, cars, listings, and view platform activities.</p>
            </>
          } />
          <Route path="users" element={<ManageUsers />} />
          <Route path="cars" element={<h2>Cars Management Coming Soon</h2>} />
          <Route path="listings" element={<ManageListings />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
