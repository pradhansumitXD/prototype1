import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import './carservice.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faUser, faTools } from '@fortawesome/free-solid-svg-icons';

library.add(faMapMarkerAlt, faPhone, faUser, faTools);

function CarService() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/services/all');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'default-service-image.jpg';
    
    try {
      if (imageUrl.startsWith('data:image')) {
        return imageUrl;
      }
      
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }

      return `http://localhost:5002/uploads/${imageUrl}`;
      
    } catch (error) {
      console.error('Error processing image URL:', error);
      return 'default-service-image.jpg';
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Car Services</h1>
        
        <div className="service-grid">
          {services.map(service => (
            <div key={service._id} className="service-card">
              <img 
                src={getImageUrl(service.imageUrl)}
                alt={service.title}
                onError={(e) => {
                  console.error('Image load error:', service.imageUrl);
                  e.target.onerror = null;
                  e.target.src = 'default-service-image.jpg';
                }}
              />
              <div className="service-content">
                <h2>{service.title}</h2>
                <div className="vendor-info">
                  <h3>
                    Vendor Information
                  </h3>
                  <p className="vendor-name">
                    <FontAwesomeIcon icon={faUser} /> 
                    {service.vendorName || 'Not specified'}
                  </p>
                  <p className="vendor-contact">
                    <FontAwesomeIcon icon={faPhone} /> 
                    {service.contactNumber}
                  </p>
                  <p className="vendor-location">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> 
                    {service.location}
                  </p>
                </div>
                <div className="service-info">
                  <h3>
                    Service Information
                  </h3>
                  <p className="service-type">
                    {service.serviceType}
                  </p>
                  <p className="service-description">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CarService;
