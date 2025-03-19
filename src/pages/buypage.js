import React, { useState, useEffect } from 'react';
import Navbar from './navbar'; 
import './buypage.css'; 
import car1 from '../assets/images/car1.jpg';
import car2 from '../assets/images/car2.jpg';
import car3 from '../assets/images/car3.jpg';
import car4 from '../assets/images/car4.jpg';
import car5 from '../assets/images/car5.jpg';
import car6 from '../assets/images/car6.jpg';
import car7 from '../assets/images/car7.jpg';
import car8 from '../assets/images/car8.jpg';

// Update FilterSection component
const FilterSection = ({ filters, handleFilterChange, handleSearch }) => {
  return (
    <div className="left-column">
      <h1>Discover a Car</h1>
      <div className="filter-options">
        <h2>Make Your Own Model</h2>
        <div className="filter-item">
          <label>Select Brand</label>
          <select name="brand" value={filters.brand} onChange={handleFilterChange}>
            {/* Changed 'make' to 'brand' to match backend */}
            <option value="">Select</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Suzuki">Suzuki</option>
            <option value="Tata">Tata</option>
            <option value="KIA">KIA</option>
            <option value="Mahindra">Mahindra</option>
            <option value="Toyota">Toyota</option>
            <option value="Nissan">Nissan</option>
            <option value="Ford">Ford</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Vehicle Type</label>
          <select name="carType" value={filters.carType} onChange={handleFilterChange}>
            {/* Changed 'vehicleType' to 'carType' */}
            <option value="">Select</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Pickup">Pickup</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Search by Budget</label>
          <select name="budget" value={filters.budget} onChange={handleFilterChange}>
            <option value="">Select</option>
            <option value="1000000">5,00,000 - 10,000,00</option>
            <option value="2000000">10,000,00 - 20,000,00</option>
            <option value="3000000">20,000,00 - 30,000,00</option>
            <option value="2000000">30,000,00 - 40,000,00</option>
            <option value="2000000">40,000,00 - 50,000,00</option>
            <option value="2000000">50,000,00 - 60,000,00</option>
            <option value="2000000">60,000,00 - 70,000,00</option>
            <option value="2000000">70,000,00 - 80,000,00</option>

          </select>
        </div>
        <div className="filter-item">
          <label>Search by Transmission</label>
          <select name="transmission" value={filters.transmission} onChange={handleFilterChange}>
            <option value="">Select</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="hybrid">Hybrid</option>
            <option value="ev">EV</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Search by Fuel Type</label>
          <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
            <option value="">Select</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="ev">EV</option>
          </select>
        </div>
        <div className="filter-item">
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
    </div>
  );
};
// Car Listing Component
const CarListing = ({ car }) => {
  return (
    <div className="car-listing">
      <img src={car.photo} alt={car.name} />
      <div className="car-details">
        <h3>{car.name}</h3>
        <span className="price">{car.price}</span>
        <div className="additional-info">
          <span>{car.kilometers}</span>
          <span>{car.transmission}</span>
          <span>{car.makeYear}</span>
          <span>{car.engine}</span>
        </div>
        <p>{car.description}</p>
        <button>View Seller Details</button>
      </div>
    </div>
  );
};
// Main BuyPage Component
function BuyPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    brand: '',           // Changed from 'make'
    carType: '',         // Changed from 'vehicleType'
    budget: '',
    transmission: '',
    fuelType: ''
  });
  // Add this function
  const fetchSellerDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5002/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch seller details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching seller details:', error);
      throw error;
    }
  };
  const fetchApprovedListings = async (filterParams = null) => {
    try {
      let url = 'http://localhost:5002/api/listings/approved';
      
      if (filterParams) {
        const queryParams = new URLSearchParams();
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Listing data structure:', data[0]); // Add this line to see the first listing's structure
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchApprovedListings();
  }, []);
  // Remove the first CarListing component definition and update the second one
  const CarListing = ({ listing }) => {
    const [showSellerDetails, setShowSellerDetails] = useState(false);
    const [sellerInfo, setSellerInfo] = useState(null);
    
    const handleViewSellerDetails = async () => {
      try {
        if (!listing.userId) {
          throw new Error('No seller ID available');
        }
        const data = await fetchSellerDetails(listing.userId);
        setSellerInfo(data);
        setShowSellerDetails(true);
      } catch (error) {
        console.error('Error fetching seller details:', error);
        alert('Could not fetch seller details. Please try again later.');
      }
    };
  
    // Extract only the filename from the full path
    const filename = listing.imageUrl.split('/').pop().split('\\').pop();
    const imageUrl = `http://localhost:5002/uploads/${filename}`;
    
    return (
      <div className="car-listing">
        <img 
          src={imageUrl} 
          alt={listing.adTitle} 
          onError={(e) => {
            console.error('Image load error:', imageUrl);
            e.target.onerror = null;
            e.target.src = car1;
          }}
        />
        <div className="car-details">
          <h3>{listing.adTitle}</h3>
          <span className="price">Rs. {listing.price}</span>
          <div className="additional-info">
            <span>{listing.kmsDriven} KM</span>
            <span>{listing.transmission}</span>
            <span>{listing.makeYear}</span>
            <span>{listing.engine}</span>
          </div>
          <p>{listing.description}</p>
          <button onClick={handleViewSellerDetails}>View Seller Details</button>
        </div>
  
        {showSellerDetails && sellerInfo && (
          <div className="seller-modal">
            <div className="seller-modal-content">
              <button className="close-btn" onClick={() => setShowSellerDetails(false)}>×</button>
              <h3>Seller Information</h3>
              <p><strong>Name:</strong> {sellerInfo.username}</p>
              <p><strong>Email:</strong> {sellerInfo.email}</p>
              <p><strong>Phone:</strong> {sellerInfo.phone}</p>
            </div>
          </div>
        )}
      </div>
    );
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  const handleSearch = () => {
    console.log('Applying filters:', filters);
    const activeFilters = {};
    
    // Only include filters with values
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        activeFilters[key] = value;
      }
    });

    // If there are active filters, fetch filtered listings
    if (Object.keys(activeFilters).length > 0) {
      fetchApprovedListings(activeFilters);
    } else {
      // If no filters, fetch all listings
      fetchApprovedListings();
    }
  };
  return (
    <>
      <Navbar />
      <div className="buy-section">
        <FilterSection 
          filters={filters} 
          handleFilterChange={handleFilterChange} 
          handleSearch={handleSearch} 
        />
        <div className="right-column">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <CarListing key={listing._id} listing={listing} />
            ))
          ) : (
            <p>No approved listings available</p>
          )}
        </div>
      </div>
    </>
  );
}
export default BuyPage;