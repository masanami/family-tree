import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../src/hooks/useAuth';
import { useAuthStore } from '../../src/stores/auth.store';

// Mock the auth store
vi.mock('../../src/stores/auth.store', () => ({
  useAuthStore: vi.fn()
}));

describe('useAuth Hook', () => {
  const mockAuthStore = {
    isAuthenticated: false,
    user: null,
    error: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    initializeAuth: vi.fn(),
    clearError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue(mockAuthStore);
  });

  describe('Hook Initialization', () => {
    it('should initialize auth state on mount', () => {
      renderHook(() => useAuth());

      expect(mockAuthStore.initializeAuth).toHaveBeenCalledOnce();
    });

    it('should only initialize auth once', () => {
      const { rerender } = renderHook(() => useAuth());
      
      rerender();
      rerender();

      // Should still only be called once
      expect(mockAuthStore.initializeAuth).toHaveBeenCalledOnce();
    });
  });

  describe('Auth State Access', () => {
    it('should return current authentication status', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return authenticated state when user is logged in', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      };

      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isAuthenticated: true,
        user: mockUser
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should return loading state during authentication', () => {
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isLoading: true
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return error state when authentication fails', () => {
      const mockError = 'Authentication failed';

      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        error: mockError
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('Auth Actions', () => {
    it('should provide login function', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.login).toBe('function');
    });

    it('should provide logout function', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.logout).toBe('function');
    });

    it('should provide clearError function', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.clearError).toBe('function');
    });

    it('should call store login function when hook login is called', async () => {
      const { result } = renderHook(() => useAuth());
      const credentials = { email: 'test@example.com', password: 'password' };

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(mockAuthStore.login).toHaveBeenCalledWith(credentials);
    });

    it('should call store logout function when hook logout is called', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthStore.logout).toHaveBeenCalledOnce();
    });

    it('should call store clearError function when hook clearError is called', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearError();
      });

      expect(mockAuthStore.clearError).toHaveBeenCalledOnce();
    });
  });

  describe('Integration with Auth Store', () => {
    it('should reflect store state changes', () => {
      const { result, rerender } = renderHook(() => useAuth());

      // Initially not authenticated
      expect(result.current.isAuthenticated).toBe(false);

      // Mock store state change to authenticated
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' }
      });

      rerender();

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
    });

    it('should handle store error state changes', () => {
      const { result, rerender } = renderHook(() => useAuth());

      // Initially no error
      expect(result.current.error).toBeNull();

      // Mock store state change to error
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        error: 'Network error'
      });

      rerender();

      expect(result.current.error).toBe('Network error');
    });

    it('should handle store loading state changes', () => {
      const { result, rerender } = renderHook(() => useAuth());

      // Initially not loading
      expect(result.current.isLoading).toBe(false);

      // Mock store state change to loading
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isLoading: true
      });

      rerender();

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Hook Cleanup', () => {
    it('should not cause memory leaks on unmount', () => {
      const { unmount } = renderHook(() => useAuth());

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should support complete authentication flow', async () => {
      const { result } = renderHook(() => useAuth());

      // Start unauthenticated
      expect(result.current.isAuthenticated).toBe(false);

      // Mock successful login
      const loginCredentials = { email: 'test@example.com', password: 'password' };
      
      await act(async () => {
        await result.current.login(loginCredentials);
      });

      expect(mockAuthStore.login).toHaveBeenCalledWith(loginCredentials);

      // Mock logout
      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthStore.logout).toHaveBeenCalledOnce();
    });

    it('should handle error clearing during authentication flow', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearError();
      });

      expect(mockAuthStore.clearError).toHaveBeenCalledOnce();
    });
  });
});