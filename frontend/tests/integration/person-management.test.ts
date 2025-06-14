import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiService } from '../../src/services/api.service';
import { API_ENDPOINTS } from '../../src/constants/api.constants';
import type { Person, CreatePersonRequest, UpdatePersonRequest } from '../../src/types/person';

describe('Person Management Integration Tests', () => {
  let mock: MockAdapter;
  const familyTreeId = 'ft-123';

  beforeEach(() => {
    mock = new MockAdapter(axios);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  describe('GET /api/v1/family-trees/:familyTreeId/persons', () => {
    it('should fetch persons list for a family tree', async () => {
      const mockPersons: Person[] = [
        {
          id: 'person1',
          familyTreeId,
          firstName: '太郎',
          lastName: '田中',
          gender: 'male',
          birthDate: '1950-01-01',
          isLiving: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'person2',
          familyTreeId,
          firstName: '花子',
          lastName: '田中',
          gender: 'female',
          birthDate: '1952-05-15',
          isLiving: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mock.onGet(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons`)
        .reply(200, {
          persons: mockPersons,
          total: 2,
        });

      const response = await apiService.get(`/api/v1/family-trees/${familyTreeId}/persons`);
      
      expect(response.persons).toHaveLength(2);
      expect(response.persons[0].firstName).toBe('太郎');
      expect(response.persons[1].firstName).toBe('花子');
    });

    it('should filter persons by search query', async () => {
      const mockSearchResults: Person[] = [
        {
          id: 'person1',
          familyTreeId,
          firstName: '太郎',
          lastName: '田中',
          gender: 'male',
          birthDate: '1950-01-01',
          isLiving: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mock.onGet(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons?search=太郎`)
        .reply(200, {
          persons: mockSearchResults,
          total: 1,
        });

      const response = await apiService.get(`/api/v1/family-trees/${familyTreeId}/persons?search=太郎`);
      
      expect(response.persons).toHaveLength(1);
      expect(response.persons[0].firstName).toBe('太郎');
    });
  });

  describe('POST /api/v1/family-trees/:familyTreeId/persons', () => {
    it('should create a new person successfully', async () => {
      const createRequest: CreatePersonRequest = {
        firstName: '次郎',
        lastName: '田中',
        gender: 'male',
        birthDate: '1975-03-20',
        isLiving: true,
        birthPlace: '東京都',
        occupation: 'エンジニア',
      };

      const mockResponse: Person = {
        id: 'person3',
        familyTreeId,
        ...createRequest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mock.onPost(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons`, createRequest)
        .reply(201, mockResponse);

      const response = await apiService.post(`/api/v1/family-trees/${familyTreeId}/persons`, createRequest);
      
      expect(response.id).toBe('person3');
      expect(response.firstName).toBe('次郎');
      expect(response.occupation).toBe('エンジニア');
    });

    it('should handle validation errors for person creation', async () => {
      const invalidRequest = {
        firstName: '', // Invalid: empty name
        lastName: '田中',
        gender: 'invalid', // Invalid gender
      };

      mock.onPost(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons`)
        .reply(400, {
          error: {
            message: 'Validation failed',
            status: 400,
            errors: {
              firstName: ['First name is required'],
              gender: ['Gender must be male, female, or other'],
            },
          },
        });

      await expect(apiService.post(`/api/v1/family-trees/${familyTreeId}/persons`, invalidRequest))
        .rejects.toThrow();
    });

    it('should create a deceased person with death information', async () => {
      const createRequest: CreatePersonRequest = {
        firstName: '太一',
        lastName: '田中',
        gender: 'male',
        birthDate: '1920-01-01',
        isLiving: false,
        deathDate: '1995-12-31',
        deathPlace: '大阪府',
      };

      const mockResponse: Person = {
        id: 'person4',
        familyTreeId,
        ...createRequest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mock.onPost(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons`, createRequest)
        .reply(201, mockResponse);

      const response = await apiService.post(`/api/v1/family-trees/${familyTreeId}/persons`, createRequest);
      
      expect(response.isLiving).toBe(false);
      expect(response.deathDate).toBe('1995-12-31');
      expect(response.deathPlace).toBe('大阪府');
    });
  });

  describe('GET /api/v1/family-trees/:familyTreeId/persons/:personId', () => {
    it('should fetch a single person with relationships', async () => {
      const mockPerson: Person = {
        id: 'person1',
        familyTreeId,
        firstName: '太郎',
        lastName: '田中',
        gender: 'male',
        birthDate: '1950-01-01',
        isLiving: true,
        occupation: '医師',
        birthPlace: '東京都',
        notes: '家族の長',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        relationships: [
          {
            id: 'rel1',
            familyTreeId,
            person1Id: 'person1',
            person2Id: 'person2',
            relationshipType: 'spouse',
            startDate: '1975-06-15',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mock.onGet(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/person1`)
        .reply(200, mockPerson);

      const response = await apiService.get(`/api/v1/family-trees/${familyTreeId}/persons/person1`);
      
      expect(response.id).toBe('person1');
      expect(response.occupation).toBe('医師');
      expect(response.relationships).toHaveLength(1);
      expect(response.relationships[0].relationshipType).toBe('spouse');
    });

    it('should handle person not found', async () => {
      mock.onGet(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/nonexistent`)
        .reply(404, {
          error: {
            message: 'Person not found',
            status: 404,
          },
        });

      await expect(apiService.get(`/api/v1/family-trees/${familyTreeId}/persons/nonexistent`))
        .rejects.toThrow();
    });
  });

  describe('PUT /api/v1/family-trees/:familyTreeId/persons/:personId', () => {
    it('should update person information', async () => {
      const updateRequest: UpdatePersonRequest = {
        occupation: 'シニアエンジニア',
        birthPlace: '東京都渋谷区',
        notes: '2024年に昇進',
      };

      const mockResponse: Person = {
        id: 'person3',
        familyTreeId,
        firstName: '次郎',
        lastName: '田中',
        gender: 'male',
        birthDate: '1975-03-20',
        isLiving: true,
        occupation: updateRequest.occupation!,
        birthPlace: updateRequest.birthPlace!,
        notes: updateRequest.notes,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      };

      mock.onPut(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/person3`, updateRequest)
        .reply(200, mockResponse);

      const response = await apiService.put(`/api/v1/family-trees/${familyTreeId}/persons/person3`, updateRequest);
      
      expect(response.occupation).toBe('シニアエンジニア');
      expect(response.notes).toBe('2024年に昇進');
    });

    it('should update person to deceased status', async () => {
      const updateRequest: UpdatePersonRequest = {
        isLiving: false,
        deathDate: '2024-01-15',
        deathPlace: '病院',
      };

      const mockResponse: Person = {
        id: 'person1',
        familyTreeId,
        firstName: '太郎',
        lastName: '田中',
        gender: 'male',
        birthDate: '1950-01-01',
        isLiving: false,
        deathDate: updateRequest.deathDate,
        deathPlace: updateRequest.deathPlace,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      };

      mock.onPut(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/person1`, updateRequest)
        .reply(200, mockResponse);

      const response = await apiService.put(`/api/v1/family-trees/${familyTreeId}/persons/person1`, updateRequest);
      
      expect(response.isLiving).toBe(false);
      expect(response.deathDate).toBe('2024-01-15');
    });
  });

  describe('DELETE /api/v1/family-trees/:familyTreeId/persons/:personId', () => {
    it('should delete a person successfully', async () => {
      mock.onDelete(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/person1`)
        .reply(204);

      await expect(apiService.delete(`/api/v1/family-trees/${familyTreeId}/persons/person1`))
        .resolves.toBeUndefined();
    });

    it('should handle deletion with relationship warnings', async () => {
      mock.onDelete(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/person2`)
        .reply(200, {
          message: 'Person deleted successfully',
          affectedRelationships: 3,
          warning: 'This person had 3 relationships that were also deleted',
        });

      const response = await apiService.delete(`/api/v1/family-trees/${familyTreeId}/persons/person2`);
      
      expect(response.affectedRelationships).toBe(3);
      expect(response.warning).toContain('3 relationships');
    });

    it('should prevent deletion of root person', async () => {
      mock.onDelete(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/root-person`)
        .reply(400, {
          error: {
            message: 'Cannot delete the root person of a family tree',
            status: 400,
          },
        });

      await expect(apiService.delete(`/api/v1/family-trees/${familyTreeId}/persons/root-person`))
        .rejects.toThrow();
    });
  });

  describe('Bulk Operations', () => {
    it('should import multiple persons from CSV', async () => {
      const csvData = `firstName,lastName,gender,birthDate
太郎,山田,male,1960-01-01
花子,山田,female,1962-03-15
一郎,山田,male,1985-07-20`;

      const mockResponse = {
        imported: 3,
        failed: 0,
        persons: [
          { id: 'person10', firstName: '太郎', lastName: '山田' },
          { id: 'person11', firstName: '花子', lastName: '山田' },
          { id: 'person12', firstName: '一郎', lastName: '山田' },
        ],
      };

      mock.onPost(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/import`)
        .reply(200, mockResponse);

      const formData = new FormData();
      formData.append('file', new Blob([csvData], { type: 'text/csv' }));

      const response = await apiService.post(`/api/v1/family-trees/${familyTreeId}/persons/import`, formData);
      
      expect(response.imported).toBe(3);
      expect(response.persons).toHaveLength(3);
    });

    it('should export persons to JSON format', async () => {
      const mockExportData = {
        familyTreeId,
        exportDate: new Date().toISOString(),
        persons: [
          {
            id: 'person1',
            firstName: '太郎',
            lastName: '田中',
            gender: 'male',
            birthDate: '1950-01-01',
          },
          {
            id: 'person2',
            firstName: '花子',
            lastName: '田中',
            gender: 'female',
            birthDate: '1952-05-15',
          },
        ],
      };

      mock.onGet(`${apiService.getBaseURL()}/api/v1/family-trees/${familyTreeId}/persons/export?format=json`)
        .reply(200, mockExportData);

      const response = await apiService.get(`/api/v1/family-trees/${familyTreeId}/persons/export?format=json`);
      
      expect(response.persons).toHaveLength(2);
      expect(response.familyTreeId).toBe(familyTreeId);
    });
  });
});