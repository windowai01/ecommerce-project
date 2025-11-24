const API_BASE_URL = 'http://localhost:8080/api';

// Auth APIs
export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,
  GET_USER: (id) => `${API_BASE_URL}/users/${id}`,
  UPDATE_USER: (id) => `${API_BASE_URL}/users/${id}`,
  GET_ALL_USERS: `${API_BASE_URL}/users/all`,
};

// Product APIs
export const PRODUCT_API = {
  GET_ALL: `${API_BASE_URL}/products/all`,
  GET_FEATURED: `${API_BASE_URL}/products/featured`,
  GET_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
  GET_BY_CATEGORY: (id) => `${API_BASE_URL}/products/category/${id}`,
  GET_RELATED: (id) => `${API_BASE_URL}/products/${id}/related`,
  FILTER: `${API_BASE_URL}/products/filter`,
  SEARCH: `${API_BASE_URL}/products/search`,
  ADD: `${API_BASE_URL}/products/add`,
  UPDATE: (id) => `${API_BASE_URL}/products/update/${id}`,
  DELETE: (id) => `${API_BASE_URL}/products/${id}`,
};

// Category APIs
export const CATEGORY_API = {
  GET_ALL: `${API_BASE_URL}/categories/all`,
  GET_BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,
  ADD: `${API_BASE_URL}/categories/add`,
  UPDATE: (id) => `${API_BASE_URL}/categories/update/${id}`,
  DELETE: (id) => `${API_BASE_URL}/categories/${id}`,
};

// Order APIs
export const ORDER_API = {
  CREATE: `${API_BASE_URL}/orders/add`,
  GET_ALL: `${API_BASE_URL}/orders/all`,
  GET_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
  GET_BY_USER: (userId) => `${API_BASE_URL}/orders/user/${userId}`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  CANCEL: (id) => `${API_BASE_URL}/orders/${id}/cancel`,
};

// Review APIs
export const REVIEW_API = {
  GET_BY_PRODUCT: (id) => `${API_BASE_URL}/reviews/product/${id}`,
  ADD: `${API_BASE_URL}/reviews/add`,
  DELETE: (id) => `${API_BASE_URL}/reviews/${id}`,
};

// Wishlist APIs
export const WISHLIST_API = {
  GET: `${API_BASE_URL}/wishlist`,
  ADD: (productId) => `${API_BASE_URL}/wishlist/add/${productId}`,
  REMOVE: (productId) => `${API_BASE_URL}/wishlist/remove/${productId}`,
  CHECK: (productId) => `${API_BASE_URL}/wishlist/check/${productId}`,
};

// Address APIs
export const ADDRESS_API = {
  GET_ALL: `${API_BASE_URL}/addresses`,
  GET_BY_ID: (id) => `${API_BASE_URL}/addresses/${id}`,
  ADD: `${API_BASE_URL}/addresses/add`,
  UPDATE: (id) => `${API_BASE_URL}/addresses/update/${id}`,
  SET_DEFAULT: (id) => `${API_BASE_URL}/addresses/set-default/${id}`,
  DELETE: (id) => `${API_BASE_URL}/addresses/${id}`,
};

// Coupon APIs
export const COUPON_API = {
  GET_ALL: `${API_BASE_URL}/coupons/all`,
  GET_ACTIVE: `${API_BASE_URL}/coupons/active`,
  VALIDATE: `${API_BASE_URL}/coupons/validate`,
  ADD: `${API_BASE_URL}/coupons/add`,
  UPDATE: (id) => `${API_BASE_URL}/coupons/update/${id}`,
  DELETE: (id) => `${API_BASE_URL}/coupons/${id}`,
};

// Payment APIs (FREE - Mock Payment)
export const PAYMENT_API = {
  PROCESS: `${API_BASE_URL}/payment/process`,
  STATUS: (orderId) => `${API_BASE_URL}/payment/status/${orderId}`,
  REFUND: (orderId) => `${API_BASE_URL}/payment/refund/${orderId}`,
};

// Admin Dashboard APIs
export const DASHBOARD_API = {
  STATS: `${API_BASE_URL}/admin/dashboard/stats`,
  SALES_CHART: `${API_BASE_URL}/admin/dashboard/sales-chart`,
  TOP_PRODUCTS: `${API_BASE_URL}/admin/dashboard/top-products`,
  RECENT_ORDERS: `${API_BASE_URL}/admin/dashboard/recent-orders`,
};

// Helper function - Get Auth Header
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API Request Helper
export const apiRequest = async (url, options = {}) => {
  const defaultHeaders = { ...getAuthHeader() };
  
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
};

export default API_BASE_URL;