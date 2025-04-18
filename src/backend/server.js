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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/listings', listingsRouter);
app.use('/api/services', servicesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
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