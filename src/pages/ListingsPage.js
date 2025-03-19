import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import './ListingsPage.css';
import car1 from '../assets/images/car1.jpg';

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
              <img 
                src={imageUrl} 
                alt={listing.adTitle}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = car1;
                }}
              />
              <div className="listing-details">
                <h3>{listing.adTitle}</h3>
                <p className="price">Rs. {listing.price}</p>
                <div className="car-info">
                  <p>Brand: {listing.brand}</p>
                  <p>Model: {listing.model}</p>
                  <p>Year: {listing.year}</p>
                  <p>Transmission: {listing.transmission}</p>
                  <p>Fuel Type: {listing.fuelType}</p>
                  <p>Engine: {listing.engine}</p>
                  <p>Kilometers: {listing.kmsDriven} KM</p>
                </div>
                <p className="description">{listing.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ListingsPage;