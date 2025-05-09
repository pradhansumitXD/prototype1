import React, { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'; 
import LandingPage from './pages/landingpage';  
import Profile from './pages/profile'; 
import Login from './pages/Login';  
import Signup from './pages/Signup';  
import BuyPage from './pages/buypage'; 
import SellPage from './pages/sellpage';  
import CompareCar from './pages/comparecar';  
import CarService from './pages/carservice';  
import AdminDashboard from './pages/AdminDashboard';  
import ManageUsers from './pages/ManageUsers';
import ManageServices from './pages/ManageServices';
import AdminSettings from './pages/AdminSettings';
import ManageListings from './pages/ManageListings';
import AdminUserCreate from './pages/AdminUserCreate';  
import EmailVerification from './pages/EmailVerification';  // Add this import
import './styles/modal.css';

const ProtectedRoute = ({ element, redirectTo, condition }) => {
  return condition ? element : <Navigate to={redirectTo} replace />;
};

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Navigate to="/" state={{ showModal: 'login' }} />} />
        <Route path="/signup" element={<Navigate to="/" state={{ showModal: 'signup' }} />} />
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/sell" element={<SellPage />} />  
        <Route path="/compare" element={<CompareCar />} /> 
        <Route path="/service" element={<CarService />} />  

        <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="/admin-dashboard/*" element={
          <ProtectedRoute 
            element={<AdminDashboard />} 
            redirectTo="/" 
            condition={isAdmin} 
          />
        }>
          <Route path="users" element={<ManageUsers />} />
          <Route path="listings" element={<ManageListings />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="create-admin" element={<AdminUserCreate />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        // Add this route in your React Router setup
        <Route path="/verify-email/:token" element={<EmailVerification />} />
      </Routes>
    </div>
  );
}

export default App;