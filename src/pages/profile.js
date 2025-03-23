import React, { useState, useEffect } from 'react';
import './profile.css'; // Import the stylesheet

function Profile() {
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '', 
    mobile: '',   // Allowing the user to change the mobile number
  });

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser({
        username: storedUser.username,
        email: storedUser.email,
        password: storedUser.password,
        mobile: storedUser.mobile || '', 
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update localStorage with the new user data
    localStorage.setItem('user', JSON.stringify(user));
    alert('Profile updated successfully!');
  };

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">Mobile Number</label>
          <input
            type="text"
            id="mobile"
            name="mobile"
            value={user.mobile}
            onChange={handleChange}
            required
            pattern="\d{10}"  // Mobile number should be 10 digits 
            title="Please enter a valid 10-digit mobile number"
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default Profile;
