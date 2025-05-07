import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminUserCreate.css';

function AdminUserCreate() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!formData.username || !formData.email || !formData.phone || !formData.password) {
        setError('All fields are required.');
        return;
      }

      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address.');
        return;
      }

      if (!validatePhone(formData.phone)) {
        setError('Please enter a valid phone number (10 digits).');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: 'admin',
          skipEmailVerification: true  
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin user');
      }

      setSuccess('Admin user created successfully');
      setFormData({ username: '', email: '', phone: '', password: '', role: 'admin' });
      
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error creating admin user');
    }
  };

  return (
    <div className="admin-create-container">
      <h2>Create Admin </h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="input-group">
          <label>Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <button type="submit">Create Admin User</button>
      </form>
    </div>
  );
}

export default AdminUserCreate;