import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiError } from '../../src/services/api.service';

describe('API Service - Simple Tests', () => {
  describe('ApiError', () => {
    it('エラーオブジェクトが正しく作成されること', () => {
      const error = new ApiError('Test error', 404, { detail: 'Not found' });
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.data).toEqual({ detail: 'Not found' });
      expect(error.name).toBe('ApiError');
      expect(error).toBeInstanceOf(Error);
    });
  });
});