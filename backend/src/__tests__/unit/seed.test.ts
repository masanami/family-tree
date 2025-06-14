import { SeedManager } from '../../utils/seed';

describe('Database Seeding', () => {
  let seedManager: SeedManager;
  let mockPrismaClient: any;

  beforeEach(() => {
    // Mock PrismaClient from setup
    const mockModule = require('@prisma/client');
    mockPrismaClient = mockModule.__mockPrismaClient;
    
    // Reset all mocks
    jest.clearAllMocks();
    
    seedManager = new SeedManager();
  });

  describe('Seed Data Creation', () => {
    it('should have a method to seed database', () => {
      expect(seedManager.seed).toBeDefined();
      expect(typeof seedManager.seed).toBe('function');
    });

    it('should create sample family tree data', async () => {
      // Mock successful creation
      mockPrismaClient.familyTree.create.mockResolvedValue({
        id: '1',
        name: 'Sample Family Tree',
        description: 'A sample family tree for testing',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockPrismaClient.person.create.mockResolvedValue({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        familyTreeId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockPrismaClient.relationship.create.mockResolvedValue({
        id: '1',
        person1Id: '1',
        person2Id: '2',
        relationshipType: 'parent',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await seedManager.seed();
      
      expect(result).toHaveProperty('familyTreesCreated');
      expect(result.familyTreesCreated).toBeGreaterThan(0);
      expect(mockPrismaClient.familyTree.create).toHaveBeenCalled();
    });

    it('should create sample person data', async () => {
      // Mock all necessary methods
      mockPrismaClient.familyTree.create.mockResolvedValue({
        id: '1',
        name: 'Test Family',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockPrismaClient.person.create.mockResolvedValue({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        familyTreeId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockPrismaClient.relationship.create.mockResolvedValue({
        id: '1',
        person1Id: '1',
        person2Id: '2',
        relationshipType: 'parent',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await seedManager.seed();
      
      expect(result).toHaveProperty('personsCreated');
      expect(result.personsCreated).toBeGreaterThan(0);
      expect(mockPrismaClient.person.create).toHaveBeenCalled();
    });

    it('should create sample relationship data', async () => {
      // Mock all necessary methods
      mockPrismaClient.familyTree.create.mockResolvedValue({
        id: '1',
        name: 'Test Family',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockPrismaClient.person.create.mockResolvedValue({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        familyTreeId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockPrismaClient.relationship.create.mockResolvedValue({
        id: '1',
        person1Id: '1',
        person2Id: '2',
        relationshipType: 'parent',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await seedManager.seed();
      
      expect(result).toHaveProperty('relationshipsCreated');
      expect(result.relationshipsCreated).toBeGreaterThan(0);
      expect(mockPrismaClient.relationship.create).toHaveBeenCalled();
    });

    it('should handle seeding errors gracefully', async () => {
      // Mock creation failure
      mockPrismaClient.familyTree.create.mockRejectedValue(new Error('Database error'));

      await expect(seedManager.seed()).rejects.toThrow('Failed to seed database');
    });

    it('should have a method to clear seed data', async () => {
      expect(seedManager.clear).toBeDefined();
      
      mockPrismaClient.relationship.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaClient.person.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaClient.familyTree.deleteMany.mockResolvedValue({ count: 2 });

      const result = await seedManager.clear();
      
      expect(result).toEqual({
        relationshipsDeleted: 5,
        personsDeleted: 10,
        familyTreesDeleted: 2
      });
    });
  });

  describe('Seed Data Validation', () => {
    it('should validate seed data before insertion', async () => {
      const isValid = await seedManager.validateSeedData();
      expect(isValid).toBe(true);
    });

    it('should generate realistic sample data', () => {
      const sampleData = seedManager.generateSampleData();
      
      expect(sampleData).toHaveProperty('familyTrees');
      expect(sampleData).toHaveProperty('persons');
      expect(sampleData).toHaveProperty('relationships');
      
      expect(Array.isArray(sampleData.familyTrees)).toBe(true);
      expect(Array.isArray(sampleData.persons)).toBe(true);
      expect(Array.isArray(sampleData.relationships)).toBe(true);
    });
  });
});