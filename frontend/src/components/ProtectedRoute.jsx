import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E7EB',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p>Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their appropriate dashboard if unauthorized for this route
    if (user?.role === 'technician') {
      return <Navigate to="/technician" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
