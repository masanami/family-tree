import React, { Suspense } from 'react';
import type { Person } from '../../types/person';
import type { Relationship } from '../../types/relationship';

// Lazy load RelationshipManagement components
const RelationshipCreator = React.lazy(() => 
  import('./RelationshipCreator').then(module => ({
    default: module.RelationshipCreator
  }))
);

const RelationshipList = React.lazy(() => 
  import('./RelationshipList').then(module => ({
    default: module.RelationshipList
  }))
);

// Loading fallback for RelationshipManagement components
const RelationshipLoadingFallback = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 rounded-lg p-4">
        <div className="h-20 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
      <div className="bg-gray-200 rounded-lg p-4">
        <div className="h-20 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
    <div className="bg-gray-200 rounded-lg p-4">
      <div className="h-6 bg-gray-300 rounded w-1/4 mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

// Lazy wrapper components with proper typing
interface RelationshipCreatorLazyProps {
  persons: Person[];
  onRelationshipCreate: (relationship: Omit<Relationship, 'id'>) => void;
  isLoading?: boolean;
}

export const RelationshipCreatorLazy: React.FC<RelationshipCreatorLazyProps> = (props) => (
  <Suspense fallback={<RelationshipLoadingFallback />}>
    <RelationshipCreator {...props} />
  </Suspense>
);

interface RelationshipListLazyProps {
  relationships: Relationship[];
  persons: Person[];
  onRelationshipEdit: (relationship: Relationship) => void;
  onRelationshipDelete: (relationshipId: string) => void;
  isLoading?: boolean;
}

export const RelationshipListLazy: React.FC<RelationshipListLazyProps> = (props) => (
  <Suspense fallback={<RelationshipLoadingFallback />}>
    <RelationshipList {...props} />
  </Suspense>
);

// Set display names for debugging
RelationshipCreatorLazy.displayName = 'RelationshipCreatorLazy';
RelationshipListLazy.displayName = 'RelationshipListLazy';