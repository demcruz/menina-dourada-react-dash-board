import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if user is authenticated using the new session keys
    const isAuthenticated = sessionStorage.getItem('md_auth') === 'true';
    const username = sessionStorage.getItem('md_user');
    
    if (isAuthenticated && username) {
      // Create fake bearer token
      const token = `fake-bearer-token-${username}`;
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Clear auth data using new session keys
      sessionStorage.removeItem('md_auth');
      sessionStorage.removeItem('md_user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;