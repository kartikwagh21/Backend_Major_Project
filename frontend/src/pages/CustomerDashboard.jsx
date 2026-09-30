import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PhotoModal from '../components/PhotoModal';
import {
  Plus,
  Wrench,
  Calendar,
  AlertCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [modalImage, setModalImage] = useState(null);

  const fetchRequests = async (status = selectedFilter) => {
    setLoading(true);
    setError('');
    try {
      const url = status && status !== 'All' ? `/requests/my?status=${encodeURIComponent(status)}` : '/requests/my';
      const res = await api.get(url);
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch repair requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'customer') {
      fetchRequests(selectedFilter);
    }
  }, [selectedFilter, user?._id, user?.role]);

  const stats = {
    total: requests.length,
    assigned: requests.filter((r) => r.status === 'Assigned').length,
    inProgress: requests.filter((r) => r.status === 'In Progress').length,
    completed: requests.filter((r) => r.status === 'Completed').length,
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

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.2rem' }}>
            My Repair Requests
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Real-time appliance service tracking and technician status updates
          </p>
        </div>

        <Link
          to="/raise-request"
          className="btn btn-primary"
          style={{ padding: '0.55rem 1.15rem' }}
        >
          <Plus size={16} />
          <span>New Repair Request</span>
        </Link>
      </div>

      {/* KPI Metrics */}
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
            Total Requests
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
            {requests.length}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Assigned
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
            Completed
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
          <span>Filter:</span>
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

      {/* Error Banner */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#64748b' }}>
          <p>Loading your requests...</p>
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
          <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.25rem' }}>No Requests Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
            {selectedFilter === 'All'
              ? 'You have not submitted any repair requests yet.'
              : `No repair requests with status '${selectedFilter}'.`}
          </p>
          <Link to="/raise-request" className="btn btn-primary">
            <Plus size={15} />
            <span>Raise Request</span>
          </Link>
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
              {/* Photo Area */}
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
                    const fallbackPath = `/${req.photoPath?.startsWith('/') ? req.photoPath.slice(1) : req.photoPath}`;
                    if (!e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = 'true';
                      e.currentTarget.src = fallbackPath;
                    }
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
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {req.issueDescription}
                </p>

                {/* Technician Box */}
                <div
                  style={{
                    backgroundColor: '#0c121e',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #1e293d',
                    marginTop: 'auto',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                    Assigned Technician
                  </div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {req.technician?.name || 'Service Technician'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {req.technician?.specialization} • {req.technician?.phone}
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #1e293d',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <Calendar size={13} />
                    <span>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <Link
                    to={`/requests/${req._id}`}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    <span>Details</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
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

export default CustomerDashboard;
