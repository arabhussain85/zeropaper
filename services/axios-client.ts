import axios, { AxiosInstance, AxiosError } from 'axios';

// Base URL for API - use environment variable if available
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://services.stage.zeropaper.online/api/zpu';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle token refresh
    if (error.response?.status === 401 && originalRequest) {
      try {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const newToken = response.data.token;
        if (localStorage.getItem('authToken')) {
          localStorage.setItem('authToken', newToken);
        } else {
          sessionStorage.setItem('authToken', newToken);
        }

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Error handler helper
const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.error || error.message;
    return { success: false, message: errorMessage };
  }
  return { success: false, message: 'An unexpected error occurred' };
};

export { axiosInstance, handleAxiosError };