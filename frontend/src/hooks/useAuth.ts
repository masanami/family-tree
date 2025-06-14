import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
};