import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import SecureImage from './SecureImage';

const PhotoModal = ({ imageUrl, altText, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(31, 41, 55, 0.75)',
        backdropFilter: 'blur(4px)',
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
          width: '720px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
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
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={16} color="#2563EB" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>
              {altText || 'Appliance Inspection Photo'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.5rem' }}
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div
          style={{
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: 'calc(85vh - 55px)',
            overflow: 'auto',
            backgroundColor: '#F5F6F8',
          }}
        >
          <SecureImage
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
