import React from 'react';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

const NotificationsTab = ({
  notifications,
  markAsRead,
  handleAccept,
  handleReject,
  handleDeleteNotification
}) => {
  return (
    <div className="notifications-container">
      {notifications.length === 0 ? (
        <p className="no-notifications">No notifications yet</p>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.read ? 'unread' : ''} ${
                notification.type === 'interest' && notification.buyerId === notification.recipientId ? 'interest-sent' : ''
              }`}
            >
              <div className="notification-content">
                <div className={`notification-header ${
                  notification.type === 'interest' && notification.buyerId === notification.recipientId ? 'interest-sent' : ''
                }`}>
                  <h4>{notification.title}</h4>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`notification-message ${
                  notification.type === 'interest' && notification.buyerId === notification.recipientId ? 'interest-confirmation' : ''
                }`}>
                  {notification.message}
                  {notification.type === 'interest' && notification.buyerId === notification.recipientId && (
                    <span className="interest-status">
                      You have shown interest in this vehicle. Waiting for seller's response.
                    </span>
                  )}
                </p>
                {notification.status === 'accepted' && (
                  <>
                    {/* Show buyer details to seller */}
                    {notification.type !== 'approval' && notification.buyerInfo && (
                      <div className="contact-info">
                        <h5>Buyer Details</h5>
                        <p><FaUser /> {notification.buyerInfo.username}</p>
                        <p><FaEnvelope /> {notification.buyerInfo.email}</p>
                        <p style={{ direction: 'ltr' }}><FaPhone style={{ transform: 'scaleX(-1)' }} /> {notification.buyerInfo.phone}</p>
                      </div>
                    )}
                    {/* Show seller details to buyer */}
                    {notification.type === 'approval' && notification.sellerInfo && (
                      <div className="contact-info">
                        <h5>Seller Details</h5>
                        <p><FaUser /> {notification.sellerInfo.username}</p>
                        <p><FaEnvelope /> {notification.sellerInfo.email}</p>
                        <p style={{ direction: 'ltr' }}><FaPhone style={{ transform: 'scaleX(-1)' }} /> {notification.sellerInfo.phone}</p>
                      </div>
                    )}
                  </>
                )}
                {notification.type !== 'interest-sent' && (
                  <div className="notification-status">
                    Status: <span className={`status-${notification.status}`}>{notification.status}</span>
                  </div>
                )}
              </div>
              <div className="notification-actions">
                {notification.status === 'pending' && notification.type !== 'interest-sent' && (
                  <>
                    <button
                      className="notification-btn accept"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(notification._id);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="notification-btn reject"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(notification._id);
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="notification-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;