import { test, expect } from '@playwright/test';
import { ApiClient } from '../fixtures/api-client';

test.describe('Full Application Flow E2E Tests', () => {
  let apiClient: ApiClient;
  let authToken: string;
  let userId: string;
  let familyTreeId: string;
  let personId1: string;
  let personId2: string;

  test.beforeAll(async () => {
    apiClient = new ApiClient(process.env.API_BASE_URL || 'http://localhost:5001');
    
    // Wait for backend to be ready
    const isReady = await apiClient.waitForServer(10000);
    expect(isReady).toBe(true);
  });

  test.describe('Authentication Flow', () => {
    test('should register a new user', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const registerData = {
        email: uniqueEmail,
        password: 'Test1234!',
        name: 'E2E Test User',
      };

      const response = await apiClient.request('/api/v1/auth/register', {
        method: 'POST',
        body: registerData,
      });

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data).toHaveProperty('token');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(uniqueEmail);

      // Store for later tests
      authToken = response.data.token;
      userId = response.data.user.id;
      apiClient.setAuthToken(authToken);
    });

    test('should login with registered credentials', async () => {
      const loginData = {
        email: `test-${userId}@example.com`, // Use the email from registration
        password: 'Test1234!',
      };

      const response = await apiClient.request('/api/v1/auth/login', {
        method: 'POST',
        body: loginData,
      });

      expect(response.success).toBe(true);
      expect(response.data.token).toBeTruthy();
      expect(response.data.user.id).toBe(userId);
    });

    test('should get current user info', async () => {
      const response = await apiClient.request('/api/v1/auth/me', {
        method: 'GET',
      });

      expect(response.success).toBe(true);
      expect(response.data.id).toBe(userId);
      expect(response.data.name).toBe('E2E Test User');
    });
  });

  test.describe('Family Tree Management', () => {
    test('should create a new family tree', async () => {
      const familyTreeData = {
        name: 'E2E Test Family Tree',
        description: 'Created during E2E testing',
        isPublic: false,
      };

      const response = await apiClient.request('/api/v1/family-trees', {
        method: 'POST',
        body: familyTreeData,
      });

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data.name).toBe(familyTreeData.name);
      expect(response.data.ownerId).toBe(userId);

      familyTreeId = response.data.id;
    });

    test('should list user family trees', async () => {
      const response = await apiClient.request('/api/v1/family-trees', {
        method: 'GET',
      });

      expect(response.success).toBe(true);
      expect(response.data.trees).toBeInstanceOf(Array);
      expect(response.data.trees.length).toBeGreaterThan(0);
      
      const createdTree = response.data.trees.find((t: any) => t.id === familyTreeId);
      expect(createdTree).toBeDefined();
      expect(createdTree.name).toBe('E2E Test Family Tree');
    });

    test('should update family tree details', async () => {
      const updateData = {
        name: 'Updated E2E Family Tree',
        description: 'Updated description during testing',
        isPublic: true,
      };

      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}`, {
        method: 'PUT',
        body: updateData,
      });

      expect(response.success).toBe(true);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.isPublic).toBe(true);
    });
  });

  test.describe('Person Management', () => {
    test('should add persons to family tree', async () => {
      // Add first person
      const person1Data = {
        firstName: '太郎',
        lastName: 'E2Eテスト',
        gender: 'male',
        birthDate: '1950-01-01',
        isLiving: true,
        birthPlace: '東京都',
        occupation: 'エンジニア',
      };

      const response1 = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/persons`, {
        method: 'POST',
        body: person1Data,
      });

      expect(response1.success).toBe(true);
      expect(response1.data.firstName).toBe(person1Data.firstName);
      personId1 = response1.data.id;

      // Add second person
      const person2Data = {
        firstName: '花子',
        lastName: 'E2Eテスト',
        gender: 'female',
        birthDate: '1952-05-15',
        isLiving: true,
        birthPlace: '大阪府',
        occupation: '教師',
      };

      const response2 = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/persons`, {
        method: 'POST',
        body: person2Data,
      });

      expect(response2.success).toBe(true);
      expect(response2.data.firstName).toBe(person2Data.firstName);
      personId2 = response2.data.id;
    });

    test('should list persons in family tree', async () => {
      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/persons`, {
        method: 'GET',
      });

      expect(response.success).toBe(true);
      expect(response.data.persons).toHaveLength(2);
      expect(response.data.total).toBe(2);
      
      const personNames = response.data.persons.map((p: any) => p.firstName);
      expect(personNames).toContain('太郎');
      expect(personNames).toContain('花子');
    });

    test('should search persons by name', async () => {
      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/persons?search=太郎`, {
        method: 'GET',
      });

      expect(response.success).toBe(true);
      expect(response.data.persons).toHaveLength(1);
      expect(response.data.persons[0].firstName).toBe('太郎');
    });

    test('should update person information', async () => {
      const updateData = {
        occupation: 'シニアエンジニア',
        notes: 'E2Eテストで更新',
      };

      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/persons/${personId1}`, {
        method: 'PUT',
        body: updateData,
      });

      expect(response.success).toBe(true);
      expect(response.data.occupation).toBe(updateData.occupation);
      expect(response.data.notes).toBe(updateData.notes);
    });
  });

  test.describe('Relationship Management', () => {
    test('should create relationship between persons', async () => {
      const relationshipData = {
        person1Id: personId1,
        person2Id: personId2,
        relationshipType: 'spouse',
        startDate: '1975-06-15',
      };

      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/relationships`, {
        method: 'POST',
        body: relationshipData,
      });

      expect(response.success).toBe(true);
      expect(response.data.relationshipType).toBe('spouse');
      expect(response.data.person1Id).toBe(personId1);
      expect(response.data.person2Id).toBe(personId2);
    });

    test('should list relationships in family tree', async () => {
      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/relationships`, {
        method: 'GET',
      });

      expect(response.success).toBe(true);
      expect(response.data.relationships).toHaveLength(1);
      expect(response.data.relationships[0].relationshipType).toBe('spouse');
    });

    test('should get person with relationships', async () => {
      const response = await apiClient.request(
        `/api/v1/family-trees/${familyTreeId}/persons/${personId1}?includeRelationships=true`,
        { method: 'GET' }
      );

      expect(response.success).toBe(true);
      expect(response.data.relationships).toBeDefined();
      expect(response.data.relationships).toHaveLength(1);
      expect(response.data.relationships[0].relationshipType).toBe('spouse');
    });
  });

  test.describe('Data Export/Import', () => {
    test('should export family tree data as JSON', async () => {
      const response = await apiClient.request(
        `/api/v1/family-trees/${familyTreeId}/export?format=json`,
        { method: 'GET' }
      );

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('familyTree');
      expect(response.data).toHaveProperty('persons');
      expect(response.data).toHaveProperty('relationships');
      expect(response.data.persons).toHaveLength(2);
      expect(response.data.relationships).toHaveLength(1);
    });

    test('should export persons as CSV', async () => {
      const response = await apiClient.request(
        `/api/v1/family-trees/${familyTreeId}/persons/export?format=csv`,
        { method: 'GET' }
      );

      expect(response.success).toBe(true);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.data).toContain('firstName,lastName,gender');
      expect(response.data).toContain('太郎');
      expect(response.data).toContain('花子');
    });
  });

  test.describe('Permission and Sharing', () => {
    let sharedUserId: string;
    let sharedUserToken: string;

    test('should create another user for sharing', async () => {
      const uniqueEmail = `shared-${Date.now()}@example.com`;
      const registerData = {
        email: uniqueEmail,
        password: 'Shared1234!',
        name: 'Shared User',
      };

      const response = await apiClient.request('/api/v1/auth/register', {
        method: 'POST',
        body: registerData,
      });

      expect(response.success).toBe(true);
      sharedUserId = response.data.user.id;
      sharedUserToken = response.data.token;
    });

    test('should share family tree with another user', async () => {
      const shareData = {
        userId: sharedUserId,
        permission: 'view',
      };

      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/share`, {
        method: 'POST',
        body: shareData,
      });

      expect(response.success).toBe(true);
      expect(response.data.userId).toBe(sharedUserId);
      expect(response.data.permission).toBe('view');
    });

    test('shared user should see shared family tree', async () => {
      // Switch to shared user's token
      apiClient.setAuthToken(sharedUserToken);

      const response = await apiClient.request('/api/v1/family-trees', {
        method: 'GET',
      });

      expect(response.success).toBe(true);
      const sharedTree = response.data.trees.find((t: any) => t.id === familyTreeId);
      expect(sharedTree).toBeDefined();
      expect(sharedTree.ownerId).not.toBe(sharedUserId);

      // Switch back to original user
      apiClient.setAuthToken(authToken);
    });

    test('shared user should not be able to edit with view permission', async () => {
      apiClient.setAuthToken(sharedUserToken);

      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}`, {
        method: 'PUT',
        body: { name: 'Unauthorized Update' },
      });

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(403);

      // Switch back
      apiClient.setAuthToken(authToken);
    });
  });

  test.describe('Cleanup', () => {
    test('should delete test family tree', async () => {
      const response = await apiClient.request(`/api/v1/family-trees/${familyTreeId}`, {
        method: 'DELETE',
      });

      expect(response.success).toBe(true);
      expect([204, 200]).toContain(response.statusCode);
    });

    test('should verify deletion cascade', async () => {
      // Try to get deleted family tree
      const ftResponse = await apiClient.request(`/api/v1/family-trees/${familyTreeId}`, {
        method: 'GET',
      });
      expect(ftResponse.success).toBe(false);
      expect(ftResponse.statusCode).toBe(404);

      // Verify persons were also deleted
      const personsResponse = await apiClient.request(`/api/v1/family-trees/${familyTreeId}/persons`, {
        method: 'GET',
      });
      expect(personsResponse.success).toBe(false);
    });

    test('should logout successfully', async () => {
      const response = await apiClient.request('/api/v1/auth/logout', {
        method: 'POST',
      });

      expect(response.success).toBe(true);
    });
  });
});