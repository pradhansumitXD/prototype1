import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom'; 
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
import ManageCars from './pages/ManageCars';  

// ProtectedRoute component to protect specific routes
const ProtectedRoute = ({ element, redirectTo, condition }) => {
  return condition ? element : <Navigate to={redirectTo} replace />;
};

function App() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'admin'; 

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/login" element={<Login />} />    
        <Route path="/signup" element={<Signup />} />  
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/sell" element={<SellPage />} />  
        <Route path="/compare" element={<CompareCar />} /> 
        <Route path="/service" element={<CarService />} />  

        {/* Admin Routes (Protected) */}
        <Route 
          path="/admin" 
          element={<Navigate to="/admin-dashboard" replace />} 
        />
        <Route 
          path="/admin-dashboard/*" 
          element={
            <ProtectedRoute 
              element={<AdminDashboard />} 
              redirectTo="/" 
              condition={isAdmin} 
            />
          }
        />  
        <Route 
          path="/admin-dashboard/users" 
          element={
            <ProtectedRoute 
              element={<ManageUsers />} 
              redirectTo="/" 
              condition={isAdmin} 
            />
          }
        />  
        <Route 
          path="/admin-dashboard/cars" 
          element={
            <ProtectedRoute 
              element={<ManageCars />} 
              redirectTo="/" 
              condition={isAdmin} 
            />
          }
        />  
      </Routes>
    </div>
  );
}

export default App;