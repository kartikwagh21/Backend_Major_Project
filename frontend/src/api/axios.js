import axios from 'axios';

// Base URL configured from environment variable with smart fallback and normalization
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Normalize URL: remove trailing slashes and ensure /api is present
let normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
if (!normalizedBaseUrl.endsWith('/api')) {
  normalizedBaseUrl = `${normalizedBaseUrl}/api`;
}

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('repair_service_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthenticated 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('repair_service_token');
        localStorage.removeItem('repair_service_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
