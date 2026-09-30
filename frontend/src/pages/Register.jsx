import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Wrench, AlertCircle } from 'lucide-react';

const SPECIALIZATIONS = [
  'Air Conditioner (AC)',
  'Refrigerator & Freezer',
  'Washing Machine & Dryer',
  'Microwave & Oven',
  'Television & Home Audio',
  'Water Purifier & RO',
  'General Home Appliances',
];

const Register = () => {
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Air Conditioner (AC)',
    address: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
        ...(role === 'technician' ? { specialization: formData.specialization } : { address: formData.address }),
      };

      const newUser = await register(payload);
      if (newUser.role === 'technician') {
        navigate('/technician');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto 2rem' }}>
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
            Create ServiceDesk Account
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Choose your account role and enter your details
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
          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder={role === 'customer' ? 'e.g. Kartik Wagh' : 'e.g. Rajesh Sharma'}
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                backgroundColor: '#0c121e',
                border: '1px solid #1e293d',
                color: '#f8fafc',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.15rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder={role === 'customer' ? 'you@example.com' : 'tech@fixitpro.in'}
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+91 98200 12345"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
              style={{
                backgroundColor: '#0c121e',
                border: '1px solid #1e293d',
                color: '#f8fafc',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
              }}
            />
          </div>

          {role === 'technician' ? (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Specialization Area
              </label>
              <select
                name="specialization"
                className="form-control"
                value={formData.specialization}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                Service Address (Mumbai / MMR)
              </label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="e.g. Flat 402, Sea Breeze Apts, Sector 17, Vashi, Navi Mumbai"
                value={formData.address}
                onChange={handleChange}
                style={{
                  backgroundColor: '#0c121e',
                  border: '1px solid #1e293d',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                }}
              />
            </div>
          )}

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
            {loading ? 'Creating Account...' : `Register as ${role === 'customer' ? 'Customer' : 'Technician'}`}
          </button>
        </form>

        {/* Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
