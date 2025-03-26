import React, { useState, useEffect } from 'react';
import Navbar from './navbar'; 
import './buypage.css'; 
import car1 from '../assets/images/car1.jpg';

const FilterSection = ({ filters, handleFilterChange, handleSearch, resetFilters }) => {
  return (
    <div className="left-column">
      <h1>Discover a Car</h1>
      <div className="filter-options">
        <h2>Make Your Own Model</h2>
        <div className="filter-item">
          <label>Select Brand</label>
          <select name="brand" value={filters.brand} onChange={handleFilterChange}>
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
            <option value="100000-500000">1,00,000 - 5,00,000</option>
            <option value="500000-1000000">5,00,000 - 10,00,000</option>
            <option value="1000000-2000000">10,00,000 - 20,00,000</option>
            <option value="2000000-3000000">20,00,000 - 30,00,000</option>
            <option value="3000000-4000000">30,00,000 - 40,00,000</option>
            <option value="4000000-5000000">40,00,000 - 50,00,000</option>
            <option value="5000000-999999999">Above 50,00,000</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Search by Transmission</label>
          <select name="transmission" value={filters.transmission} onChange={handleFilterChange}>
            <option value="">Select</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
            <option value="EV">EV</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Search by Fuel Type</label>
          <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
            <option value="">Select</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="EV">EV</option>
          </select>
        </div>

        <div className="filter-item">
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
      <div className="filter-actions">
        <button onClick={resetFilters} className="reset-btn">Reset Filters</button>
      </div>
    </div>
  );
};

function BuyPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    brand: '',
    carType: '',
    budget: '',
    transmission: '',
    fuelType: ''
  });

  const fetchSellerDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5002/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch seller details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching seller details:', error);
      throw error;
    }
  };

  const fetchApprovedListings = async (filterParams) => {
    try {
      setLoading(true);
      let url = 'http://localhost:5002/api/listings/approved';
      
      if (filterParams) {
        const queryParams = new URLSearchParams();
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value) {
            if (key === 'budget') {
              const [min, max] = value.split('-');
              queryParams.append('minPrice', min);
              queryParams.append('maxPrice', max);
            } else {
              queryParams.append(key, value);
            }
          }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      console.log('Fetching URL:', url); 
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Received data:', data); 
      setListings(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const activeFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        activeFilters[key] = value;
      }
    });
    console.log('Active filters:', activeFilters); 
    fetchApprovedListings(activeFilters);
  };

  // Add resetFilters function
  const resetFilters = () => {
    setFilters({
      brand: '',
      carType: '',
      budget: '',
      transmission: '',
      fuelType: ''
    });
    fetchApprovedListings();
  };

  useEffect(() => {
    fetchApprovedListings();
  }, []);

  const CarListing = ({ listing }) => {
    const [showSellerDetails, setShowSellerDetails] = useState(false);
    const [sellerInfo, setSellerInfo] = useState(null);
    
    const handleViewSellerDetails = async () => {
      try {
        if (!listing.userId) throw new Error('No seller ID available');
        const data = await fetchSellerDetails(listing.userId);
        setSellerInfo(data);
        setShowSellerDetails(true);
      } catch (error) {
        console.error('Error fetching seller details:', error);
        alert('Could not fetch seller details. Please try again later.');
      }
    };
  
    const filename = listing.imageUrl.split('/').pop().split('\\').pop();
    const imageUrl = `http://localhost:5002/uploads/${filename}`;
    
    return (
      <div className="car-listing">
        <img 
          src={imageUrl} 
          alt={listing.adTitle} 
          onError={(e) => {
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

  return (
    <>
      <Navbar />
      <div className="buy-section">
        <FilterSection 
          filters={filters} 
          handleFilterChange={handleFilterChange} 
          handleSearch={handleSearch}
          resetFilters={resetFilters}
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