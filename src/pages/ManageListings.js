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
        console.log('Fetching listings with user:', user);

        // Updated fetch request to use the correct endpoint
        const response = await fetch('http://localhost:5002/api/listings/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'user': JSON.stringify(user)
          }
        });

        console.log('Response:', response); // Debug log

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched listings:', data);
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
          'user': JSON.stringify(user)
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update listing status');
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
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(listing => (
            <tr key={listing._id}>
              <td>{listing.adTitle}</td>
              <td>${listing.price}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageListings;