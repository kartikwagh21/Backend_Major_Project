import axios from 'axios';

// Resilient API Base URL resolution with automatic protocol & fallback handling
const getBaseUrl = () => {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  const isBrowser = typeof window !== 'undefined';
  const isProduction =
    isBrowser &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  // On production hosts (e.g. Vercel), if env variable is empty or localhost, use live Render backend
  if (isProduction && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    envUrl = 'https://backend-major-project-tlhb.onrender.com/api';
  }

  // Local development default
  if (!envUrl) {
    envUrl = 'http://localhost:5001/api';
  }

  // Ensure valid HTTP/HTTPS protocol
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    envUrl = `https://${envUrl}`;
  }

  // Strip trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');

  // Ensure /api suffix is present
  if (!envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }

  return envUrl;
};

const normalizedBaseUrl = getBaseUrl();

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
