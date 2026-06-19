import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      window.location.href = '/login';
    }

    // Create user-friendly error message
    let errorMessage = ERROR_MESSAGES.SERVER_ERROR;

    if (!error.response) {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.response.status === 422) {
      errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
    } else if (error.response.data && typeof error.response.data === 'object') {
      const data = error.response.data as { message?: string };
      errorMessage = data.message || errorMessage;
    }

    return Promise.reject({
      status: false,
      message: errorMessage,
      originalError: error,
    });
  }
);

export default apiClient;
