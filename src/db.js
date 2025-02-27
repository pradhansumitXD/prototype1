const mongoose = require('mongoose');

// Your MongoDB Atlas connection string (replace with your actual details)
const uri = 'mongodb+srv://carmarketplace:carmarketplace@cluster0.4fjzu.mongodb.net/';

// Connect to MongoDB Atlas
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });
