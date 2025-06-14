import request from 'supertest';
import { App } from '../../app';
import { Server } from 'http';

// Mock PrismaClient to avoid actual database operations in tests
jest.mock('@prisma/client');

describe('Relationship API Endpoints', () => {
  let app: App;
  let server: Server;
  let mockPrismaClient: any;
  let testFamilyTreeId: string;
  let testPerson1Id: string;
  let testPerson2Id: string;
  let testRelationshipId: string;

  beforeAll(async () => {
    // Initialize app and get server
    app = new App();
    server = app.getServer();
    
    // Get mock PrismaClient
    const { __mockPrismaClient } = require('@prisma/client');
    mockPrismaClient = __mockPrismaClient;

    // Create test data
    const familyTree = await prisma.familyTree.create({
      data: {
        name: 'Test Family Tree',
        description: 'Test family tree for relationship API tests'
      }
    });
    testFamilyTreeId = familyTree.id;

    const person1 = await prisma.person.create({
      data: {
        familyTreeId: testFamilyTreeId,
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male'
      }
    });
    testPerson1Id = person1.id;

    const person2 = await prisma.person.create({
      data: {
        familyTreeId: testFamilyTreeId,
        firstName: 'Jane',
        lastName: 'Doe',
        gender: 'female'
      }
    });
    testPerson2Id = person2.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.relationship.deleteMany({});
    await prisma.person.deleteMany({});
    await prisma.familyTree.deleteMany({});
    await prisma.$disconnect();

    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clean up relationships before each test
    await prisma.relationship.deleteMany({});
  });

  describe('GET /api/v1/family-trees/:treeId/relationships', () => {
    it('should return empty array when no relationships exist', async () => {
      const response = await request(server)
        .get(`/api/v1/family-trees/${testFamilyTreeId}/relationships`)
        .expect(200);

      expect(response.body).toEqual({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      });
    });

    it('should return all relationships for a family tree', async () => {
      // Create test relationships
      const relationship1 = await prisma.relationship.create({
        data: {
          person1Id: testPerson1Id,
          person2Id: testPerson2Id,
          relationshipType: 'spouse'
        }
      });

      const response = await request(server)
        .get(`/api/v1/family-trees/${testFamilyTreeId}/relationships`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        id: relationship1.id,
        person1Id: testPerson1Id,
        person2Id: testPerson2Id,
        relationshipType: 'spouse'
      });
      expect(response.body.pagination.total).toBe(1);
    });

    it('should support pagination', async () => {
      // Create multiple relationships
      for (let i = 0; i < 15; i++) {
        await prisma.relationship.create({
          data: {
            person1Id: testPerson1Id,
            person2Id: testPerson2Id,
            relationshipType: `relation-${i}`
          }
        });
      }

      const response = await request(server)
        .get(`/api/v1/family-trees/${testFamilyTreeId}/relationships`)
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toEqual({
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3
      });
    });

    it('should return 404 for non-existent family tree', async () => {
      const response = await request(server)
        .get('/api/v1/family-trees/non-existent-id/relationships')
        .expect(404);

      expect(response.body.error).toMatchObject({
        message: 'Family tree not found',
        status: 404
      });
    });
  });

  describe('POST /api/v1/family-trees/:treeId/relationships', () => {
    it('should create a new relationship', async () => {
      const relationshipData = {
        person1Id: testPerson1Id,
        person2Id: testPerson2Id,
        relationshipType: 'parent'
      };

      const response = await request(server)
        .post(`/api/v1/family-trees/${testFamilyTreeId}/relationships`)
        .send(relationshipData)
        .expect(201);

      expect(response.body.data).toMatchObject(relationshipData);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();

      // Verify in database
      const created = await prisma.relationship.findUnique({
        where: { id: response.body.data.id }
      });
      expect(created).toBeTruthy();
    });

    it('should validate required fields', async () => {
      const response = await request(server)
        .post(`/api/v1/family-trees/${testFamilyTreeId}/relationships`)
        .send({})
        .expect(400);

      expect(response.body.error.message).toContain('person1Id is required');
      expect(response.body.error.message).toContain('person2Id is required');
      expect(response.body.error.message).toContain('relationshipType is required');
    });

    it('should validate person IDs exist', async () => {
      const response = await request(server)
        .post(`/api/v1/family-trees/${testFamilyTreeId}/relationships`)
        .send({
          person1Id: 'non-existent-id',
          person2Id: 'non-existent-id',
          relationshipType: 'parent'
        })
        .expect(400);

      expect(response.body.error.message).toContain('Invalid person IDs');
    });

    it('should validate persons belong to the same family tree', async () => {
      // Create person in different family tree
      const otherTree = await prisma.familyTree.create({
        data: { name: 'Other Tree' }
      });
      const otherPerson = await prisma.person.create({
        data: {
          familyTreeId: otherTree.id,
          firstName: 'Other',
          lastName: 'Person'
        }
      });

      const response = await request(server)
        .post(`/api/v1/family-trees/${testFamilyTreeId}/relationships`)
        .send({
          person1Id: testPerson1Id,
          person2Id: otherPerson.id,
          relationshipType: 'parent'
        })
        .expect(400);

      expect(response.body.error.message).toContain('Persons must belong to the same family tree');

      // Clean up
      await prisma.person.delete({ where: { id: otherPerson.id } });
      await prisma.familyTree.delete({ where: { id: otherTree.id } });
    });

    it('should prevent duplicate relationships', async () => {
      // Create first relationship
      await prisma.relationship.create({
        data: {
          person1Id: testPerson1Id,
          person2Id: testPerson2Id,
          relationshipType: 'spouse'
        }
      });

      // Try to create duplicate
      const response = await request(server)
        .post(`/api/v1/family-trees/${testFamilyTreeId}/relationships`)
        .send({
          person1Id: testPerson1Id,
          person2Id: testPerson2Id,
          relationshipType: 'spouse'
        })
        .expect(409);

      expect(response.body.error.message).toContain('Relationship already exists');
    });
  });

  describe('PUT /api/v1/relationships/:id', () => {
    beforeEach(async () => {
      // Create a test relationship
      const relationship = await prisma.relationship.create({
        data: {
          person1Id: testPerson1Id,
          person2Id: testPerson2Id,
          relationshipType: 'spouse'
        }
      });
      testRelationshipId = relationship.id;
    });

    it('should update a relationship', async () => {
      const updateData = {
        relationshipType: 'sibling'
      };

      const response = await request(server)
        .put(`/api/v1/relationships/${testRelationshipId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: testRelationshipId,
        person1Id: testPerson1Id,
        person2Id: testPerson2Id,
        relationshipType: 'sibling'
      });
      expect(new Date(response.body.data.updatedAt).getTime())
        .toBeGreaterThan(new Date(response.body.data.createdAt).getTime());
    });

    it('should allow updating person IDs', async () => {
      // Create another person
      const person3 = await prisma.person.create({
        data: {
          familyTreeId: testFamilyTreeId,
          firstName: 'Jack',
          lastName: 'Doe'
        }
      });

      const response = await request(server)
        .put(`/api/v1/relationships/${testRelationshipId}`)
        .send({
          person2Id: person3.id
        })
        .expect(200);

      expect(response.body.data.person2Id).toBe(person3.id);

      // Clean up
      await prisma.person.delete({ where: { id: person3.id } });
    });

    it('should validate updated data', async () => {
      const response = await request(server)
        .put(`/api/v1/relationships/${testRelationshipId}`)
        .send({
          relationshipType: ''
        })
        .expect(400);

      expect(response.body.error.message).toContain('relationshipType');
    });

    it('should return 404 for non-existent relationship', async () => {
      const response = await request(server)
        .put('/api/v1/relationships/non-existent-id')
        .send({
          relationshipType: 'parent'
        })
        .expect(404);

      expect(response.body.error.message).toBe('Relationship not found');
    });
  });

  describe('DELETE /api/v1/relationships/:id', () => {
    beforeEach(async () => {
      // Create a test relationship
      const relationship = await prisma.relationship.create({
        data: {
          person1Id: testPerson1Id,
          person2Id: testPerson2Id,
          relationshipType: 'spouse'
        }
      });
      testRelationshipId = relationship.id;
    });

    it('should delete a relationship', async () => {
      const response = await request(server)
        .delete(`/api/v1/relationships/${testRelationshipId}`)
        .expect(204);

      expect(response.body).toEqual({});

      // Verify deletion
      const deleted = await prisma.relationship.findUnique({
        where: { id: testRelationshipId }
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent relationship', async () => {
      const response = await request(server)
        .delete('/api/v1/relationships/non-existent-id')
        .expect(404);

      expect(response.body.error.message).toBe('Relationship not found');
    });

    it('should be idempotent', async () => {
      // First deletion
      await request(server)
        .delete(`/api/v1/relationships/${testRelationshipId}`)
        .expect(204);

      // Second deletion should return 404
      await request(server)
        .delete(`/api/v1/relationships/${testRelationshipId}`)
        .expect(404);
    });
  });
});