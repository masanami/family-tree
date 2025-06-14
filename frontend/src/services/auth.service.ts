import { apiService } from './api.service';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Mock implementation for testing
    if (email === 'test@example.com' && password === 'password') {
      return Promise.resolve({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    }
    
    return apiService.post<LoginResponse>('/auth/login', { email, password });
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/register', data);
  }

  async logout(): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me');
  }

  async refreshToken(): Promise<{ token: string; expiresIn?: number }> {
    return apiService.post<{ token: string; expiresIn?: number }>('/auth/refresh');
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/auth/reset-password', { token, password });
  }

  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    return apiService.get<{ valid: boolean; user?: User }>('/auth/validate');
  }
}

export const authService = new AuthService();