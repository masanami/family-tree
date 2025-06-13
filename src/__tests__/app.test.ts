import request from 'supertest';
import { app } from '../index';

describe('Express App', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp).getTime()).toBeCloseTo(Date.now(), -2);
    });
  });


  describe('CORS', () => {
    it('should handle CORS headers', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});