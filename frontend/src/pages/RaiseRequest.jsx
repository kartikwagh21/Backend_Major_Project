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

const PRESET_PHOTOS = [
  { id: 'ac', label: 'Air Conditioner', file: '/sample-appliances/sample_ac.svg', name: 'voltas_ac_photo.svg' },
  { id: 'wm', label: 'Washing Machine', file: '/sample-appliances/sample_wm.svg', name: 'lg_frontload_photo.svg' },
  { id: 'fridge', label: 'Refrigerator', file: '/sample-appliances/sample_fridge.svg', name: 'samsung_fridge_photo.svg' },
  { id: 'micro', label: 'Microwave Oven', file: '/sample-appliances/sample_microwave.svg', name: 'ifb_microwave_photo.svg' },
  { id: 'tv', label: 'Smart TV', file: '/sample-appliances/sample_tv.svg', name: 'sony_bravia_photo.svg' },
  { id: 'ro', label: 'Water Purifier', file: '/sample-appliances/sample_ro.svg', name: 'kent_ro_photo.svg' },
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

  const handleSelectPresetPhoto = async (preset) => {
    try {
      setError('');
      const response = await fetch(preset.file);
      const blob = await response.blob();
      const file = new File([blob], preset.name, { type: 'image/svg+xml' });
      setPhotoFile(file);
      setPhotoPreview(preset.file);
    } catch (err) {
      setError('Could not load preset photo.');
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

    if (!photoFile) {
      setError('Please upload an appliance photo or select one of the sample photos.');
      return;
    }

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
      data.append('photo', photoFile);

      const res = await api.post('/requests', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
    <div style={{ maxWidth: '680px', margin: '0.5rem auto' }}>
      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#94a3b8',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1rem',
        }}
      >
        <ArrowLeft size={15} />
        <span>Back to My Requests</span>
      </Link>

      <div className="clean-card" style={{ padding: '2rem', backgroundColor: '#111726' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.45rem', color: '#f8fafc', marginBottom: '0.2rem' }}>
            New Repair Request
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Provide appliance specifications, photo, and assign a Mumbai service specialist
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
          <div className="form-group">
            <label className="form-label">Assign Technician</label>
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
              >
                {technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} — {t.specialization} ({t.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Appliance Type */}
            <div className="form-group">
              <label className="form-label">Appliance Type</label>
              <select
                name="applianceType"
                className="form-control"
                value={formData.applianceType}
                onChange={handleChange}
                required
              >
                {COMMON_APPLIANCES.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select
                name="brand"
                className="form-control"
                value={formData.brand}
                onChange={handleChange}
                required
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
            <div className="form-group">
              <label className="form-label">Custom Appliance Name</label>
              <input
                type="text"
                name="customAppliance"
                className="form-control"
                placeholder="e.g. Coffee Machine"
                value={formData.customAppliance}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {formData.brand === 'Other Brand' && (
            <div className="form-group">
              <label className="form-label">Custom Brand Name</label>
              <input
                type="text"
                name="customBrand"
                className="form-control"
                placeholder="e.g. Philips"
                value={formData.customBrand}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Issue Description */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Issue Description</label>
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
            />

            {/* Quick Fill suggestions */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Sparkles size={11} /> Quick templates:
              </span>
              {QUICK_DESCRIPTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, issueDescription: q.text }))}
                  style={{
                    fontSize: '0.72rem',
                    color: '#60a5fa',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Appliance Inspection Photo (Required)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              required={!photoFile}
            />

            {!photoPreview ? (
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #2a374f',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem',
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
                  <Upload size={22} style={{ margin: '0 auto 0.4rem', color: '#60a5fa', display: 'block' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>
                    Click or drag & drop appliance photo
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    JPEG, PNG, WebP or SVG up to 5MB
                  </div>
                </div>

                {/* Instant Preset Photo Picker */}
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Or select an instant sample photo:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
                    {PRESET_PHOTOS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPresetPhoto(p)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.6rem',
                          backgroundColor: '#182032',
                          border: '1px solid #2a374f',
                          borderRadius: '6px',
                          color: '#cbd5e1',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.color = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#2a374f';
                          e.currentTarget.style.color = '#cbd5e1';
                        }}
                      >
                        <ImageIcon size={13} color="#60a5fa" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1px solid #1e293d',
                  maxHeight: '220px',
                  backgroundColor: '#0c121e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '210px', objectFit: 'contain' }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="btn btn-danger"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '0.3rem 0.55rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <X size={13} />
                  <span>Change Photo</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.7rem' }}
            disabled={loading || loadingTechs || technicians.length === 0}
          >
            {loading ? 'Submitting Request...' : 'Submit Repair Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseRequest;
