import React, { Suspense } from 'react';
import type { Person } from '../../types/person';

// Lazy load PersonManagement components
const PersonForm = React.lazy(() => 
  import('./PersonForm').then(module => ({
    default: module.PersonForm
  }))
);

const PersonCard = React.lazy(() => 
  import('./PersonCard').then(module => ({
    default: module.PersonCard
  }))
);

const PersonDetailModal = React.lazy(() => 
  import('./PersonDetailModal').then(module => ({
    default: module.PersonDetailModal
  }))
);

// Loading fallback for PersonManagement components
const PersonManagementLoadingFallback = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg p-6 mb-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

// Lazy wrapper components with proper typing
interface PersonFormLazyProps {
  person?: Person;
  onSubmit: (personData: Partial<Person>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PersonFormLazy: React.FC<PersonFormLazyProps> = (props) => (
  <Suspense fallback={<PersonManagementLoadingFallback />}>
    <PersonForm {...props} />
  </Suspense>
);

interface PersonCardLazyProps {
  person: Person;
  onClick: (person: Person) => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export const PersonCardLazy: React.FC<PersonCardLazyProps> = (props) => (
  <Suspense fallback={<PersonManagementLoadingFallback />}>
    <PersonCard {...props} />
  </Suspense>
);

interface PersonDetailModalLazyProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

export const PersonDetailModalLazy: React.FC<PersonDetailModalLazyProps> = (props) => (
  <Suspense fallback={<PersonManagementLoadingFallback />}>
    <PersonDetailModal {...props} />
  </Suspense>
);

// Set display names for debugging
PersonFormLazy.displayName = 'PersonFormLazy';
PersonCardLazy.displayName = 'PersonCardLazy';
PersonDetailModalLazy.displayName = 'PersonDetailModalLazy';