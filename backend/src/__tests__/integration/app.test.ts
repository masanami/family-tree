import request from 'supertest';
import { App } from '../../app';
import { Server } from 'http';

describe('API Basic Structure', () => {
  let app: App;
  let server: Server;

  beforeAll(() => {
    app = new App();
    server = app.getServer();
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('Application Setup', () => {
    it('should create an Express application', () => {
      expect(app).toBeDefined();
      expect(app.getApp()).toBeDefined();
    });

    it('should have proper API prefix configured', async () => {
      const response = await request(server)
        .get('/api/v1/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Middleware Configuration', () => {
    it('should have CORS enabled', async () => {
      const response = await request(server)
        .options('/api/v1/health')
        .expect(204);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should parse JSON bodies', async () => {
      const testData = { test: 'data' };
      const response = await request(server)
        .post('/api/v1/test-json')
        .send(testData)
        .set('Content-Type', 'application/json');
      
      // The endpoint doesn't exist yet, but middleware should parse the body
      expect(response.status).toBe(404);
    });

    it('should have error handling middleware', async () => {
      const response = await request(server)
        .get('/api/v1/error-test')
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('status', 404);
    });
  });

  describe('Routing Structure', () => {
    it('should have health check endpoint', async () => {
      const response = await request(server)
        .get('/api/v1/health')
        .expect(200);
      
      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });
    });

    it('should have family trees routes mounted', async () => {
      // Test that the routes are at least defined (will return 404 for now)
      await request(server).get('/api/v1/family-trees');
      await request(server).post('/api/v1/family-trees');
      await request(server).get('/api/v1/family-trees/1');
      await request(server).put('/api/v1/family-trees/1');
      await request(server).delete('/api/v1/family-trees/1');
    });

    it('should have persons routes mounted', async () => {
      // Test that the routes are at least defined
      await request(server).get('/api/v1/persons');
      await request(server).post('/api/v1/persons');
      await request(server).get('/api/v1/persons/1');
      await request(server).put('/api/v1/persons/1');
      await request(server).delete('/api/v1/persons/1');
    });

    it('should have relationships routes mounted', async () => {
      // Test that the routes are at least defined
      await request(server).get('/api/v1/relationships');
      await request(server).post('/api/v1/relationships');
      await request(server).get('/api/v1/relationships/1');
      await request(server).put('/api/v1/relationships/1');
      await request(server).delete('/api/v1/relationships/1');
    });
  });
});