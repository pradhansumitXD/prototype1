import React, { useState, useEffect } from 'react';
import './ManageListings.css';

function ManageListings() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.log('Received listings:', data); // Debug log to see what data we're getting
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
          'user': JSON.stringify({ id: user?.id, role: user?.role }) // Add user role information
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

  return (
    <div className="manage-listings">
      <h2>Manage Listings</h2>
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
                    src={`http://localhost:5002/uploads/${listing.imageUrl}`}
                    alt={listing.title || listing.adTitle}
                    className="listing-image"
                  />
                </td>
                <td>{listing.title || listing.adTitle || 'N/A'}</td>
                <td>{listing.brand || 'N/A'}</td>
                <td>{listing.model || 'N/A'}</td>
                <td>₹{listing.price?.toLocaleString('en-IN') || 'N/A'}</td>
                <td>{listing.status}</td>
                <td>
                  <button 
                    onClick={() => handleStatusUpdate(listing._id, 'approved')}
                    className="approve-btn"
                    disabled={listing.status === 'approved'}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(listing._id, 'rejected')}
                    className="reject-btn"
                    disabled={listing.status === 'rejected'}
                  >
                    Reject
                  </button>
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