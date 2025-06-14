import { RelationshipService } from '../../../services/relationship.service';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../../middleware/error-handler';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      familyTree: {
        findUnique: jest.fn()
      },
      person: {
        findUnique: jest.fn(),
        findMany: jest.fn()
      },
      relationship: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    }))
  };
});

describe('RelationshipService', () => {
  let service: RelationshipService;
  let mockPrismaClient: any;

  beforeEach(() => {
    service = new RelationshipService();
    mockPrismaClient = (service as any).prisma;
    jest.clearAllMocks();
  });

  describe('getByFamilyTree', () => {
    const familyTreeId = 'test-tree-id';
    const mockPersons = [
      { id: 'person1' },
      { id: 'person2' }
    ];
    const mockRelationships = [
      {
        id: 'rel1',
        person1Id: 'person1',
        person2Id: 'person2',
        relationshipType: 'spouse',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    beforeEach(() => {
      mockPrismaClient.familyTree.findUnique.mockResolvedValue({ id: familyTreeId });
      mockPrismaClient.person.findMany.mockResolvedValue(mockPersons);
      mockPrismaClient.relationship.findMany.mockResolvedValue(mockRelationships);
      mockPrismaClient.relationship.count.mockResolvedValue(1);
    });

    it('should return paginated relationships for a family tree', async () => {
      const result = await service.getByFamilyTree(familyTreeId, 1, 10);

      expect(result).toEqual({
        data: mockRelationships,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });

      expect(mockPrismaClient.familyTree.findUnique).toHaveBeenCalledWith({
        where: { id: familyTreeId }
      });
      expect(mockPrismaClient.person.findMany).toHaveBeenCalledWith({
        where: { familyTreeId },
        select: { id: true }
      });
    });

    it('should throw 404 if family tree not found', async () => {
      mockPrismaClient.familyTree.findUnique.mockResolvedValue(null);

      await expect(service.getByFamilyTree(familyTreeId, 1, 10))
        .rejects.toThrow(new ApiError(404, 'Family tree not found'));
    });

    it('should handle pagination correctly', async () => {
      const page = 2;
      const limit = 5;

      await service.getByFamilyTree(familyTreeId, page, limit);

      expect(mockPrismaClient.relationship.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { person1Id: { in: ['person1', 'person2'] }, person2Id: { in: ['person1', 'person2'] } }
          ]
        },
        skip: 5, // (page - 1) * limit
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('create', () => {
    const familyTreeId = 'test-tree-id';
    const createData = {
      person1Id: 'person1',
      person2Id: 'person2',
      relationshipType: 'parent'
    };
    const mockPerson1 = { id: 'person1', familyTreeId };
    const mockPerson2 = { id: 'person2', familyTreeId };

    beforeEach(() => {
      mockPrismaClient.person.findUnique
        .mockResolvedValueOnce(mockPerson1)
        .mockResolvedValueOnce(mockPerson2);
      mockPrismaClient.relationship.findFirst.mockResolvedValue(null);
      mockPrismaClient.relationship.create.mockResolvedValue({
        id: 'new-rel',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should create a new relationship', async () => {
      const result = await service.create(familyTreeId, createData);

      expect(result).toMatchObject(createData);
      expect(mockPrismaClient.relationship.create).toHaveBeenCalledWith({
        data: createData
      });
    });

    it('should throw 400 if person not found', async () => {
      mockPrismaClient.person.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(familyTreeId, createData))
        .rejects.toThrow(new ApiError(400, 'Invalid person IDs'));
    });

    it('should throw 400 if persons in different family trees', async () => {
      mockPrismaClient.person.findUnique
        .mockResolvedValueOnce({ id: 'person1', familyTreeId })
        .mockResolvedValueOnce({ id: 'person2', familyTreeId: 'other-tree' });

      await expect(service.create(familyTreeId, createData))
        .rejects.toThrow(new ApiError(400, 'Persons must belong to the same family tree'));
    });

    it('should throw 409 if relationship already exists', async () => {
      mockPrismaClient.relationship.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.create(familyTreeId, createData))
        .rejects.toThrow(new ApiError(409, 'Relationship already exists'));
    });
  });

  describe('update', () => {
    const relationshipId = 'rel-id';
    const existingRelationship = {
      id: relationshipId,
      person1Id: 'person1',
      person2Id: 'person2',
      relationshipType: 'spouse'
    };
    const updateData = { relationshipType: 'sibling' };

    beforeEach(() => {
      mockPrismaClient.relationship.findUnique.mockResolvedValue(existingRelationship);
      mockPrismaClient.relationship.update.mockResolvedValue({
        ...existingRelationship,
        ...updateData,
        updatedAt: new Date()
      });
    });

    it('should update a relationship', async () => {
      const result = await service.update(relationshipId, updateData);

      expect(result.relationshipType).toBe('sibling');
      expect(mockPrismaClient.relationship.update).toHaveBeenCalledWith({
        where: { id: relationshipId },
        data: updateData
      });
    });

    it('should throw 404 if relationship not found', async () => {
      mockPrismaClient.relationship.findUnique.mockResolvedValue(null);

      await expect(service.update(relationshipId, updateData))
        .rejects.toThrow(new ApiError(404, 'Relationship not found'));
    });

    it('should validate person IDs when updating', async () => {
      const updateWithPersons = { person2Id: 'new-person' };
      mockPrismaClient.person.findUnique
        .mockResolvedValueOnce({ id: 'person1', familyTreeId: 'tree1' })
        .mockResolvedValueOnce({ id: 'new-person', familyTreeId: 'tree2' });

      await expect(service.update(relationshipId, updateWithPersons))
        .rejects.toThrow(new ApiError(400, 'Persons must belong to the same family tree'));
    });
  });

  describe('delete', () => {
    const relationshipId = 'rel-id';

    it('should delete a relationship', async () => {
      mockPrismaClient.relationship.delete.mockResolvedValue({});

      await expect(service.delete(relationshipId)).resolves.not.toThrow();

      expect(mockPrismaClient.relationship.delete).toHaveBeenCalledWith({
        where: { id: relationshipId }
      });
    });

    it('should throw 404 if relationship not found', async () => {
      const prismaError = new Error();
      (prismaError as any).code = 'P2025';
      mockPrismaClient.relationship.delete.mockRejectedValue(prismaError);

      await expect(service.delete(relationshipId))
        .rejects.toThrow(new ApiError(404, 'Relationship not found'));
    });

    it('should rethrow other errors', async () => {
      const otherError = new Error('Database error');
      mockPrismaClient.relationship.delete.mockRejectedValue(otherError);

      await expect(service.delete(relationshipId))
        .rejects.toThrow(otherError);
    });
  });
});