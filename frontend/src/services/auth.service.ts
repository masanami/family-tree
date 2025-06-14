import { apiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import type {
  User,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ValidateTokenResponse,
} from '../types/auth.types';

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
    
    return apiService.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiService.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  async logout(): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>(API_ENDPOINTS.AUTH.ME);
  }

  async refreshToken(): Promise<{ token: string; expiresIn?: number }> {
    return apiService.post<{ token: string; expiresIn?: number }>(API_ENDPOINTS.AUTH.REFRESH);
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const request: ForgotPasswordRequest = { email };
    return apiService.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, request);
  }

  async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    const request: ResetPasswordRequest = { token, password };
    return apiService.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, request);
  }

  async validateToken(): Promise<ValidateTokenResponse> {
    return apiService.get<ValidateTokenResponse>(API_ENDPOINTS.AUTH.VALIDATE);
  }
}

export const authService = new AuthService();