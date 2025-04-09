import React, { useState } from 'react';
import Navbar from './navbar';
import './comparecar.css';

function CompareCar() {
  const [car1Search, setCar1Search] = useState('');
  const [car2Search, setCar2Search] = useState('');
  const [car1Details, setCar1Details] = useState(null);
  const [car2Details, setCar2Details] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCarDetails = async (search, isFirstCar) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?model=${search}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '135387ff6amshf1f1e0b2db73c25p1b1147jsn666837a578b1', 
          'X-RapidAPI-Host': 'cars-by-api-ninjas.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch car data');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const carData = {
          make: data[0].make,
          model: data[0].model,
          year: data[0].year,
          vehicleType: data[0].class,
          fuel_type: data[0].fuel_type,
          transmission: data[0].transmission,
          displacement: data[0].displacement,
          cylinders: data[0].cylinders,
          drive: data[0].drive,
          highway_mpg: data[0].highway_mpg,
          city_mpg: data[0].city_mpg
        };

        if (isFirstCar) {
          setCar1Details(carData);
        } else {
          setCar2Details(carData);
        }
      } else {
        setError(`No results found for ${search}`);
      }
    } catch (error) {
      setError('Failed to fetch car details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e, isFirstCar) => {
    e.preventDefault();
    const search = isFirstCar ? car1Search : car2Search;
    if (search.trim()) {
      fetchCarDetails(search, isFirstCar);
    }
  };

  return (
    <div className="compare-car-container">
      <Navbar />
      <div className="compare-car-content">
        <h1>Compare Cars</h1>
        
        <div className="car-selection">
          <div className="car-search-box">
            <h3>First Car</h3>
            <form onSubmit={(e) => handleSearch(e, true)}>
              <input
                type="text"
                value={car1Search}
                onChange={(e) => setCar1Search(e.target.value)}
                placeholder="Enter car model..."
              />
              <button type="submit">Search</button>
            </form>
          </div>

          <div className="car-search-box">
            <h3>Second Car</h3>
            <form onSubmit={(e) => handleSearch(e, false)}>
              <input
                type="text"
                value={car2Search}
                onChange={(e) => setCar2Search(e.target.value)}
                placeholder="Enter car model..."
              />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        {(car1Details || car2Details) && (
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Specifications</th>
                  <th>{car1Details ? car1Details.make + ' ' + car1Details.model : 'Car 1'}</th>
                  <th>{car2Details ? car2Details.make + ' ' + car2Details.model : 'Car 2'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Make</td>
                  <td>{car1Details?.make || '-'}</td>
                  <td>{car2Details?.make || '-'}</td>
                </tr>
                <tr>
                  <td>Model</td>
                  <td>{car1Details?.model || '-'}</td>
                  <td>{car2Details?.model || '-'}</td>
                </tr>
                <tr>
                  <td>Year</td>
                  <td>{car1Details?.year || '-'}</td>
                  <td>{car2Details?.year || '-'}</td>
                </tr>
                <tr>
                  <td>Vehicle Type</td>
                  <td>{car1Details?.vehicleType || '-'}</td>
                  <td>{car2Details?.vehicleType || '-'}</td>
                </tr>
                <tr>
                  <td>Fuel Type</td>
                  <td>{car1Details?.fuel_type || '-'}</td>
                  <td>{car2Details?.fuel_type || '-'}</td>
                </tr>
                <tr>
                  <td>Transmission</td>
                  <td>{car1Details?.transmission || '-'}</td>
                  <td>{car2Details?.transmission || '-'}</td>
                </tr>
                <tr>
                  <td>Engine Size (L)</td>
                  <td>{car1Details?.displacement || '-'}</td>
                  <td>{car2Details?.displacement || '-'}</td>
                </tr>
                <tr>
                  <td>Cylinders</td>
                  <td>{car1Details?.cylinders || '-'}</td>
                  <td>{car2Details?.cylinders || '-'}</td>
                </tr>
                <tr>
                  <td>Drive</td>
                  <td>{car1Details?.drive || '-'}</td>
                  <td>{car2Details?.drive || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompareCar;