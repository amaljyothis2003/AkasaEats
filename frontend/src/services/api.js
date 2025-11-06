import axios from 'axios';

// API Base URLs
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001/api/v1';
const ITEMS_API_URL = import.meta.env.VITE_ITEMS_API_URL || 'http://localhost:3002/api/v1';
const CART_API_URL = import.meta.env.VITE_CART_API_URL || 'http://localhost:3003/api/v1';

// Create axios instances
const authAPI = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const itemsAPI = axios.create({
  baseURL: ITEMS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const cartAPI = axios.create({
  baseURL: CART_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Add interceptors to all APIs
addAuthInterceptor(authAPI);
addAuthInterceptor(itemsAPI);
addAuthInterceptor(cartAPI);

// Response interceptor for error handling
const addErrorInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

addErrorInterceptor(authAPI);
addErrorInterceptor(itemsAPI);
addErrorInterceptor(cartAPI);

// Auth API endpoints
export const authService = {
  register: (data) => authAPI.post('/auth/register', data),
  login: (data) => authAPI.post('/auth/login', data),
  getProfile: () => authAPI.get('/auth/profile'),
  updateProfile: (data) => authAPI.put('/auth/profile', data),
  deleteAccount: () => authAPI.delete('/auth/user'),
  logout: () => authAPI.post('/auth/logout'),
};

// Items API endpoints
export const itemsService = {
  getAllItems: (params) => itemsAPI.get('/items', { params }),
  getItem: (id) => itemsAPI.get(`/items/${id}`),
  getCategories: () => itemsAPI.get('/items/categories'),
  getItemsByCategory: (category) => itemsAPI.get(`/items/category/${category}`),
  searchItems: (query) => itemsAPI.get('/items/search', { params: { q: query } }),
  checkStock: (itemId, quantity) => itemsAPI.post('/items/check-stock', { itemId, quantity }),
};

// Cart API endpoints
export const cartService = {
  getCart: () => cartAPI.get('/cart'),
  addToCart: (itemId, quantity) => cartAPI.post('/cart', { itemId, quantity }),
  updateQuantity: (itemId, quantity) => cartAPI.put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId) => cartAPI.delete(`/cart/${itemId}`),
  clearCart: () => cartAPI.delete('/cart'),
  validateCart: () => cartAPI.get('/cart/validate'),
};

export { authAPI, itemsAPI, cartAPI };
