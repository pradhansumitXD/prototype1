import React, { useState, useEffect } from 'react';
import Navbar from './navbar'; 
import './buypage.css'; 
import car1 from '../assets/images/car1.jpg';

const maskText = (text) => {
  if (!text) return '';
  const visibleStart = text.slice(0, 2);
  const visibleEnd = text.slice(-2);
  const maskedLength = text.length - 4;
  const masked = '*'.repeat(maskedLength);
  return `${visibleStart}${masked}${visibleEnd}`;
};

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

const PreviewModal = ({ listing, onClose, fetchSellerDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);

  const images = Array.isArray(listing.imageUrl) 
    ? listing.imageUrl 
    : listing.imageUrl 
      ? [listing.imageUrl]
      : [];

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

  // In PreviewModal component
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return car1;
    
    try {
      const url = imageUrl.toString().trim();
      // Handle array of URLs
      if (Array.isArray(url)) {
        return url[0] ? processImageUrl(url[0]) : car1;
      }
      return processImageUrl(url);
    } catch (error) {
      console.error('Error in getImageUrl:', error);
      return car1;
    }
  };
  
  const processImageUrl = (url) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `http://localhost:5002${url}`;
    return `http://localhost:5002/uploads/${encodeURIComponent(url)}`;
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="preview-modal" onClick={onClose}>
      <div className="preview-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="preview-image-container">
          <button className="nav-btn prev" onClick={handlePrevImage}>❮</button>
          <div className="preview-image">
            <div className="image-wrapper">
              <img 
                src={getImageUrl(images[currentImageIndex])}
                alt={`${listing.adTitle} - Image ${currentImageIndex + 1}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = car1;
                }}
              />
            </div>
          </div>
          <button className="nav-btn next" onClick={handleNextImage}>❯</button>
          <div className="image-counter">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
        <div className="preview-details">
          <h2>{listing.adTitle}</h2>
          <p className="price">Rs. {Number(listing.price).toLocaleString('en-IN')}</p>
          <button 
            className="seller-details-btn" 
            onClick={handleViewSellerDetails}
          >
            View Seller Details
          </button>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="label">Brand:</span>
              <span>{listing.brand}</span>
            </div>
            <div className="spec-item">
              <span className="label">Model:</span>
              <span>{listing.model}</span>
            </div>
            <div className="spec-item">
              <span className="label">Year:</span>
              <span>{listing.makeYear}</span>
            </div>
            <div className="spec-item">
              <span className="label">Type:</span>
              <span>{listing.carType}</span>
            </div>
            <div className="spec-item">
              <span className="label">Fuel Type:</span>
              <span>{listing.fuelType}</span>
            </div>
            <div className="spec-item">
              <span className="label">Transmission:</span>
              <span>{listing.transmission}</span>
            </div>
            <div className="spec-item">
              <span className="label">Engine:</span>
              <span>{listing.engine}</span>
            </div>
            <div className="spec-item">
              <span className="label">KMs Driven:</span>
              <span>{listing.kmsDriven} KM</span>
            </div>
            <div className="spec-item">
              <span className="label">Ownership:</span>
              <span>{listing.ownership}</span>
            </div>
          </div>
          <div className="description">
            <h3>Description</h3>
            <p>{listing.description}</p>
          </div>
        </div>

        {showSellerDetails && sellerInfo && (
          <div className="seller-modal" onClick={(e) => {
            e.stopPropagation();
            setShowSellerDetails(false);
          }}>
            <div className="seller-modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowSellerDetails(false)}>×</button>
              <h3>Seller Information</h3>
              <p><strong>Name:</strong> {maskText(sellerInfo.username)}</p>
              <p><strong>Email:</strong> {maskText(sellerInfo.email)}</p>
              <p><strong>Phone:</strong> {maskText(sellerInfo.phone)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CarListing = ({ listing, onPreview, fetchSellerDetails }) => {
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [interestStatus, setInterestStatus] = useState('none');
  const [showNotification, setShowNotification] = useState(false);

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

  const getListingImage = (listing) => {
    try {
      if (!listing || !listing.imageUrl) return car1;

      if (Array.isArray(listing.imageUrl)) {
        if (listing.imageUrl.length > 0 && listing.imageUrl[0]) {
          const imageUrl = listing.imageUrl[0].toString().trim();
          return imageUrl.startsWith('/uploads/') 
            ? `http://localhost:5002${imageUrl}`
            : `http://localhost:5002/uploads/${encodeURIComponent(imageUrl)}`;
        }
      }

      if (typeof listing.imageUrl === 'string') {
        const imageUrl = listing.imageUrl.trim();
        return imageUrl.startsWith('/uploads/')
          ? `http://localhost:5002${imageUrl}`
          : `http://localhost:5002/uploads/${encodeURIComponent(imageUrl)}`;
      }

      return car1;
    } catch (error) {
      console.error('Error processing listing image:', error, listing?.imageUrl);
      return car1;
    }
  };

  const handleInterestClick = async (event) => {
    event.preventDefault();
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!storedUser || !token) {
        window.location.href = '/login';
        return;
      }

      const buyerId = storedUser.id || storedUser._id;

      if (buyerId === listing.userId) {
        alert("You cannot show interest in your own listing");
        return;
      }

      if (!listing._id || !buyerId || !listing.userId) {
        console.error('Missing required data:', { 
          listingId: listing._id, 
          buyerId: buyerId, 
          sellerId: listing.userId 
        });
        throw new Error('Missing required data for interest creation');
      }

      console.log('Sending interest request...');
      const response = await fetch('http://localhost:5002/api/interests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing._id,
          buyerId: buyerId,
          sellerId: listing.userId,
          status: 'pending'
        })
      });

      const data = await response.json();

      if (response.status === 409) {
        setInterestStatus('pending');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      try {
        const notificationResponse = await fetch('http://localhost:5002/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientId: listing.userId,
            buyerId: buyerId,  // Add buyerId
            message: `${storedUser.username} has shown interest in your listing: ${listing.adTitle}`,
            type: 'interest',
            listingId: listing._id,
            status: 'pending'  // Add status
          })
        });
      
        const notificationData = await notificationResponse.json();
        
        if (!notificationResponse.ok) {
          console.error('Failed to create notification:', notificationData);
          // Log more details for debugging
          console.log('Notification request details:', {
            recipientId: listing.userId,
            buyerId: buyerId,
            listingId: listing._id,
            type: 'interest'
          });
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      setInterestStatus('pending');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
    } catch (error) {
      console.error('Error in handleInterestClick:', error);
      alert(error.message || 'Failed to send interest. Please try again.');
    }
  };

  return (
    <div className="car-listing">
      <img 
        src={getListingImage(listing)}
        alt={listing?.adTitle || 'Car Image'}
        onClick={() => onPreview(listing)}
        style={{ cursor: 'pointer' }}
        onError={(e) => {
          console.error('Image load error:', listing?.imageUrl, typeof listing?.imageUrl);
          e.target.onerror = null;
          e.target.src = car1;
        }}
      />
      <div className="car-details">
        <h3>{listing.adTitle}</h3>
        <span className="price">Rs. {Number(listing.price).toLocaleString('en-IN')}</span>
        <div className="additional-info">
          <span>{listing.kmsDriven} KM</span>
          <span>{listing.transmission}</span>
          <span>{listing.makeYear}</span>
          <span>{listing.engine}</span>
        </div>
        <p>{listing.description}</p>
        <div className="button-group">
          <button onClick={handleViewSellerDetails}>View Seller Details</button>
          <button 
            onClick={handleInterestClick}
            className={`interest-btn ${interestStatus}`}
            disabled={interestStatus === 'pending'}
            type="button" // Explicitly set the button type
          >
            {interestStatus === 'none' && 'Show Interest'}
            {interestStatus === 'pending' && 'Interest Pending'}
            {interestStatus === 'accepted' && 'Interest Accepted'}
          </button>
        </div>
      </div>

      {showSellerDetails && sellerInfo && (
        <div className="seller-modal" onClick={() => setShowSellerDetails(false)}>
          <div className="seller-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Seller Details</h3>
            <p>
              <strong>Name: </strong>
              <span className="masked-info">
                {maskText(sellerInfo.username)}
              </span>
            </p>
            <p>
              <strong>Email: </strong>
              <span className="masked-info">
                {maskText(sellerInfo.email)}
              </span>
            </p>
            <p>
              <strong>Phone: </strong>
              <span className="masked-info">
                {maskText(sellerInfo.phone)}
              </span>
            </p>
            <button className="close-btn" onClick={() => setShowSellerDetails(false)}>×</button>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="interest-success-popup">
          <div className="interest-success-content">
            <span className="success-icon">✓</span>
            <p>Interest sent successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

function BuyPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewListing, setPreviewListing] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
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
      setError(null); // Reset any previous errors
      
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
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000 
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setListings(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings. Please check your connection and try again.');
      setListings([]); 
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
    fetchApprovedListings(activeFilters);
  };

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handlePreview = (listing) => {
    setPreviewListing(listing);
    setShowPreview(true);
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
              <CarListing 
                key={listing._id} 
                listing={listing}
                onPreview={handlePreview}
                fetchSellerDetails={fetchSellerDetails}
              />
            ))
          ) : (
            <p>No approved listings available</p>
          )}
        </div>
      </div>
      {showPreview && previewListing && (
        <PreviewModal 
          listing={previewListing} 
          onClose={() => setShowPreview(false)} 
          fetchSellerDetails={fetchSellerDetails}
        />
      )}
    </>
  );
}

export default BuyPage;