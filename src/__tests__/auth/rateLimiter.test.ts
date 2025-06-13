import { Request, Response, NextFunction } from 'express';
import { createRateLimiter, clearRateLimitStore } from '../../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    clearRateLimitStore();
    mockRequest = {
      ip: '127.0.0.1',
      path: '/api/auth/login'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    clearRateLimitStore();
  });

  it('should allow requests under the limit', () => {
    const limiter = createRateLimiter(60000, 3);

    // First request
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    // Second request
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);

    // Third request
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(3);
  });

  it('should block requests over the limit', () => {
    const limiter = createRateLimiter(60000, 2);

    // First request
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    // Second request
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);

    // Third request (should be blocked)
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2); // Not called again
    expect(mockResponse.status).toHaveBeenCalledWith(429);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Too many requests, please try again later'
    });
  });

  it('should reset limit after window expires', () => {
    jest.useFakeTimers();
    const limiter = createRateLimiter(1000, 1); // 1 second window, 1 request

    // First request
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    // Second request (blocked)
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(429);

    // Advance time past the window
    jest.advanceTimersByTime(1001);

    // Third request (should be allowed)
    (mockNext as jest.Mock).mockClear();
    mockResponse.status = jest.fn().mockReturnThis();
    mockResponse.json = jest.fn();
    
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('should track different IPs separately', () => {
    const limiter = createRateLimiter(60000, 1);

    // First IP
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    // Same IP (blocked)
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(429);

    // Different IP
    mockRequest = {
      ...mockRequest,
      ip: '192.168.1.1'
    };
    (mockNext as jest.Mock).mockClear();
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should track different paths separately', () => {
    const limiter = createRateLimiter(60000, 1);

    // First path
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    // Same path (blocked)
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(429);

    // Different path
    mockRequest = {
      ...mockRequest,
      path: '/api/auth/register'
    };
    (mockNext as jest.Mock).mockClear();
    limiter(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});