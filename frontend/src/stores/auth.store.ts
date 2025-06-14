import { create } from 'zustand';
import { authService } from '../services/auth.service';
import type { User, AuthState as AuthStateType } from '../types/auth.types';

interface AuthState extends AuthStateType {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(email, password);
      const { token, user } = response;
      
      // Save token to localStorage
      localStorage.setItem('auth-token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid credentials',
      });
    }
  },

  logout: () => {
    // Remove token from localStorage
    localStorage.removeItem('auth-token');
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      set({ token });
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setToken: (token: string | null) => {
    set({ token });
  },
}));