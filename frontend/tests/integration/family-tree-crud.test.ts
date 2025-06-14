import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiService } from '../../src/services/api.service';
import { API_ENDPOINTS } from '../../src/constants/api.constants';
import type { FamilyTree, CreateFamilyTreeRequest, UpdateFamilyTreeRequest } from '../../src/types/familyTree';

describe('Family Tree CRUD Integration Tests', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    // Reset localStorage
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  describe('GET /api/v1/family-trees', () => {
    it('should fetch family trees list successfully', async () => {
      const mockFamilyTrees: FamilyTree[] = [
        {
          id: '1',
          name: '田中家系図',
          description: '田中家の家系図です',
          ownerId: 'user1',
          isPublic: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          membersCount: 10,
        },
        {
          id: '2',
          name: '公開家系図',
          description: '公開されている家系図',
          ownerId: 'user2',
          isPublic: true,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          membersCount: 5,
        },
      ];

      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`).reply(200, {
        trees: mockFamilyTrees,
        total: 2,
        page: 1,
        limit: 10,
        hasMore: false,
      });

      const response = await apiService.get(`${API_ENDPOINTS.FAMILY_TREES.BASE}`);
      
      expect(response).toHaveProperty('trees');
      expect(response.trees).toHaveLength(2);
      expect(response.trees[0].name).toBe('田中家系図');
      expect(response.hasMore).toBe(false);
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        trees: [],
        total: 50,
        page: 2,
        limit: 10,
        hasMore: true,
      };

      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}?page=2&limit=10`)
        .reply(200, mockResponse);

      const response = await apiService.get(`${API_ENDPOINTS.FAMILY_TREES.BASE}?page=2&limit=10`);
      
      expect(response.page).toBe(2);
      expect(response.limit).toBe(10);
      expect(response.hasMore).toBe(true);
    });

    it('should handle authentication errors', async () => {
      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`).reply(401, {
        error: {
          message: 'Unauthorized',
          status: 401,
        },
      });

      await expect(apiService.get(API_ENDPOINTS.FAMILY_TREES.BASE))
        .rejects.toThrow();
    });
  });

  describe('POST /api/v1/family-trees', () => {
    it('should create a new family tree successfully', async () => {
      const createRequest: CreateFamilyTreeRequest = {
        name: '新しい家系図',
        description: 'テスト用の家系図',
        isPublic: false,
      };

      const mockResponse: FamilyTree = {
        id: '3',
        ...createRequest,
        ownerId: 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`, createRequest)
        .reply(201, mockResponse);

      const response = await apiService.post(API_ENDPOINTS.FAMILY_TREES.BASE, createRequest);
      
      expect(response.id).toBe('3');
      expect(response.name).toBe(createRequest.name);
      expect(response.description).toBe(createRequest.description);
      expect(response.isPublic).toBe(createRequest.isPublic);
    });

    it('should handle validation errors', async () => {
      const invalidRequest = {
        name: '', // Invalid: empty name
        description: 'Test',
        isPublic: false,
      };

      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`, invalidRequest)
        .reply(400, {
          error: {
            message: 'Validation failed',
            status: 400,
            errors: {
              name: ['Name is required', 'Name must be at least 2 characters'],
            },
          },
        });

      await expect(apiService.post(API_ENDPOINTS.FAMILY_TREES.BASE, invalidRequest))
        .rejects.toThrow();
    });
  });

  describe('GET /api/v1/family-trees/:id', () => {
    it('should fetch a single family tree successfully', async () => {
      const mockFamilyTree: FamilyTree = {
        id: '1',
        name: '田中家系図',
        description: '詳細な説明',
        ownerId: 'user1',
        isPublic: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        membersCount: 15,
        sharedWith: [
          { userId: 'user2', userName: '佐藤太郎', permission: 'view' },
        ],
      };

      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BY_ID('1')}`)
        .reply(200, mockFamilyTree);

      const response = await apiService.get(API_ENDPOINTS.FAMILY_TREES.BY_ID('1'));
      
      expect(response.id).toBe('1');
      expect(response.name).toBe('田中家系図');
      expect(response.membersCount).toBe(15);
      expect(response.sharedWith).toHaveLength(1);
    });

    it('should handle 404 not found errors', async () => {
      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BY_ID('999')}`)
        .reply(404, {
          error: {
            message: 'Family tree not found',
            status: 404,
          },
        });

      await expect(apiService.get(API_ENDPOINTS.FAMILY_TREES.BY_ID('999')))
        .rejects.toThrow();
    });
  });

  describe('PUT /api/v1/family-trees/:id', () => {
    it('should update a family tree successfully', async () => {
      const updateRequest: UpdateFamilyTreeRequest = {
        name: '更新された家系図',
        description: '更新された説明',
        isPublic: true,
      };

      const mockResponse: FamilyTree = {
        id: '1',
        name: updateRequest.name!,
        description: updateRequest.description!,
        isPublic: updateRequest.isPublic!,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        membersCount: 15,
      };

      mock.onPut(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BY_ID('1')}`, updateRequest)
        .reply(200, mockResponse);

      const response = await apiService.put(API_ENDPOINTS.FAMILY_TREES.BY_ID('1'), updateRequest);
      
      expect(response.name).toBe(updateRequest.name);
      expect(response.description).toBe(updateRequest.description);
      expect(response.isPublic).toBe(updateRequest.isPublic);
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateFamilyTreeRequest = {
        name: '名前のみ更新',
      };

      const mockResponse: FamilyTree = {
        id: '1',
        name: partialUpdate.name!,
        description: '既存の説明',
        isPublic: false,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      };

      mock.onPut(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BY_ID('1')}`, partialUpdate)
        .reply(200, mockResponse);

      const response = await apiService.put(API_ENDPOINTS.FAMILY_TREES.BY_ID('1'), partialUpdate);
      
      expect(response.name).toBe(partialUpdate.name);
      expect(response.description).toBe('既存の説明');
    });

    it('should handle permission errors', async () => {
      mock.onPut(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BY_ID('1')}`)
        .reply(403, {
          error: {
            message: 'You do not have permission to update this family tree',
            status: 403,
          },
        });

      await expect(apiService.put(API_ENDPOINTS.FAMILY_TREES.BY_ID('1'), {}))
        .rejects.toThrow();
    });
  });

  describe('DELETE /api/v1/family-trees/:id', () => {
    it('should delete a family tree successfully', async () => {
      mock.onDelete(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BY_ID('1')}`)
        .reply(204);

      await expect(apiService.delete(API_ENDPOINTS.FAMILY_TREES.BY_ID('1')))
        .resolves.toBeUndefined();
    });

    it('should handle delete permission errors', async () => {
      mock.onDelete(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BY_ID('2')}`)
        .reply(403, {
          error: {
            message: 'Only the owner can delete this family tree',
            status: 403,
          },
        });

      await expect(apiService.delete(API_ENDPOINTS.FAMILY_TREES.BY_ID('2')))
        .rejects.toThrow();
    });

    it('should handle cascade delete warnings', async () => {
      mock.onDelete(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BY_ID('3')}`)
        .reply(200, {
          message: 'Family tree deleted successfully',
          deletedCount: {
            familyTree: 1,
            persons: 15,
            relationships: 20,
          },
        });

      const response = await apiService.delete(API_ENDPOINTS.FAMILY_TREES.BY_ID('3'));
      
      expect(response).toHaveProperty('deletedCount');
      expect(response.deletedCount.persons).toBe(15);
      expect(response.deletedCount.relationships).toBe(20);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`)
        .networkError();

      await expect(apiService.get(API_ENDPOINTS.FAMILY_TREES.BASE))
        .rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onGet(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`)
        .timeout();

      await expect(apiService.get(API_ENDPOINTS.FAMILY_TREES.BASE))
        .rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      mock.onPost(`${apiService.getBaseURL()}${API_ENDPOINTS.FAMILY_TREES.BASE}`)
        .reply(500, {
          error: {
            message: 'Internal server error',
            status: 500,
          },
        });

      await expect(apiService.post(API_ENDPOINTS.FAMILY_TREES.BASE, {}))
        .rejects.toThrow();
    });
  });
});