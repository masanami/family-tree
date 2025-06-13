import { Request, Response } from 'express';
import { authController } from '../../controllers/authController';
import { UserModel } from '../../models/user';
import bcrypt from 'bcrypt';

// Mock modules
jest.mock('bcrypt');
jest.mock('../../models/user');

describe('Auth Controller Error Handling', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('register', () => {
    it('should handle bcrypt hash error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Registration error:', expect.any(Error));
    });

    it('should handle database creation error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (UserModel.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Registration error:', expect.any(Error));
    });
  });

  describe('login', () => {
    it('should handle bcrypt compare error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password'
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User'
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Compare error'));

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));
    });
  });

  describe('me', () => {
    it('should handle database error', async () => {
      const authRequest: any = {
        body: {},
        user: {
          userId: '123',
          email: 'test@example.com'
        }
      };

      (UserModel.findById as jest.Mock).mockRejectedValue(new Error('DB error'));

      await authController.me(authRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Get user error:', expect.any(Error));
    });

    it('should handle user not found', async () => {
      const authRequest: any = {
        body: {},
        user: {
          userId: '123',
          email: 'test@example.com'
        }
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await authController.me(authRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle missing user in request', async () => {
      mockRequest = { body: {} };

      await authController.me(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should handle logout error gracefully', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer invalid'
        }
      };

      // Mock the invalidateToken to throw
      const authModule = await import('../../middleware/auth');
      jest.spyOn(authModule, 'invalidateToken').mockImplementation(() => {
        throw new Error('Invalidation error');
      });

      await authController.logout(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
    });
  });
});