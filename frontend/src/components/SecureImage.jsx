import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const SecureImage = ({
  src,
  alt = 'Appliance',
  className = '',
  style = {},
  onClick,
  fallback = null,
}) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let createdUrl = null;

    if (!src) {
      setLoading(false);
      setError(true);
      return;
    }

    // Direct blob or data URL
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      setObjectUrl(src);
      setLoading(false);
      return;
    }

    // Determine normalized API request path
    let requestPath = src;
    if (requestPath.startsWith('http://') || requestPath.startsWith('https://')) {
      try {
        const parsed = new URL(requestPath);
        requestPath = parsed.pathname;
      } catch (e) {
        // fallback to original
      }
    }

    // Strip leading /api or api/ so axios baseURL isn't duplicated
    if (requestPath.startsWith('/api/')) {
      requestPath = requestPath.replace(/^\/api/, '');
    } else if (requestPath.startsWith('api/')) {
      requestPath = requestPath.replace(/^api/, '');
    }

    setLoading(true);
    setError(false);

    api
      .get(requestPath, { responseType: 'blob' })
      .then((res) => {
        if (isMounted) {
          const url = URL.createObjectURL(res.data);
          createdUrl = url;
          setObjectUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Could not load secure image:', err.message);
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c121e',
          color: '#64748b',
          fontSize: '0.75rem',
          ...style,
        }}
        onClick={onClick}
      >
        <span>Loading image...</span>
      </div>
    );
  }

  if (error || !objectUrl) {
    if (fallback) return fallback;
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c121e',
          color: '#64748b',
          fontSize: '0.8rem',
          fontWeight: 500,
          ...style,
        }}
        onClick={onClick}
      >
        <span>📷 Appliance Photo</span>
      </div>
    );
  }

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
    />
  );
};

export default SecureImage;
