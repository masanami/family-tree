import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../src/services/auth.service';
import { apiService } from '../../src/services/api.service';

// Mock apiService
vi.mock('../../src/services/api.service', () => ({
  apiService: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('正しい認証情報でログインできること', async () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      apiService.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.login('test@example.com', 'password');

      expect(apiService.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockResponse);
    });

    it('ログインエラーが適切に処理されること', async () => {
      const mockError = new Error('Invalid credentials');
      apiService.post.mockRejectedValueOnce(mockError);

      await expect(
        authService.login('invalid@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('新規ユーザーを登録できること', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const mockResponse = {
        token: 'new-user-token',
        user: {
          id: '2',
          email: 'new@example.com',
          name: 'New User',
        },
      };

      apiService.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.register(registerData);

      expect(apiService.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse);
    });

    it('登録エラーが適切に処理されること', async () => {
      const mockError = new Error('Email already exists');
      apiService.post.mockRejectedValueOnce(mockError);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password',
          name: 'User',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('ログアウトAPIが呼び出されること', async () => {
      apiService.post.mockResolvedValueOnce({ success: true });

      const result = await authService.logout();

      expect(apiService.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual({ success: true });
    });

    it('ログアウトエラーが適切に処理されること', async () => {
      const mockError = new Error('Logout failed');
      apiService.post.mockRejectedValueOnce(mockError);

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('getCurrentUser', () => {
    it('現在のユーザー情報を取得できること', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01',
      };

      apiService.get.mockResolvedValueOnce(mockUser);

      const result = await authService.getCurrentUser();

      expect(apiService.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('ユーザー情報取得エラーが適切に処理されること', async () => {
      const mockError = new Error('Unauthorized');
      apiService.get.mockRejectedValueOnce(mockError);

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('refreshToken', () => {
    it('トークンをリフレッシュできること', async () => {
      const mockResponse = {
        token: 'new-token',
        expiresIn: 3600,
      };

      apiService.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.refreshToken();

      expect(apiService.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockResponse);
    });

    it('リフレッシュエラーが適切に処理されること', async () => {
      const mockError = new Error('Refresh token expired');
      apiService.post.mockRejectedValueOnce(mockError);

      await expect(authService.refreshToken()).rejects.toThrow('Refresh token expired');
    });
  });

  describe('forgotPassword', () => {
    it('パスワードリセットメールを送信できること', async () => {
      const mockResponse = { message: 'Reset email sent' };
      apiService.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.forgotPassword('test@example.com');

      expect(apiService.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('パスワードをリセットできること', async () => {
      const mockResponse = { message: 'Password reset successful' };
      const resetData = {
        token: 'reset-token',
        password: 'new-password',
      };

      apiService.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.resetPassword(resetData.token, resetData.password);

      expect(apiService.post).toHaveBeenCalledWith('/auth/reset-password', resetData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateToken', () => {
    it('トークンの有効性を確認できること', async () => {
      const mockResponse = { valid: true, user: { id: '1' } };
      apiService.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.validateToken();

      expect(apiService.get).toHaveBeenCalledWith('/auth/validate');
      expect(result).toEqual(mockResponse);
    });

    it('無効なトークンの場合falseを返すこと', async () => {
      const mockResponse = { valid: false };
      apiService.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.validateToken();

      expect(result).toEqual(mockResponse);
    });
  });
});