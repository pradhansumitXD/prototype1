import React, { useState, useEffect } from 'react';
import './ManageUsers.css';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editUsername, setEditUsername] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch('http://localhost:5002/api/admin/users', {
          headers: {
            'Content-Type': 'application/json',
            'user': JSON.stringify(user)
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const adminUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5002/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(adminUser)
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditUsername(user.username);
  };

  const handleUpdate = async () => {
    try {
      const adminUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5002/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(adminUser)
        },
        body: JSON.stringify({
          username: editUsername,
          role: editRole
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(prevUsers => prevUsers.map(user => 
        user._id === editingUser._id 
          ? { ...user, username: editUsername, role: editRole }
          : user
      ));
      setEditingUser(null);
      setError(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    }
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="manage-users">
      <h2>Manage Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  user.username
                )}
              </td>
              <td>{user.email}</td>
              <td>
                {editingUser?._id === user._id ? (
                  <select 
                    value={editRole} 
                    onChange={(e) => setEditRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUser?._id === user._id ? (
                  <>
                    <button 
                      className="save-btn"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;
