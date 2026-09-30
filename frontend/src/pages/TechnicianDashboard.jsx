import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PhotoModal from '../components/PhotoModal';
import {
  Wrench,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Play,
  Check,
  XCircle,
  Filter,
  ChevronRight,
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [modalImage, setModalImage] = useState(null);

  const fetchAssignedRequests = async (status = selectedFilter) => {
    setLoading(true);
    setError('');
    try {
      const url = status && status !== 'All' ? `/requests/assigned?status=${encodeURIComponent(status)}` : '/requests/assigned';
      const res = await api.get(url);
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assigned requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'technician') {
      fetchAssignedRequests(selectedFilter);
    }
  }, [selectedFilter, user?._id, user?.role]);

  const handleQuickStatusUpdate = async (requestId, nextStatus) => {
    setUpdatingId(requestId);
    setError('');
    setActionSuccess('');
    try {
      const res = await api.patch(`/requests/${requestId}/status`, {
        status: nextStatus,
        note: `Status updated to ${nextStatus}`,
      });
      if (res.data.success) {
        setActionSuccess(`Job marked as "${nextStatus}" successfully!`);
        fetchAssignedRequests(selectedFilter);
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    total: requests.length,
    assigned: requests.filter((r) => r.status === 'Assigned').length,
    inProgress: requests.filter((r) => r.status === 'In Progress').length,
    completed: requests.filter((r) => r.status === 'Completed').length,
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return '';
    if (photoPath.startsWith('http')) return photoPath;
    const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
    const base = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:5001/';
    return `${base.endsWith('/') ? base : base + '/'}${cleanPath}`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>Technician Workspace</h1>
          <span
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              padding: '0.2rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {user?.specialization || 'Field Technician'}
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          Review assigned appliance service jobs and progress them through resolution
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="metric-card">
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Assigned
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
            {requests.length}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Assigned (Pending Start)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.25rem' }}>
            {stats.assigned}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            In Progress
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#c084fc', marginTop: '0.25rem' }}>
            {stats.inProgress}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed Jobs
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4ade80', marginTop: '0.25rem' }}>
            {stats.completed}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: '#111726',
          padding: '0.35rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #1e293d',
          boxShadow: 'var(--shadow-xs)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, paddingLeft: '0.4rem', marginRight: '0.25rem' }}>
          <Filter size={14} />
          <span>Status:</span>
        </div>
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            style={{
              padding: '0.35rem 0.8rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '5px',
              border: selectedFilter === filter ? '1px solid #3b82f6' : '1px solid transparent',
              cursor: 'pointer',
              backgroundColor: selectedFilter === filter ? '#2563eb' : 'transparent',
              color: selectedFilter === filter ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Action Notifications */}
      {actionSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#64748b' }}>
          <p>Loading assigned tasks...</p>
        </div>
      ) : requests.length === 0 ? (
        <div
          className="clean-card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            borderStyle: 'dashed',
            backgroundColor: '#111726',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#182032',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}
          >
            <Wrench size={20} />
          </div>
          <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.25rem' }}>No Assigned Tasks</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {selectedFilter === 'All'
              ? 'You currently have no repair requests assigned to your queue.'
              : `No assigned tasks with status '${selectedFilter}'.`}
          </p>
        </div>
      ) : (
        <div className="grid-responsive">
          {requests.map((req) => (
            <div
              key={req._id}
              className="clean-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: '#111726',
                border: '1px solid #1e293d',
              }}
            >
              {/* Photo */}
              <div
                style={{
                  position: 'relative',
                  height: '175px',
                  backgroundColor: '#0c121e',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  borderBottom: '1px solid #1e293d',
                }}
                onClick={() =>
                  setModalImage({
                    url: getImageUrl(req.photoPath),
                    alt: `${req.brand} ${req.applianceType}`,
                  })
                }
              >
                <img
                  src={getImageUrl(req.photoPath)}
                  alt={`${req.brand} ${req.applianceType}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <StatusBadge status={req.status} />
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {req.brand}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700 }}>
                    {req.applianceType}
                  </h3>
                </div>

                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    lineHeight: 1.5,
                  }}
                >
                  {req.issueDescription}
                </p>

                {/* Customer Details Box */}
                <div
                  style={{
                    backgroundColor: '#0c121e',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #1e293d',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontSize: '0.825rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#f8fafc' }}>
                    <User size={14} color="#60a5fa" />
                    <span>{req.customer?.name || 'Customer'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                    <Phone size={14} />
                    <span>{req.customer?.phone || 'No phone'}</span>
                  </div>
                  {req.customer?.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: '#64748b' }}>
                      <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{req.customer?.address}</span>
                    </div>
                  )}
                </div>

                {/* Workflow Buttons */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #1e293d',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  {req.status === 'Assigned' && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleQuickStatusUpdate(req._id, 'In Progress')}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.825rem' }}
                        disabled={updatingId === req._id}
                      >
                        <Play size={14} />
                        <span>Start Work</span>
                      </button>
                      <button
                        onClick={() => handleQuickStatusUpdate(req._id, 'Cancelled')}
                        className="btn btn-danger"
                        style={{ padding: '0.45rem 0.65rem' }}
                        disabled={updatingId === req._id}
                        title="Cancel Job"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}

                  {req.status === 'In Progress' && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleQuickStatusUpdate(req._id, 'Completed')}
                        className="btn btn-success"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.825rem' }}
                        disabled={updatingId === req._id}
                      >
                        <Check size={14} />
                        <span>Mark Completed</span>
                      </button>
                      <button
                        onClick={() => handleQuickStatusUpdate(req._id, 'Cancelled')}
                        className="btn btn-danger"
                        style={{ padding: '0.45rem 0.65rem' }}
                        disabled={updatingId === req._id}
                        title="Cancel Job"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}

                  {(req.status === 'Completed' || req.status === 'Cancelled') && (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '0.78rem',
                        color: req.status === 'Completed' ? '#4ade80' : '#f87171',
                        padding: '0.2rem 0',
                        fontWeight: 600,
                      }}
                    >
                      Job {req.status}
                    </div>
                  )}

                  <Link
                    to={`/requests/${req._id}`}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem' }}
                  >
                    <span>View Details & History</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default TechnicianDashboard;
