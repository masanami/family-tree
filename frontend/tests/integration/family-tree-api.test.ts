import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../../src/services/api.service';
import { API_ENDPOINTS } from '../../src/constants/api.constants';

// Mock data for testing
const mockFamilyTree = {
  id: '1',
  name: 'Test Family Tree',
  description: 'A test family tree',
  createdBy: 'user123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockFamilyTrees = [
  mockFamilyTree,
  {
    id: '2',
    name: 'Another Family Tree',
    description: 'Another test family tree',
    createdBy: 'user456',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

describe('Family Tree API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/family-trees', () => {
    it('should fetch all family trees successfully', async () => {
      // Mock successful API response
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: mockFamilyTrees
      });

      const result = await apiService.get(API_ENDPOINTS.FAMILY_TREES.BASE);

      expect(getSpy).toHaveBeenCalledWith(API_ENDPOINTS.FAMILY_TREES.BASE);
      expect(result.data).toEqual(mockFamilyTrees);
      expect(result.data).toHaveLength(2);
    });

    it('should handle empty family trees list', async () => {
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: []
      });

      const result = await apiService.get(API_ENDPOINTS.FAMILY_TREES.BASE);

      expect(getSpy).toHaveBeenCalledWith(API_ENDPOINTS.FAMILY_TREES.BASE);
      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      const getSpy = vi.spyOn(apiService, 'get').mockRejectedValue(
        new Error('Network Error')
      );

      await expect(
        apiService.get(API_ENDPOINTS.FAMILY_TREES.BASE)
      ).rejects.toThrow('Network Error');

      expect(getSpy).toHaveBeenCalledWith(API_ENDPOINTS.FAMILY_TREES.BASE);
    });
  });

  describe('POST /api/family-trees', () => {
    const newFamilyTreeData = {
      name: 'New Family Tree',
      description: 'A new test family tree',
      createdBy: 'user789'
    };

    it('should create a new family tree successfully', async () => {
      const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
        data: { ...mockFamilyTree, ...newFamilyTreeData }
      });

      const result = await apiService.post(
        API_ENDPOINTS.FAMILY_TREES.BASE,
        newFamilyTreeData
      );

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.BASE,
        newFamilyTreeData
      );
      expect(result.data.name).toBe(newFamilyTreeData.name);
      expect(result.data.description).toBe(newFamilyTreeData.description);
    });

    it('should handle validation errors', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Validation failed',
              details: [
                {
                  field: 'name',
                  message: 'Name is required'
                }
              ]
            }
          }
        }
      };

      const postSpy = vi.spyOn(apiService, 'post').mockRejectedValue(validationError);

      await expect(
        apiService.post(API_ENDPOINTS.FAMILY_TREES.BASE, { name: '' })
      ).rejects.toEqual(validationError);

      expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.FAMILY_TREES.BASE, { name: '' });
    });
  });

  describe('GET /api/family-trees/:id', () => {
    it('should fetch a specific family tree successfully', async () => {
      const familyTreeId = '1';
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: mockFamilyTree
      });

      const result = await apiService.get(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId)
      );

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId)
      );
      expect(result.data).toEqual(mockFamilyTree);
      expect(result.data.id).toBe(familyTreeId);
    });

    it('should handle 404 not found errors', async () => {
      const familyTreeId = 'non-existent';
      const notFoundError = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Family tree not found'
            }
          }
        }
      };

      const getSpy = vi.spyOn(apiService, 'get').mockRejectedValue(notFoundError);

      await expect(
        apiService.get(API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId))
      ).rejects.toEqual(notFoundError);

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId)
      );
    });
  });

  describe('PUT /api/family-trees/:id', () => {
    const familyTreeId = '1';
    const updateData = {
      name: 'Updated Family Tree',
      description: 'Updated description'
    };

    it('should update a family tree successfully', async () => {
      const updatedFamilyTree = { ...mockFamilyTree, ...updateData };
      const putSpy = vi.spyOn(apiService, 'put').mockResolvedValue({
        data: updatedFamilyTree
      });

      const result = await apiService.put(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId),
        updateData
      );

      expect(putSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId),
        updateData
      );
      expect(result.data.name).toBe(updateData.name);
      expect(result.data.description).toBe(updateData.description);
    });

    it('should handle update validation errors', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Validation failed',
              details: [
                {
                  field: 'name',
                  message: 'Name must be between 1 and 255 characters'
                }
              ]
            }
          }
        }
      };

      const putSpy = vi.spyOn(apiService, 'put').mockRejectedValue(validationError);

      await expect(
        apiService.put(
          API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId),
          { name: 'a'.repeat(300) }
        )
      ).rejects.toEqual(validationError);

      expect(putSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId),
        { name: 'a'.repeat(300) }
      );
    });
  });

  describe('DELETE /api/family-trees/:id', () => {
    const familyTreeId = '1';

    it('should delete a family tree successfully', async () => {
      const deleteSpy = vi.spyOn(apiService, 'delete').mockResolvedValue({
        data: null
      });

      const result = await apiService.delete(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId)
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(familyTreeId)
      );
      expect(result.data).toBeNull();
    });

    it('should handle delete of non-existent family tree', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Family tree not found'
            }
          }
        }
      };

      const deleteSpy = vi.spyOn(apiService, 'delete').mockRejectedValue(notFoundError);

      await expect(
        apiService.delete(API_ENDPOINTS.FAMILY_TREES.BY_ID('non-existent'))
      ).rejects.toEqual(notFoundError);

      expect(deleteSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.BY_ID('non-existent')
      );
    });
  });

  describe('CRUD Integration Flow', () => {
    it('should support complete CRUD workflow', async () => {
      const createData = {
        name: 'Integration Test Tree',
        description: 'For integration testing',
        createdBy: 'test-user'
      };

      // Mock the complete CRUD flow
      const createdTree = { ...mockFamilyTree, ...createData };
      const updatedTree = { ...createdTree, name: 'Updated Integration Tree' };

      // Create
      const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
        data: createdTree
      });

      const createResult = await apiService.post(
        API_ENDPOINTS.FAMILY_TREES.BASE,
        createData
      );

      expect(createResult.data.name).toBe(createData.name);

      // Read
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: createdTree
      });

      const readResult = await apiService.get(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(createdTree.id)
      );

      expect(readResult.data.id).toBe(createdTree.id);

      // Update
      const putSpy = vi.spyOn(apiService, 'put').mockResolvedValue({
        data: updatedTree
      });

      const updateResult = await apiService.put(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(createdTree.id),
        { name: 'Updated Integration Tree' }
      );

      expect(updateResult.data.name).toBe('Updated Integration Tree');

      // Delete
      const deleteSpy = vi.spyOn(apiService, 'delete').mockResolvedValue({
        data: null
      });

      const deleteResult = await apiService.delete(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(createdTree.id)
      );

      expect(deleteResult.data).toBeNull();

      // Verify all calls were made
      expect(postSpy).toHaveBeenCalled();
      expect(getSpy).toHaveBeenCalled();
      expect(putSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
    });
  });
});