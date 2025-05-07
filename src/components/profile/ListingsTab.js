import React from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import car1 from '../../assets/images/car1.jpg';
import './ListingsTab.css';

const ListingsTab = ({
  listings,
  loading,
  editingListing,
  handleEditListing,
  handleUpdateListing,
  handleDeleteListing,
  handleEditChange,
  handleImageChange,
  handleRemovePreview,
  handleRemoveCurrentImage,
  previewImages,
  setEditingListing,
  setPreviewImages
}) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return car1;
    if (Array.isArray(imagePath)) {
      return imagePath[0] 
        ? imagePath[0].startsWith('http') 
          ? imagePath[0] 
          : `http://localhost:5002/uploads/${imagePath[0]}`
        : car1;
    }
    return imagePath.startsWith('http') 
      ? imagePath 
      : `http://localhost:5002/uploads/${imagePath}`;
  };

  const handleUpdate = async (event, listingId) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      
      // Add all listing fields to formData
      Object.keys(editingListing).forEach(key => {
        if (key !== 'imageUrl' && key !== '_id' && editingListing[key] !== undefined) {
          formData.append(key, editingListing[key]);
        }
      });
      
      // Add current images
      if (editingListing.imageUrl) {
        formData.append('currentImages', JSON.stringify(
          Array.isArray(editingListing.imageUrl) ? editingListing.imageUrl : [editingListing.imageUrl]
        ));
      }
      
      // Add new images
      previewImages.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });
  
      await handleUpdateListing(listingId, formData);
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="listings-tab-container">
      {loading ? (
        <p className="listings-loading">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="no-listings">No listings found</p>
      ) : (
        <div className="profile-listings-grid">
          {listings.map(listing => (
            <div 
              key={listing._id} 
              className={`profile-listing-card ${editingListing?._id === listing._id ? 'profile-listing-editing' : ''}`}
            >
              {editingListing?._id === listing._id ? (
                <form 
                  className="profile-edit-form" 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(e, listing._id);
                  }}
                >
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
                        value={editingListing.makeYear || editingListing.year}
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
                        Max 5 images allowed (
                        {(editingListing?.imageUrl?.length || 0) + (previewImages?.length || 0)}/5 used
                        {previewImages?.length > 0 && ` (${editingListing?.imageUrl?.length || 0} current + ${previewImages.length} new)`}
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
                                src={getImageUrl(img)}
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
                                src={getImageUrl(editingListing.imageUrl)}
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
                    src={getImageUrl(listing.imageUrl)}
                    alt={listing.adTitle || `${listing.brand} ${listing.model}`}
                    className="profile-listing-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = car1;
                    }}
                  />
                  <div className="profile-listing-details">
                    <h3 className="profile-listing-title">
                      {listing.adTitle || `${listing.brand} ${listing.model} (${listing.makeYear || listing.year})`}
                    </h3>
                    <p className="profile-listing-price">
                      Rs. {Number(listing.price).toLocaleString('en-IN')}
                    </p>
                    {listing.status && <p className="profile-listing-status">Status: {listing.status}</p>}
                    {listing.description && (
                      <p className="profile-listing-description">{listing.description}</p>
                    )}
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
      )}
    </div>
  );
};

export default ListingsTab;