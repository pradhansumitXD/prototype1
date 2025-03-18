import React, { useState, useEffect } from 'react';
import Navbar from './navbar';

function ListingsPage() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/listings/all');
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();
  }, []);

  return (
    <>
      <Navbar />
      <div className="listings-container">
        {listings.map((listing) => (
          <div key={listing._id} className="listing-card">
            <img src={`http://localhost:5002/${listing.imageUrl}`} alt={listing.adTitle} />
            <h3>{listing.adTitle}</h3>
            <p>Brand: {listing.brand}</p>
            <p>Price: ${listing.price}</p>
            <p>Year: {listing.makeYear}</p>
            <p>Mileage: {listing.kmsDriven} km</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default ListingsPage;