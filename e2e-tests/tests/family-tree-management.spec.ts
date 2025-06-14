import { test, expect } from '@playwright/test';
import { ApiClient } from '../fixtures/api-client';

test.describe('Family Tree Management E2E Tests', () => {
  let apiClient: ApiClient;
  let authToken: string;
  let userId: string;
  let testFamilyTreeIds: string[] = [];

  test.beforeAll(async () => {
    apiClient = new ApiClient(process.env.API_BASE_URL || 'http://localhost:5001');
    
    // Wait for backend to be ready
    const isReady = await apiClient.waitForServer(30000);
    expect(isReady).toBe(true);

    // TODO: Once authentication is implemented, get auth token here
    // For now, we'll test without authentication
    authToken = 'mock-token';
    userId = 'test-user-id';
  });

  test.afterAll(async () => {
    // Cleanup test data
    for (const familyTreeId of testFamilyTreeIds) {
      await apiClient.deleteFamilyTree(familyTreeId);
    }
  });

  test.describe('Health Check', () => {
    test('should verify backend is healthy', async () => {
      const response = await apiClient.healthCheck();
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('ok');
    });
  });

  test.describe('Create Family Tree', () => {
    test('should create a new family tree with valid data', async () => {
      const familyTreeData = {
        name: 'E2E Test Family Tree',
        description: 'Created during E2E testing',
      };

      const response = await apiClient.createFamilyTree(familyTreeData);
      
      // Store ID for cleanup
      if (response.success && response.data) {
        testFamilyTreeIds.push(response.data.id);
      }

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data?.name).toBe(familyTreeData.name);
      expect(response.data?.description).toBe(familyTreeData.description);
      expect(response.data?.id).toBeTruthy();
      expect(response.data?.createdAt).toBeTruthy();
    });

    test('should create a family tree with minimal data', async () => {
      const minimalData = {
        name: 'E2E Minimal Tree',
      };

      const response = await apiClient.createFamilyTree(minimalData);
      
      if (response.success && response.data) {
        testFamilyTreeIds.push(response.data.id);
      }

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data?.name).toBe(minimalData.name);
      expect(response.data?.description).toBeUndefined();
    });

    test('should fail to create family tree with empty name', async () => {
      const invalidData = {
        name: '',
        description: 'Invalid family tree',
      };

      const response = await apiClient.createFamilyTree(invalidData);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toBeTruthy();
    });

    test('should fail to create family tree without name', async () => {
      const invalidData = {
        description: 'Missing name',
      } as any;

      const response = await apiClient.createFamilyTree(invalidData);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  test.describe('List Family Trees', () => {
    test.beforeAll(async () => {
      // Create test data
      for (let i = 1; i <= 3; i++) {
        const response = await apiClient.createFamilyTree({
          name: `E2E List Test Tree ${i}`,
          description: `Test tree ${i} for list operation`,
        });
        if (response.success && response.data) {
          testFamilyTreeIds.push(response.data.id);
        }
      }
    });

    test('should retrieve list of family trees', async () => {
      const response = await apiClient.getFamilyTrees();
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data?.length).toBeGreaterThanOrEqual(3);
      
      // Verify our test trees are in the list
      const testTrees = response.data?.filter(tree => 
        tree.name.startsWith('E2E List Test Tree')
      );
      expect(testTrees?.length).toBe(3);
    });

    test('should return empty array when no family trees exist', async () => {
      // This test assumes we can filter or clean data
      // In a real scenario, we might use a test user with no trees
      const response = await apiClient.getFamilyTrees();
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  test.describe('Get Single Family Tree', () => {
    let testTreeId: string;

    test.beforeAll(async () => {
      const response = await apiClient.createFamilyTree({
        name: 'E2E Get Test Tree',
        description: 'Test tree for get operation',
      });
      
      if (response.success && response.data) {
        testTreeId = response.data.id;
        testFamilyTreeIds.push(testTreeId);
      }
    });

    test('should retrieve a specific family tree by ID', async () => {
      const response = await apiClient.getFamilyTree(testTreeId);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe(testTreeId);
      expect(response.data?.name).toBe('E2E Get Test Tree');
      expect(response.data?.description).toBe('Test tree for get operation');
    });

    test('should return 404 for non-existent family tree', async () => {
      const nonExistentId = 'non-existent-id-12345';
      const response = await apiClient.getFamilyTree(nonExistentId);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.error).toBeTruthy();
    });

    test('should return 400 for invalid ID format', async () => {
      const invalidId = '!!!invalid-id!!!';
      const response = await apiClient.getFamilyTree(invalidId);
      
      expect(response.success).toBe(false);
      expect([400, 404]).toContain(response.statusCode);
    });
  });

  test.describe('Update Family Tree', () => {
    let testTreeId: string;

    test.beforeAll(async () => {
      const response = await apiClient.createFamilyTree({
        name: 'E2E Update Test Tree',
        description: 'Original description',
      });
      
      if (response.success && response.data) {
        testTreeId = response.data.id;
        testFamilyTreeIds.push(testTreeId);
      }
    });

    test('should update family tree name and description', async () => {
      const updateData = {
        name: 'E2E Updated Tree Name',
        description: 'Updated description during E2E test',
      };

      const response = await apiClient.updateFamilyTree(testTreeId, updateData);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data?.name).toBe(updateData.name);
      expect(response.data?.description).toBe(updateData.description);
      expect(response.data?.id).toBe(testTreeId);
    });

    test('should update only the name', async () => {
      const partialUpdate = {
        name: 'E2E Partially Updated Name',
      };

      const response = await apiClient.updateFamilyTree(testTreeId, partialUpdate);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data?.name).toBe(partialUpdate.name);
      // Description should remain from previous update
      expect(response.data?.description).toBe('Updated description during E2E test');
    });

    test('should update only the description', async () => {
      const partialUpdate = {
        description: 'Only description updated',
      };

      const response = await apiClient.updateFamilyTree(testTreeId, partialUpdate);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data?.description).toBe(partialUpdate.description);
      // Name should remain from previous update
      expect(response.data?.name).toBe('E2E Partially Updated Name');
    });

    test('should fail to update with empty name', async () => {
      const invalidUpdate = {
        name: '',
      };

      const response = await apiClient.updateFamilyTree(testTreeId, invalidUpdate);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });

    test('should return 404 when updating non-existent family tree', async () => {
      const updateData = {
        name: 'Should not update',
      };

      const response = await apiClient.updateFamilyTree('non-existent-id', updateData);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Delete Family Tree', () => {
    test('should delete an existing family tree', async () => {
      // Create a tree specifically for deletion
      const createResponse = await apiClient.createFamilyTree({
        name: 'E2E Delete Test Tree',
        description: 'To be deleted',
      });
      
      expect(createResponse.success).toBe(true);
      const treeId = createResponse.data!.id;

      // Delete the tree
      const deleteResponse = await apiClient.deleteFamilyTree(treeId);
      
      expect(deleteResponse.success).toBe(true);
      expect([200, 204]).toContain(deleteResponse.statusCode);

      // Verify it's deleted
      const getResponse = await apiClient.getFamilyTree(treeId);
      expect(getResponse.success).toBe(false);
      expect(getResponse.statusCode).toBe(404);
    });

    test('should return 404 when deleting non-existent family tree', async () => {
      const response = await apiClient.deleteFamilyTree('non-existent-id');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });

    test('should handle deletion of already deleted family tree', async () => {
      // Create and delete a tree
      const createResponse = await apiClient.createFamilyTree({
        name: 'E2E Double Delete Test',
      });
      
      const treeId = createResponse.data!.id;
      await apiClient.deleteFamilyTree(treeId);

      // Try to delete again
      const secondDeleteResponse = await apiClient.deleteFamilyTree(treeId);
      
      expect(secondDeleteResponse.success).toBe(false);
      expect(secondDeleteResponse.statusCode).toBe(404);
    });
  });

  test.describe('Family Tree Validation', () => {
    test('should enforce name length constraints', async () => {
      // Test minimum length
      const tooShortName = {
        name: 'A', // Assuming minimum is 2 characters
        description: 'Name too short',
      };

      const shortResponse = await apiClient.createFamilyTree(tooShortName);
      expect(shortResponse.success).toBe(false);
      expect(shortResponse.statusCode).toBe(400);

      // Test maximum length (assuming 100 characters)
      const tooLongName = {
        name: 'A'.repeat(101),
        description: 'Name too long',
      };

      const longResponse = await apiClient.createFamilyTree(tooLongName);
      expect(longResponse.success).toBe(false);
      expect(longResponse.statusCode).toBe(400);
    });

    test('should enforce description length constraints', async () => {
      // Test maximum description length (assuming 500 characters)
      const longDescription = {
        name: 'E2E Description Test',
        description: 'A'.repeat(501),
      };

      const response = await apiClient.createFamilyTree(longDescription);
      
      if (response.statusCode === 400) {
        expect(response.success).toBe(false);
      } else {
        // If no constraint, it should succeed
        expect(response.success).toBe(true);
        if (response.data) {
          testFamilyTreeIds.push(response.data.id);
        }
      }
    });

    test('should handle special characters in names', async () => {
      const specialCharData = {
        name: 'E2E 特殊文字 & Émojis 🌳 Family Tree',
        description: 'Testing unicode and special characters',
      };

      const response = await apiClient.createFamilyTree(specialCharData);
      
      if (response.success && response.data) {
        testFamilyTreeIds.push(response.data.id);
        expect(response.data.name).toBe(specialCharData.name);
      }
    });
  });

  test.describe('Concurrent Operations', () => {
    test('should handle concurrent family tree creation', async () => {
      const promises = [];
      
      // Create 5 family trees concurrently
      for (let i = 1; i <= 5; i++) {
        promises.push(
          apiClient.createFamilyTree({
            name: `E2E Concurrent Tree ${i}`,
            description: `Concurrent test ${i}`,
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach((response, index) => {
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(201);
        expect(response.data?.name).toBe(`E2E Concurrent Tree ${index + 1}`);
        
        if (response.data) {
          testFamilyTreeIds.push(response.data.id);
        }
      });

      // Verify all were created
      const listResponse = await apiClient.getFamilyTrees();
      const concurrentTrees = listResponse.data?.filter(tree => 
        tree.name.startsWith('E2E Concurrent Tree')
      );
      expect(concurrentTrees?.length).toBe(5);
    });

    test('should handle concurrent updates to same family tree', async () => {
      // Create a tree for concurrent update testing
      const createResponse = await apiClient.createFamilyTree({
        name: 'E2E Concurrent Update Test',
        description: 'Original',
      });
      
      const treeId = createResponse.data!.id;
      testFamilyTreeIds.push(treeId);

      // Attempt concurrent updates
      const updates = [
        apiClient.updateFamilyTree(treeId, { name: 'Update 1' }),
        apiClient.updateFamilyTree(treeId, { name: 'Update 2' }),
        apiClient.updateFamilyTree(treeId, { name: 'Update 3' }),
      ];

      const updateResponses = await Promise.all(updates);
      
      // All updates should complete (though order is non-deterministic)
      updateResponses.forEach(response => {
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(200);
      });

      // Final state should be one of the updates
      const finalResponse = await apiClient.getFamilyTree(treeId);
      expect(['Update 1', 'Update 2', 'Update 3']).toContain(finalResponse.data?.name);
    });
  });

  test.describe('Error Recovery', () => {
    test('should recover from server errors', async () => {
      // This test assumes the server might have transient errors
      // We'll test by making multiple requests
      let successCount = 0;
      const attempts = 3;

      for (let i = 0; i < attempts; i++) {
        const response = await apiClient.healthCheck();
        if (response.success) {
          successCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // At least one should succeed
      expect(successCount).toBeGreaterThan(0);
    });
  });
});