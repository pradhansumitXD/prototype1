import React, { useState } from "react";
import Navbar from "./navbar"; 
import "./sellpage.css";
import { FaCamera, FaTimes } from 'react-icons/fa';

function SellPage() {
  const [carDetails, setCarDetails] = useState({
    brand: "",
    model: "",
    carType: "",
    fuelType: "",
    year: "",
    transmission: "",
    engine: "",
    ownership: "",
    price: "",
    adTitle: "",
    description: "",
    kmsDriven: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add this to your state declarations at the top
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Modify the handleSubmit function's success handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Reset success message
  
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.id) {
        throw new Error('Please login to create a listing');
      }

      if (carDetails.images.length === 0) {
        throw new Error('Please upload at least one image');
      }

      const formData = new FormData();
      
      // Add each image individually
      carDetails.images.forEach((image) => {
        formData.append('images', image); // Changed from 'images[]' to 'images'
      });

      // Add all other fields
      formData.append('userId', user.id);
      formData.append('brand', carDetails.brand);
      formData.append('model', carDetails.model);
      formData.append('carType', carDetails.carType);
      formData.append('fuelType', carDetails.fuelType);
      formData.append('makeYear', carDetails.year);
      formData.append('transmission', carDetails.transmission);
      formData.append('engine', carDetails.engine);
      formData.append('ownership', carDetails.ownership);
      formData.append('kmsDriven', carDetails.kmsDriven);
      formData.append('price', carDetails.price);
      formData.append('adTitle', carDetails.adTitle);
      formData.append('description', carDetails.description);

      const response = await fetch('http://localhost:5002/api/listings/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }

      const data = await response.json();
      setSuccessMessage('Listing created successfully! Redirecting to home page...');
      
      // Reset form
      setCarDetails({
        brand: "",
        model: "",
        carType: "",
        fuelType: "",
        year: "",
        transmission: "",
        engine: "",
        ownership: "",
        price: "",
        adTitle: "",
        description: "",
        kmsDriven: "",
        images: [],
      });
      
      // Delay redirect to show success message and redirect to landing page
      setTimeout(() => {
        window.location.href = '/';  // Changed from '/buy' to '/'
      }, 2000);
  
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      const newImages = Array.from(files);
      const totalImages = carDetails.images.length + newImages.length;
      if (totalImages <= 5) {
        setCarDetails({
          ...carDetails,
          images: [...carDetails.images, ...newImages]
        });
      }
    } else if (name === "price" || name === "year" || name === "kmsDriven") {
      setCarDetails({
        ...carDetails,
        [name]: value ? parseInt(value) : ""
      });
    } else {
      setCarDetails({
        ...carDetails,
        [name]: value
      });
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setCarDetails(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Add this in the JSX, right after the <h1> element
  return (
    <>
      <Navbar />
      <div className="sell-page-container">
        <div className="sell-form-container">
          <h1 className="sell-heading">Sell Your Car</h1>
          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="error-message">{error}</div>}
          <form className="sell-form" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-left">
              <div className="form-group">
                <label>Car Brand</label>
                <select name="brand" value={carDetails.brand} onChange={handleInputChange} required>
                  <option value="">Select Brand</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Suzuki">Suzuki</option>
                  <option value="Tata">Tata</option>
                  <option value="KIA">KIA</option>
                  <option value="Ford">Ford</option>
                  <option value="Mahindra">Mahindra</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label>Model</label>
                <input type="text" name="model" value={carDetails.model} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Car Type</label>
                <select name="carType" value={carDetails.carType} onChange={handleInputChange} required>
                  <option value="">Select Car Type</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fuel Type</label>
                <select name="fuelType" value={carDetails.fuelType} onChange={handleInputChange} required>
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="EV">EV</option>
                </select>
              </div>

              <div className="form-group">
                <label>Make Year</label>
                <input type="number" name="year" value={carDetails.year} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Transmission</label>
                <select name="transmission" value={carDetails.transmission} onChange={handleInputChange} required>
                  <option value="">Select Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="EV">EV</option>
                </select>
              </div>

              <div className="form-group">
                <label>Engine</label>
                <select name="engine" value={carDetails.engine} onChange={handleInputChange} required>
                  <option value="">Select Engine</option>
                  <option value="1.2L">1.2L</option>
                  <option value="1.5L">1.5L</option>
                  <option value="1.6L">1.6L</option>
                  <option value="2.0L">2.0L</option>
                  <option value="2.2L">2.2L</option>
                  <option value="2.8L">2.8L</option>
                  <option value="Electric">EV</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ownership</label>
                <select name="ownership" value={carDetails.ownership} onChange={handleInputChange} required>
                  <option value="">Select Ownership</option>
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                  <option value="Third">Third</option>
                </select>
              </div>

              <div className="form-group">
                <label>Kilometers Driven</label>
                <input 
                  type="number" 
                  name="kmsDriven" 
                  value={carDetails.kmsDriven} 
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="form-group image-upload-container">
                <label>Car Images (Up to 5 images)</label>
                <div className="image-upload-grid">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="upload-box">
                      {index < carDetails.images.length ? (
                        <div className="image-preview-box">
                          <img
                            src={URL.createObjectURL(carDetails.images[index])}
                            alt={`Car preview ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <label 
                          htmlFor={`image-input-${index}`} 
                          className={`upload-label ${carDetails.images.length >= 5 ? 'disabled' : ''}`}
                        >
                          <FaCamera className="upload-icon" />
                          <span>Add Photo</span>
                          <input
                            id={`image-input-${index}`}
                            type="file"
                            name="images"
                            onChange={handleInputChange}
                            accept="image/*"
                            disabled={carDetails.images.length >= 5}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                {carDetails.images.length === 0 && (
                  <p className="upload-hint">Please upload at least one image of your car</p>
                )}
                {carDetails.images.length === 5 && (
                  <p className="max-images-hint">Maximum number of images reached (5)</p>
                )}
              </div>

              <div className="form-group">
                <label>Ad Title</label>
                <input 
                  type="text" 
                  name="adTitle" 
                  value={carDetails.adTitle} 
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Price</label>
                <input 
                  type="number" 
                  name="price" 
                  value={carDetails.price} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={carDetails.description} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default SellPage;