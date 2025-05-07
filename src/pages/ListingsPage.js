import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import './ListingsPage.css';
import car1 from '../assets/images/car1.jpg';
import { getImageUrl } from '../utils/imageHelper';

function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/listings/all');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="listings-container">
        {listings.map((listing) => {
          const filename = listing.imageUrl.split('/').pop().split('\\').pop();
          const imageUrl = `http://localhost:5002/uploads/${filename}`;

          return (
            <div key={listing._id} className="listing-card">
              // Replace the image section in the listings.map
              <img 
                src={getImageUrl(listing.imageUrl)}
                alt={listing.adTitle || 'Car Image'}
                onError={(e) => {
                  console.error('Image load error:', listing.imageUrl);
                  e.target.onerror = null;
                  e.target.src = car1;
                }}
              />
              <div className="listing-details">
                <h3>{listing.adTitle.split('-')[0].trim()}</h3>
                <p className="price">Rs. {Number(listing.price).toLocaleString('en-IN')}</p>
                <div className="car-info">
                  <p>Brand: {listing.brand || 'N/A'}</p>
                  <p>Type: {listing.carType || 'N/A'}</p>
                  <p>Year: {listing.makeYear || 'N/A'}</p>
                  <p>Transmission: {listing.transmission || 'N/A'}</p>
                  <p>Fuel Type: {listing.fuelType || 'N/A'}</p>
                  <p>Engine: {listing.engine || 'N/A'}</p>
                  <p>Kilometers: {listing.kmsDriven || 'N/A'} KM</p>
                </div>
                <p className="description">{listing.description || 'N/A'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ListingsPage;