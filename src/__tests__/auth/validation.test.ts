import { validateRegistration, validateLogin } from '../../utils/validation';

describe('Authentication Validation', () => {
  describe('validateRegistration', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'valid@example.com',
        password: 'SecurePass123!',
        name: 'Valid User'
      };

      const errors = validateRegistration(data);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Valid User'
      };

      const errors = validateRegistration(data);
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('valid email')
        })
      );
    });

    it('should reject short passwords', () => {
      const data = {
        email: 'valid@example.com',
        password: '123',
        name: 'Valid User'
      };

      const errors = validateRegistration(data);
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: expect.stringContaining('at least 8 characters')
        })
      );
    });

    it('should reject passwords without uppercase letter', () => {
      const data = {
        email: 'valid@example.com',
        password: 'securepass123!',
        name: 'Valid User'
      };

      const errors = validateRegistration(data);
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: expect.stringContaining('uppercase letter')
        })
      );
    });

    it('should reject passwords without number', () => {
      const data = {
        email: 'valid@example.com',
        password: 'SecurePass!',
        name: 'Valid User'
      };

      const errors = validateRegistration(data);
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: expect.stringContaining('number')
        })
      );
    });

    it('should reject passwords without special character', () => {
      const data = {
        email: 'valid@example.com',
        password: 'SecurePass123',
        name: 'Valid User'
      };

      const errors = validateRegistration(data);
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: expect.stringContaining('special character')
        })
      );
    });

    it('should reject empty name', () => {
      const data = {
        email: 'valid@example.com',
        password: 'SecurePass123!',
        name: ''
      };

      const errors = validateRegistration(data);
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: expect.stringContaining('required')
        })
      );
    });
  });

  describe('validateLogin', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'valid@example.com',
        password: 'anyPassword'
      };

      const errors = validateLogin(data);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'anyPassword'
      };

      const errors = validateLogin(data);
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('valid email')
        })
      );
    });

    it('should reject empty password', () => {
      const data = {
        email: 'valid@example.com',
        password: ''
      };

      const errors = validateLogin(data);
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: expect.stringContaining('required')
        })
      );
    });
  });
});