import React, { useState, useEffect } from 'react';
import './ManageUsers.css';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update the fetchUsers function
  const fetchUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('Current user:', user);
  
      if (!user) {
        throw new Error('Please login first');
      }
  
      const response = await fetch('http://localhost:5001/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        }
      });
  
      const data = await response.json();
      console.log('Fetched users:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
  
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Update delete handler
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'user': JSON.stringify(user)
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete user');
        }

        // Update local state after successful deletion
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setError(null); // Clear any existing errors
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.message);
      }
    }
  };

  // Update the update handler
  const handleUpdateUser = async (userId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const currentUser = users.find(u => u._id === userId);
      
      if (!currentUser) {
        throw new Error('User not found');
      }
  
      const updateData = {
        username: newUsername,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role
      };
  
      console.log('Sending update data:', updateData);
  
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        },
        body: JSON.stringify(updateData)
      });
  
      const data = await response.json();
      console.log('Server response:', data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }
  
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === userId ? { ...u, ...updateData } : u)
      );
      setEditUserId(null);
      setNewUsername('');
      alert('User updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      alert(err.message);
    }
  };

  const handleEditUser = (userId, currentName) => {
    setEditUserId(userId);
    setNewUsername(currentName);
  };

  return (
    <div className="manage-users">
      <h1>Manage Users</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="users-table-container">
          <h2>User Management</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    {editUserId === user._id ? (
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                  <td>
                    {editUserId === user._id ? (
                      <button className="update-btn" onClick={() => handleUpdateUser(user._id)}>
                        Save
                      </button>
                    ) : (
                      <button className="edit-btn" onClick={() => handleEditUser(user._id, user.username)}>
                        Edit
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
