export type RelationshipType = 
  | 'parent' 
  | 'child' 
  | 'spouse' 
  | 'sibling' 
  | 'grandparent'
  | 'grandchild'
  | 'uncle_aunt'
  | 'nephew_niece'
  | 'cousin';

export interface Relationship {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  familyTreeId: string;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    marriageDate?: string;
    divorceDate?: string;
    adoptionDate?: string;
    notes?: string;
  };
}

export interface RelationshipFormData {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  metadata?: {
    marriageDate?: string;
    divorceDate?: string;
    adoptionDate?: string;
    notes?: string;
  };
}

export interface CreateRelationshipRequest {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  familyTreeId: string;
  metadata?: {
    marriageDate?: string;
    divorceDate?: string;
    adoptionDate?: string;
    notes?: string;
  };
}

export interface UpdateRelationshipRequest {
  relationshipType?: RelationshipType;
  metadata?: {
    marriageDate?: string;
    divorceDate?: string;
    adoptionDate?: string;
    notes?: string;
  };
}

export interface DragDropContext {
  sourcePersonId: string | null;
  targetPersonId: string | null;
  isDragging: boolean;
  dragPreview?: {
    x: number;
    y: number;
    sourcePersonName: string;
  };
}

export interface RelationshipValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Utility types for relationship management
export interface RelationshipConstraints {
  maxSpouses: number;
  allowSelfReference: boolean;
  allowDuplicateRelationships: boolean;
  requiredConfirmationTypes: RelationshipType[];
}