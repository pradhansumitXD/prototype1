import React, { useState } from 'react';
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
const Buypage = () => {
  const [filters, setFilters] = useState({
    make: '',
    vehicleType: '',
    budget: '',
    transmission: '',
    fuelType: ''
  });

  const carListings = [
    {
      id: 1,
      photo: car1,
      name: 'Hyundai Creta - 2016 Model',
      price: '28,50,000 NPR',
      kilometers: '55,000 km',
      transmission: 'Manual',
      makeYear: '2016',
      engine: '1.6L',
      description: 'Great condition, low mileage.',
    },
    {
      id: 2,
      photo: car2,
      name: 'KIA Seltos - 2022 Model',
      price: '40,00,000 NPR',
      kilometers: '15,000 km',
      transmission: 'Automatic',
      makeYear: '2022',
      engine: '2.0L',
      description: 'Well-maintained and reliable.',
    },
    {
      id: 3,
      photo: car3,
      name: 'Suzuki Fronx - 2018 Model',
      price: '20,00,000 NPR',
      kilometers: '40,000 km',
      transmission: 'Manual',
      makeYear: '2018',
      engine: '1.2L',
      description: 'Excellent condition, low mileage.',
    },
    {
      id: 4,
      photo: car4,
      name: 'Tata Nexon EV - 2020 Model',
      price: '25,00,000 NPR',
      kilometers: '25,000 km',
      transmission: 'Automatic',
      makeYear: '2020',
      engine: 'EV',
      description: 'Brand new, no issues.',
    },
    {
      id: 5,
      photo: car5,
      name: 'Suzuki Breeza - 2016 Model',
      price: '23,00,000 NPR',
      kilometers: '46,000 km',
      transmission: 'Manual',
      makeYear: '2016',
      engine: '1.2L',
      description: 'Excellent condition, low mileage.',
    },
    {
      id: 6,
      photo: car6,
      name: 'KIA Sonet - 2022 Model',
      price: '33,00,000 NPR',
      kilometers: '12,000 km',
      transmission: 'Manual',
      makeYear: '2022',
      engine: '1.2L',
      description: 'Brand new, no issues.',
    },
    {
      id: 7,
      photo: car7,
      name: 'Toyota Rav4 - 2020 Model',
      price: '63,00,000 NPR',
      kilometers: '20,000 km',
      transmission: 'Automatic',
      makeYear: '2020',
      engine: '2.5L',
      description: 'Excellent condition, low mileage.',
    },
    {
      id: 8,
      photo: car8,
      name: 'Volswagen Polo - 2019 Model',
      price: '28,00,000',
      kilometers: '52,000 km',
      transmission: 'Manual',
      makeYear: '2019',
      engine: '1.5L',
      description: 'Brand new, no issues.',
    },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
  };

  return (
    <>
      <Navbar /> 
      <div className="buy-section">
        <FilterSection filters={filters} handleFilterChange={handleFilterChange} handleSearch={handleSearch} />

        <div className="right-column">
          {carListings.map((car) => (
            <CarListing key={car.id} car={car} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Buypage;
