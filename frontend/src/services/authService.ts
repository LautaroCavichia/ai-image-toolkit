// src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  displayName: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

// Function to handle login
export const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials);
  // Store the token and user info in localStorage
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('userId', response.data.userId);
  localStorage.setItem('email', response.data.email);
  localStorage.setItem('displayName', response.data.displayName);
  return response.data;
};

// Function to handle registration
export const register = async (credentials: AuthRequest): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, credentials);
  // Store the token and user info in localStorage
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('userId', response.data.userId);
  localStorage.setItem('email', response.data.email);
  localStorage.setItem('displayName', response.data.displayName);
  return response.data;
};

// Function to create a test user (for development/testing)
export const createTestUser = async (): Promise<AuthResponse> => {
  const response = await axios.get<AuthResponse>(`${API_BASE_URL}/auth/create-test-user`);
  // Store the token and user info in localStorage
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('userId', response.data.userId);
  localStorage.setItem('email', response.data.email);
  localStorage.setItem('displayName', response.data.displayName);
  return response.data;
};

// Function to log out user
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  localStorage.removeItem('displayName');
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Get current user
export const getCurrentUser = (): { userId: string; email: string; displayName: string } | null => {
  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email');
  const displayName = localStorage.getItem('displayName');
  
  if (userId && email) {
    return { userId, email, displayName: displayName || '' };
  }
  
  return null;
};

// Get auth token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set up axios interceptor to include token in all requests
export const setupAxiosInterceptors = (): void => {
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};