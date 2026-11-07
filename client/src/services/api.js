import axios from 'axios';

// In development: VITE_API_URL is empty → uses '/api' → Vite proxy forwards to http://localhost:5000/api
// In production:  VITE_API_URL should be set to the full backend URL, e.g. https://my-app.onrender.com/api
//                 But if frontend is served by the backend (same origin), '/api' still works.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sweety_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('sweety_token');
        localStorage.removeItem('sweety_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

