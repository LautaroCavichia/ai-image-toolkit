// src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface AuthResponse {
  token: string;
  userId: string;
  email?: string;
  displayName: string;
  isGuest?: boolean;
  tokenBalance?: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials);
  
  // Store the token and user info in localStorage
  storeUserData(response.data);
  
  return response.data;
};


export const register = async (credentials: AuthRequest): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, credentials);
  

  storeUserData(response.data);
  
  return response.data;
};

export const createGuestUser = async (): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/guest`);
  
  // Store the token and user info in localStorage
  storeUserData(response.data);
  
  return response.data;
};

// Function to convert a guest to a registered user
export const convertGuestToRegistered = async (
  userId: string,
  email: string,
  password: string,
  displayName: string
): Promise<boolean> => {
  try {
    await axios.post(`${API_BASE_URL}/auth/convert-guest`, {
      userId,
      email,
      password,
      displayName
    });
    
    const userData = getUserData();
    if (userData) {
      userData.isGuest = false;
      userData.email = email;
      userData.displayName = displayName;
      storeUserData(userData);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to convert guest account', error);
    return false;
  }
};

// Function to create a test user (for development/testing)
export const createTestUser = async (): Promise<AuthResponse> => {
  const response = await axios.get<AuthResponse>(`${API_BASE_URL}/auth/create-test-user`);
  
  storeUserData(response.data);
  
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  localStorage.removeItem('displayName');
  localStorage.removeItem('isGuest');
  localStorage.removeItem('tokenBalance');
};

export const storeUserData = (userData: AuthResponse): void => {
  localStorage.setItem('token', userData.token);
  localStorage.setItem('userId', userData.userId);
  if (userData.email) localStorage.setItem('email', userData.email);
  localStorage.setItem('displayName', userData.displayName);
  
  if (userData.isGuest !== undefined) {
    localStorage.setItem('isGuest', userData.isGuest.toString());
  }
  
  if (userData.tokenBalance !== undefined) {
    localStorage.setItem('tokenBalance', userData.tokenBalance.toString());
  }
};

export const getUserData = (): AuthResponse | null => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email');
  const displayName = localStorage.getItem('displayName');
  const isGuestStr = localStorage.getItem('isGuest');
  const tokenBalanceStr = localStorage.getItem('tokenBalance');
  
  if (token && userId) {
    return {
      token,
      userId,
      email: email || undefined,
      displayName: displayName || 'User',
      isGuest: isGuestStr ? isGuestStr === 'true' : undefined,
      tokenBalance: tokenBalanceStr ? parseInt(tokenBalanceStr, 10) : undefined,
    };
  }
  
  return null;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

export const isGuestUser = (): boolean => {
  return localStorage.getItem('isGuest') === 'true';
};

export const getCurrentUser = (): { userId: string; email?: string; displayName: string; isGuest?: boolean; tokenBalance?: number } | null => {
  return getUserData();
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const updateTokenBalance = (newBalance: number): void => {
  localStorage.setItem('tokenBalance', newBalance.toString());
};

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