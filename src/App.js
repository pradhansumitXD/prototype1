import React from 'react';
import { Route, Routes } from 'react-router-dom'; 
import LandingPage from './pages/landingpage';  
import Login from './pages/Login';  
import Signup from './pages/Signup';  
import BuyPage from './pages/buypage'; 
import SellPage from './pages/sellpage';  
import CompareCar from './pages/comparecar';  
import CarService from './pages/carservice';  
import AdminDashboard from './pages/AdminDashboard';  
import ManageUsers from './pages/ManageUsers';  
import ManageCars from './pages/ManageCars';  

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />  
        <Route path="/login" element={<Login />} />    
        <Route path="/signup" element={<Signup />} />  
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/sell" element={<SellPage />} />  
        <Route path="/compare" element={<CompareCar />} /> 
        <Route path="/service" element={<CarService />} />  

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />  
        <Route path="/admin/users" element={<ManageUsers />} />  
        <Route path="/admin/cars" element={<ManageCars />} />  
      </Routes>
    </div>
  );
}

export default App;
