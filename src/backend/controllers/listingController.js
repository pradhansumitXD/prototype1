const Listing = require('../models/listing');
const fs = require('fs');
const path = require('path');

// Create new listing
const createListing = async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(file => file.filename) : [];
    
    const listing = new Listing({
      ...req.body,
      imageUrl: imageUrls,
      userId: req.body.userId
    });
    
    await listing.save();
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all listings
const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get approved listings
const getApprovedListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'approved' });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update listing status
const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add this update listing function
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
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
      imageUrl: finalImageUrls
    };

    // Remove fields that shouldn't be updated
    delete updatedData.currentImages;
    delete updatedData._id;

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update the exports
module.exports = {
  createListing,
  getAllListings,
  getApprovedListings,
  updateListingStatus,
  updateListing
};