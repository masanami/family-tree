import request from 'supertest';
import express from 'express';
import personRoutes from '../../src/routes/personRoutes';
import { PersonService } from '../../src/services/personService';

// Mock PersonService
jest.mock('../../src/services/personService');

const app = express();
app.use(express.json());
app.use('/api/persons', personRoutes);

describe('Person Routes', () => {
  let mockPersonService: jest.Mocked<PersonService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPersonService = {
      getAllPersons: jest.fn(),
      getPersonById: jest.fn(),
      createPerson: jest.fn(),
      updatePerson: jest.fn(),
      deletePerson: jest.fn(),
      searchPersons: jest.fn()
    } as unknown as jest.Mocked<PersonService>;
    (PersonService as jest.Mock).mockImplementation(() => mockPersonService);
  });

  describe('GET /api/persons', () => {
    it('should return all persons', async () => {
      const mockPersons = [
        { id: '1', first_name: 'John', last_name: 'Doe' },
        { id: '2', first_name: 'Jane', last_name: 'Smith' }
      ];
      mockPersonService.getAllPersons.mockResolvedValue(mockPersons as any);

      const response = await request(app).get('/api/persons');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPersons);
    });

    it('should handle errors', async () => {
      mockPersonService.getAllPersons.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/persons');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch persons' });
    });
  });

  describe('GET /api/persons/:id', () => {
    it('should return a person by ID', async () => {
      const mockPerson = { id: '123e4567-e89b-12d3-a456-426614174000', first_name: 'John', last_name: 'Doe' };
      mockPersonService.getPersonById.mockResolvedValue(mockPerson as any);

      const response = await request(app).get('/api/persons/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPerson);
    });

    it('should return 404 if person not found', async () => {
      mockPersonService.getPersonById.mockResolvedValue(null);

      const response = await request(app).get('/api/persons/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Person not found' });
    });

    it('should validate UUID format', async () => {
      const response = await request(app).get('/api/persons/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/persons', () => {
    it('should create a new person', async () => {
      const newPerson = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-01-01'
      };
      const createdPerson = { id: '1', ...newPerson };
      mockPersonService.createPerson.mockResolvedValue(createdPerson as any);

      const response = await request(app)
        .post('/api/persons')
        .send(newPerson);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdPerson);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/persons')
        .send({ first_name: 'John' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/persons/:id', () => {
    it('should update a person', async () => {
      const updateData = { first_name: 'Jane' };
      const updatedPerson = { 
        id: '123e4567-e89b-12d3-a456-426614174000', 
        first_name: 'Jane', 
        last_name: 'Doe' 
      };
      mockPersonService.updatePerson.mockResolvedValue(updatedPerson as any);

      const response = await request(app)
        .put('/api/persons/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedPerson);
    });

    it('should return 404 if person not found', async () => {
      mockPersonService.updatePerson.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/persons/123e4567-e89b-12d3-a456-426614174000')
        .send({ first_name: 'Jane' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/persons/:id', () => {
    it('should delete a person', async () => {
      mockPersonService.deletePerson.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/persons/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(204);
    });

    it('should return 404 if person not found', async () => {
      mockPersonService.deletePerson.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/persons/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/persons/search', () => {
    it('should search persons', async () => {
      const mockPersons = [{ id: '1', first_name: 'John', last_name: 'Doe' }];
      mockPersonService.searchPersons.mockResolvedValue(mockPersons as any);

      const response = await request(app)
        .get('/api/persons/search')
        .query({ q: 'john' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPersons);
    });

    it('should validate search query parameter', async () => {
      const response = await request(app).get('/api/persons/search');

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});