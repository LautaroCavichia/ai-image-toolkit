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

// Modifica tu función login en authService.ts
// En authService.ts
export const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
  try {
    console.log('🚀 Iniciando request de login');
    
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/login`, 
      credentials,
      { timeout: 10000 }
    );

    console.log('✅ Response recibida:', response.status);

    const authData = {
      ...response.data,
      isGuest: false,
    };

    return authData;

  } catch (error: any) {
    console.log('❌ Error en authService:', error.message);

    let errorMessage = 'Login failed. Please try again.';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.response?.status === 403) {
      // 👇 Ahora mostramos el mensaje real del backend
      errorMessage = error.response.data || 'Your account is locked.';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your connection.';
    }

    console.error('Login failed:', errorMessage);
    throw new Error(errorMessage);
  }
};


// Función adicional para probar la validez del token (opcional)
export const validateToken = async (): Promise<boolean> => {
  try {
    await fetchCurrentUser();
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
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

  // Guardar isGuest SIEMPRE, por defecto false
  localStorage.setItem('isGuest', (userData.isGuest ?? false).toString());

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

let onUnauthorizedCallback: (() => Promise<AuthResponse>) | undefined;

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export function setupAxiosInterceptors() {
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // Evitar retry y refresh token en la llamada a login
      if (originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        if (!onUnauthorizedCallback) {
          // 🔴 No se puede renovar, desloguear y redirigir
          logout();
          window.location.href = '/login'; // Ruta a tu página de login
          return Promise.reject(error);
        }

        // 🔄 Intentar renovar el token con el callback registrado
        try {
          const newTokenData = await onUnauthorizedCallback();
          localStorage.setItem('token', newTokenData.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${newTokenData.token}`;
          processQueue(null, newTokenData.token);
          originalRequest.headers.Authorization = `Bearer ${newTokenData.token}`;
          return axios(originalRequest);
        } catch (err) {
          // 🔴 Falló la renovación: desloguear y redirigir
          processQueue(err, null);
          logout();
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}


// Registro del handler que debe devolver Promise<AuthResponse> con nuevo token
export function registerUnauthorizedHandler(callback?: () => Promise<AuthResponse>) {
  onUnauthorizedCallback = callback;
}

export const fetchCurrentUser = async (): Promise<AuthResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    throw new Error('No token found');
  }

  console.log('Token from localStorage:', token);

  try {
    // Crear una instancia de axios sin interceptor para esta llamada específica
    const authAxios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Making request to /auth/me with token:', token);
    const response = await authAxios.get<AuthResponse>('/auth/me');
    console.log('User data received:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in fetchCurrentUser:', {
      
    });
    
    // Limpiar el token si es inválido
  
    
    throw error;
  }
};

