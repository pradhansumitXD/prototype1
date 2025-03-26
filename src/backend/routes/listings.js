const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Listing = require('../models/listing');
// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
// Create new listing
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const listing = new Listing({
      ...req.body,
      imageUrl: req.file.filename, // Store only the filename
      status: 'pending'
    });
    await listing.save();
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Get approved listings
// Add this route to handle approved listings
router.get('/approved', async (req, res) => {
  try {
    const { brand, carType, minPrice, maxPrice, transmission, fuelType } = req.query;
    
    const filter = { status: 'approved' };
    
    if (brand) filter.brand = brand;
    if (carType) filter.carType = carType;
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    console.log('Filter query:', filter); // Debug log

    const approvedListings = await Listing.find(filter);
    res.json(approvedListings);
  } catch (error) {
    console.error('Error fetching approved listings:', error);
    res.status(500).json({ message: 'Error fetching approved listings' });
  }
});
// Update listing status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = JSON.parse(req.headers.user || '{}');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(400).json({ message: error.message });
  }
});
// Get all listings
router.get('/all', async (req, res) => {
  try {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    
    const listings = await Listing.find()
      .select('adTitle brand model price status imageUrl carType transmission fuelType makeYear engine kmsDriven description ownership')
      .sort({ createdAt: -1 });
    
    const sanitizedListings = listings.map(listing => ({
      _id: listing._id,
      adTitle: listing.adTitle,
      title: listing.adTitle,  
      brand: listing.brand,
      model: listing.model,    
      price: listing.price,
      status: listing.status,
      imageUrl: listing.imageUrl,
      carType: listing.carType,
      transmission: listing.transmission,
      fuelType: listing.fuelType
    }));

    console.log('Sending listings:', sanitizedListings);
    res.json(sanitizedListings);
  } catch (error) {
    console.error('Error in /all route:', error);
    res.status(500).json({ message: error.message });
  }
});
// Add this delete endpoint before module.exports
router.delete('/:id', async (req, res) => {
  try {
    const user = JSON.parse(req.headers.user || '{}');
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Delete the listing
    await Listing.findByIdAndDelete(req.params.id);

    // Delete associated image if it exists
    if (listing.imageUrl) {
      const imagePath = path.join(__dirname, '../uploads', listing.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
