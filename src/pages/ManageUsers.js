import React, { useState, useEffect } from 'react';
import './ManageUsers.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faUsers } from '@fortawesome/free-solid-svg-icons';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
            'user': JSON.stringify({
              id: user.id || user._id,
              role: user.role
            })
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

  // Add these new state variables at the top with other states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Update handleDelete function
  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  // Add confirmDelete function
  const confirmDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5002/api/admin/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify({
            id: user.id || user._id,
            role: user.role
          })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
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
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5002/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify({
            id: user.id || user._id,
            role: user.role
          })
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
      setSuccessMessage('User updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="manage-users">
      <h2><FontAwesomeIcon icon={faUsers} /> Manage Users</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>ACTIONS</th>
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
                    <div className="button-group">
                    <button className="save-btn" onClick={handleUpdate}>
    <FontAwesomeIcon icon={faSave} /> Save
  </button>
  <button className="cancel-btn" onClick={() => setEditingUser(null)}>
    <FontAwesomeIcon icon={faTimes} /> Cancel
  </button>
</div>

                  </>
                ) : (
                  <div className="action-buttons">
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEdit(user)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(user._id)}
                      disabled={user.role === 'admin'}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="delete-modal-buttons">
              <button className="confirm-btn" onClick={confirmDelete}>Delete</button>
              <button className="cancel-btn" onClick={() => {
                setShowDeleteModal(false);
                setUserToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;