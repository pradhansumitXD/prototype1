import React, { useState, useEffect } from 'react';
import './ManageServices.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faCog, faUpload } from '@fortawesome/free-solid-svg-icons';

function ManageServices() {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);  
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    imageUrl: '',
    serviceType: 'Car Wash',
    location: '',
    contactNumber: '',
    userId: '',
    vendorName: ''
  });

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/services/all', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch services');
      }

      const data = await response.json();
      setServices(data);
    } catch (error) {
      setError('Error fetching services: ' + error.message);
      console.error('Error fetching services:', error);
    }
  };

  // Add handleImageChange function
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingService) {
          setEditingService({
            ...editingService,
            imageUrl: reader.result
          });
        } else {
          setNewService({
            ...newService,
            imageUrl: reader.result
          });
        }
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async () => {
    if (!newService.title || !newService.description || !selectedImage || !newService.vendorName) {
      setError('Please fill all required fields and upload an image');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      if (!userId || userRole !== 'admin') {
        setError('Only administrators can add services');
        return;
      }

      const formData = new FormData();
      if (!newService.vendorName.trim()) {
        setError('Vendor name is required');
        return;
      }
      
      formData.append('title', newService.title);
      formData.append('description', newService.description);
      formData.append('image', selectedImage);
      formData.append('serviceType', newService.serviceType);
      formData.append('location', newService.location);
      formData.append('contactNumber', newService.contactNumber);
      formData.append('userId', userId);
      formData.append('vendorName', newService.vendorName.trim());

      const response = await fetch('http://localhost:5002/api/services/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(errorData || 'Failed to add service');
      }

      const result = await response.json();
      console.log('Success:', result);

      await fetchServices();
      setNewService({
        title: '',
        description: '',
        imageUrl: '',
        serviceType: 'Car Wash',
        location: '',
        contactNumber: '',
        userId: '',
        vendorName: ''  
      });
      setSelectedImage(null);
      setError(null);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append('title', editingService.title || '');
      formData.append('description', editingService.description || '');
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      formData.append('serviceType', editingService.serviceType || 'Car Wash');
      formData.append('location', editingService.location || '');
      formData.append('contactNumber', editingService.contactNumber || '');
      formData.append('vendorName', editingService.vendorName || '');
      formData.append('userId', editingService.userId || '');
  
      const response = await fetch(`http://localhost:5002/api/services/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Failed to update service. Please try again.');
      }
  
      await fetchServices();
      setEditingService(null);
      setSelectedImage(null);
      setError(null);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
    }
  };

  // Update handleDelete function
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const response = await fetch(`http://localhost:5002/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete service');
      }

      await fetchServices();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (service) => {
    setEditingService({ ...service });
  };

  return (
    <div className="manage-services">
      <h2><FontAwesomeIcon icon={faCog} /> Manage Services</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="add-service-form">
        <h3>Add New Service</h3>
        <div className="form-section">
          <h4>Service Details</h4>
          <input
            type="text"
            placeholder="Vendor Name"
            value={newService.vendorName}
            onChange={(e) => setNewService({ ...newService, vendorName: e.target.value })}
            className="edit-input"
          />
          <select
            value={newService.serviceType}
            onChange={(e) => setNewService({ ...newService, serviceType: e.target.value })}
            className="edit-input"
          >
            <option value="Car Wash">Car Wash</option>
            <option value="Car Repair">Car Repair</option>
            <option value="Car Towing">Car Towing</option>
            <option value="Car Inspection">Car Inspection</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Service Title"
            value={newService.title}
            onChange={(e) => setNewService({ ...newService, title: e.target.value })}
            className="edit-input"
          />
          <textarea
            placeholder="Service Description"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            className="edit-textarea"
          />
          <input
            type="text"
            placeholder="Location"
            value={newService.location}
            onChange={(e) => setNewService({ ...newService, location: e.target.value })}
            className="edit-input"
          />
          <input
            type="tel"
            placeholder="Contact Number"
            value={newService.contactNumber}
            onChange={(e) => setNewService({ ...newService, contactNumber: e.target.value })}
            className="edit-input"
          />
          <div className="image-upload">
            <label htmlFor="service-image" className="upload-btn">
              <FontAwesomeIcon icon={faUpload} /> Upload Image
            </label>
            <input
              type="file"
              id="service-image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {newService.imageUrl && (
              <img src={newService.imageUrl} alt="Preview" className="image-preview" />
            )}
          </div>
        </div>

        <button className="add-btn" onClick={handleAddService}>
          Add Service
        </button>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service._id} className="service-card">
            {editingService?._id === service._id ? (
              <>
                <div className="form-section">
                  <input
                    type="text"
                    placeholder="Vendor Name"
                    value={editingService.vendorName}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      vendorName: e.target.value
                    })}
                    className="edit-input"
                  />
                  <select
                    value={editingService.serviceType}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      serviceType: e.target.value
                    })}
                    className="edit-input"
                  >
                    <option value="Car Wash">Car Wash</option>
                    <option value="Car Repair">Car Repair</option>
                    <option value="Car Towing">Car Towing</option>
                    <option value="Car Inspection">Car Inspection</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={editingService.title}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      title: e.target.value
                    })}
                    className="edit-input"
                  />
                  <textarea
                    value={editingService.description}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      description: e.target.value
                    })}
                    className="edit-textarea"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={editingService.location}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      location: e.target.value
                    })}
                    className="edit-input"
                  />
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    value={editingService.contactNumber}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      contactNumber: e.target.value
                    })}
                    className="edit-input"
                  />
                  <div className="image-upload">
                    <label htmlFor={`edit-image-${service._id}`} className="upload-btn">
                      <FontAwesomeIcon icon={faUpload} /> Change Image
                    </label>
                    <input
                      type="file"
                      id={`edit-image-${service._id}`}
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="save-btn" onClick={() => handleUpdate(service._id)}>
                    <FontAwesomeIcon icon={faSave} /> Save
                  </button>
                  <button className="cancel-btn" onClick={() => setEditingService(null)}>
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <img 
                  src={`http://localhost:5002/uploads/${service.imageUrl}`} 
                  alt={service.title} 
                />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-details">
                  <h4>Service Details</h4>
                  <p><strong>Vendor:</strong> {service.vendorName || 'Not specified'}</p>
                  <p><strong>Type:</strong> {service.serviceType}</p>
                  <p><strong>Location:</strong> {service.location}</p>
                  <p><strong>Contact:</strong> {service.contactNumber}</p>
                </div>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => handleEdit(service)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(service._id)}>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageServices;