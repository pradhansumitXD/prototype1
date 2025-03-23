const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Service = require('../models/serviceModels');  

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

// Create new service
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    console.log('Received data:', req.body); // Add logging
    
    const service = new Service({
      userId: req.body.userId,
      title: req.body.title,
      description: req.body.description,
      serviceType: req.body.serviceType,
      location: req.body.location,
      contactNumber: req.body.contactNumber,
      vendorName: req.body.vendorName, 
      imageUrl: req.file ? req.file.filename : '',
    });
    
    const savedService = await service.save();
    res.status(201).json({ message: 'Service created successfully', service: savedService });
  } catch (error) {
    console.error('Service creation error:', error); 
    res.status(400).json({ message: error.message });
  }
});

// Get all services
router.get('/all', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update service
router.put('/update/:id', upload.single('image'), async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      serviceType: req.body.serviceType,
      location: req.body.location,
      contactNumber: req.body.contactNumber,
      vendorName: req.body.vendorName
    };

    if (req.file) {
      updates.imageUrl = req.file.filename;

      // Delete old image if it exists
      const oldService = await Service.findById(req.params.id);
      if (oldService && oldService.imageUrl) {
        const oldImagePath = path.join(__dirname, '../uploads', oldService.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;