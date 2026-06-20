// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const DEFAULT_POS_API_TOKEN = 'bb7f835441b0dd38083386a6b1feaf48';
export const POS_API_TOKEN = import.meta.env.VITE_POS_API_TOKEN || DEFAULT_POS_API_TOKEN;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
  },
  INVOICES: {
    CREATE: '/invoices',
    LIST: '/invoices/list',
    GET_BY_ID: (id: number) => `/invoices/id/${id}`,
    GET_BY_UUID: (uuid: string) => `/invoices/uuid/${uuid}`,
  },

  PRODUCTS: {
    LIST: '/products',
    GET_BY_ID: (id: number) => `/products/id/${id}`,
  },
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  VALIDATION_ERROR: 'Please check your form for errors.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVOICE_CREATED: 'Invoice created successfully!',
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
};

// Duration for auto-dismissing toasts (in ms)
export const TOAST_DURATION = 4000;

// Default currency
export const DEFAULT_CURRENCY = import.meta.env.VITE_CURRENCY || 'جنيه';
