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

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'technician') {
        navigate('/technician');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password, role);
      if (loggedInUser.role === 'technician') {
        navigate('/technician');
      } else {
        navigate('/dashboard');
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
          backgroundColor: '#111726',
          borderRadius: '14px',
          border: '1px solid #1e293d',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
            Sign in to ServiceDesk
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Choose your account role and enter credentials
          </p>
        </div>

        {/* Role Segmented Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#0c121e',
            border: '1px solid #1e293d',
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
              border: role === 'customer' ? '1px solid #2a374f' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              backgroundColor: role === 'customer' ? '#182032' : 'transparent',
              color: role === 'customer' ? '#f8fafc' : '#94a3b8',
              boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
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
              border: role === 'technician' ? '1px solid #2a374f' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              backgroundColor: role === 'technician' ? '#182032' : 'transparent',
              color: role === 'technician' ? '#f8fafc' : '#94a3b8',
              boxShadow: role === 'technician' ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
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
            <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
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
                backgroundColor: '#0c121e',
                border: '1px solid #1e293d',
                color: '#f8fafc',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
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
                backgroundColor: '#0c121e',
                border: '1px solid #1e293d',
                color: '#f8fafc',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#16a34a',
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
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
            disabled={loading}
          >
            {loading ? 'Signing in...' : `Sign in as ${role === 'customer' ? 'Customer' : 'Technician'}`}
          </button>
        </form>

        {/* Quick Demo Fill */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '1rem',
            backgroundColor: '#0c121e',
            border: '1px solid #1e293d',
            borderRadius: '10px',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.6rem' }}>
            Instant Demo Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => handleAutofill('customer')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                backgroundColor: '#182032',
                color: '#f1f5f9',
                border: '1px solid #2a374f',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#202b42')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#182032')}
            >
              Fill Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('technician')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                backgroundColor: '#182032',
                color: '#f1f5f9',
                border: '1px solid #2a374f',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#202b42')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#182032')}
            >
              Fill Demo Technician
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
