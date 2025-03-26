import React, { useState } from "react";
import Navbar from "./navbar"; 
import "./sellpage.css";

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
    image: null,
    adTitle: "",
    description: "",
    kmsDriven: "", // Add this line
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.id) {
        throw new Error('Please login to create a listing');
      }

      const formData = new FormData();
      formData.append('userId', user.id);  
      
      const { year, ...otherDetails } = carDetails;
      formData.append('makeYear', year);  
      
      // Append all other details
      Object.entries(otherDetails).forEach(([key, value]) => {
        if (key === 'image') {
          if (value) {
            formData.append('image', value);
          }
        } else {
          formData.append(key, value);
        }
      });

      const response = await fetch('http://localhost:5002/api/listings/create', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }

      alert('Listing created successfully!');
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
        image: null,
        adTitle: "",
        description: "",
      });

    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setCarDetails({
        ...carDetails,
        image: files[0]
      });
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

  return (
    <>
      <Navbar />
      <div className="sell-page-container">
        <div className="sell-form-container">
          <h1 className="sell-heading">Sell Your Car</h1>

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

              <div className="form-group">
                <label>Car Image</label>
                <input type="file" name="image" onChange={handleInputChange} required />
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
                <input type="number" name="price" value={carDetails.price} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={carDetails.description} onChange={handleInputChange} required />
              </div>

              <button type="submit" className="submit-btn">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default SellPage;