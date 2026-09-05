import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campushub_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration / 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('campushub_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          if (res.data.access) {
            localStorage.setItem('campushub_access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch {
          // Token refresh failed - clean up tokens
          localStorage.removeItem('campushub_access_token');
          localStorage.removeItem('campushub_refresh_token');
          localStorage.removeItem('campushub_user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
