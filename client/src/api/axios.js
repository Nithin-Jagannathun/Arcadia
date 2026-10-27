import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arcadia_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 session expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we got 401 on an authenticated endpoint and we had a token, remove token
      if (localStorage.getItem('arcadia_token') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('arcadia_token');
        localStorage.removeItem('arcadia_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
