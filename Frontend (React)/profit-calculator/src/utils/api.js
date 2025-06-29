// src/utils/api.js
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};

// File API
export const fileAPI = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  }
};

// User Data API
export const userDataAPI = {
  getData: () => api.get('/user/data'),
  saveData: (data) => api.post('/user/data', data),
  addTransaction: (transaction) => api.post('/user/transactions', transaction),
  updateTransaction: (id, transaction) => api.put(`/user/transactions/${id}`, transaction),
  deleteTransaction: (id) => api.delete(`/user/transactions/${id}`),
  updateSettings: (settings) => api.put('/user/settings', settings)
};

// Currency API
export const currencyAPI = {
  getSupportedCurrencies: () => api.get('/currencies'),
  convertCurrency: (amount, fromCurrency, toCurrency) => 
    api.get('/currencies/convert', { params: { amount, from: fromCurrency, to: toCurrency } })
};

export default api;