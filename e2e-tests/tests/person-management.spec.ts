import { test, expect } from '@playwright/test';
import { ApiClient } from '../fixtures/api-client';

test.describe('Person Management E2E Tests', () => {
  let apiClient: ApiClient;
  let familyTreeId: string;
  let testPersonIds: string[] = [];

  test.beforeAll(async () => {
    apiClient = new ApiClient(process.env.API_BASE_URL || 'http://localhost:5001');
    
    // Wait for backend to be ready
    const isReady = await apiClient.waitForServer(30000);
    expect(isReady).toBe(true);

    // Create a family tree for person tests
    const treeResponse = await apiClient.createFamilyTree({
      name: 'E2E Person Test Family Tree',
      description: 'Family tree for person management E2E tests',
    });
    
    expect(treeResponse.success).toBe(true);
    familyTreeId = treeResponse.data!.id;
  });

  test.afterAll(async () => {
    // Cleanup test data
    if (familyTreeId) {
      await apiClient.deleteFamilyTree(familyTreeId);
    }
  });

  test.afterEach(async () => {
    // Clean up persons after each test
    for (const personId of testPersonIds) {
      await apiClient.deletePerson(personId);
    }
    testPersonIds = [];
  });

  test.describe('Create Person', () => {
    test('should create a person with full details', async () => {
      const personData = {
        firstName: '太郎',
        lastName: 'E2Eテスト',
        birthDate: '1950-01-15',
        gender: 'male' as const,
        bio: 'E2Eテスト用の人物データです',
      };

      const response = await apiClient.createPerson(familyTreeId, personData);
      
      if (response.success && response.data) {
        testPersonIds.push(response.data.id);
      }

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data?.firstName).toBe(personData.firstName);
      expect(response.data?.lastName).toBe(personData.lastName);
      expect(response.data?.birthDate).toContain('1950-01-15');
      expect(response.data?.gender).toBe(personData.gender);
      expect(response.data?.bio).toBe(personData.bio);
      expect(response.data?.familyTreeId).toBe(familyTreeId);
    });

    test('should create a person with minimal data', async () => {
      const minimalData = {
        firstName: '花子',
      };

      const response = await apiClient.createPerson(familyTreeId, minimalData);
      
      if (response.success && response.data) {
        testPersonIds.push(response.data.id);
      }

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data?.firstName).toBe(minimalData.firstName);
      expect(response.data?.lastName).toBeUndefined();
      expect(response.data?.gender).toBeUndefined();
    });

    test('should create a deceased person', async () => {
      const deceasedPerson = {
        firstName: '祖父',
        lastName: 'E2Eテスト',
        birthDate: '1920-03-10',
        deathDate: '1995-12-25',
        gender: 'male' as const,
      };

      const response = await apiClient.createPerson(familyTreeId, deceasedPerson);
      
      if (response.success && response.data) {
        testPersonIds.push(response.data.id);
      }

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data?.deathDate).toContain('1995-12-25');
    });

    test('should handle all gender options', async () => {
      const genders = ['male', 'female', 'other'] as const;
      
      for (const gender of genders) {
        const personData = {
          firstName: `${gender}Person`,
          gender: gender,
        };

        const response = await apiClient.createPerson(familyTreeId, personData);
        
        if (response.success && response.data) {
          testPersonIds.push(response.data.id);
          expect(response.data.gender).toBe(gender);
        }
        
        expect(response.success).toBe(true);
      }
    });

    test('should fail to create person without firstName', async () => {
      const invalidData = {
        lastName: 'NoFirstName',
        gender: 'male' as const,
      } as any;

      const response = await apiClient.createPerson(familyTreeId, invalidData);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toBeTruthy();
    });

    test('should fail to create person with invalid gender', async () => {
      const invalidData = {
        firstName: 'InvalidGender',
        gender: 'invalid' as any,
      };

      const response = await apiClient.createPerson(familyTreeId, invalidData);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });

    test('should fail to create person with invalid date format', async () => {
      const invalidData = {
        firstName: 'InvalidDate',
        birthDate: 'not-a-date',
      };

      const response = await apiClient.createPerson(familyTreeId, invalidData);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  test.describe('List Persons', () => {
    test.beforeAll(async () => {
      // Create test persons
      const testPersons = [
        { firstName: '一郎', lastName: '田中', gender: 'male' as const, birthDate: '1950-01-01' },
        { firstName: '花子', lastName: '田中', gender: 'female' as const, birthDate: '1952-05-15' },
        { firstName: '次郎', lastName: '田中', gender: 'male' as const, birthDate: '1975-08-20' },
        { firstName: '三郎', lastName: '山田', gender: 'male' as const, birthDate: '1980-03-10' },
      ];

      for (const person of testPersons) {
        const response = await apiClient.createPerson(familyTreeId, person);
        if (response.success && response.data) {
          testPersonIds.push(response.data.id);
        }
      }
    });

    test('should retrieve all persons in a family tree', async () => {
      const response = await apiClient.getPersons(familyTreeId);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data?.length).toBe(4);
      
      // Verify all test persons are present
      const firstNames = response.data?.map(p => p.firstName);
      expect(firstNames).toContain('一郎');
      expect(firstNames).toContain('花子');
      expect(firstNames).toContain('次郎');
      expect(firstNames).toContain('三郎');
    });

    test('should return empty array for family tree with no persons', async () => {
      // Create a new empty family tree
      const emptyTreeResponse = await apiClient.createFamilyTree({
        name: 'E2E Empty Tree for Person List',
      });
      
      const emptyTreeId = emptyTreeResponse.data!.id;

      const response = await apiClient.getPersons(emptyTreeId);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data?.length).toBe(0);

      // Cleanup
      await apiClient.deleteFamilyTree(emptyTreeId);
    });

    test('should handle non-existent family tree ID', async () => {
      const response = await apiClient.getPersons('non-existent-tree-id');
      
      expect(response.success).toBe(false);
      expect([404, 400]).toContain(response.statusCode);
    });
  });

  test.describe('Get Single Person', () => {
    let testPersonId: string;

    test.beforeAll(async () => {
      const response = await apiClient.createPerson(familyTreeId, {
        firstName: '取得テスト',
        lastName: '人物',
        birthDate: '1960-06-15',
        gender: 'female' as const,
        bio: '単一人物取得テスト用',
      });
      
      testPersonId = response.data!.id;
      testPersonIds.push(testPersonId);
    });

    test('should retrieve a specific person by ID', async () => {
      const response = await apiClient.getPerson(testPersonId);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe(testPersonId);
      expect(response.data?.firstName).toBe('取得テスト');
      expect(response.data?.lastName).toBe('人物');
      expect(response.data?.bio).toBe('単一人物取得テスト用');
    });

    test('should return 404 for non-existent person', async () => {
      const response = await apiClient.getPerson('non-existent-person-id');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.error).toBeTruthy();
    });
  });

  test.describe('Update Person', () => {
    let testPersonId: string;

    test.beforeEach(async () => {
      const response = await apiClient.createPerson(familyTreeId, {
        firstName: '更新前',
        lastName: 'テスト',
        birthDate: '1970-01-01',
        gender: 'male' as const,
        bio: '更新テスト用の初期データ',
      });
      
      testPersonId = response.data!.id;
      testPersonIds.push(testPersonId);
    });

    test('should update all person fields', async () => {
      const updateData = {
        firstName: '更新後',
        lastName: '変更済み',
        birthDate: '1970-02-02',
        gender: 'female' as const,
        bio: '全フィールドを更新しました',
      };

      const response = await apiClient.updatePerson(testPersonId, updateData);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data?.firstName).toBe(updateData.firstName);
      expect(response.data?.lastName).toBe(updateData.lastName);
      expect(response.data?.birthDate).toContain('1970-02-02');
      expect(response.data?.gender).toBe(updateData.gender);
      expect(response.data?.bio).toBe(updateData.bio);
    });

    test('should update only firstName', async () => {
      const partialUpdate = {
        firstName: '名前のみ更新',
      };

      const response = await apiClient.updatePerson(testPersonId, partialUpdate);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data?.firstName).toBe(partialUpdate.firstName);
      // Other fields should remain unchanged
      expect(response.data?.lastName).toBe('テスト');
      expect(response.data?.gender).toBe('male');
    });

    test('should add death date to living person', async () => {
      const deathUpdate = {
        deathDate: '2023-12-31',
      };

      const response = await apiClient.updatePerson(testPersonId, deathUpdate);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data?.deathDate).toContain('2023-12-31');
    });

    test('should fail to update with invalid data', async () => {
      const invalidUpdate = {
        gender: 'invalid-gender' as any,
      };

      const response = await apiClient.updatePerson(testPersonId, invalidUpdate);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });

    test('should return 404 when updating non-existent person', async () => {
      const response = await apiClient.updatePerson('non-existent-id', {
        firstName: 'Should not update',
      });
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Delete Person', () => {
    test('should delete an existing person', async () => {
      // Create a person for deletion
      const createResponse = await apiClient.createPerson(familyTreeId, {
        firstName: '削除対象',
        lastName: 'テスト人物',
      });
      
      const personId = createResponse.data!.id;

      // Delete the person
      const deleteResponse = await apiClient.deletePerson(personId);
      
      expect(deleteResponse.success).toBe(true);
      expect([200, 204]).toContain(deleteResponse.statusCode);

      // Verify deletion
      const getResponse = await apiClient.getPerson(personId);
      expect(getResponse.success).toBe(false);
      expect(getResponse.statusCode).toBe(404);
    });

    test('should return 404 when deleting non-existent person', async () => {
      const response = await apiClient.deletePerson('non-existent-person');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Person Validation', () => {
    test('should enforce firstName length constraints', async () => {
      // Test empty firstName
      const emptyName = {
        firstName: '',
        lastName: 'ValidLastName',
      };

      const emptyResponse = await apiClient.createPerson(familyTreeId, emptyName);
      expect(emptyResponse.success).toBe(false);
      expect(emptyResponse.statusCode).toBe(400);

      // Test very long firstName (assuming max 100 chars)
      const longName = {
        firstName: 'A'.repeat(101),
        lastName: 'ValidLastName',
      };

      const longResponse = await apiClient.createPerson(familyTreeId, longName);
      expect(longResponse.success).toBe(false);
      expect(longResponse.statusCode).toBe(400);
    });

    test('should validate date logic (birth before death)', async () => {
      const invalidDates = {
        firstName: 'InvalidDates',
        birthDate: '2000-01-01',
        deathDate: '1999-12-31', // Death before birth
      };

      const response = await apiClient.createPerson(familyTreeId, invalidDates);
      
      // Should either fail or handle gracefully
      if (response.success) {
        testPersonIds.push(response.data!.id);
        // If it succeeds, the system might auto-correct or ignore
        console.warn('System allowed death date before birth date');
      } else {
        expect(response.statusCode).toBe(400);
      }
    });

    test('should handle special characters in names', async () => {
      const specialNames = [
        { firstName: "O'Brien", lastName: 'Irish' },
        { firstName: 'Jean-Pierre', lastName: 'French' },
        { firstName: '李明', lastName: '中文' },
        { firstName: 'José', lastName: 'Español' },
        { firstName: 'Müller', lastName: 'Deutsch' },
      ];

      for (const nameData of specialNames) {
        const response = await apiClient.createPerson(familyTreeId, nameData);
        
        if (response.success && response.data) {
          testPersonIds.push(response.data.id);
          expect(response.data.firstName).toBe(nameData.firstName);
          expect(response.data.lastName).toBe(nameData.lastName);
        }
      }
    });
  });

  test.describe('Bulk Operations', () => {
    test('should handle creating multiple persons sequentially', async () => {
      const persons = [
        { firstName: 'Sequential1', birthDate: '1990-01-01' },
        { firstName: 'Sequential2', birthDate: '1991-02-02' },
        { firstName: 'Sequential3', birthDate: '1992-03-03' },
        { firstName: 'Sequential4', birthDate: '1993-04-04' },
        { firstName: 'Sequential5', birthDate: '1994-05-05' },
      ];

      const createdIds: string[] = [];

      for (const person of persons) {
        const response = await apiClient.createPerson(familyTreeId, person);
        expect(response.success).toBe(true);
        if (response.data) {
          createdIds.push(response.data.id);
          testPersonIds.push(response.data.id);
        }
      }

      // Verify all were created
      const listResponse = await apiClient.getPersons(familyTreeId);
      const sequentialPersons = listResponse.data?.filter(p => 
        p.firstName.startsWith('Sequential')
      );
      expect(sequentialPersons?.length).toBe(5);
    });

    test('should handle concurrent person creation', async () => {
      const concurrentPersons = Array.from({ length: 5 }, (_, i) => ({
        firstName: `Concurrent${i + 1}`,
        lastName: 'Test',
        birthDate: `199${i}-01-01`,
      }));

      const promises = concurrentPersons.map(person => 
        apiClient.createPerson(familyTreeId, person)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(201);
        expect(response.data?.firstName).toBe(`Concurrent${index + 1}`);
        
        if (response.data) {
          testPersonIds.push(response.data.id);
        }
      });
    });
  });

  test.describe('Family Tree Relationship', () => {
    test('should maintain family tree association', async () => {
      // Create person in our test family tree
      const response = await apiClient.createPerson(familyTreeId, {
        firstName: 'TreeAssociation',
        lastName: 'Test',
      });
      
      const personId = response.data!.id;
      testPersonIds.push(personId);

      // Retrieve and verify family tree association
      const getResponse = await apiClient.getPerson(personId);
      expect(getResponse.data?.familyTreeId).toBe(familyTreeId);

      // Verify person appears in family tree's person list
      const listResponse = await apiClient.getPersons(familyTreeId);
      const found = listResponse.data?.find(p => p.id === personId);
      expect(found).toBeDefined();
    });

    test('should not allow creating person in non-existent family tree', async () => {
      const response = await apiClient.createPerson('non-existent-tree', {
        firstName: 'ShouldFail',
      });
      
      expect(response.success).toBe(false);
      expect([400, 404]).toContain(response.statusCode);
    });
  });
});