import React, { useState, useEffect } from 'react';
import './ManageListings.css';

function ManageListings() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    adTitle: '',
    brand: '',
    model: '',
    price: ''
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch('http://localhost:5002/api/listings/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id || ''}`,
            'Accept': 'application/json',
            'user': JSON.stringify({ id: user?.id, role: user?.role })
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Listing data with model:', data.map(item => ({
          id: item._id,
          model: item.model,
          adTitle: item.adTitle
        })));
        setListings(data || []);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleStatusUpdate = async (listingId, newStatus) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // Check these API endpoints
      const response = await fetch(`http://localhost:5002/api/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || ''}`,
          'Accept': 'application/json',
          'user': JSON.stringify({ id: user?.id, role: user?.role }) 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update listing status');
      }

      // Update the listings state after successful status update
      setListings(listings.map(listing => 
        listing._id === listingId ? { ...listing, status: newStatus } : listing
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setEditFormData({
      adTitle: listing.adTitle || listing.title,
      brand: listing.brand,
      model: listing.model,
      price: listing.price
    });
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5002/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || ''}`,
          'user': JSON.stringify({ id: user?.id, role: user?.role })
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to delete listing (Status: ${response.status})`);
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      setListings(listings.filter(listing => listing._id !== listingId));
      alert('Listing deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete listing: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5002/api/listings/${editingListing._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || ''}`,
          'user': JSON.stringify({ id: user?.id, role: user?.role })
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) throw new Error('Failed to update listing');
      
      const updatedListing = await response.json();
      setListings(listings.map(listing => 
        listing._id === editingListing._id ? { ...listing, ...updatedListing } : listing
      ));
      setEditingListing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="manage-listings">
      <h2>Manage Listings</h2>
      {editingListing && (
        <div className="edit-form-overlay">
          <form onSubmit={handleEditSubmit} className="edit-form">
            <h3>Edit Listing</h3>
            <input
              type="text"
              value={editFormData.adTitle}
              onChange={e => setEditFormData({...editFormData, adTitle: e.target.value})}
              placeholder="Title"
            />
            <input
              type="text"
              value={editFormData.brand}
              onChange={e => setEditFormData({...editFormData, brand: e.target.value})}
              placeholder="Brand"
            />
            <input
              type="text"
              value={editFormData.model}
              onChange={e => setEditFormData({...editFormData, model: e.target.value})}
              placeholder="Model"
            />
            <input
              type="number"
              value={editFormData.price}
              onChange={e => setEditFormData({...editFormData, price: e.target.value})}
              placeholder="Price"
            />
            <div className="edit-form-buttons">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingListing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <table className="listings-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(listing => {
            console.log('Rendering listing:', listing);
            return (
              <tr key={listing._id}>
                <td>
                  <img 
                    src={`http://localhost:5002/uploads/${listing.imageUrl.split('/').pop().split('\\').pop()}`}
                    alt={listing.title || listing.adTitle}
                    className="listing-image"
                    onError={(e) => {
                      console.error('Image load error:', listing.imageUrl);
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </td>
                <td>{listing.title || listing.adTitle || 'N/A'}</td>
                <td>{listing.brand || 'N/A'}</td>
                <td>{(() => {
                  if (listing.model) return listing.model;
                  const titleParts = (listing.adTitle || '').split('-');
                  return titleParts.length > 1 ? titleParts[0].trim().split(' ')[1] : 'N/A';
                })()}</td>
                <td>₹{Number(listing.price).toLocaleString('en-IN') || 'N/A'}</td>
                <td>{listing.status}</td>
                <td className="action-buttons">
                  <div className="button-group">
                    <div className="status-buttons">
                      <button 
                        onClick={() => handleStatusUpdate(listing._id, 'approved')}
                        className="approve-btn"
                        disabled={listing.status === 'approved'}
                      >
                        <i className="fas fa-check"></i> Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(listing._id, 'rejected')}
                        className="reject-btn"
                        disabled={listing.status === 'rejected'}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </div>
                    <div className="edit-delete-buttons">
                      <button 
                        onClick={() => handleDelete(listing._id)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ManageListings;