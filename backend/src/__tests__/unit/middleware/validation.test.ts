import { Request, Response, NextFunction } from 'express';
import { validate, ValidationRules } from '../../../middleware/validation';
import { ApiError } from '../../../middleware/error-handler';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('Body Validation', () => {
    it('should pass validation for valid body data', () => {
      const rules: ValidationRules = {
        body: {
          name: { required: true, type: 'string' },
          age: { required: true, type: 'number', min: 0 }
        }
      };

      mockRequest.body = { name: 'John Doe', age: 25 };

      validate(rules)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail validation for missing required fields', () => {
      const rules: ValidationRules = {
        body: {
          name: { required: true, type: 'string' }
        }
      };

      mockRequest.body = {};

      validate(rules)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(400);
      expect(error.message).toContain('name');
    });

    it('should fail validation for wrong type', () => {
      const rules: ValidationRules = {
        body: {
          age: { required: true, type: 'number' }
        }
      };

      mockRequest.body = { age: 'not a number' };

      validate(rules)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(400);
      expect(error.message).toContain('age');
    });

    it('should validate string length constraints', () => {
      const rules: ValidationRules = {
        body: {
          username: { required: true, type: 'string', minLength: 3, maxLength: 20 }
        }
      };

      // Too short
      mockRequest.body = { username: 'ab' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));

      // Reset mock
      mockNext = jest.fn();

      // Valid length
      mockRequest.body = { username: 'validuser' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate number constraints', () => {
      const rules: ValidationRules = {
        body: {
          age: { required: true, type: 'number', min: 18, max: 100 }
        }
      };

      // Too low
      mockRequest.body = { age: 10 };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));

      // Reset mock
      mockNext = jest.fn();

      // Valid
      mockRequest.body = { age: 25 };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate email format', () => {
      const rules: ValidationRules = {
        body: {
          email: { required: true, type: 'string', format: 'email' }
        }
      };

      // Invalid email
      mockRequest.body = { email: 'not-an-email' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));

      // Reset mock
      mockNext = jest.fn();

      // Valid email
      mockRequest.body = { email: 'user@example.com' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate date format', () => {
      const rules: ValidationRules = {
        body: {
          birthDate: { required: true, type: 'string', format: 'date' }
        }
      };

      // Valid date
      mockRequest.body = { birthDate: '2000-01-01' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate enum values', () => {
      const rules: ValidationRules = {
        body: {
          gender: { required: true, type: 'string', enum: ['male', 'female', 'other'] }
        }
      };

      // Invalid enum value
      mockRequest.body = { gender: 'invalid' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));

      // Reset mock
      mockNext = jest.fn();

      // Valid enum value
      mockRequest.body = { gender: 'male' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Params Validation', () => {
    it('should validate route parameters', () => {
      const rules: ValidationRules = {
        params: {
          id: { required: true, type: 'string', format: 'uuid' }
        }
      };

      mockRequest.params = { id: 'not-a-uuid' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('Query Validation', () => {
    it('should validate query parameters', () => {
      const rules: ValidationRules = {
        query: {
          page: { required: false, type: 'number', min: 1 },
          limit: { required: false, type: 'number', min: 1, max: 100 }
        }
      };

      mockRequest.query = { page: '2', limit: '20' };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Complex Validation', () => {
    it('should validate nested objects', () => {
      const rules: ValidationRules = {
        body: {
          user: {
            required: true,
            type: 'object',
            properties: {
              name: { required: true, type: 'string' },
              age: { required: true, type: 'number' }
            }
          }
        }
      };

      mockRequest.body = {
        user: {
          name: 'John',
          age: 30
        }
      };

      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate arrays', () => {
      const rules: ValidationRules = {
        body: {
          tags: {
            required: true,
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 5
          }
        }
      };

      mockRequest.body = { tags: ['tag1', 'tag2'] };
      validate(rules)(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});