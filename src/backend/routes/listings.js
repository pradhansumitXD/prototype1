const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Listing = require('../models/listing');
const uploadsConfig = require('../config/uploadConfig');

// Update storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadsConfig.path)) {
      fs.mkdirSync(uploadsConfig.path, { recursive: true });
    }
    cb(null, uploadsConfig.path);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
// Create new listing
router.post('/create', upload.array('images', 5), async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(file => file.filename) : [];
    
    const listing = new Listing({
      ...req.body,
      imageUrl: imageUrls,
      status: 'pending'
    });
    
    await listing.save();
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(400).json({ message: error.message });
  }
});
// Get approved listings
// route to handle approved listings
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

    console.log('Filter query:', filter); 

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
// Adding this delete endpoint before module.exports
router.delete('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Parse user info from headers
    const userInfo = JSON.parse(req.headers.user || '{}');
    const isAdmin = userInfo.role === 'admin';
    const isOwner = listing.userId.toString() === userInfo.id;

    // Check if user is either admin or the listing owner
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own listings.' });
    }

    // Delete associated image files from uploads directory
    if (listing.imageUrl) {
      const images = Array.isArray(listing.imageUrl) ? listing.imageUrl : [listing.imageUrl];
      images.forEach(image => {
        const imagePath = path.join(__dirname, '../../uploads', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image: ${imagePath}`);
        }
      });
    }

    // Delete the listing from database
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: error.message });
  }
});
// Add this route for user listings
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userListings = await Listing.find({ userId: userId })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(userListings);
  } catch (error) {
    console.error('Server error fetching user listings:', error);
    res.status(500).json({ message: 'Error fetching user listings' });
  }
});

// Adding this update route before module.exports
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Parse user info and check permissions
    const userInfo = JSON.parse(req.headers.user || '{}');
    const isAdmin = userInfo.role === 'admin';
    const isOwner = listing.userId.toString() === userInfo.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied. You can only update your own listings.' });
    }

    // Handle images
    let finalImageUrls = [];

    // Keep existing images that weren't removed
    if (req.body.currentImages) {
      const currentImages = JSON.parse(req.body.currentImages);
      finalImageUrls = [...currentImages];

      // Delete removed images from storage
      const removedImages = listing.imageUrl.filter(img => !currentImages.includes(img));
      removedImages.forEach(img => {
        const imagePath = path.join(__dirname, '../../uploads', img);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => file.filename);
      finalImageUrls = [...finalImageUrls, ...newImageUrls];
    }

    // Update the listing with all data including images
    const updatedData = {
      ...req.body,
      imageUrl: finalImageUrls,
      userId: listing.userId 
    };

    delete updatedData.currentImages;
    delete updatedData._id;

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;