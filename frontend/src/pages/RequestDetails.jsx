import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StatusHistoryTimeline from '../components/StatusHistoryTimeline';
import PhotoModal from '../components/PhotoModal';
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  User,
  Phone,
  Mail,
  MapPin,
  Wrench,
} from 'lucide-react';

const VALID_NEXT_STATUS_MAP = {
  Pending: ['Assigned', 'Cancelled'],
  Assigned: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const RequestDetails = () => {
  const { id } = useParams();
  const { user, isCustomer, isTechnician } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const [modalImage, setModalImage] = useState(null);

  const fetchRequestDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.data);
        const allowed = VALID_NEXT_STATUS_MAP[res.data.data.status] || [];
        if (allowed.length > 0) {
          setSelectedNextStatus(allowed[0]);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load request details. You may not have permission to view this request.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedNextStatus) return;

    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const res = await api.patch(`/requests/${id}/status`, {
        status: selectedNextStatus,
        note: statusNote.trim() || `Status updated to ${selectedNextStatus}`,
      });

      if (res.data.success) {
        setUpdateSuccess(`Status successfully updated to "${selectedNextStatus}"!`);
        setRequest(res.data.data);
        setStatusNote('');
        const allowed = VALID_NEXT_STATUS_MAP[res.data.data.status] || [];
        if (allowed.length > 0) {
          setSelectedNextStatus(allowed[0]);
        }
        setTimeout(() => setUpdateSuccess(''), 4000);
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update request status.');
    } finally {
      setUpdating(false);
    }
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return '/uploads/voltas_1.5ton_split_ac.svg';
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;
    const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;

    let base = import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_BASE_URL;
    if (base) {
      base = base.replace(/\/api\/?$/, '');
    } else {
      base = window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://backend-major-project-tlhb.onrender.com';
    }
    return `${base.replace(/\/+$/, '')}/${cleanPath}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
        <p>Loading request details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div style={{ maxWidth: '500px', margin: '3rem auto' }}>
        <div className="clean-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#111726' }}>
          <ShieldAlert size={40} color="#f87171" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f8fafc' }}>Access Restricted</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {error || 'This record does not exist or you do not have permission to view it.'}
          </p>
          <Link to={isTechnician ? '/technician' : '/dashboard'} className="btn btn-primary">
            <ArrowLeft size={15} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const allowedTransitions = VALID_NEXT_STATUS_MAP[request.status] || [];
  const isAssignedTech =
    isTechnician && request.technician && request.technician._id?.toString() === user?._id?.toString();

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Link
        to={isTechnician ? '/technician' : '/dashboard'}
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
        <span>Back to {isTechnician ? 'Assigned Queue' : 'My Requests'}</span>
      </Link>

      {/* Header Card */}
      <div
        className="clean-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#111726',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {request.brand} • REQUEST #{request._id.slice(-6).toUpperCase()}
          </div>
          <h1 style={{ fontSize: '1.4rem', color: '#f8fafc', marginTop: '0.15rem' }}>
            {request.applianceType}
          </h1>
        </div>

        <StatusBadge status={request.status} />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '1.25rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Appliance Image */}
          <div className="clean-card" style={{ padding: '1.25rem', backgroundColor: '#111726' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Appliance Inspection Photo</h3>
              <button
                type="button"
                onClick={() =>
                  setModalImage({
                    url: getImageUrl(request.photoPath),
                    alt: `${request.brand} ${request.applianceType}`,
                  })
                }
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
              >
                <ExternalLink size={12} />
                <span>Enlarge</span>
              </button>
            </div>

            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                backgroundColor: '#0c121e',
                border: '1px solid #1e293d',
                cursor: 'pointer',
                maxHeight: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() =>
                setModalImage({
                  url: getImageUrl(request.photoPath),
                  alt: `${request.brand} ${request.applianceType}`,
                })
              }
            >
              <img
                src={getImageUrl(request.photoPath)}
                alt={`${request.brand} ${request.applianceType}`}
                style={{ width: '100%', maxHeight: '280px', objectFit: 'contain' }}
                onError={(e) => {
                  const fallbackPath = `/${request.photoPath?.startsWith('/') ? request.photoPath.slice(1) : request.photoPath}`;
                  if (!e.currentTarget.dataset.retried) {
                    e.currentTarget.dataset.retried = 'true';
                    e.currentTarget.src = fallbackPath;
                  }
                }}
              />
            </div>
          </div>

          {/* Issue */}
          <div className="clean-card" style={{ padding: '1.25rem', backgroundColor: '#111726' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.5rem' }}>Reported Problem</h3>
            <p
              style={{
                color: '#cbd5e1',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                backgroundColor: '#0c121e',
                padding: '0.85rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid #1e293d',
              }}
            >
              {request.issueDescription}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem' }}>
              <Calendar size={14} />
              <span>Created on {new Date(request.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>

          {/* Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="clean-card" style={{ padding: '1rem', backgroundColor: '#111726' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                CUSTOMER DETAILS
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#f8fafc' }}>{request.customer?.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} /> {request.customer?.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} /> {request.customer?.email}</div>
                {request.customer?.address && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}><MapPin size={13} style={{ marginTop: '2px', flexShrink: 0 }} /> {request.customer?.address}</div>}
              </div>
            </div>

            <div className="clean-card" style={{ padding: '1rem', backgroundColor: '#111726' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                ASSIGNED TECHNICIAN
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#f8fafc' }}>{request.technician?.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ color: '#c084fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Wrench size={13} /> {request.technician?.specialization}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} /> {request.technician?.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} /> {request.technician?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Technician Action Panel */}
          {isAssignedTech && (
            <div className="clean-card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb', backgroundColor: '#111726' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
                Update Job Status
              </h3>

              {updateSuccess && (
                <div className="alert alert-success">
                  <CheckCircle2 size={16} />
                  <span>{updateSuccess}</span>
                </div>
              )}

              {updateError && (
                <div className="alert alert-error">
                  <AlertCircle size={16} />
                  <span>{updateError}</span>
                </div>
              )}

              {allowedTransitions.length > 0 ? (
                <form onSubmit={handleStatusUpdate}>
                  <div className="form-group">
                    <label className="form-label">Next Status State</label>
                    <select
                      className="form-control"
                      value={selectedNextStatus}
                      onChange={(e) => setSelectedNextStatus(e.target.value)}
                      required
                    >
                      {allowedTransitions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service Log / Progress Note</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g. Completed initial diagnostic, replaced capacitor."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.6rem' }}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : `Transition to ${selectedNextStatus}`}
                  </button>
                </form>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  This request has reached terminal state: <strong>{request.status}</strong>.
                </div>
              )}
            </div>
          )}

          {/* Timeline Card */}
          <div className="clean-card" style={{ padding: '1.25rem', backgroundColor: '#111726' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
              Status Audit Trail
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              Timestamped progression history for this repair lifecycle
            </p>

            <StatusHistoryTimeline history={request.statusHistory} />
          </div>
        </div>
      </div>

      {modalImage && (
        <PhotoModal
          imageUrl={modalImage.url}
          altText={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
};

export default RequestDetails;
