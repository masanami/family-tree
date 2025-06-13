import request from 'supertest';
import express from 'express';
import relationshipRoutes from '../../src/routes/relationshipRoutes';
import { RelationshipService } from '../../src/services/relationshipService';

// Mock RelationshipService
jest.mock('../../src/services/relationshipService');

const app = express();
app.use(express.json());
app.use('/api/relationships', relationshipRoutes);

describe('Relationship Routes', () => {
  let mockRelationshipService: jest.Mocked<RelationshipService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRelationshipService = {
      getAllRelationships: jest.fn(),
      getRelationshipById: jest.fn(),
      getPersonRelationships: jest.fn(),
      createRelationship: jest.fn(),
      updateRelationship: jest.fn(),
      deleteRelationship: jest.fn(),
      getRelationshipsByType: jest.fn(),
      getChildren: jest.fn(),
      getParents: jest.fn(),
      getSiblings: jest.fn(),
      getSpouses: jest.fn()
    } as unknown as jest.Mocked<RelationshipService>;
    (RelationshipService as jest.Mock).mockImplementation(() => mockRelationshipService);
  });

  describe('GET /api/relationships', () => {
    it('should return all relationships', async () => {
      const mockRelationships = [
        { 
          id: '1', 
          person1_id: '1', 
          person2_id: '2', 
          relationship_type: 'spouse' 
        }
      ];
      mockRelationshipService.getAllRelationships.mockResolvedValue(mockRelationships as any);

      const response = await request(app).get('/api/relationships');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRelationships);
    });
  });

  describe('GET /api/relationships/:id', () => {
    it('should return a relationship by ID', async () => {
      const mockRelationship = { 
        id: '123e4567-e89b-12d3-a456-426614174000', 
        person1_id: '1', 
        person2_id: '2', 
        relationship_type: 'spouse' 
      };
      mockRelationshipService.getRelationshipById.mockResolvedValue(mockRelationship as any);

      const response = await request(app)
        .get('/api/relationships/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRelationship);
    });

    it('should return 404 if relationship not found', async () => {
      mockRelationshipService.getRelationshipById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/relationships/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/relationships', () => {
    it('should create a new relationship', async () => {
      const newRelationship = {
        person1_id: '123e4567-e89b-12d3-a456-426614174000',
        person2_id: '123e4567-e89b-12d3-a456-426614174001',
        relationship_type: 'parent-child'
      };
      const createdRelationship = { id: '1', ...newRelationship };
      mockRelationshipService.createRelationship.mockResolvedValue(createdRelationship as any);

      const response = await request(app)
        .post('/api/relationships')
        .send(newRelationship);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdRelationship);
    });

    it('should validate relationship type', async () => {
      const response = await request(app)
        .post('/api/relationships')
        .send({
          person1_id: '123e4567-e89b-12d3-a456-426614174000',
          person2_id: '123e4567-e89b-12d3-a456-426614174001',
          relationship_type: 'invalid-type'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should prevent self-relationships', async () => {
      const response = await request(app)
        .post('/api/relationships')
        .send({
          person1_id: '123e4567-e89b-12d3-a456-426614174000',
          person2_id: '123e4567-e89b-12d3-a456-426614174000',
          relationship_type: 'spouse'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle duplicate relationship error', async () => {
      mockRelationshipService.createRelationship.mockRejectedValue(
        new Error('This relationship already exists')
      );

      const response = await request(app)
        .post('/api/relationships')
        .send({
          person1_id: '123e4567-e89b-12d3-a456-426614174000',
          person2_id: '123e4567-e89b-12d3-a456-426614174001',
          relationship_type: 'spouse'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/relationships/person/:personId/children', () => {
    it('should return children of a person', async () => {
      mockRelationshipService.getChildren.mockResolvedValue(['child1', 'child2']);

      const response = await request(app)
        .get('/api/relationships/person/123e4567-e89b-12d3-a456-426614174000/children');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ children: ['child1', 'child2'] });
    });
  });

  describe('GET /api/relationships/person/:personId/parents', () => {
    it('should return parents of a person', async () => {
      mockRelationshipService.getParents.mockResolvedValue(['parent1', 'parent2']);

      const response = await request(app)
        .get('/api/relationships/person/123e4567-e89b-12d3-a456-426614174000/parents');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ parents: ['parent1', 'parent2'] });
    });
  });

  describe('GET /api/relationships/person/:personId/siblings', () => {
    it('should return siblings of a person', async () => {
      mockRelationshipService.getSiblings.mockResolvedValue(['sibling1', 'sibling2']);

      const response = await request(app)
        .get('/api/relationships/person/123e4567-e89b-12d3-a456-426614174000/siblings');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ siblings: ['sibling1', 'sibling2'] });
    });
  });

  describe('GET /api/relationships/person/:personId/spouses', () => {
    it('should return spouses of a person', async () => {
      mockRelationshipService.getSpouses.mockResolvedValue(['spouse1']);

      const response = await request(app)
        .get('/api/relationships/person/123e4567-e89b-12d3-a456-426614174000/spouses');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ spouses: ['spouse1'] });
    });
  });

  describe('DELETE /api/relationships/:id', () => {
    it('should delete a relationship', async () => {
      mockRelationshipService.deleteRelationship.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/relationships/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(204);
    });

    it('should return 404 if relationship not found', async () => {
      mockRelationshipService.deleteRelationship.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/relationships/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(404);
    });
  });
});