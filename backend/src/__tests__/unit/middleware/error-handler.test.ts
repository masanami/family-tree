import { Request, Response, NextFunction } from 'express';
import { errorHandler, ApiError } from '../../../middleware/error-handler';

describe('Error Handling Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    mockResponse = {
      status: responseStatus,
      json: responseJson
    };
    mockNext = jest.fn();
  });

  describe('ApiError Class', () => {
    it('should create an ApiError with status and message', () => {
      const error = new ApiError(400, 'Bad Request');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(400);
      expect(error.message).toBe('Bad Request');
    });

    it('should have a name property set to ApiError', () => {
      const error = new ApiError(404, 'Not Found');
      expect(error.name).toBe('ApiError');
    });
  });

  describe('Error Handler Middleware', () => {
    it('should handle ApiError instances', () => {
      const apiError = new ApiError(403, 'Forbidden');
      
      errorHandler(
        apiError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(403);
      expect(responseJson).toHaveBeenCalledWith({
        error: {
          message: 'Forbidden',
          status: 403
        }
      });
    });

    it('should handle generic Error instances', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: {
          message: 'Something went wrong',
          status: 500
        }
      });
    });

    it('should handle non-Error objects', () => {
      const error = { custom: 'error' };
      
      errorHandler(
        error as any,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: {
          message: 'Internal Server Error',
          status: 500
        }
      });
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Dev error');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseJson).toHaveBeenCalledWith({
        error: {
          message: 'Dev error',
          status: 500,
          stack: expect.any(String)
        }
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Prod error');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseJson).toHaveBeenCalledWith({
        error: {
          message: 'Prod error',
          status: 500
        }
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});