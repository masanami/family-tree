export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    VALIDATE: '/auth/validate',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  
  // Family tree endpoints
  FAMILY_TREES: {
    BASE: '/api/family-trees',
    BY_ID: (id: string) => `/api/family-trees/${id}`,
    PERSONS: (treeId: string) => `/api/family-trees/${treeId}/persons`,
    MEMBERS: (id: string) => `/api/family-trees/${id}/members`,
    RELATIONSHIPS: (id: string) => `/api/v1/family-trees/${id}/relationships`,
  },

  // Person endpoints
  PERSONS: {
    BY_ID: (id: string) => `/api/persons/${id}`,
  },

  // Relationship endpoints
  RELATIONSHIPS: {
    BASE: (familyTreeId: string) => `/api/v1/family-trees/${familyTreeId}/relationships`,
    BY_ID: (familyTreeId: string, relationshipId: string) => `/api/v1/family-trees/${familyTreeId}/relationships/${relationshipId}`,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;