import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../../src/stores/auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されていること', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('ログイン機能', () => {
    it('ログイン成功時にユーザー情報とトークンが保存されること', async () => {
      const { result } = renderHook(() => useAuthStore());
      
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      const mockToken = 'mock-jwt-token';

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('ログイン失敗時にエラーが設定されること', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('invalid@example.com', 'wrong-password');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('ログイン中はローディング状態になること', async () => {
      const { result } = renderHook(() => useAuthStore());

      let loadingStateDuringLogin = false;

      // Start login without await to check loading state
      act(() => {
        result.current.login('test@example.com', 'password').then(() => {
          // Login completed
        });
      });

      // Check loading state immediately after starting login
      loadingStateDuringLogin = result.current.isLoading;

      // Wait for login to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(loadingStateDuringLogin).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('ログアウト機能', () => {
    it('ログアウト時に認証情報がクリアされること', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('ローカルストレージからトークンが削除されること', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set token in localStorage
      localStorage.setItem('auth-token', 'mock-token');

      act(() => {
        result.current.logout();
      });

      expect(localStorage.getItem('auth-token')).toBeNull();
    });
  });

  describe('トークン管理', () => {
    it('トークンをローカルストレージに保存すること', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(localStorage.getItem('auth-token')).toBe('mock-jwt-token');
    });

    it('初期化時にローカルストレージからトークンを読み込むこと', () => {
      localStorage.setItem('auth-token', 'existing-token');

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.initializeAuth();
      });

      expect(result.current.token).toBe('existing-token');
    });
  });

  describe('エラーハンドリング', () => {
    it('エラーをクリアできること', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set error
      act(() => {
        useAuthStore.setState({ error: 'Some error' });
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});