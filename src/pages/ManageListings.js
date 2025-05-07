import React, { useState, useEffect } from 'react';
import './ManageListings.css';
import car1 from '../assets/images/car1.jpg';

function ManageListings() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    adTitle: '',
    brand: '',
    model: '',
    price: ''
  });

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return car1;
    
    try {
      if (Array.isArray(imageUrl)) {
        if (imageUrl.length === 0) return car1;
        const firstImage = imageUrl[0];
        const cleanImagePath = firstImage.replace(/[\[\]']/g, '').trim();
        return `http://localhost:5002/uploads/${cleanImagePath}`;
      }

      const cleanImagePath = imageUrl.replace(/[\[\]']/g, '').trim();
      return `http://localhost:5002/uploads/${cleanImagePath}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return car1;
    }
  };

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
        throw new Error(errorData.message || `Failed to update listing status (${response.status})`);
      }

      const updatedListing = await response.json();
      
      setListings(listings.map(listing => 
        listing._id === listingId ? updatedListing : listing
      ));

    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = (listingId) => {
    setListingToDelete(listingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5002/api/listings/${listingToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || ''}`,
          'Accept': 'application/json',
          'user': JSON.stringify({ id: user?.id, role: user?.role })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to delete listing (Status: ${response.status})`);
      }

      setListings(prevListings => prevListings.filter(listing => listing._id !== listingToDelete));
      setSuccessMessage('Listing deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowDeleteModal(false);
      setListingToDelete(null);
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
      setSuccessMessage('Listing updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="manage-listings">
      <h2>Manage Listings</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
            <div className="delete-modal-buttons">
              <button className="confirm-btn" onClick={confirmDelete}>Delete</button>
              <button className="cancel-btn" onClick={() => {
                setShowDeleteModal(false);
                setListingToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
                    src={getImageUrl(listing.imageUrl)}
                    alt={listing.title || listing.adTitle || 'Car Image'}
                    className="listing-image"
                    onError={(e) => {
                      console.error('Image load error:', listing.imageUrl);
                      e.target.onerror = null;
                      e.target.src = car1;
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