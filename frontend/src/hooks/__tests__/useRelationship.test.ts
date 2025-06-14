import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useRelationship } from '../useRelationship';
import type { Relationship, RelationshipType } from '../../types/relationship';

// Mock the API service
vi.mock('../../services/api.service', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockRelationships: Relationship[] = [
  {
    id: '1',
    fromPersonId: 'person1',
    toPersonId: 'person2',
    relationshipType: 'spouse',
    familyTreeId: 'tree1',
    isConfirmed: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    metadata: {
      marriageDate: '2000-01-01',
    },
  },
  {
    id: '2',
    fromPersonId: 'person1',
    toPersonId: 'person3',
    relationshipType: 'parent',
    familyTreeId: 'tree1',
    isConfirmed: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('useRelationship', () => {
  const { apiService } = require('../../services/api.service');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadRelationships', () => {
    it('should load relationships for a family tree', async () => {
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      expect(result.current.relationships).toEqual([]);
      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.loadRelationships('tree1');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.relationships).toEqual(mockRelationships);
      expect(apiService.get).toHaveBeenCalledWith('/family-trees/tree1/relationships');
    });

    it('should handle load error', async () => {
      const error = new Error('Failed to load relationships');
      apiService.get.mockRejectedValue(error);

      const { result } = renderHook(() => useRelationship());

      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load relationships');
      expect(result.current.relationships).toEqual([]);
    });
  });

  describe('createRelationship', () => {
    it('should create a new relationship', async () => {
      const newRelationship: Relationship = {
        id: '3',
        fromPersonId: 'person4',
        toPersonId: 'person5',
        relationshipType: 'sibling',
        familyTreeId: 'tree1',
        isConfirmed: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      apiService.post.mockResolvedValue(newRelationship);

      const { result } = renderHook(() => useRelationship());

      // Set initial relationships
      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual([]);
      });

      const createData = {
        fromPersonId: 'person4',
        toPersonId: 'person5',
        relationshipType: 'sibling' as RelationshipType,
        familyTreeId: 'tree1',
      };

      await act(async () => {
        await result.current.createRelationship(createData);
      });

      expect(apiService.post).toHaveBeenCalledWith('/family-trees/tree1/relationships', createData);
      expect(result.current.relationships).toContainEqual(newRelationship);
    });

    it('should handle creation error', async () => {
      const error = new Error('Failed to create relationship');
      apiService.post.mockRejectedValue(error);

      const { result } = renderHook(() => useRelationship());

      const createData = {
        fromPersonId: 'person4',
        toPersonId: 'person5',
        relationshipType: 'sibling' as RelationshipType,
        familyTreeId: 'tree1',
      };

      await act(async () => {
        try {
          await result.current.createRelationship(createData);
        } catch (e) {
          expect(e).toEqual(error);
        }
      });

      expect(result.current.error).toBe('Failed to create relationship');
    });
  });

  describe('updateRelationship', () => {
    it('should update an existing relationship', async () => {
      const updatedRelationship: Relationship = {
        ...mockRelationships[0],
        relationshipType: 'divorced',
        metadata: {
          marriageDate: '2000-01-01',
          divorceDate: '2020-01-01',
        },
      };

      apiService.put.mockResolvedValue(updatedRelationship);
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      // Load initial relationships
      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      const updateData = {
        relationshipType: 'divorced' as RelationshipType,
        metadata: {
          divorceDate: '2020-01-01',
        },
      };

      await act(async () => {
        await result.current.updateRelationship('1', updateData);
      });

      expect(apiService.put).toHaveBeenCalledWith('/family-trees/tree1/relationships/1', updateData);
      
      // Check that the relationship was updated in the local state
      const updatedRelationshipInState = result.current.relationships.find(r => r.id === '1');
      expect(updatedRelationshipInState?.relationshipType).toBe('divorced');
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update relationship');
      apiService.put.mockRejectedValue(error);
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      // Load initial relationships
      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      const updateData = {
        relationshipType: 'divorced' as RelationshipType,
      };

      await act(async () => {
        try {
          await result.current.updateRelationship('1', updateData);
        } catch (e) {
          expect(e).toEqual(error);
        }
      });

      expect(result.current.error).toBe('Failed to update relationship');
    });
  });

  describe('deleteRelationship', () => {
    it('should delete a relationship', async () => {
      apiService.delete.mockResolvedValue({ success: true });
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      // Load initial relationships
      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      await act(async () => {
        await result.current.deleteRelationship('1');
      });

      expect(apiService.delete).toHaveBeenCalledWith('/family-trees/tree1/relationships/1');
      
      // Check that the relationship was removed from local state
      const remainingRelationships = result.current.relationships;
      expect(remainingRelationships.find(r => r.id === '1')).toBeUndefined();
    });

    it('should handle deletion error', async () => {
      const error = new Error('Failed to delete relationship');
      apiService.delete.mockRejectedValue(error);
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      // Load initial relationships
      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      await act(async () => {
        try {
          await result.current.deleteRelationship('1');
        } catch (e) {
          expect(e).toEqual(error);
        }
      });

      expect(result.current.error).toBe('Failed to delete relationship');
    });
  });

  describe('validateRelationship', () => {
    beforeEach(() => {
      apiService.get.mockResolvedValue({ relationships: mockRelationships });
    });

    it('should validate valid relationship', async () => {
      const { result } = renderHook(() => useRelationship());

      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      const validation = result.current.validateRelationship('person4', 'person5', 'sibling');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect self-reference', () => {
      const { result } = renderHook(() => useRelationship());

      const validation = result.current.validateRelationship('person1', 'person1', 'sibling');

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('自分自身との関係性は作成できません');
    });

    it('should detect duplicate relationships', async () => {
      const { result } = renderHook(() => useRelationship());

      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      const validation = result.current.validateRelationship('person1', 'person2', 'spouse');

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('この関係性は既に存在します');
    });

    it('should detect multiple spouse relationships', async () => {
      const { result } = renderHook(() => useRelationship());

      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      // person1 already has spouse person2, trying to add another spouse
      const validation = result.current.validateRelationship('person1', 'person4', 'spouse');

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('この人物は既に配偶者がいます');
    });

    it('should show warning for large age differences', async () => {
      const { result } = renderHook(() => useRelationship());

      // Mock person data for age validation
      const mockPersons = [
        { id: 'person6', birthDate: '1950-01-01' }, // 74 years old
        { id: 'person7', birthDate: '2000-01-01' }, // 24 years old
      ];

      vi.spyOn(result.current, 'getPersons').mockReturnValue(mockPersons);

      const validation = result.current.validateRelationship('person6', 'person7', 'spouse');

      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('年齢差が大きいため、関係性をご確認ください');
    });

    it('should validate parent-child age relationships', async () => {
      const { result } = renderHook(() => useRelationship());

      // Mock person data where child is older than parent
      const mockPersons = [
        { id: 'person8', birthDate: '1980-01-01' }, // 44 years old
        { id: 'person9', birthDate: '1970-01-01' }, // 54 years old
      ];

      vi.spyOn(result.current, 'getPersons').mockReturnValue(mockPersons);

      const validation = result.current.validateRelationship('person8', 'person9', 'child');

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('子どもの方が親より年上です');
    });
  });

  describe('getRelationshipsByPerson', () => {
    it('should get all relationships for a specific person', async () => {
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      const person1Relationships = result.current.getRelationshipsByPerson('person1');

      expect(person1Relationships).toHaveLength(2);
      expect(person1Relationships[0].relationshipType).toBe('spouse');
      expect(person1Relationships[1].relationshipType).toBe('parent');
    });

    it('should return empty array for person with no relationships', async () => {
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      const noRelationships = result.current.getRelationshipsByPerson('person999');

      expect(noRelationships).toHaveLength(0);
    });
  });

  describe('getRelationshipType', () => {
    it('should get relationship type between two persons', async () => {
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      const relationshipType = result.current.getRelationshipType('person1', 'person2');

      expect(relationshipType).toBe('spouse');
    });

    it('should return null if no relationship exists', async () => {
      apiService.get.mockResolvedValue({ relationships: mockRelationships });

      const { result } = renderHook(() => useRelationship());

      act(() => {
        result.current.loadRelationships('tree1');
      });

      await waitFor(() => {
        expect(result.current.relationships).toEqual(mockRelationships);
      });

      const relationshipType = result.current.getRelationshipType('person1', 'person999');

      expect(relationshipType).toBeNull();
    });
  });
});