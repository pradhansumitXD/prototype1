const express = require('express');
const router = express.Router();
const Interest = require('../models/interest');
const auth = require('../middleware/auth');

// Create a new interest
router.post('/create', auth, async (req, res) => {
  try {
    const { listingId, buyerId, sellerId } = req.body;

    // Validate required fields
    if (!listingId || !buyerId || !sellerId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if interest already exists
    const existingInterest = await Interest.findOne({
      listingId,
      buyerId,
      sellerId,
    });

    if (existingInterest) {
      return res.status(409).json({ message: 'Interest already exists' });
    }

    // Create new interest record
    const interest = new Interest({
      listingId,
      buyerId,
      sellerId,
      status: 'pending'
    });

    const savedInterest = await interest.save();
    res.status(201).json(savedInterest);
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({ message: 'Error creating interest', error: error.message });
  }
});

module.exports = router;