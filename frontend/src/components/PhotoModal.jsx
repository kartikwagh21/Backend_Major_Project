import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const PhotoModal = ({ imageUrl, altText, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 14, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '85vh',
          backgroundColor: '#111726',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid #1e293d',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #1e293d',
            backgroundColor: '#111726',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>
            {altText || 'Appliance Inspection Photo'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <ExternalLink size={13} />
              <span>Full Size</span>
            </a>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.5rem' }}
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: 'calc(85vh - 55px)',
            overflow: 'auto',
            backgroundColor: '#0c121e',
          }}
        >
          <img
            src={imageUrl}
            alt={altText || 'Appliance'}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
