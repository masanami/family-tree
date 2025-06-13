import { RelationshipService } from '../../src/services/relationshipService';
import pool from '../../src/config/database';
import { CreateRelationshipDto } from '../../src/types/models';

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

describe('RelationshipService', () => {
  let relationshipService: RelationshipService;
  const mockQuery = pool.query as jest.MockedFunction<typeof pool.query>;

  beforeEach(() => {
    relationshipService = new RelationshipService();
    jest.clearAllMocks();
  });

  describe('getAllRelationships', () => {
    it('should return all relationships ordered by created_at', async () => {
      const mockRelationships = [
        { id: '1', person1_id: '1', person2_id: '2', relationship_type: 'spouse' }
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockRelationships } as any);

      const result = await relationshipService.getAllRelationships();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC')
      );
      expect(result).toEqual(mockRelationships);
    });
  });

  describe('getRelationshipById', () => {
    it('should return a relationship by ID', async () => {
      const mockRelationship = { 
        id: '1', 
        person1_id: '1', 
        person2_id: '2', 
        relationship_type: 'spouse' 
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockRelationship] } as any);

      const result = await relationshipService.getRelationshipById('1');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM family_relationships WHERE id = $1',
        ['1']
      );
      expect(result).toEqual(mockRelationship);
    });
  });

  describe('createRelationship', () => {
    it('should create a new relationship', async () => {
      const createDto: CreateRelationshipDto = {
        person1_id: '1',
        person2_id: '2',
        relationship_type: 'parent-child'
      };
      const mockCreatedRelationship = { id: '1', ...createDto };
      
      // Mock person existence check
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '2' }] } as any);
      // Mock insert
      mockQuery.mockResolvedValueOnce({ rows: [mockCreatedRelationship] } as any);

      const result = await relationshipService.createRelationship(createDto);

      expect(mockQuery).toHaveBeenNthCalledWith(1,
        'SELECT COUNT(*) FROM persons WHERE id IN ($1, $2)',
        ['1', '2']
      );
      expect(result).toEqual(mockCreatedRelationship);
    });

    it('should throw error if persons do not exist', async () => {
      const createDto: CreateRelationshipDto = {
        person1_id: '1',
        person2_id: '999',
        relationship_type: 'parent-child'
      };
      
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }] } as any);

      await expect(relationshipService.createRelationship(createDto))
        .rejects.toThrow('One or both persons do not exist');
    });

    it('should throw error for duplicate relationship', async () => {
      const createDto: CreateRelationshipDto = {
        person1_id: '1',
        person2_id: '2',
        relationship_type: 'parent-child'
      };
      
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '2' }] } as any);
      mockQuery.mockRejectedValueOnce({ code: '23505' });

      await expect(relationshipService.createRelationship(createDto))
        .rejects.toThrow('This relationship already exists');
    });
  });

  describe('getChildren', () => {
    it('should return children IDs for a parent', async () => {
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ child_id: '2' }, { child_id: '3' }] 
      } as any);

      const result = await relationshipService.getChildren('1');

      expect(result).toEqual(['2', '3']);
    });
  });

  describe('getParents', () => {
    it('should return parent IDs for a child', async () => {
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ parent_id: '1' }, { parent_id: '2' }] 
      } as any);

      const result = await relationshipService.getParents('3');

      expect(result).toEqual(['1', '2']);
    });
  });

  describe('getSiblings', () => {
    it('should return sibling IDs for a person', async () => {
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ sibling_id: '2' }, { sibling_id: '3' }] 
      } as any);

      const result = await relationshipService.getSiblings('1');

      expect(result).toEqual(['2', '3']);
    });
  });

  describe('getSpouses', () => {
    it('should return current spouse IDs for a person', async () => {
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ spouse_id: '2' }] 
      } as any);

      const result = await relationshipService.getSpouses('1');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('end_date IS NULL OR end_date > CURRENT_DATE'),
        ['1']
      );
      expect(result).toEqual(['2']);
    });
  });

  describe('deleteRelationship', () => {
    it('should delete a relationship and return true', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 } as any);

      const result = await relationshipService.deleteRelationship('1');

      expect(result).toBe(true);
    });
  });
});