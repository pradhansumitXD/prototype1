const Notification = require('../models/notification');
const User = require('../models/user');

const createNotification = async (req, res) => {
  try {
    const { recipientId, message, type, listingId, buyerId } = req.body;

    if (!recipientId || !message || !type || !listingId || !buyerId) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: { recipientId, message, type, listingId, buyerId }
      });
    }

    const [buyer, recipient] = await Promise.all([
      User.findById(buyerId),
      User.findById(recipientId)
    ]);

    if (!buyer || !recipient) {
      return res.status(404).json({ 
        message: !buyer ? 'Buyer not found' : 'Recipient not found' 
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
      message: `You have shown interest in this vehicle. Waiting for seller's response.`,
      type: 'interest',
      listingId,
      buyerId,
      status: 'pending',
      buyerInfo: {
        username: buyer.username,
        email: buyer.email,
        phone: buyer.phone || buyer.mobile
      }
    });

    // Save both notifications
    await Promise.all([
      sellerNotification.save(),
      buyerNotification.save()
    ]);

    res.status(201).json({
      sellerNotification,
      buyerNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
};

const approveInterest = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const [buyer, seller] = await Promise.all([
      User.findById(notification.buyerId),
      User.findById(notification.recipientId)
    ]);

    if (!buyer || !seller) {
      return res.status(404).json({ 
        message: !buyer ? `Buyer not found with ID: ${notification.buyerId}` 
                       : `Seller not found with ID: ${notification.recipientId}` 
      });
    }

    notification.status = 'approved';
    notification.sellerInfo = req.body.sellerInfo;
    notification.buyerInfo = {
      username: buyer.username,
      email: buyer.email,
      phone: buyer.phone || buyer.mobile
    };
    await notification.save();

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
};

const getUserNotifications = async (req, res) => {
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
};

const markAsRead = async (req, res) => {
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
};

const deleteNotification = async (req, res) => {
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
};

const acceptRequest = async (req, res) => {
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
      message: `Your request for "${existingNotification.listingId.adTitle}" has been accepted! Seller contact: ${existingNotification.recipientId.username} (${existingNotification.recipientId.phone || existingNotification.recipientId.mobile})`,
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
};

const rejectRequest = async (req, res) => {
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
};

module.exports = {
  createNotification,
  approveInterest,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  acceptRequest,
  rejectRequest
};