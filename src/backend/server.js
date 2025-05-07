require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');  
const fs = require('fs');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const listingsRouter = require('./routes/listings');
const servicesRouter = require('./routes/services');
const uploadsConfig = require('./config/uploadConfig');
const interestsRouter = require('./routes/interests');
const notificationsRouter = require('./routes/notifications');

const app = express();

// Enhanced Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow React app
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Upload directory setup
const uploadsPath = path.join(__dirname, '../../uploads');
console.log('Current uploads path:', uploadsPath); // Add this to debug

// Only create if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/listings', listingsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/interests', interestsRouter);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      message: 'Authentication Error', 
      details: err.message 
    });
  }

  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

// Server startup
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Add this with your other route registrations
app.use('/api/notifications', notificationsRouter);