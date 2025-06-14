export interface SearchFilters {
  searchQuery: string;
  gender?: 'male' | 'female' | 'other' | 'all';
  ageRange?: {
    min?: number;
    max?: number;
  };
  birthDateRange?: {
    start?: string;
    end?: string;
  };
  isAlive?: boolean | 'all';
  hasProfileImage?: boolean | 'all';
  familyTreeId?: string;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  appliedFilters: SearchFilters;
  highlights: SearchHighlight[];
}

export interface SearchHighlight {
  itemId: string;
  field: string;
  matches: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface PersonSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  age?: number;
  isAlive: boolean;
  familyTreeId: string;
  relevanceScore: number;
  matchedFields: string[];
}

export interface SearchState {
  filters: SearchFilters;
  results: SearchResult<PersonSearchResult> | null;
  loading: boolean;
  error: string | null;
  recentSearches: string[];
  suggestions: string[];
}

export interface SearchOptions {
  includeDeceased: boolean;
  fuzzySearch: boolean;
  highlightMatches: boolean;
  sortBy: 'relevance' | 'name' | 'age' | 'birthDate';
  sortOrder: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Search field configuration
export interface SearchField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  searchable: boolean;
  filterable: boolean;
  weight: number; // for relevance scoring
}

export type SortableField = 'name' | 'age' | 'birthDate' | 'relevance';
export type SearchMode = 'simple' | 'advanced';
export type SortField = 'name' | 'age' | 'birthDate' | 'relevance';
export type SortOrder = 'asc' | 'desc';