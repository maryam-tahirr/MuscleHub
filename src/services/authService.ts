
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  profilePicture?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

const token = localStorage.getItem(AUTH_TOKEN_KEY);
if (token) {
  setAuthHeader(token);
}

const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', { email, password });
      
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
      setAuthHeader(response.data.token);
      
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    }
  },
  
  register: async (name: string, email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/register', { name, email, password });
      
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
      setAuthHeader(response.data.token);
      
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    }
  },
  
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    setAuthHeader(null);
  },
  
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem(USER_DATA_KEY);
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
  
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return Boolean(user && user.isAdmin);
  },
  
  handleAuthCallback: (token: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        axios.get<User>(`/api/users/${payload._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          const user = response.data;
          
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
          setAuthHeader(token);
          
          resolve(user);
        }).catch(error => {
          reject(new Error('Failed to fetch user details after authentication'));
        });
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default authService;
