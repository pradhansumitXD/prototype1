const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Listing = require('../models/listing');
const uploadsConfig = require('../config/uploadConfig');
const auth = require('../middleware/auth'); 

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

router.delete('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

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

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: error.message });
  }
});
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

router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    let finalImageUrls = [];

    // Handle current images
    if (req.body.currentImages) {
      const currentImages = JSON.parse(req.body.currentImages);
      finalImageUrls = [...currentImages];

      // Remove images that are no longer needed
      const removedImages = listing.imageUrl.filter(img => !currentImages.includes(img));
      removedImages.forEach(img => {
        const imagePath = path.join(uploadsConfig.path, img);
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

    // Validate total number of images
    if (finalImageUrls.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed' });
    }

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

// Reset interest status
router.post('/:listingId/reset-interest', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { buyerId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Remove the interest record if it exists
    if (listing.interests) {
      listing.interests = listing.interests.filter(interest => 
        interest.buyerId.toString() !== buyerId.toString()
      );
      await listing.save();
    }

    res.json({ message: 'Interest status reset successfully' });
  } catch (error) {
    console.error('Error resetting interest:', error);
    res.status(500).json({ message: 'Error resetting interest status' });  
  }
});
router.get('/:listingId/check-interest/:buyerId', auth, async (req, res) => {
  try {
    const { listingId, buyerId } = req.params;
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const existingInterest = listing.interests?.find(interest => 
      interest.buyerId.toString() === buyerId.toString()
    );

    res.json({ 
      hasInterest: !!existingInterest,
      status: existingInterest ? existingInterest.status : 'none'
    });
  } catch (error) {
    console.error('Error checking interest:', error);
    res.status(500).json({ message: 'Error checking interest status' });
  }
});

router.post('/:listingId/create-interest', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { buyerId, buyerName } = req.body;

    const listing = await Listing.findById(listingId);
    
    // Check if listing exists and is active
    if (!listing) {
      return res.status(410).json({ 
        message: 'This listing is no longer available',
        status: 'deleted'
      });
    }

    // Check if listing is still approved
    if (listing.status !== 'approved') {
      return res.status(400).json({ 
        message: 'This listing is no longer active',
        status: 'inactive'
      });
    }

    // Check for existing interest
    const existingInterest = listing.interests?.find(interest => 
      interest.buyerId.toString() === buyerId.toString()
    );

    if (existingInterest) {
      if (existingInterest.status === 'rejected') {
        existingInterest.status = 'pending';
        existingInterest.createdAt = new Date(); 
        await listing.save();
        return res.status(201).json({ 
          message: 'Interest resubmitted successfully', 
          status: 'pending' 
        });
      } else {
        return res.status(409).json({ 
          message: 'You have already shown interest in this listing',
          status: existingInterest.status 
        });
      }
    }

    if (!listing.interests) {
      listing.interests = [];
    }

    listing.interests.push({
      buyerId,
      buyerName, 
      status: 'pending',
      createdAt: new Date()
    });

    await listing.save();
    res.status(201).json({ message: 'Interest created', status: 'pending' });

  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({ message: 'Error creating interest' });
  }
});
router.get('/:listingId/interests', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const sanitizedInterests = listing.interests.map(interest => ({
      buyerId: interest.buyerId,
      buyerName: interest.buyerName,
      status: interest.status,
      createdAt: interest.createdAt,
      contactInfo: interest.status === 'accepted' ? {
        email: interest.buyerEmail,
        phone: interest.buyerPhone
      } : null
    }));

    res.json(sanitizedInterests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ message: 'Error fetching interests' });
  }
});
// Route to reject interest
router.post('/:id/reject-interest', auth, async (req, res) => {
  try {
    const { buyerId } = req.body;
    const listingId = req.params.id;

    console.log('Rejecting interest:', { listingId, buyerId }); 

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (!listing.interests) {
      listing.interests = [];
    }

    const interestIndex = listing.interests.findIndex(
      interest => interest.buyerId && interest.buyerId.toString() === buyerId.toString()
    );

    console.log('Interest index:', interestIndex); 
    console.log('Current interests:', listing.interests); 
    if (interestIndex === -1) {
      return res.status(404).json({ message: 'Interest not found for this buyer' });
    }

    // Update the interest status to rejected
    listing.interests[interestIndex].status = 'rejected';
    listing.markModified('interests'); 
    await listing.save();

    res.json({ message: 'Interest rejected successfully' });
  } catch (error) {
    console.error('Error rejecting interest:', error);
    res.status(500).json({ 
      message: 'Error rejecting interest', 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});
router.post('/:listingId/accept-interest', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { buyerId, sellerInfo } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const interest = listing.interests?.find(int => 
      int.buyerId.toString() === buyerId.toString()
    );

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    // Update interest with seller info and status
    interest.status = 'accepted';
    interest.sellerInfo = sellerInfo; 
    interest.acceptedAt = new Date();

    await listing.save();
    res.json({ 
      message: 'Interest accepted successfully',
      status: 'accepted',
      sellerInfo 
    });
  } catch (error) {
    console.error('Error accepting interest:', error);
    res.status(500).json({ message: 'Error accepting interest' });
  }
});

router.get('/:listingId/check-interest/:buyerId', auth, async (req, res) => {
  try {
    const { listingId, buyerId } = req.params;
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const existingInterest = listing.interests?.find(interest => 
      interest.buyerId.toString() === buyerId.toString()
    );

    res.json({ 
      hasInterest: !!existingInterest,
      status: existingInterest ? existingInterest.status : 'none',
      sellerInfo: existingInterest?.status === 'accepted' ? existingInterest.sellerInfo : null
    });
  } catch (error) {
    console.error('Error checking interest:', error);
    res.status(500).json({ message: 'Error checking interest status' });
  }
});
module.exports = router;