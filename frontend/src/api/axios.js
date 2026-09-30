import axios from 'axios';

// Smart resolution for API Base URL
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isBrowser = typeof window !== 'undefined';
  const isProduction = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // If in production browser and env variable is missing or points to localhost, use live Render backend
  if (isProduction) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://backend-major-project-tlhb.onrender.com/api';
    }
  }

  return envUrl || 'http://localhost:5001/api';
};

const rawBaseUrl = getBaseUrl();
let normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
if (!normalizedBaseUrl.endsWith('/api')) {
  normalizedBaseUrl = `${normalizedBaseUrl}/api`;
}

const api = axios.create({
  baseURL: normalizedBaseUrl,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('repair_service_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('repair_service_token');
      localStorage.removeItem('repair_service_user');
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
