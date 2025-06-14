import request from 'supertest';
import express from 'express';
import { PersonRoutes } from '../person.routes';

describe('Person API Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Setup routes
    const personRoutes = new PersonRoutes();
    app.use('/api/family-trees/:treeId/persons', personRoutes.getTreePersonsRouter());
    app.use('/api/persons', personRoutes.getPersonRouter());
  });

  describe('GET /api/family-trees/:treeId/persons', () => {
    it('should return all persons in a family tree', async () => {
      const response = await request(app)
        .get('/api/family-trees/1/persons')
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent family tree', async () => {
      await request(app)
        .get('/api/family-trees/999/persons')
        .expect(404);
    });
  });

  describe('POST /api/family-trees/:treeId/persons', () => {
    it('should create a new person in family tree', async () => {
      const newPerson = {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        gender: 'male'
      };

      const response = await request(app)
        .post('/api/family-trees/1/persons')
        .send(newPerson)
        .expect(201);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstName).toBe(newPerson.firstName);
      expect(response.body.data.familyTreeId).toBe('1');
    });

    it('should return 400 for invalid person data', async () => {
      const invalidPerson = {
        lastName: 'Doe'
        // Missing required firstName
      };

      await request(app)
        .post('/api/family-trees/1/persons')
        .send(invalidPerson)
        .expect(400);
    });

    it('should return 404 for non-existent family tree', async () => {
      const person = {
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/api/family-trees/999/persons')
        .send(person)
        .expect(404);
    });
  });

  describe('GET /api/persons/:id', () => {
    it('should return a specific person', async () => {
      const response = await request(app)
        .get('/api/persons/1')
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', '1');
    });

    it('should return 404 for non-existent person', async () => {
      await request(app)
        .get('/api/persons/999')
        .expect(404);
    });
  });

  describe('PUT /api/persons/:id', () => {
    it('should update a person', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        birthDate: '1990-05-15'
      };

      const response = await request(app)
        .put('/api/persons/1')
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.firstName).toBe(updateData.firstName);
    });

    it('should return 404 for non-existent person', async () => {
      await request(app)
        .put('/api/persons/999')
        .send({ firstName: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/persons/:id', () => {
    it('should delete a person', async () => {
      await request(app)
        .delete('/api/persons/1')
        .expect(204);
    });

    it('should return 404 for non-existent person', async () => {
      await request(app)
        .delete('/api/persons/999')
        .expect(404);
    });
  });
});