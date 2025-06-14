import { test, expect } from '@playwright/test';
import { ApiClient } from '../fixtures/api-client';

test.describe('Backend Readiness Tests', () => {
  let apiClient: ApiClient;

  test.beforeAll(async () => {
    apiClient = new ApiClient(process.env.API_BASE_URL || 'http://localhost:5001');
  });

  test('should verify backend server is running', async () => {
    const isReady = await apiClient.waitForServer(10000);
    expect(isReady).toBe(true);
  });

  test('should respond to health check', async () => {
    const response = await apiClient.healthCheck();
    
    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.data).toHaveProperty('status');
  });

  test('should return proper API structure for family trees endpoint', async () => {
    const response = await apiClient.getFamilyTrees();
    
    // Should return either success with array or proper error structure
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('statusCode');
    
    if (response.success) {
      expect(Array.isArray(response.data)).toBe(true);
    } else {
      expect(response).toHaveProperty('error');
    }
  });

  test('should handle CORS correctly', async () => {
    // Test CORS by making request from browser context
    const response = await fetch('http://localhost:5001/health', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok).toBe(true);
    
    // Check CORS headers are present
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    expect(corsHeader).toBeTruthy();
  });

  test('should return proper error for invalid endpoints', async () => {
    const response = await fetch('http://localhost:5001/api/nonexistent');
    
    expect(response.status).toBe(404);
  });
});