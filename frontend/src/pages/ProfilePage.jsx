import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile, deleteAccount, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
    phoneNumber: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
    
    setUpdating(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This will permanently delete all your data. Are you absolutely sure?'
    );
    
    if (!doubleConfirm) return;

    setDeleting(true);
    const result = await deleteAccount();
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
      setDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <h1>{user?.displayName || 'User'}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!editing ? (
            <div className="profile-info">
              <div className="info-section">
                <h2>Profile Information</h2>
                
                <div className="info-item">
                  <span className="info-label">Display Name:</span>
                  <span className="info-value">{user?.displayName || 'Not set'}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user?.email}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Phone Number:</span>
                  <span className="info-value">{user?.phoneNumber || 'Not set'}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Photo URL:</span>
                  <span className="info-value">
                    {user?.photoURL ? (
                      <a href={user.photoURL} target="_blank" rel="noopener noreferrer">
                        View Photo
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Member Since:</span>
                  <span className="info-value">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="profile-actions">
                <button onClick={() => setEditing(true)} className="edit-btn">
                  Edit Profile
                </button>
                <button onClick={handleDeleteAccount} className="delete-btn" disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Your display name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>

              <div className="form-group">
                <label htmlFor="photoURL">Photo URL</label>
                <input
                  type="url"
                  id="photoURL"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setEditing(false);
                    setError('');
                  }} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
