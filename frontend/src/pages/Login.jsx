import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password, role);
      if (loggedInUser.role === 'technician') {
        navigate('/technician', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'customer') {
      setEmail('kartik.wagh@gmail.com');
      setPassword('password123');
    } else {
      setEmail('rajesh.sharma@fixitpro.in');
      setPassword('password123');
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto 2rem' }}>
      <div
        className="clean-card"
        style={{
          padding: '2.5rem 2.25rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.4rem' }}>
            Sign in to ServiceDesk
          </h1>
          <p style={{ color: '#4B5563', fontSize: '0.875rem' }}>
            Choose your account role and enter credentials
          </p>
        </div>

        {/* Role Segmented Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB',
            padding: '4px',
            borderRadius: '8px',
            gap: '4px',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('customer')}
            style={{
              padding: '0.55rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: role === 'customer' ? '1px solid #D1D5DB' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              backgroundColor: role === 'customer' ? '#FFFFFF' : 'transparent',
              color: role === 'customer' ? '#1F2937' : '#4B5563',
              boxShadow: role === 'customer' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <User size={15} />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('technician')}
            style={{
              padding: '0.55rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: role === 'technician' ? '1px solid #D1D5DB' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              backgroundColor: role === 'technician' ? '#FFFFFF' : 'transparent',
              color: role === 'technician' ? '#1F2937' : '#4B5563',
              boxShadow: role === 'technician' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Wrench size={15} />
            <span>Technician</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                color: '#1F2937',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                color: '#1F2937',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#2563EB',
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
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}></span>
                <span>Signing in... (Waking up server...)</span>
              </span>
            ) : (
              `Sign in as ${role === 'customer' ? 'Customer' : 'Technician'}`
            )}
          </button>
        </form>

        {/* Quick Demo Fill */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '1rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
          }}
        >
          <div style={{ color: '#4B5563', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.6rem' }}>
            Instant Demo Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => handleAutofill('customer')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                backgroundColor: '#FFFFFF',
                color: '#1F2937',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              Fill Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('technician')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                backgroundColor: '#FFFFFF',
                color: '#1F2937',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              Fill Demo Technician
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#4B5563' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
