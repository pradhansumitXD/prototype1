const mongoose = require('mongoose');

const uri = 'mongodb+srv://carmarketplace:carmarketplace@cluster0.4fjzu.mongodb.net/';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });
