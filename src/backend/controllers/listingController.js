const Listing = require('../models/listing');

// Create new listing
const createListing = async (req, res) => {
  try {
    const listing = new Listing({
      ...req.body,
      imageUrl: req.file.path,
      userId: JSON.parse(req.headers.user)._id
    });
    await listing.save();
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
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

module.exports = {
  createListing,
  getAllListings,
  getApprovedListings,
  updateListingStatus
};