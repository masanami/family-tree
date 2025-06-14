import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiService } from '../../src/services/api.service';
import { authService } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/stores/auth.store';
import { API_ENDPOINTS } from '../../src/constants/api.constants';
import type { LoginResponse, RegisterResponse, User } from '../../src/types/auth.types';

describe('Authentication Flow Integration Tests', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    // Reset auth store
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should login successfully and store token', async () => {
      const mockUser: User = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockLoginResponse: LoginResponse = {
        user: mockUser,
        token: 'mock-jwt-token',
        expiresIn: 3600,
      };

      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.LOGIN}`, {
        email: 'test@example.com',
        password: 'password123',
      }).reply(200, mockLoginResponse);

      await useAuthStore.getState().login('test@example.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('mock-jwt-token');
      expect(localStorage.getItem('auth-token')).toBe('mock-jwt-token');
    });

    it('should handle login with invalid credentials', async () => {
      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.LOGIN}`).reply(401, {
        error: {
          message: 'Invalid email or password',
          status: 401,
        },
      });

      await useAuthStore.getState().login('wrong@example.com', 'wrongpassword');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('ログインに失敗しました');
      expect(localStorage.getItem('auth-token')).toBeNull();
    });

    it('should set authorization header after login', async () => {
      const mockLoginResponse: LoginResponse = {
        user: {
          id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        token: 'mock-jwt-token',
        expiresIn: 3600,
      };

      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.LOGIN}`).reply(200, mockLoginResponse);
      
      await useAuthStore.getState().login('test@example.com', 'password123');

      // Test that subsequent requests include the auth header
      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`).reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer mock-jwt-token');
        return [200, { trees: [] }];
      });

      await apiService.get(API_ENDPOINTS.FAMILY_TREES.BASE);
    });
  });

  describe('Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const mockUser: User = {
        id: 'user2',
        email: 'newuser@example.com',
        name: 'New User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockRegisterResponse: RegisterResponse = {
        user: mockUser,
        token: 'new-user-token',
        expiresIn: 3600,
      };

      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.REGISTER}`, {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      }).reply(201, mockRegisterResponse);

      const response = await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(response.user.email).toBe('newuser@example.com');
      expect(response.token).toBe('new-user-token');
    });

    it('should handle registration validation errors', async () => {
      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.REGISTER}`).reply(400, {
        error: {
          message: 'Validation failed',
          status: 400,
          errors: {
            email: ['Email is already taken'],
            password: ['Password must be at least 8 characters'],
          },
        },
      });

      await expect(authService.register({
        email: 'existing@example.com',
        password: 'short',
        name: 'Test User',
      })).rejects.toThrow();
    });
  });

  describe('Logout Flow', () => {
    it('should logout successfully and clear auth state', async () => {
      // Setup authenticated state
      useAuthStore.setState({
        user: {
          id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        token: 'existing-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      localStorage.setItem('auth-token', 'existing-token');

      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.LOGOUT}`).reply(200, {
        message: 'Logged out successfully',
      });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(localStorage.getItem('auth-token')).toBeNull();
    });

    it('should clear auth state even if logout API fails', async () => {
      useAuthStore.setState({
        user: {
          id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        token: 'existing-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      localStorage.setItem('auth-token', 'existing-token');

      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.LOGOUT}`).networkError();

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('Token Management', () => {
    it('should auto-logout on 401 responses', async () => {
      // Setup authenticated state
      useAuthStore.setState({
        user: {
          id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        token: 'expired-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`).reply(401, {
        error: {
          message: 'Token expired',
          status: 401,
        },
      });

      try {
        await apiService.get(API_ENDPOINTS.FAMILY_TREES.BASE);
      } catch (error) {
        // Expected to throw
      }

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.token).toBeNull();
      expect(localStorage.getItem('auth-token')).toBeNull();
    });

    it('should validate token on app initialization', async () => {
      localStorage.setItem('auth-token', 'stored-token');

      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.VALIDATE}`).reply(200, {
        valid: true,
        user: {
          id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      });

      const isValid = await authService.validateToken('stored-token');
      expect(isValid).toBe(true);
    });

    it('should handle invalid stored tokens', async () => {
      localStorage.setItem('auth-token', 'invalid-token');

      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.VALIDATE}`).reply(401, {
        error: {
          message: 'Invalid token',
          status: 401,
        },
      });

      const isValid = await authService.validateToken('invalid-token');
      expect(isValid).toBe(false);
    });
  });

  describe('Protected Route Access', () => {
    it('should allow access to protected routes with valid token', async () => {
      useAuthStore.setState({
        token: 'valid-token',
        isAuthenticated: true,
        user: {
          id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        isLoading: false,
        error: null,
      });

      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.ME}`).reply(200, {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const user = await authService.getCurrentUser();
      expect(user.id).toBe('user1');
    });

    it('should redirect to login for unauthenticated requests', async () => {
      useAuthStore.setState({
        token: null,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });

      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.AUTH.ME}`).reply(401, {
        error: {
          message: 'Authentication required',
          status: 401,
        },
      });

      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });
});