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

const FilterSection = ({ filters, handleFilterChange, handleSearch }) => {
  return (
    <div className="left-column">
      <h1>Discover a Car</h1>
      <div className="filter-options">
        <h2>Make Your Own Model</h2>
        <div className="filter-item">
          <label>Select Brand</label>
          <select name="make" value={filters.make} onChange={handleFilterChange}>
            <option value="">Select</option>
            <option value="hyundai">Hyundai</option>
            <option value="suzuki">Suzuki</option>
            <option value="tata">Tata</option>
            <option value="KIA">KIA</option>
            <option value="mahindra">Mahindra</option>
            <option value="Toyota">Toyota</option>
            <option value="nissan">Nissan</option>
            <option value="ford">Ford</option>
            <option value="volkswagen">Volkswagen</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Vehicle Type</label>
          <select name="vehicleType" value={filters.vehicleType} onChange={handleFilterChange}>
            <option value="">Select</option>
            <option value="hatchback">Hatchback</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="pickup">Pickup</option>
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
  const [filters, setFilters] = useState({
    make: '',
    vehicleType: '',
    budget: '',
    transmission: '',
    fuelType: ''
  });
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
      console.log('Fetched filtered listings:', data);
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
  const CarListing = ({ listing }) => {
      const [showSellerDetails, setShowSellerDetails] = useState(false);
      const [sellerInfo, setSellerInfo] = useState(null);
      const handleViewSellerDetails = async () => {
        try {
          if (!listing.userId) {
            throw new Error('No seller ID available');
          }
          console.log('Fetching details for user:', listing.userId);
          const data = await fetchSellerDetails(listing.userId); // Now this will work
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
              <span>{listing.kmsDriven} km</span>
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
          {listings.length > 0 ? (
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
