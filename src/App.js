import React from 'react';
import { Route, Routes } from 'react-router-dom'; 
import LandingPage from './landingpage';  
import Login from './Login';  
import Signup from './Signup';  
import BuyPage from './buypage'; 
import SellPage from './sellpage';  
import CompareCar from './comparecar';  
import CarService from './carservice';  
import AdminDashboard from './AdminDashboard';  // Import the AdminDashboard component
import ManageUsers from './ManageUsers';  // Component to manage users
import ManageCars from './ManageCars';  // Component to manage cars

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />  
        <Route path="/Login" element={<Login />} />    
        <Route path="/Signup" element={<Signup />} />  
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/sell" element={<SellPage />} />  
        <Route path="/compare" element={<CompareCar />} /> 
        <Route path="/service" element={<CarService />} />  

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />  {/* Admin Dashboard */}
        <Route path="/admin/users" element={<ManageUsers />} />  {/* Manage Users */}
        <Route path="/admin/cars" element={<ManageCars />} />  {/* Manage Cars */}
      </Routes>
    </div>
  );
}

export default App;
