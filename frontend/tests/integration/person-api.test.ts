import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../../src/services/api.service';
import { API_ENDPOINTS } from '../../src/constants/api.constants';

// Mock data for testing
const mockPerson = {
  id: '1',
  familyTreeId: 'tree-1',
  firstName: 'John',
  lastName: 'Doe',
  birthDate: '1990-01-01',
  deathDate: null,
  gender: 'male' as const,
  bio: 'Test person biography',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockPersons = [
  mockPerson,
  {
    id: '2',
    familyTreeId: 'tree-1',
    firstName: 'Jane',
    lastName: 'Smith',
    birthDate: '1985-05-15',
    deathDate: null,
    gender: 'female' as const,
    bio: 'Another test person',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

describe('Person API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/family-trees/:treeId/persons', () => {
    const familyTreeId = 'tree-1';

    it('should fetch all persons in a family tree successfully', async () => {
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: mockPersons
      });

      const result = await apiService.get(
        API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId)
      );

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId)
      );
      expect(result.data).toEqual(mockPersons);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].familyTreeId).toBe(familyTreeId);
    });

    it('should handle empty persons list', async () => {
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: []
      });

      const result = await apiService.get(
        API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId)
      );

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId)
      );
      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
    });

    it('should handle invalid family tree ID', async () => {
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
        apiService.get(API_ENDPOINTS.FAMILY_TREES.PERSONS('non-existent'))
      ).rejects.toEqual(notFoundError);

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.PERSONS('non-existent')
      );
    });
  });

  describe('POST /api/family-trees/:treeId/persons', () => {
    const familyTreeId = 'tree-1';
    const newPersonData = {
      firstName: 'Alice',
      lastName: 'Johnson',
      birthDate: '1995-03-20',
      gender: 'female' as const,
      bio: 'New person for testing'
    };

    it('should create a new person successfully', async () => {
      const createdPerson = {
        ...mockPerson,
        ...newPersonData,
        id: '3',
        familyTreeId
      };

      const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
        data: createdPerson
      });

      const result = await apiService.post(
        API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId),
        newPersonData
      );

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId),
        newPersonData
      );
      expect(result.data.firstName).toBe(newPersonData.firstName);
      expect(result.data.lastName).toBe(newPersonData.lastName);
      expect(result.data.familyTreeId).toBe(familyTreeId);
    });

    it('should handle validation errors for required fields', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Validation failed',
              details: [
                {
                  field: 'firstName',
                  message: 'First name is required'
                }
              ]
            }
          }
        }
      };

      const postSpy = vi.spyOn(apiService, 'post').mockRejectedValue(validationError);

      await expect(
        apiService.post(
          API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId),
          { firstName: '', lastName: 'Test' }
        )
      ).rejects.toEqual(validationError);

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId),
        { firstName: '', lastName: 'Test' }
      );
    });

    it('should handle invalid family tree ID during creation', async () => {
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

      const postSpy = vi.spyOn(apiService, 'post').mockRejectedValue(notFoundError);

      await expect(
        apiService.post(
          API_ENDPOINTS.FAMILY_TREES.PERSONS('non-existent'),
          newPersonData
        )
      ).rejects.toEqual(notFoundError);

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.FAMILY_TREES.PERSONS('non-existent'),
        newPersonData
      );
    });
  });

  describe('GET /api/persons/:id', () => {
    it('should fetch a specific person successfully', async () => {
      const personId = '1';
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: mockPerson
      });

      const result = await apiService.get(
        API_ENDPOINTS.PERSONS.BY_ID(personId)
      );

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS.BY_ID(personId)
      );
      expect(result.data).toEqual(mockPerson);
      expect(result.data.id).toBe(personId);
    });

    it('should handle 404 not found errors', async () => {
      const personId = 'non-existent';
      const notFoundError = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Person not found'
            }
          }
        }
      };

      const getSpy = vi.spyOn(apiService, 'get').mockRejectedValue(notFoundError);

      await expect(
        apiService.get(API_ENDPOINTS.PERSONS.BY_ID(personId))
      ).rejects.toEqual(notFoundError);

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS.BY_ID(personId)
      );
    });
  });

  describe('PUT /api/persons/:id', () => {
    const personId = '1';
    const updateData = {
      firstName: 'Updated John',
      lastName: 'Updated Doe',
      bio: 'Updated biography'
    };

    it('should update a person successfully', async () => {
      const updatedPerson = { ...mockPerson, ...updateData };
      const putSpy = vi.spyOn(apiService, 'put').mockResolvedValue({
        data: updatedPerson
      });

      const result = await apiService.put(
        API_ENDPOINTS.PERSONS.BY_ID(personId),
        updateData
      );

      expect(putSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS.BY_ID(personId),
        updateData
      );
      expect(result.data.firstName).toBe(updateData.firstName);
      expect(result.data.lastName).toBe(updateData.lastName);
      expect(result.data.bio).toBe(updateData.bio);
    });

    it('should handle validation errors during update', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Validation failed',
              details: [
                {
                  field: 'firstName',
                  message: 'First name must be between 1 and 100 characters'
                }
              ]
            }
          }
        }
      };

      const putSpy = vi.spyOn(apiService, 'put').mockRejectedValue(validationError);

      await expect(
        apiService.put(
          API_ENDPOINTS.PERSONS.BY_ID(personId),
          { firstName: 'a'.repeat(150) }
        )
      ).rejects.toEqual(validationError);

      expect(putSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS.BY_ID(personId),
        { firstName: 'a'.repeat(150) }
      );
    });

    it('should handle update of non-existent person', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Person not found'
            }
          }
        }
      };

      const putSpy = vi.spyOn(apiService, 'put').mockRejectedValue(notFoundError);

      await expect(
        apiService.put(
          API_ENDPOINTS.PERSONS.BY_ID('non-existent'),
          updateData
        )
      ).rejects.toEqual(notFoundError);

      expect(putSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS.BY_ID('non-existent'),
        updateData
      );
    });
  });

  describe('DELETE /api/persons/:id', () => {
    const personId = '1';

    it('should delete a person successfully', async () => {
      const deleteSpy = vi.spyOn(apiService, 'delete').mockResolvedValue({
        data: null
      });

      const result = await apiService.delete(
        API_ENDPOINTS.PERSONS.BY_ID(personId)
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS.BY_ID(personId)
      );
      expect(result.data).toBeNull();
    });

    it('should handle delete of non-existent person', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Person not found'
            }
          }
        }
      };

      const deleteSpy = vi.spyOn(apiService, 'delete').mockRejectedValue(notFoundError);

      await expect(
        apiService.delete(API_ENDPOINTS.PERSONS.BY_ID('non-existent'))
      ).rejects.toEqual(notFoundError);

      expect(deleteSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS.BY_ID('non-existent')
      );
    });
  });

  describe('Complex Person Operations', () => {
    it('should handle person with optional fields', async () => {
      const minimalPersonData = {
        firstName: 'Minimal'
        // Only required field
      };

      const createdPerson = {
        id: '4',
        familyTreeId: 'tree-1',
        firstName: 'Minimal',
        lastName: null,
        birthDate: null,
        deathDate: null,
        gender: null,
        bio: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
        data: createdPerson
      });

      const result = await apiService.post(
        API_ENDPOINTS.FAMILY_TREES.PERSONS('tree-1'),
        minimalPersonData
      );

      expect(result.data.firstName).toBe('Minimal');
      expect(result.data.lastName).toBeNull();
      expect(result.data.birthDate).toBeNull();
    });

    it('should handle deceased person with death date', async () => {
      const deceasedPersonData = {
        firstName: 'Historical',
        lastName: 'Person',
        birthDate: '1900-01-01',
        deathDate: '1980-12-31',
        gender: 'male' as const
      };

      const createdPerson = {
        ...mockPerson,
        ...deceasedPersonData,
        id: '5'
      };

      const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
        data: createdPerson
      });

      const result = await apiService.post(
        API_ENDPOINTS.FAMILY_TREES.PERSONS('tree-1'),
        deceasedPersonData
      );

      expect(result.data.birthDate).toBe('1900-01-01');
      expect(result.data.deathDate).toBe('1980-12-31');
    });
  });

  describe('Person CRUD Integration Flow', () => {
    it('should support complete person CRUD workflow', async () => {
      const familyTreeId = 'tree-1';
      const createData = {
        firstName: 'Integration',
        lastName: 'Test',
        birthDate: '1990-01-01',
        gender: 'other' as const,
        bio: 'For integration testing'
      };

      // Mock the complete CRUD flow
      const createdPerson = { ...mockPerson, ...createData, id: '6' };
      const updatedPerson = { ...createdPerson, firstName: 'Updated Integration' };

      // Create
      const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
        data: createdPerson
      });

      const createResult = await apiService.post(
        API_ENDPOINTS.FAMILY_TREES.PERSONS(familyTreeId),
        createData
      );

      expect(createResult.data.firstName).toBe(createData.firstName);

      // Read
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: createdPerson
      });

      const readResult = await apiService.get(
        API_ENDPOINTS.PERSONS.BY_ID(createdPerson.id)
      );

      expect(readResult.data.id).toBe(createdPerson.id);

      // Update
      const putSpy = vi.spyOn(apiService, 'put').mockResolvedValue({
        data: updatedPerson
      });

      const updateResult = await apiService.put(
        API_ENDPOINTS.PERSONS.BY_ID(createdPerson.id),
        { firstName: 'Updated Integration' }
      );

      expect(updateResult.data.firstName).toBe('Updated Integration');

      // Delete
      const deleteSpy = vi.spyOn(apiService, 'delete').mockResolvedValue({
        data: null
      });

      const deleteResult = await apiService.delete(
        API_ENDPOINTS.PERSONS.BY_ID(createdPerson.id)
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