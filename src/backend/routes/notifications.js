
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/notification');
const User = require('../models/user');
const Listing = require('../models/listing'); 
const auth = require('../middleware/auth');
// Create notification
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, message, type, listingId, buyerId } = req.body;
    
    const [buyer, recipient, listing] = await Promise.all([
      User.findById(buyerId),
      User.findById(recipientId),
      Listing.findById(listingId)
    ]);

    if (!buyer || !recipient || !listing) {
      return res.status(404).json({ 
        message: !buyer ? 'Buyer not found' : !recipient ? 'Recipient not found' : 'Listing not found'
      });
    }

    // Create notification for seller
    const sellerNotification = new Notification({
      recipientId,
      message,
      type,
      listingId,
      buyerId,
      status: 'pending',
      buyerInfo: {
        username: buyer.username,
        email: buyer.email,
        phone: buyer.phone || buyer.mobile
      }
    });

    // Create notification for buyer
    const buyerNotification = new Notification({
      recipientId: buyerId,
      message: `You have shown interest in "${listing.adTitle}". Waiting for seller's response.`,
      type: 'interest-sent',
      listingId,
      buyerId,
      buyerInfo: {
        username: buyer.username,
        email: buyer.email,
        phone: buyer.phone || buyer.mobile
      }
    });

    // Save both notifications
    const [savedSellerNotification, savedBuyerNotification] = await Promise.all([
      sellerNotification.save(),
      buyerNotification.save()
    ]);

    res.status(201).json({
      sellerNotification: savedSellerNotification,
      buyerNotification: savedBuyerNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
});
// Approve interest and share contact details
router.post('/:notificationId/approve', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    console.log('Notification found:', notification); 
    const buyer = await User.findById(notification.buyerId);
    console.log('Buyer ID:', notification.buyerId, 'Buyer found:', buyer); 
    if (!buyer) {
      return res.status(404).json({ message: `Buyer not found with ID: ${notification.buyerId}` });
    }
    const seller = await User.findById(notification.recipientId);
    console.log('Seller ID:', notification.recipientId, 'Seller found:', seller); 
    if (!seller) {
      return res.status(404).json({ message: `Seller not found with ID: ${notification.recipientId}` });
    }
    // Update notification status with seller info from request
    notification.status = 'approved';
    notification.sellerInfo = req.body.sellerInfo;
    notification.buyerInfo = {
      username: buyer.username,
      email: buyer.email,
      phone: buyer.phone || buyer.mobile
    };
    await notification.save();
    // Create notification for buyer
    const buyerNotification = new Notification({
      recipientId: buyer._id,
      buyerId: buyer._id,
      message: `Your interest has been approved! Seller contact: ${req.body.sellerInfo.phone}`,
      type: 'approval',
      listingId: notification.listingId,
      status: 'approved',
      sellerInfo: req.body.sellerInfo,
      buyerInfo: notification.buyerInfo
    });
    await buyerNotification.save();
    res.json({ 
      message: 'Interest approved',
      buyerDetails: notification.buyerInfo
    });
  } catch (error) {
    console.error('Error approving interest:', error);
    res.status(500).json({ message: error.message || 'Error approving interest' });
  }
});
// Get user notifications
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.params.userId })
      .populate('buyerId', 'username email phone')  
      .populate('listingId', 'adTitle price')      
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});
// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});
// Accept request
router.post('/:notificationId/accept', auth, async (req, res) => {
  try {
    const existingNotification = await Notification.findById(req.params.notificationId)
      .populate('buyerId', 'username email phone mobile')
      .populate('listingId', 'adTitle price')
      .populate('recipientId', 'username email phone mobile');
    if (!existingNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    existingNotification.status = 'accepted';
    existingNotification.sellerInfo = {
      username: existingNotification.recipientId.username,
      email: existingNotification.recipientId.email,
      phone: existingNotification.recipientId.phone || existingNotification.recipientId.mobile
    };
    
    await existingNotification.save();
    const buyerNotification = new Notification({
      recipientId: existingNotification.buyerId._id,
      buyerId: existingNotification.buyerId._id,
      listingId: existingNotification.listingId,
      message: `Your request for "${existingNotification.listingId.adTitle}" has been accepted!`,
      type: 'approval',
      status: 'accepted',
      sellerInfo: {
        username: existingNotification.recipientId.username,
        email: existingNotification.recipientId.email,
        phone: existingNotification.recipientId.phone || existingNotification.recipientId.mobile,
        profilePicture: existingNotification.recipientId.profilePicture
      },
      buyerInfo: existingNotification.buyerInfo
    });
    
    await buyerNotification.save();
    res.json({
      message: 'Request accepted successfully',
      notification: existingNotification
    });
  } catch (error) {
    console.error('Error in accept route:', error);
    res.status(500).json({ 
      message: 'Error accepting request', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// Reject request
router.post('/:notificationId/reject', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId)
      .populate('buyerId', 'username')
      .populate('listingId', 'adTitle');
      
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.status = 'rejected';
    await notification.save();
    const buyerNotification = new Notification({
      recipientId: notification.buyerId._id,
      buyerId: notification.buyerId._id,
      listingId: notification.listingId._id,
      message: `Your interest in "${notification.listingId.adTitle}" has been rejected by the seller. You may look for other similar listings.`,
      type: 'rejection',
      status: 'rejected'
    });
    await buyerNotification.save();
    res.json({ 
      message: 'Request rejected successfully',
      notification: notification 
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
});
module.exports = router;

