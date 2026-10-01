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

// Response interceptor with auto-retry on cold-start (502/503/504 or network errors)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 unauthenticated errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('repair_service_token');
      localStorage.removeItem('repair_service_user');
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }

    // Auto-retry cold-start or temporary network failure (up to 3 times)
    if (!config || config.__isRetryRequest) {
      return Promise.reject(error);
    }

    const isNetworkOrColdStart =
      !error.response ||
      [502, 503, 504].includes(error.response.status) ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error');

    if (isNetworkOrColdStart) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = 3;

      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        const delay = Math.min(1500 * config.__retryCount, 4000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

// Pre-warm backend server in background on app load to mitigate cold-starts
if (typeof window !== 'undefined') {
  setTimeout(() => {
    api.get('/health', { timeout: 60000 }).catch(() => {});
  }, 200);
}

export default api;
