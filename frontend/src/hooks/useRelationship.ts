import { useState, useCallback } from 'react';
import type { 
  Relationship, 
  RelationshipType, 
  CreateRelationshipRequest, 
  UpdateRelationshipRequest,
  RelationshipValidation
} from '../types/relationship';

// Mock API service for now - will be replaced with actual service
const mockApiService = {
  get: async (url: string) => {
    console.log('Mock API GET:', url);
    return { relationships: [] };
  },
  post: async (url: string, data: any) => {
    console.log('Mock API POST:', url, data);
    return {
      id: `rel_${Date.now()}`,
      ...data,
      isConfirmed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  put: async (url: string, data: any) => {
    console.log('Mock API PUT:', url, data);
    return data;
  },
  delete: async (url: string) => {
    console.log('Mock API DELETE:', url);
    return { success: true };
  },
};

export const useRelationship = () => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFamilyTreeId, setCurrentFamilyTreeId] = useState<string | null>(null);

  const loadRelationships = useCallback(async (familyTreeId: string) => {
    setLoading(true);
    setError(null);
    setCurrentFamilyTreeId(familyTreeId);
    
    try {
      const response = await mockApiService.get(`/family-trees/${familyTreeId}/relationships`);
      setRelationships(response.relationships || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load relationships';
      setError(errorMessage);
      setRelationships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRelationship = useCallback(async (data: CreateRelationshipRequest): Promise<Relationship> => {
    setLoading(true);
    setError(null);
    
    try {
      const newRelationship = await mockApiService.post(
        `/family-trees/${data.familyTreeId}/relationships`,
        data
      );
      
      setRelationships(prev => [...prev, newRelationship]);
      return newRelationship;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create relationship';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRelationship = useCallback(async (
    relationshipId: string, 
    data: UpdateRelationshipRequest
  ): Promise<Relationship> => {
    if (!currentFamilyTreeId) {
      throw new Error('No family tree loaded');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedRelationship = await mockApiService.put(
        `/family-trees/${currentFamilyTreeId}/relationships/${relationshipId}`,
        data
      );
      
      setRelationships(prev => 
        prev.map(rel => 
          rel.id === relationshipId 
            ? { ...rel, ...updatedRelationship, updatedAt: new Date().toISOString() }
            : rel
        )
      );
      
      return updatedRelationship;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update relationship';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFamilyTreeId]);

  const deleteRelationship = useCallback(async (relationshipId: string): Promise<void> => {
    if (!currentFamilyTreeId) {
      throw new Error('No family tree loaded');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await mockApiService.delete(
        `/family-trees/${currentFamilyTreeId}/relationships/${relationshipId}`
      );
      
      setRelationships(prev => prev.filter(rel => rel.id !== relationshipId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete relationship';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFamilyTreeId]);

  const validateRelationship = useCallback((
    fromPersonId: string,
    toPersonId: string,
    relationshipType: RelationshipType
  ): RelationshipValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for self-reference
    if (fromPersonId === toPersonId) {
      errors.push('自分自身との関係性は作成できません');
    }

    // Check for duplicate relationships
    const existingRelationship = relationships.find(rel => 
      (rel.fromPersonId === fromPersonId && rel.toPersonId === toPersonId) ||
      (rel.fromPersonId === toPersonId && rel.toPersonId === fromPersonId)
    );

    if (existingRelationship) {
      errors.push('この関係性は既に存在します');
    }

    // Check for multiple spouse relationships
    if (relationshipType === 'spouse') {
      const existingSpouses = relationships.filter(rel => 
        rel.relationshipType === 'spouse' && 
        (rel.fromPersonId === fromPersonId || rel.toPersonId === fromPersonId)
      );

      if (existingSpouses.length > 0) {
        errors.push('この人物は既に配偶者がいます');
      }
    }

    // Age-based validations (simplified for now)
    // In real implementation, would get person data and calculate ages
    const mockPersonAges = {
      [fromPersonId]: Math.floor(Math.random() * 80) + 20,
      [toPersonId]: Math.floor(Math.random() * 80) + 20,
    };

    const fromAge = mockPersonAges[fromPersonId] || 30;
    const toAge = mockPersonAges[toPersonId] || 30;
    const ageDifference = Math.abs(fromAge - toAge);

    if (relationshipType === 'spouse' && ageDifference > 30) {
      warnings.push('年齢差が大きいため、関係性をご確認ください');
    }

    if (relationshipType === 'parent' || relationshipType === 'child') {
      const parentAge = relationshipType === 'parent' ? fromAge : toAge;
      const childAge = relationshipType === 'parent' ? toAge : fromAge;
      
      if (childAge >= parentAge) {
        errors.push('子どもの方が親より年上です');
      }
      
      if (parentAge - childAge < 15) {
        warnings.push('親子の年齢差が小さいため、関係性をご確認ください');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [relationships]);

  const getRelationshipsByPerson = useCallback((personId: string): Relationship[] => {
    return relationships.filter(rel => 
      rel.fromPersonId === personId || rel.toPersonId === personId
    );
  }, [relationships]);

  const getRelationshipType = useCallback((
    personId1: string, 
    personId2: string
  ): RelationshipType | null => {
    const relationship = relationships.find(rel => 
      (rel.fromPersonId === personId1 && rel.toPersonId === personId2) ||
      (rel.fromPersonId === personId2 && rel.toPersonId === personId1)
    );
    
    return relationship?.relationshipType || null;
  }, [relationships]);

  // Helper function for tests
  const getPersons = useCallback(() => {
    // Mock function for age validation in tests
    return [];
  }, []);

  return {
    // State
    relationships,
    loading,
    error,
    
    // Actions
    loadRelationships,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    
    // Validation
    validateRelationship,
    
    // Queries
    getRelationshipsByPerson,
    getRelationshipType,
    
    // Helpers
    getPersons,
  };
};