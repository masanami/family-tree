import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should call next() with valid token', () => {
    const token = jwt.sign(
      { userId: '123', email: 'test@example.com' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    mockRequest.headers = {
      authorization: `Bearer ${token}`
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest).toHaveProperty('user');
    expect((mockRequest as any).user).toHaveProperty('userId', '123');
    expect((mockRequest as any).user).toHaveProperty('email', 'test@example.com');
  });

  it('should return 401 when no token is provided', () => {
    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No token provided'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token'
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid token'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token is expired', () => {
    const expiredToken = jwt.sign(
      { userId: '123', email: 'test@example.com' },
      config.jwtSecret,
      { expiresIn: '-1h' }
    );

    mockRequest.headers = {
      authorization: `Bearer ${expiredToken}`
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid token'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle malformed authorization header', () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat'
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No token provided'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should check token invalidation', async () => {
    const token = jwt.sign(
      { userId: '123', email: 'test@example.com' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Mock the invalidatedTokens set
    const { invalidateToken } = await import('../../middleware/auth');
    invalidateToken(token);

    mockRequest.headers = {
      authorization: `Bearer ${token}`
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Token has been invalidated'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});