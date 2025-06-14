export interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  membersCount?: number;
  sharedWith?: Array<{
    userId: string;
    userName: string;
    permission: 'view' | 'edit' | 'admin';
  }>;
}

export interface FamilyTreeFormData {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface CreateFamilyTreeRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface UpdateFamilyTreeRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface FamilyTreeListResponse {
  trees: FamilyTree[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DeleteFamilyTreeResponse {
  success: boolean;
  message?: string;
}