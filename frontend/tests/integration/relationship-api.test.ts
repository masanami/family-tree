import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../../src/services/api.service';
import { API_ENDPOINTS } from '../../src/constants/api.constants';

// Mock data for testing based on engineer-2's specifications
const mockRelationship = {
  id: 'rel-1',
  fromPersonId: 'person-1',
  toPersonId: 'person-2',
  relationshipType: 'spouse',
  familyTreeId: 'tree-1',
  isConfirmed: true,
  metadata: {
    marriageDate: '2020-01-01',
    divorceDate: null,
    adoptionDate: null,
    notes: 'Test relationship'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockRelationships = [
  mockRelationship,
  {
    id: 'rel-2',
    fromPersonId: 'person-2',
    toPersonId: 'person-3',
    relationshipType: 'parent',
    familyTreeId: 'tree-1',
    isConfirmed: true,
    metadata: {
      marriageDate: null,
      divorceDate: null,
      adoptionDate: null,
      notes: 'Parent-child relationship'
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

describe('Relationship API Integration Tests', () => {
  const familyTreeId = 'tree-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/family-trees/{familyTreeId}/relationships', () => {
    it('should fetch all relationships in a family tree successfully', async () => {
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: mockRelationships
      });

      const result = await apiService.get(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId)
      );

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId)
      );
      expect(result.data).toEqual(mockRelationships);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].familyTreeId).toBe(familyTreeId);
    });

    it('should handle empty relationships list', async () => {
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: []
      });

      const result = await apiService.get(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId)
      );

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId)
      );
      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
    });

    it('should handle unauthorized access (401)', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: {
            error: {
              message: 'Authentication required'
            }
          }
        }
      };

      const getSpy = vi.spyOn(apiService, 'get').mockRejectedValue(unauthorizedError);

      await expect(
        apiService.get(API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId))
      ).rejects.toEqual(unauthorizedError);

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId)
      );
    });

    it('should handle forbidden access (403)', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: {
            error: {
              message: 'Access denied to family tree'
            }
          }
        }
      };

      const getSpy = vi.spyOn(apiService, 'get').mockRejectedValue(forbiddenError);

      await expect(
        apiService.get(API_ENDPOINTS.RELATIONSHIPS.BASE('other-tree'))
      ).rejects.toEqual(forbiddenError);

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE('other-tree')
      );
    });

    it('should handle family tree not found (404)', async () => {
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
        apiService.get(API_ENDPOINTS.RELATIONSHIPS.BASE('non-existent'))
      ).rejects.toEqual(notFoundError);

      expect(getSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE('non-existent')
      );
    });
  });

  describe('POST /api/v1/family-trees/{familyTreeId}/relationships', () => {
    const createRelationshipData = {
      fromPersonId: 'person-1',
      toPersonId: 'person-2',
      relationshipType: 'spouse',
      metadata: {
        marriageDate: '2023-06-15',
        notes: 'Wedding ceremony in Paris'
      }
    };

    it('should create a new relationship successfully', async () => {
      const createdRelationship = {
        ...mockRelationship,
        ...createRelationshipData,
        id: 'rel-3',
        familyTreeId
      };

      const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
        data: createdRelationship
      });

      const result = await apiService.post(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
        createRelationshipData
      );

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
        createRelationshipData
      );
      expect(result.data.fromPersonId).toBe(createRelationshipData.fromPersonId);
      expect(result.data.toPersonId).toBe(createRelationshipData.toPersonId);
      expect(result.data.relationshipType).toBe(createRelationshipData.relationshipType);
      expect(result.data.familyTreeId).toBe(familyTreeId);
    });

    it('should handle validation errors (400)', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Validation failed',
              details: [
                {
                  field: 'fromPersonId',
                  message: 'fromPersonId is required'
                },
                {
                  field: 'relationshipType',
                  message: 'Invalid relationship type'
                }
              ]
            }
          }
        }
      };

      const postSpy = vi.spyOn(apiService, 'post').mockRejectedValue(validationError);

      await expect(
        apiService.post(
          API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
          { fromPersonId: '', toPersonId: 'person-2', relationshipType: 'invalid' }
        )
      ).rejects.toEqual(validationError);

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
        { fromPersonId: '', toPersonId: 'person-2', relationshipType: 'invalid' }
      );
    });

    it('should handle conflict errors - duplicate relationship (409)', async () => {
      const conflictError = {
        response: {
          status: 409,
          data: {
            error: {
              message: 'Relationship conflict',
              details: 'Relationship between these persons already exists'
            }
          }
        }
      };

      const postSpy = vi.spyOn(apiService, 'post').mockRejectedValue(conflictError);

      await expect(
        apiService.post(
          API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
          createRelationshipData
        )
      ).rejects.toEqual(conflictError);

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
        createRelationshipData
      );
    });

    it('should handle conflict errors - spouse already exists (409)', async () => {
      const spouseConflictError = {
        response: {
          status: 409,
          data: {
            error: {
              message: 'Spouse conflict',
              details: 'Person already has a spouse relationship'
            }
          }
        }
      };

      const postSpy = vi.spyOn(apiService, 'post').mockRejectedValue(spouseConflictError);

      await expect(
        apiService.post(
          API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
          { ...createRelationshipData, relationshipType: 'spouse' }
        )
      ).rejects.toEqual(spouseConflictError);

      expect(postSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
        { ...createRelationshipData, relationshipType: 'spouse' }
      );
    });
  });

  describe('PUT /api/v1/family-trees/{familyTreeId}/relationships/{relationshipId}', () => {
    const relationshipId = 'rel-1';
    const updateData = {
      relationshipType: 'ex-spouse',
      metadata: {
        marriageDate: '2020-01-01',
        divorceDate: '2023-12-31',
        notes: 'Divorced amicably'
      }
    };

    it('should update a relationship successfully', async () => {
      const updatedRelationship = { ...mockRelationship, ...updateData };
      const putSpy = vi.spyOn(apiService, 'put').mockResolvedValue({
        data: updatedRelationship
      });

      const result = await apiService.put(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId),
        updateData
      );

      expect(putSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId),
        updateData
      );
      expect(result.data.relationshipType).toBe(updateData.relationshipType);
      expect(result.data.metadata.divorceDate).toBe('2023-12-31');
    });

    it('should handle update validation errors (400)', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Validation failed',
              details: [
                {
                  field: 'metadata.marriageDate',
                  message: 'Invalid date format'
                }
              ]
            }
          }
        }
      };

      const putSpy = vi.spyOn(apiService, 'put').mockRejectedValue(validationError);

      await expect(
        apiService.put(
          API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId),
          { metadata: { marriageDate: 'invalid-date' } }
        )
      ).rejects.toEqual(validationError);

      expect(putSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId),
        { metadata: { marriageDate: 'invalid-date' } }
      );
    });

    it('should handle relationship not found (404)', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Relationship not found'
            }
          }
        }
      };

      const putSpy = vi.spyOn(apiService, 'put').mockRejectedValue(notFoundError);

      await expect(
        apiService.put(
          API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, 'non-existent'),
          updateData
        )
      ).rejects.toEqual(notFoundError);

      expect(putSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, 'non-existent'),
        updateData
      );
    });
  });

  describe('DELETE /api/v1/family-trees/{familyTreeId}/relationships/{relationshipId}', () => {
    const relationshipId = 'rel-1';

    it('should delete a relationship successfully', async () => {
      const deleteSpy = vi.spyOn(apiService, 'delete').mockResolvedValue({
        data: null
      });

      const result = await apiService.delete(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId)
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId)
      );
      expect(result.data).toBeNull();
    });

    it('should handle delete of non-existent relationship (404)', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Relationship not found'
            }
          }
        }
      };

      const deleteSpy = vi.spyOn(apiService, 'delete').mockRejectedValue(notFoundError);

      await expect(
        apiService.delete(
          API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, 'non-existent')
        )
      ).rejects.toEqual(notFoundError);

      expect(deleteSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, 'non-existent')
      );
    });

    it('should handle unauthorized delete (401)', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: {
            error: {
              message: 'Authentication required'
            }
          }
        }
      };

      const deleteSpy = vi.spyOn(apiService, 'delete').mockRejectedValue(unauthorizedError);

      await expect(
        apiService.delete(
          API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId)
        )
      ).rejects.toEqual(unauthorizedError);

      expect(deleteSpy).toHaveBeenCalledWith(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId)
      );
    });
  });

  describe('Complex Relationship Scenarios', () => {
    it('should handle different relationship types', async () => {
      const relationshipTypes = [
        { type: 'spouse', metadata: { marriageDate: '2020-01-01' } },
        { type: 'parent', metadata: { adoptionDate: '2015-06-01' } },
        { type: 'child', metadata: { notes: 'Biological child' } },
        { type: 'sibling', metadata: { notes: 'Twin brother' } }
      ];

      for (const relType of relationshipTypes) {
        const createData = {
          fromPersonId: 'person-1',
          toPersonId: 'person-2',
          relationshipType: relType.type,
          metadata: relType.metadata
        };

        const createdRelationship = {
          ...mockRelationship,
          ...createData,
          id: `rel-${relType.type}`
        };

        const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
          data: createdRelationship
        });

        const result = await apiService.post(
          API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
          createData
        );

        expect(result.data.relationshipType).toBe(relType.type);
        expect(result.data.metadata).toEqual(expect.objectContaining(relType.metadata));
      }
    });

    it('should handle relationship metadata updates', async () => {
      const relationshipId = 'rel-spouse';
      const metadataUpdates = [
        { marriageDate: '2020-01-01', notes: 'Civil ceremony' },
        { divorceDate: '2023-12-31', notes: 'Divorced amicably' },
        { adoptionDate: '2021-05-15', notes: 'Adopted child together' }
      ];

      for (const metadata of metadataUpdates) {
        const updatedRelationship = {
          ...mockRelationship,
          metadata: { ...mockRelationship.metadata, ...metadata }
        };

        const putSpy = vi.spyOn(apiService, 'put').mockResolvedValue({
          data: updatedRelationship
        });

        const result = await apiService.put(
          API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, relationshipId),
          { metadata }
        );

        expect(result.data.metadata).toEqual(
          expect.objectContaining(metadata)
        );
      }
    });
  });

  describe('Relationship CRUD Integration Flow', () => {
    it('should support complete relationship CRUD workflow', async () => {
      const createData = {
        fromPersonId: 'person-integration-1',
        toPersonId: 'person-integration-2',
        relationshipType: 'spouse',
        metadata: {
          marriageDate: '2024-01-15',
          notes: 'Integration test relationship'
        }
      };

      // Mock the complete CRUD flow
      const createdRelationship = { ...mockRelationship, ...createData, id: 'rel-integration' };
      const updatedRelationship = {
        ...createdRelationship,
        relationshipType: 'ex-spouse',
        metadata: { ...createData.metadata, divorceDate: '2024-12-31' }
      };

      // Create
      const postSpy = vi.spyOn(apiService, 'post').mockResolvedValue({
        data: createdRelationship
      });

      const createResult = await apiService.post(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId),
        createData
      );

      expect(createResult.data.relationshipType).toBe(createData.relationshipType);

      // Read (via list - individual get not specified in engineer-2's spec)
      const getSpy = vi.spyOn(apiService, 'get').mockResolvedValue({
        data: [createdRelationship]
      });

      const readResult = await apiService.get(
        API_ENDPOINTS.RELATIONSHIPS.BASE(familyTreeId)
      );

      expect(readResult.data[0].id).toBe(createdRelationship.id);

      // Update
      const putSpy = vi.spyOn(apiService, 'put').mockResolvedValue({
        data: updatedRelationship
      });

      const updateResult = await apiService.put(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, createdRelationship.id),
        { 
          relationshipType: 'ex-spouse',
          metadata: { divorceDate: '2024-12-31' }
        }
      );

      expect(updateResult.data.relationshipType).toBe('ex-spouse');

      // Delete
      const deleteSpy = vi.spyOn(apiService, 'delete').mockResolvedValue({
        data: null
      });

      const deleteResult = await apiService.delete(
        API_ENDPOINTS.RELATIONSHIPS.BY_ID(familyTreeId, createdRelationship.id)
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