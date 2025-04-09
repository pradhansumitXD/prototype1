import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './profile.css';
import car1 from '../assets/images/car1.jpg';
import { FaTimes, FaPlus } from 'react-icons/fa';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    oldPassword: '',
    confirmPassword: '',
    mobile: '',
  });
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      console.log('Stored user:', storedUser);
      if (storedUser) {
        fetch(`http://localhost:5002/api/users/${storedUser.id || storedUser._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        })
        .then(response => response.json())
        .then(userData => {
          setUser({
            username: userData.username || '',
            email: userData.email || '',
            password: '',
            mobile: userData.phone || '', 
            _id: userData._id
          });
        });
        
        fetchUserListings(storedUser.id || storedUser._id);
      } else {
        console.error('No user data found in localStorage');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserListings = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5002/api/listings/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user.password) {
        if (!user.oldPassword) {
          throw new Error('Please enter your current password');
        }
        if (user.password !== user.confirmPassword) {
          throw new Error('New passwords do not match');
        }
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user': JSON.stringify({
            id: user._id,
            role: JSON.parse(localStorage.getItem('user')).role
          })
        },
        body: JSON.stringify({
          username: user.username,
          phone: user.mobile,
          ...(user.password && {
            oldPassword: user.oldPassword,
            newPassword: user.password
          })
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUserData = {
        ...currentUser,
        username: updatedUser.username,
        phone: updatedUser.phone
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      setUser(prev => ({
        ...prev,
        username: updatedUser.username,
        mobile: updatedUser.phone
      }));
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
      // Add timeout to clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleDeleteListing = (listingId) => {
    setListingToDelete(listingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`http://localhost:5002/api/listings/${listingToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'user': JSON.stringify({
            id: storedUser.id || storedUser._id,
            role: storedUser.role,
            userId: storedUser.id || storedUser._id
          })
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setListings(prevListings => prevListings.filter(listing => listing._id !== listingToDelete));
      setSuccessMessage('Listing deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete listing');
      // Add timeout to clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setShowDeleteModal(false);
      setListingToDelete(null);
    }
  };

  const handleUpdateListing = async (e, listingId) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const formData = new FormData();
      
      Object.keys(editingListing).forEach(key => {
        if (key !== 'imageUrl' && key !== '_id') {
          formData.append(key, editingListing[key]);
        }
      });
  
      const currentImages = editingListing.imageUrl 
        ? (Array.isArray(editingListing.imageUrl) ? editingListing.imageUrl : [editingListing.imageUrl])
        : [];
      formData.append('currentImages', JSON.stringify(currentImages));
  
      previewImages.forEach(preview => {
        formData.append('images', preview.file);
      });
  
      formData.append('userId', user.id || user._id);
  
      const response = await fetch(`http://localhost:5002/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'user': JSON.stringify({
            id: user.id || user._id,
            role: user.role
          })
        },
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update listing: ${response.status}`);
      }
  
      await fetchUserListings(user.id || user._id);
      setEditingListing(null);
      setPreviewImages([]);
      setSuccessMessage('Listing updated successfully');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating listing:', error);
      setError(error.message || 'Failed to update listing');
      // Add timeout to clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImagesCount = editingListing.imageUrl 
      ? (Array.isArray(editingListing.imageUrl) ? editingListing.imageUrl.length : 1)
      : 0;
    
    const totalImages = currentImagesCount + files.length;
    
    if (totalImages > 5) {
      alert(`You can only have up to 5 images total. You currently have ${currentImagesCount} images.`);
      e.target.value = '';
      return;
    }
  
    const newPreviewImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file
    }));
  
    setPreviewImages(prevImages => [...prevImages, ...newPreviewImages]);
    e.target.value = '';
  };

  const handleRemovePreview = (index) => {
    setPreviewImages(prevImages => {
      const newPreviews = [...prevImages];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleRemoveCurrentImage = (index) => {
    const updatedListing = { ...editingListing };
    if (Array.isArray(updatedListing.imageUrl)) {
      updatedListing.imageUrl = updatedListing.imageUrl.filter((_, i) => i !== index);
    } else {
      updatedListing.imageUrl = [];
    }
    setEditingListing(updatedListing);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingListing(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleEditListing = (listing) => {
    setEditingListing({
      ...listing,
      adTitle: listing.adTitle,
      price: listing.price,
      description: listing.description,
      brand: listing.brand,
      model: listing.model,
      carType: listing.carType,
      fuelType: listing.fuelType,
      makeYear: listing.makeYear,
      transmission: listing.transmission,
      engine: listing.engine,
      ownership: listing.ownership,
      kmsDriven: listing.kmsDriven,
      imageUrl: listing.imageUrl,
      _id: listing._id
    });
    setPreviewImages([]);
  };

  return (
    <div className="profile-container">
      <Navbar />
      {successMessage && (
        <div className="profile-success-message">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="profile-error-message">
          {error}
        </div>
      )}
      <div className="profile-page-container">
        <div className="profile-page-tabs">
          <button 
            className={`profile-tab-btn ${activeTab === 'profile' ? 'profile-tab-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`profile-tab-btn ${activeTab === 'listings' ? 'profile-tab-active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            My Listings
          </button>
        </div>
        {activeTab === 'profile' ? (
          <div className="profile-form-container">
            <h2>Profile Settings</h2>
            <form onSubmit={handleSubmit} className="profile-page-form">
              <div className="profile-form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  required
                  className="profile-form-input"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  disabled
                  className="profile-form-input"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={user.oldPassword}
                  onChange={handleChange}
                  className="profile-form-input"
                  placeholder="Enter current password to change"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  className="profile-form-input"
                  placeholder="Enter new password"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={user.confirmPassword}
                  onChange={handleChange}
                  className="profile-form-input"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={user.mobile}
                  onChange={handleChange}
                  required
                  pattern="\d{10}"
                  title="Please enter a valid 10-digit mobile number"
                  className="profile-form-input"
                />
              </div>
              <button type="submit" className="profile-save-btn">Save Changes</button>
            </form>
          </div>
        ) : (
          <div className="profile-listings-section">
            <h2 className="profile-listings-title">My Listings</h2>
            {loading ? (
              <div className="profile-loading">Loading...</div>
            ) : listings.length > 0 ? (
              <div className="profile-listings-grid">
                {listings.map(listing => (
                  <div key={listing._id} className={`profile-listing-card ${editingListing && editingListing._id === listing._id ? 'profile-listing-editing' : ''}`}>
                    {editingListing && editingListing._id === listing._id ? (
                      <form onSubmit={(e) => handleUpdateListing(e, listing._id)} className="profile-edit-form">
                        <div className="profile-edit-form-header">
                          <h3>Edit Listing</h3>
                        </div>
                        <div className="profile-edit-form-fields">
                          <div className="profile-input-group">
                            <label htmlFor="brand">Brand</label>
                            <select
                              name="brand"
                              id="brand"
                              value={editingListing.brand}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            >
                              <option value="">Select Brand</option>
                              <option value="Hyundai">Hyundai</option>
                              <option value="Suzuki">Suzuki</option>
                              <option value="Tata">Tata</option>
                              <option value="KIA">KIA</option>
                              <option value="Ford">Ford</option>
                              <option value="Mahindra">Mahindra</option>
                              <option value="Toyota">Toyota</option>
                              <option value="Nissan">Nissan</option>
                              <option value="Volkswagen">Volkswagen</option>
                              <option value="Others">Others</option>
                            </select>
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="model">Model</label>
                            <input
                              type="text"
                              name="model"
                              id="model"
                              value={editingListing.model}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            />
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="carType">Car Type</label>
                            <select
                              name="carType"
                              id="carType"
                              value={editingListing.carType}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            >
                              <option value="">Select Car Type</option>
                              <option value="Hatchback">Hatchback</option>
                              <option value="Sedan">Sedan</option>
                              <option value="SUV">SUV</option>
                              <option value="Pickup">Pickup</option>
                            </select>
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="fuelType">Fuel Type</label>
                            <select
                              name="fuelType"
                              id="fuelType"
                              value={editingListing.fuelType}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            >
                              <option value="">Select Fuel Type</option>
                              <option value="Petrol">Petrol</option>
                              <option value="Diesel">Diesel</option>
                              <option value="Hybrid">Hybrid</option>
                              <option value="EV">EV</option>
                            </select>
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="makeYear">Make Year</label>
                            <input
                              type="number"
                              name="makeYear"
                              id="makeYear"
                              value={editingListing.makeYear}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            />
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="transmission">Transmission</label>
                            <select
                              name="transmission"
                              id="transmission"
                              value={editingListing.transmission}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            >
                              <option value="">Select Transmission</option>
                              <option value="Manual">Manual</option>
                              <option value="Automatic">Automatic</option>
                              <option value="EV">EV</option>
                            </select>
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="engine">Engine</label>
                            <select
                              name="engine"
                              id="engine"
                              value={editingListing.engine}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            >
                              <option value="">Select Engine</option>
                              <option value="1.2L">1.2L</option>
                              <option value="1.5L">1.5L</option>
                              <option value="1.6L">1.6L</option>
                              <option value="2.0L">2.0L</option>
                              <option value="2.2L">2.2L</option>
                              <option value="2.8L">2.8L</option>
                              <option value="Electric">EV</option>
                            </select>
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="ownership">Ownership</label>
                            <select
                              name="ownership"
                              id="ownership"
                              value={editingListing.ownership}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            >
                              <option value="">Select Ownership</option>
                              <option value="First">First</option>
                              <option value="Second">Second</option>
                              <option value="Third">Third</option>
                            </select>
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="kmsDriven">Kilometers Driven</label>
                            <input
                              type="number"
                              name="kmsDriven"
                              id="kmsDriven"
                              value={editingListing.kmsDriven}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            />
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="adTitle">Ad Title</label>
                            <input
                              type="text"
                              name="adTitle"
                              id="adTitle"
                              value={editingListing.adTitle}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            />
                          </div>
                          <div className="profile-input-group">
                            <label htmlFor="price">Price</label>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              value={editingListing.price}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input"
                            />
                          </div>
                          <div className="profile-input-group full-width">
                            <label htmlFor="description">Description</label>
                            <textarea
                              name="description"
                              id="description"
                              value={editingListing.description}
                              onChange={handleEditChange}
                              required
                              className="profile-edit-input profile-edit-textarea"
                              rows="4"
                            />
                          </div>
                        </div>
                        <div className="profile-image-upload-section">
                          <div className="profile-upload-header">
                            <small>
                              Max 5 images allowed ({(editingListing.imageUrl ? (Array.isArray(editingListing.imageUrl) ? editingListing.imageUrl.length : 1) : 0)} current + {previewImages.length} new)
                            </small>
                          </div>
                          <input
                            type="file"
                            id={`profile-photo-${listing._id}`}
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            key={editingListing?._id}
                          />
                          <div className="profile-image-preview-container">
                            {editingListing.imageUrl && (
                              Array.isArray(editingListing.imageUrl) ? 
                                editingListing.imageUrl.map((img, index) => (
                                  <div key={`profile-existing-${index}`} className="profile-preview-image-wrapper">
                                    <button
                                      type="button"
                                      className="profile-remove-image-btn"
                                      onClick={() => handleRemoveCurrentImage(index)}
                                    >
                                      <FaTimes className="profile-remove-icon" />
                                    </button>
                                    <img
                                      src={`http://localhost:5002/uploads/${img}`}
                                      alt={`Current ${index + 1}`}
                                      className="profile-preview-image"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = car1;
                                      }}
                                    />
                                    <span className="profile-image-label">Current</span>
                                  </div>
                                )) : (
                                  <div className="profile-preview-image-wrapper">
                                    <button
                                      type="button"
                                      className="profile-remove-image-btn"
                                      onClick={() => handleRemoveCurrentImage(0)}
                                    >
                                      <FaTimes className="profile-remove-icon" />
                                    </button>
                                    <img
                                      src={`http://localhost:5002/uploads/${editingListing.imageUrl}`}
                                      alt="Current"
                                      className="profile-preview-image"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = car1;
                                      }}
                                    />
                                    <span className="profile-image-label">Current</span>
                                  </div>
                                )
                            )}
                            
                            {previewImages.map((preview, index) => (
                              <div key={`profile-new-${index}`} className="profile-preview-image-wrapper">
                                <img
                                  src={preview.url}
                                  alt={`Preview ${index + 1}`}
                                  className="profile-preview-image"
                                />
                                <button
                                  type="button"
                                  className="profile-remove-image-btn"
                                  onClick={() => handleRemovePreview(index)}
                                >
                                  <FaTimes className="profile-remove-icon" />
                                </button>
                                <span className="profile-image-label">New</span>
                              </div>
                            ))}
                            
                            {[...Array(5 - (editingListing.imageUrl ? (Array.isArray(editingListing.imageUrl) ? editingListing.imageUrl.length : 1) : 0) - previewImages.length)].map((_, index) => (
                              <label 
                                key={`profile-placeholder-${index}`} 
                                htmlFor={`profile-photo-${listing._id}`} 
                                className="profile-upload-placeholder"
                              >
                                <FaPlus className="profile-plus-icon" />
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="profile-edit-actions">
                          <button type="submit" className="profile-save-changes-btn">Save Changes</button>
                          <button 
                            type="button" 
                            className="profile-cancel-btn"
                            onClick={() => {
                              setEditingListing(null);
                              setPreviewImages([]);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <img 
                          src={Array.isArray(listing.imageUrl) && listing.imageUrl.length > 0
                            ? `http://localhost:5002/uploads/${listing.imageUrl[0]}`
                            : listing.imageUrl
                            ? `http://localhost:5002/uploads/${listing.imageUrl}`
                            : car1}
                          alt={listing.adTitle}
                          className="profile-listing-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = car1;
                          }}
                        />
                        <div className="profile-listing-details">
                          <h3 className="profile-listing-title">{listing.adTitle}</h3>
                          <p className="profile-listing-price">Rs. {Number(listing.price).toLocaleString('en-IN')}</p>
                          <p className="profile-listing-status">Status: {listing.status}</p>
                          <div className="profile-listing-actions">
                            <button className="profile-edit-btn" onClick={() => handleEditListing(listing)}>Edit</button>
                            <button className="profile-delete-btn" onClick={() => handleDeleteListing(listing._id)}>Delete</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="profile-no-listings">You haven't posted any listings yet.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
            <div className="delete-modal-buttons">
              <button className="confirm-btn" onClick={confirmDelete}>Delete</button>
              <button className="cancel-btn" onClick={() => {
                setShowDeleteModal(false);
                setListingToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;