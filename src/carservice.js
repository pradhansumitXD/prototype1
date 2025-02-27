import React from 'react';
import Navbar from './navbar';
import './carservice.css';
import carservice1 from './assets/images/car-wash.jpg';
import carservice2 from './assets/images/car-towing.jpg';

function CarService() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Car Services</h1>
        
        <div className="service-grid">
          {/* Car Wash Service */}
          <div className="service-card">
            <img 
              src={carservice1} 
              alt="Car Wash Service" 
            />
            <h2>Car Wash Service</h2>
            <p>Get a professional car wash to keep your vehicle clean and shiny.</p>
          </div>
          
          {/* Car Towing Service */}
          <div className="service-card">
            <img 
              src={carservice2} 
              alt="Car Towing Service" 
            />
            <h2>Car Towing Service</h2>
            <p>Reliable towing services available for emergencies and breakdowns.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarService;
