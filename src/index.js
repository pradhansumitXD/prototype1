import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Create the root using the new createRoot method in React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your app inside the root element
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
