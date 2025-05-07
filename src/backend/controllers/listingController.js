const Listing = require('../models/listing');
const fs = require('fs');
const path = require('path');

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

const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApprovedListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'approved' });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Remove ownership check to allow any user to update
    let finalImageUrls = [];

    if (req.body.currentImages) {
      const currentImages = JSON.parse(req.body.currentImages);
      finalImageUrls = [...currentImages];

      const removedImages = listing.imageUrl.filter(img => !currentImages.includes(img));
      removedImages.forEach(img => {
        const imagePath = path.join(__dirname, '../../uploads', img);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => file.filename);
      finalImageUrls = [...finalImageUrls, ...newImageUrls];
    }

    const updatedData = {
      ...req.body,
      imageUrl: finalImageUrls,
      // Keep the original userId to maintain ownership
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
    console.error('Update listing error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.imageUrl && listing.imageUrl.length > 0) {
      listing.imageUrl.forEach(img => {
        const imagePath = path.join(__dirname, '../../uploads', img);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ userId: req.params.userId });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectInterest = async (req, res) => {
  try {
    const { buyerId } = req.body;
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (!listing.interests) {
      listing.interests = [];
    }

    const interestIndex = listing.interests.findIndex(
      interest => interest.buyerId.toString() === buyerId
    );

    if (interestIndex === -1) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    listing.interests[interestIndex].status = 'rejected';
    await listing.save();

    res.json({ message: 'Interest rejected successfully' });
  } catch (error) {
    console.error('Error rejecting interest:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getApprovedListings,
  updateListingStatus,
  updateListing,
  deleteListing,
  getUserListings,
  rejectInterest
};