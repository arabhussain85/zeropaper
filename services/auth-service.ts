import { axiosInstance, handleAxiosError } from './axios-client';

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const authService = {
  async sendOTP(email: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/send-otp', { email });
      return { success: true, message: 'OTP sent successfully', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, refreshToken } = response.data;

      // Store tokens
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
      }

      return { success: true, message: 'Login successful', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return { success: true, message: 'Registration successful', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      return { success: true, message: 'Password reset successful', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
  },
};