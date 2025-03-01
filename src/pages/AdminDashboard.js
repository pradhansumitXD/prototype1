import React from 'react';
import './AdminDashboard.css'; // Import a CSS file for styling

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-nav">
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/admin/users">Manage Users</a></li>
          <li><a href="/admin/cars">Manage Cars</a></li>
        </ul>
      </div>

      <div className="main-content">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the admin dashboard. Use the sidebar to navigate.</p>

        <div className="stats">
          <div className="stat-box">
            <h3>Total Users</h3>
            <p>250</p>
          </div>
          <div className="stat-box">
            <h3>Total Cars</h3>
            <p>100</p>
          </div>
          <div className="stat-box">
            <h3>Pending Approvals</h3>
            <p>5</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
