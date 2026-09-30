import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import RaiseRequest from './pages/RaiseRequest';
import RequestDetails from './pages/RequestDetails';

// Root redirector based on authenticated user role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Loading FixIt Pro...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'technician') {
    return <Navigate to="/technician" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Root Route */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/raise-request"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <RaiseRequest />
                  </ProtectedRoute>
                }
              />

              {/* Technician Routes */}
              <Route
                path="/technician"
                element={
                  <ProtectedRoute allowedRoles={['technician']}>
                    <TechnicianDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Request Details */}
              <Route
                path="/requests/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'technician']}>
                    <RequestDetails />
                  </ProtectedRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
