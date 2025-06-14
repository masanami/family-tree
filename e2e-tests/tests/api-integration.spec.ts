import { test, expect } from '@playwright/test';
import { ApiClient } from '../fixtures/api-client';
import { createTestFamily, createTestPerson } from '../helpers/test-data';

test.describe('API Integration Tests', () => {
  let apiClient: ApiClient;
  let createdFamilyTreeIds: string[] = [];

  test.beforeAll(async () => {
    apiClient = new ApiClient(process.env.API_BASE_URL || 'http://localhost:5001');
    
    // Wait for backend server to be ready
    const isServerReady = await apiClient.waitForServer(30000);
    if (!isServerReady) {
      throw new Error('Backend server is not responding. Please ensure the backend is running.');
    }
  });

  test.beforeEach(async () => {
    // Clean up any existing test data
    await apiClient.cleanupTestData();
    createdFamilyTreeIds = [];
  });

  test.afterEach(async () => {
    // Clean up test data after each test
    for (const id of createdFamilyTreeIds) {
      await apiClient.deleteFamilyTree(id);
    }
  });

  test('should check API health endpoint', async () => {
    const response = await apiClient.healthCheck();
    
    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.data).toHaveProperty('status');
  });

  test('should create and retrieve family tree', async () => {
    const testFamily = createTestFamily({
      name: 'E2E Test Family',
      description: 'Created by API integration test'
    });

    // Create family tree
    const createResponse = await apiClient.createFamilyTree(testFamily);
    
    expect(createResponse.success).toBe(true);
    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.data).toHaveProperty('id');
    expect(createResponse.data?.name).toBe(testFamily.name);
    expect(createResponse.data?.description).toBe(testFamily.description);

    const familyTreeId = createResponse.data!.id;
    createdFamilyTreeIds.push(familyTreeId);

    // Retrieve the created family tree
    const getResponse = await apiClient.getFamilyTree(familyTreeId);
    
    expect(getResponse.success).toBe(true);
    expect(getResponse.data?.id).toBe(familyTreeId);
    expect(getResponse.data?.name).toBe(testFamily.name);
  });

  test('should validate family tree creation', async () => {
    // Test with missing required field
    const invalidFamily = { description: 'Missing name field' };
    
    const response = await apiClient.createFamilyTree(invalidFamily as any);
    
    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(400);
    expect(response.error).toContain('validation');
  });

  test('should handle family tree not found', async () => {
    const response = await apiClient.getFamilyTree('nonexistent-id');
    
    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(404);
  });

  test('should create and manage persons in family tree', async () => {
    // First create a family tree
    const testFamily = createTestFamily({ name: 'E2E Persons Test Family' });
    const familyResponse = await apiClient.createFamilyTree(testFamily);
    
    expect(familyResponse.success).toBe(true);
    const familyTreeId = familyResponse.data!.id;
    createdFamilyTreeIds.push(familyTreeId);

    // Create a person
    const testPerson = createTestPerson({
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1980-01-01',
      gender: 'male'
    });

    const createPersonResponse = await apiClient.createPerson(familyTreeId, testPerson);
    
    expect(createPersonResponse.success).toBe(true);
    expect(createPersonResponse.statusCode).toBe(201);
    expect(createPersonResponse.data?.firstName).toBe(testPerson.firstName);
    expect(createPersonResponse.data?.lastName).toBe(testPerson.lastName);
    expect(createPersonResponse.data?.familyTreeId).toBe(familyTreeId);

    const personId = createPersonResponse.data!.id;

    // Retrieve the person
    const getPersonResponse = await apiClient.getPerson(personId);
    
    expect(getPersonResponse.success).toBe(true);
    expect(getPersonResponse.data?.id).toBe(personId);
    expect(getPersonResponse.data?.firstName).toBe(testPerson.firstName);

    // Get persons in family tree
    const getPersonsResponse = await apiClient.getPersons(familyTreeId);
    
    expect(getPersonsResponse.success).toBe(true);
    expect(getPersonsResponse.data).toHaveLength(1);
    expect(getPersonsResponse.data?.[0].id).toBe(personId);
  });

  test('should validate person creation', async () => {
    // Create family tree first
    const testFamily = createTestFamily({ name: 'E2E Validation Test Family' });
    const familyResponse = await apiClient.createFamilyTree(testFamily);
    const familyTreeId = familyResponse.data!.id;
    createdFamilyTreeIds.push(familyTreeId);

    // Test with missing required field
    const invalidPerson = { lastName: 'Doe' }; // Missing firstName
    
    const response = await apiClient.createPerson(familyTreeId, invalidPerson as any);
    
    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(400);
  });

  test('should update person information', async () => {
    // Setup: Create family tree and person
    const testFamily = createTestFamily({ name: 'E2E Update Test Family' });
    const familyResponse = await apiClient.createFamilyTree(testFamily);
    const familyTreeId = familyResponse.data!.id;
    createdFamilyTreeIds.push(familyTreeId);

    const testPerson = createTestPerson({
      firstName: 'Jane',
      lastName: 'Smith',
      gender: 'female'
    });

    const createPersonResponse = await apiClient.createPerson(familyTreeId, testPerson);
    const personId = createPersonResponse.data!.id;

    // Update person
    const updateData = {
      lastName: 'Johnson',
      bio: 'Updated biography'
    };

    const updateResponse = await apiClient.updatePerson(personId, updateData);
    
    expect(updateResponse.success).toBe(true);
    expect(updateResponse.data?.lastName).toBe('Johnson');
    expect(updateResponse.data?.bio).toBe('Updated biography');
    expect(updateResponse.data?.firstName).toBe('Jane'); // Should remain unchanged
  });

  test('should delete person', async () => {
    // Setup: Create family tree and person
    const testFamily = createTestFamily({ name: 'E2E Delete Test Family' });
    const familyResponse = await apiClient.createFamilyTree(testFamily);
    const familyTreeId = familyResponse.data!.id;
    createdFamilyTreeIds.push(familyTreeId);

    const testPerson = createTestPerson({ firstName: 'ToDelete', lastName: 'Person' });
    const createPersonResponse = await apiClient.createPerson(familyTreeId, testPerson);
    const personId = createPersonResponse.data!.id;

    // Delete person
    const deleteResponse = await apiClient.deletePerson(personId);
    
    expect(deleteResponse.success).toBe(true);
    expect(deleteResponse.statusCode).toBe(204);

    // Verify person is deleted
    const getResponse = await apiClient.getPerson(personId);
    expect(getResponse.success).toBe(false);
    expect(getResponse.statusCode).toBe(404);
  });

  test('should handle relationship endpoints (not implemented yet)', async () => {
    // Test that relationship endpoints return 501 Not Implemented
    const response = await apiClient.createRelationship({
      person1Id: 'test-id-1',
      person2Id: 'test-id-2',
      relationshipType: 'parent_child'
    });

    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(501); // Not Implemented
  });

  test('should handle multiple family trees', async () => {
    // Create multiple family trees
    const family1 = createTestFamily({ name: 'E2E Test Family 1' });
    const family2 = createTestFamily({ name: 'E2E Test Family 2' });

    const response1 = await apiClient.createFamilyTree(family1);
    const response2 = await apiClient.createFamilyTree(family2);

    expect(response1.success).toBe(true);
    expect(response2.success).toBe(true);

    createdFamilyTreeIds.push(response1.data!.id, response2.data!.id);

    // Get all family trees
    const getAllResponse = await apiClient.getFamilyTrees();
    
    expect(getAllResponse.success).toBe(true);
    expect(getAllResponse.data?.length).toBeGreaterThanOrEqual(2);
    
    const familyNames = getAllResponse.data?.map(f => f.name) || [];
    expect(familyNames).toContain(family1.name);
    expect(familyNames).toContain(family2.name);
  });

  test('should handle concurrent operations', async () => {
    // Test concurrent family tree creation
    const families = Array.from({ length: 5 }, (_, i) => 
      createTestFamily({ name: `E2E Concurrent Family ${i + 1}` })
    );

    const promises = families.map(family => apiClient.createFamilyTree(family));
    const responses = await Promise.all(promises);

    // All should succeed
    responses.forEach(response => {
      expect(response.success).toBe(true);
      if (response.data?.id) {
        createdFamilyTreeIds.push(response.data.id);
      }
    });

    expect(responses).toHaveLength(5);
  });
});