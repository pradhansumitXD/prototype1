import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import './AdminDashboard.css';
import ManageUsers from './ManageUsers';

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-nav">
          <li><Link to="/admin-dashboard">Dashboard</Link></li>
          <li><Link to="/admin-dashboard/users">Manage Users</Link></li>
          <li><Link to="/admin-dashboard/cars">Manage Cars</Link></li>
        </ul>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={
            <>
              <h1>Welcome to the Admin Dashboard</h1>
              <p>Use the sidebar to manage users, cars, and view platform activities.</p>
            </>
          } />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/cars" element={<h2>Cars Management Coming Soon</h2>} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
