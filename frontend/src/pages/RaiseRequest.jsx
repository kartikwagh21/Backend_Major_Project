import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Upload,
  ArrowLeft,
  X,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

const COMMON_APPLIANCES = [
  'Air Conditioner (AC)',
  'Refrigerator / Fridge',
  'Washing Machine',
  'Microwave Oven',
  'Television (Smart TV)',
  'Water Purifier / RO',
  'Dishwasher',
  'Induction Cooktop',
  'Other Home Appliance',
];

const COMMON_BRANDS = [
  'Samsung',
  'LG',
  'Whirlpool',
  'Bosch',
  'Panasonic',
  'Daikin',
  'Godrej',
  'Sony',
  'Haier',
  'IFB',
  'Voltas',
  'Other Brand',
];

const QUICK_DESCRIPTIONS = [
  { label: 'AC Low Cooling', text: 'Indoor unit cooling is minimal and error code E4 is flashing intermittently on the LED display.' },
  { label: 'Washing Machine Drum', text: 'Drum produces excessive loud thumping noise and fails to spin during the final rinse cycle.' },
  { label: 'Fridge Warm Section', text: 'Freezer is frosting normally but lower vegetable rack and milk compartment are not getting cool air.' },
];

const RaiseRequest = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(true);

  const [formData, setFormData] = useState({
    technician: '',
    applianceType: 'Air Conditioner (AC)',
    customAppliance: '',
    brand: 'Samsung',
    customBrand: '',
    issueDescription: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await api.get('/technicians');
        if (res.data.success && res.data.data.length > 0) {
          setTechnicians(res.data.data);
          setFormData((prev) => ({
            ...prev,
            technician: res.data.data[0]._id,
          }));
        }
      } catch (err) {
        setError('Failed to load available technicians. Please refresh.');
      } finally {
        setLoadingTechs(false);
      }
    };

    fetchTechnicians();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WebP, SVG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      setError('');
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    if (formData.issueDescription.trim().length < 10) {
      setError('Issue description must be at least 10 characters long.');
      return;
    }

    if (!formData.technician) {
      setError('Please select a technician.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('technician', formData.technician);
      data.append(
        'applianceType',
        formData.applianceType === 'Other Home Appliance' && formData.customAppliance
          ? formData.customAppliance
          : formData.applianceType
      );
      data.append(
        'brand',
        formData.brand === 'Other Brand' && formData.customBrand
          ? formData.customBrand
          : formData.brand
      );
      data.append('issueDescription', formData.issueDescription.trim());
      
      if (photoFile) {
        data.append('photo', photoFile);
      }

      const token = localStorage.getItem('repair_service_token');
      const res = await api.post('/requests', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit repair request.');
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto 3rem' }}>
      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#94a3b8',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to My Requests</span>
      </Link>

      <div
        className="clean-card"
        style={{
          padding: '2.25rem',
          backgroundColor: '#111726',
          borderRadius: '14px',
          border: '1px solid #1e293d',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.3rem' }}>
            New Repair Request
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Provide appliance specifications, issue details, and optional inspection photo
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>{error}</strong>
              {fieldErrors.length > 0 && (
                <ul style={{ marginTop: '0.35rem', paddingLeft: '1.1rem', fontSize: '0.8rem' }}>
                  {fieldErrors.map((fe, i) => (
                    <li key={i}>{fe.message}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Technician Select */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
              Assign Technician
            </label>
            {loadingTechs ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading technicians...</div>
            ) : technicians.length === 0 ? (
              <div className="alert alert-info">
                No technicians registered yet.
              </div>
            ) : (
              <select
                name="technician"
                className="form-control"
                value={formData.technician}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              >
                {technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} — {t.specialization} ({t.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Appliance Type */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Appliance Type
              </label>
              <select
                name="applianceType"
                className="form-control"
                value={formData.applianceType}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              >
                {COMMON_APPLIANCES.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Brand
              </label>
              <select
                name="brand"
                className="form-control"
                value={formData.brand}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              >
                {COMMON_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.applianceType === 'Other Home Appliance' && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Custom Appliance Name
              </label>
              <input
                type="text"
                name="customAppliance"
                className="form-control"
                placeholder="e.g. Coffee Machine"
                value={formData.customAppliance}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              />
            </div>
          )}

          {formData.brand === 'Other Brand' && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Custom Brand Name
              </label>
              <input
                type="text"
                name="customBrand"
                className="form-control"
                placeholder="e.g. Philips"
                value={formData.customBrand}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              />
            </div>
          )}

          {/* Issue Description */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Issue Description
              </label>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: formData.issueDescription.length >= 10 ? '#4ade80' : '#94a3b8',
                  fontWeight: 600,
                }}
              >
                {formData.issueDescription.length}/10 min chars
              </span>
            </div>
            <textarea
              name="issueDescription"
              className="form-control"
              rows={3}
              placeholder="Describe the issue in detail (e.g. AC compressor makes a rattling noise and does not blow cold air)."
              value={formData.issueDescription}
              onChange={handleChange}
              required
              minLength={10}
              style={{
                backgroundColor: '#0c121e',
                border: '1px solid #1e293d',
                color: '#f8fafc',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
              }}
            />

            {/* Quick Fill suggestions */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={12} /> Templates:
              </span>
              {QUICK_DESCRIPTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, issueDescription: q.text }))}
                  style={{
                    fontSize: '0.75rem',
                    color: '#60a5fa',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="form-group" style={{ marginTop: '1.25rem', marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
              Appliance Photo (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #2a374f',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#0c121e',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = '#111726';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a374f';
                  e.currentTarget.style.backgroundColor = '#0c121e';
                }}
              >
                <Upload size={24} style={{ margin: '0 auto 0.4rem', color: '#60a5fa', display: 'block' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>
                  Click to upload appliance photo
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Supports JPEG, PNG, WebP or SVG up to 5MB
                </div>
              </div>
            ) : (
              <div
                style={{
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #1e293d',
                  backgroundColor: '#0c121e',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Appliance Preview"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #2a374f',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    {photoFile?.name || 'Uploaded photo'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    {photoFile?.size ? `${(photoFile.size / 1024).toFixed(1)} KB` : 'Image attached'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.65rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <X size={14} />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.925rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
            disabled={loading}
          >
            {loading ? 'Submitting Request...' : 'Submit Repair Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseRequest;
