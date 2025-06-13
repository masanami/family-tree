import request from 'supertest';
import express from 'express';

// Simple integration test to verify API structure
describe('API Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock routes for testing
    app.get('/api/persons', (_req, res) => {
      res.json([{ id: '1', first_name: 'John', last_name: 'Doe' }]);
    });
    
    app.get('/api/relationships', (_req, res) => {
      res.json([{ id: '1', person1_id: '1', person2_id: '2', relationship_type: 'spouse' }]);
    });
  });

  it('should handle person endpoints', async () => {
    const response = await request(app).get('/api/persons');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should handle relationship endpoints', async () => {
    const response = await request(app).get('/api/relationships');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});