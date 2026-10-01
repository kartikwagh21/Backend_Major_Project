import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, LogOut, Plus, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isTechnician, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Do not render navbar on auth pages (login / register)
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homeLink = !isAuthenticated
    ? '/login'
    : isTechnician
    ? '/technician'
    : '/dashboard';

  return (
    <header
      style={{
        backgroundColor: '#1F2937',
        borderBottom: '1px solid #374151',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link to={homeLink} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              backgroundColor: '#2563EB',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Wrench size={19} />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              ServiceDesk
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '1px' }}>
              Repair Management
            </div>
          </div>
        </Link>

        {/* Navigation & User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <>
              {isCustomer && (
                <>
                  <Link
                    to="/dashboard"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      color: ['/dashboard', '/my-requests', '/requests/my'].includes(location.pathname) ? '#FFFFFF' : '#D1D5DB',
                      backgroundColor: ['/dashboard', '/my-requests', '/requests/my'].includes(location.pathname) ? '#374151' : 'transparent',
                      border: ['/dashboard', '/my-requests', '/requests/my'].includes(location.pathname) ? '1px solid #4B5563' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                      textDecoration: 'none',
                    }}
                  >
                    <ClipboardList size={15} />
                    <span>My Requests</span>
                  </Link>

                  <Link
                    to="/raise-request"
                    className="btn btn-primary"
                    style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem', textDecoration: 'none', backgroundColor: '#2563EB' }}
                  >
                    <Plus size={16} />
                    <span>New Request</span>
                  </Link>
                </>
              )}

              {isTechnician && (
                <Link
                  to="/technician"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    color: ['/technician', '/assigned-queue', '/assigned', '/requests/assigned'].includes(location.pathname) ? '#FFFFFF' : '#D1D5DB',
                    backgroundColor: ['/technician', '/assigned-queue', '/assigned', '/requests/assigned'].includes(location.pathname) ? '#374151' : 'transparent',
                    border: ['/technician', '/assigned-queue', '/assigned', '/requests/assigned'].includes(location.pathname) ? '1px solid #4B5563' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                  }}
                >
                  <ClipboardList size={15} />
                  <span>Assigned Queue</span>
                </Link>
              )}

              {/* User Profile Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: '#2563EB',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#9CA3AF', textTransform: 'capitalize' }}>
                    {user?.role} {user?.specialization ? `• ${user.specialization}` : ''}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem 0.65rem',
                  color: '#F87171',
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/login"
                style={{
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  backgroundColor: '#2563EB',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.15s ease',
                }}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
