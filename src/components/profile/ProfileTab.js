import React from 'react';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

const ProfileTab = ({ user, handleChange, handleSubmit }) => {
  return (
    <div className="profile-form-container">
      <form onSubmit={handleSubmit}>
        <div className="profile-edit-form-fields">
          <div className="profile-edit-field">
            <label><FaUser /> Username</label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="profile-edit-input"
              required
            />
          </div>
          <div className="profile-edit-field">
            <label><FaEnvelope /> Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="profile-edit-input"
              required
            />
          </div>
          <div className="profile-edit-field">
            <label><FaPhone style={{ transform: 'scaleX(-1)' }} /> Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={user.mobile}
              onChange={handleChange}
              className="profile-edit-input"
              required
            />
          </div>
          <div className="profile-edit-field">
            <label>Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={user.oldPassword}
              onChange={handleChange}
              className="profile-edit-input"
            />
          </div>
          <div className="profile-edit-field">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              className="profile-edit-input"
            />
          </div>
          <div className="profile-edit-field">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleChange}
              className="profile-edit-input"
            />
          </div>
        </div>
        <div className="profile-edit-actions">
          <button type="submit" className="profile-save-changes-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;