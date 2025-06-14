import request from 'supertest';
import express from 'express';
import { FamilyTreeRoutes } from '../family-tree.routes';

describe('FamilyTree API Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/family-trees', new FamilyTreeRoutes().router);
  });

  describe('GET /api/family-trees', () => {
    it('should return all family trees', async () => {
      const response = await request(app)
        .get('/api/family-trees')
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/family-trees', () => {
    it('should create a new family tree', async () => {
      const newFamilyTree = {
        name: 'Test Family Tree',
        description: 'A test family tree',
        createdBy: 'test-user'
      };

      const response = await request(app)
        .post('/api/family-trees')
        .send(newFamilyTree)
        .expect(201);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newFamilyTree.name);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        description: 'Missing required name field'
      };

      await request(app)
        .post('/api/family-trees')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/family-trees/:id', () => {
    it('should return a specific family tree', async () => {
      const response = await request(app)
        .get('/api/family-trees/1')
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', '1');
    });

    it('should return 404 for non-existent family tree', async () => {
      await request(app)
        .get('/api/family-trees/999')
        .expect(404);
    });
  });

  describe('PUT /api/family-trees/:id', () => {
    it('should update a family tree', async () => {
      const updateData = {
        name: 'Updated Family Tree',
        description: 'Updated description'
      };

      const response = await request(app)
        .put('/api/family-trees/1')
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent family tree', async () => {
      await request(app)
        .put('/api/family-trees/999')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/family-trees/:id', () => {
    it('should delete a family tree', async () => {
      await request(app)
        .delete('/api/family-trees/1')
        .expect(204);
    });

    it('should return 404 for non-existent family tree', async () => {
      await request(app)
        .delete('/api/family-trees/999')
        .expect(404);
    });
  });
});