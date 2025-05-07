const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Service = require('../models/serviceModels');
const uploadsConfig = require('../config/uploadConfig');

const saveBase64Image = (base64String) => {
  try {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const fileType = matches[1];
    const base64Data = matches[2];
    const extension = fileType.split('/')[1];
    const fileName = `${Date.now()}.${extension}`;
    const filePath = path.join(uploadsConfig.path, fileName);

    fs.writeFileSync(filePath, base64Data, 'base64');
    return fileName;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw error;
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsConfig.path);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExt);
    const timestamp = Date.now();
    cb(null, `${timestamp}-${fileName}${fileExt}`);
  }
});

const upload = multer({ storage: storage });

// Create new service
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    console.log('Received data:', req.body);
    
    let imageUrl = '';
    
    if (req.body.imageBase64) {
      imageUrl = saveBase64Image(req.body.imageBase64);
    } else if (req.file) {
      imageUrl = req.file.filename;
    }
    
    const service = new Service({
      userId: req.body.userId,
      title: req.body.title,
      description: req.body.description,
      serviceType: req.body.serviceType,
      location: req.body.location,
      contactNumber: req.body.contactNumber,
      vendorName: req.body.vendorName,
      imageUrl: imageUrl,
    });
    
    const savedService = await service.save();
    res.status(201).json({ message: 'Service created successfully', service: savedService });
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

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

    if (req.body.imageBase64) {
      updates.imageUrl = saveBase64Image(req.body.imageBase64);
    } else if (req.file) {
      updates.imageUrl = req.file.filename;
    }

    if (updates.imageUrl) {
      const oldService = await Service.findById(req.params.id);
      if (oldService && oldService.imageUrl) {
        const oldImagePath = path.join(uploadsConfig.path, oldService.imageUrl);
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

router.get('/all', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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