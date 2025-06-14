// Person types (copied from issue-37 for consistency)
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  bio?: string;
  familyTreeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonFormData {
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  bio?: string;
}