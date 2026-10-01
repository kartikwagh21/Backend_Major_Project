import axios from 'axios';

// Sanitize, strip quotes, and validate any environment or fallback URL
const sanitizeAndValidateUrl = (rawUrl) => {
  if (!rawUrl) return null;
  let cleaned = String(rawUrl)
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .trim()
    .replace(/;+$/, '')
    .trim();

  if (!cleaned) return null;

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  cleaned = cleaned.replace(/\/+$/, '');

  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.origin + parsed.pathname.replace(/\/+$/, '');
  } catch (err) {
    console.warn('Invalid URL pattern detected:', rawUrl);
    return null;
  }
};

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_BASE_URL;
  let resolved = sanitizeAndValidateUrl(envUrl);

  // If no environment variable is configured, default to local dev server
  if (!resolved) {
    resolved = 'http://localhost:5001/api';
  }

  return resolved;
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
