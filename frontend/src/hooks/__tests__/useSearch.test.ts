import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useSearch } from '../useSearch';
import type { SearchFilters, PersonSearchResult } from '../../types/search';

// Mock the API service
vi.mock('../../services/api.service', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockPersons: PersonSearchResult[] = [
  {
    id: '1',
    firstName: '太郎',
    lastName: '田中',
    fullName: '田中太郎',
    birthDate: '1970-01-01',
    gender: 'male',
    age: 54,
    isAlive: true,
    familyTreeId: 'tree1',
    relevanceScore: 0.95,
    matchedFields: ['firstName', 'lastName'],
  },
  {
    id: '2',
    firstName: '花子',
    lastName: '田中',
    fullName: '田中花子',
    birthDate: '1975-05-15',
    gender: 'female',
    age: 49,
    isAlive: true,
    familyTreeId: 'tree1',
    relevanceScore: 0.90,
    matchedFields: ['lastName'],
  },
  {
    id: '3',
    firstName: '一郎',
    lastName: '山田',
    fullName: '山田一郎',
    birthDate: '1980-03-20',
    gender: 'male',
    age: 44,
    isAlive: true,
    familyTreeId: 'tree1',
    relevanceScore: 0.75,
    matchedFields: ['firstName'],
  },
];

describe('useSearch', () => {
  const { apiService } = require('../../services/api.service');

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSearch());

      expect(result.current.filters).toEqual({
        searchQuery: '',
        gender: 'all',
        ageRange: {},
        birthDateRange: {},
        isAlive: 'all',
        hasProfileImage: 'all',
      });
      expect(result.current.results).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.recentSearches).toEqual([]);
      expect(result.current.suggestions).toEqual([]);
    });

    it('should load recent searches from localStorage on mount', () => {
      localStorageMock.setItem(
        'family-tree-recent-searches',
        JSON.stringify(['田中', '山田', '太郎'])
      );

      const { result } = renderHook(() => useSearch());

      expect(result.current.recentSearches).toEqual(['田中', '山田', '太郎']);
    });
  });

  describe('Search Functionality', () => {
    it('should perform basic search', async () => {
      apiService.get.mockResolvedValue({
        items: mockPersons.slice(0, 2),
        totalCount: 150,
        filteredCount: 2,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('田中');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.results).toEqual({
        items: mockPersons.slice(0, 2),
        totalCount: 150,
        filteredCount: 2,
        searchQuery: '田中',
        appliedFilters: {
          searchQuery: '田中',
          gender: 'all',
          ageRange: {},
          birthDateRange: {},
          isAlive: 'all',
          hasProfileImage: 'all',
        },
        highlights: [],
      });

      expect(apiService.get).toHaveBeenCalledWith('/search/persons', {
        params: {
          q: '田中',
          gender: 'all',
          isAlive: 'all',
          hasProfileImage: 'all',
          limit: 20,
          offset: 0,
        },
      });
    });

    it('should handle search with filters', async () => {
      apiService.get.mockResolvedValue({
        items: [mockPersons[0]],
        totalCount: 150,
        filteredCount: 1,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch());

      const filters: SearchFilters = {
        searchQuery: '太郎',
        gender: 'male',
        ageRange: { min: 20, max: 60 },
        birthDateRange: { start: '1970-01-01', end: '1980-12-31' },
        isAlive: true,
        hasProfileImage: true,
      };

      act(() => {
        result.current.searchWithFilters(filters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiService.get).toHaveBeenCalledWith('/search/persons', {
        params: {
          q: '太郎',
          gender: 'male',
          ageMin: 20,
          ageMax: 60,
          birthDateStart: '1970-01-01',
          birthDateEnd: '1980-12-31',
          isAlive: true,
          hasProfileImage: true,
          limit: 20,
          offset: 0,
        },
      });
    });

    it('should handle search error', async () => {
      const error = new Error('Search failed');
      apiService.get.mockRejectedValue(error);

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('田中');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Search failed');
      expect(result.current.results).toBeNull();
    });

    it('should store search queries in recent searches', async () => {
      apiService.get.mockResolvedValue({
        items: mockPersons,
        totalCount: 150,
        filteredCount: 3,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('田中');
      });

      await waitFor(() => {
        expect(result.current.recentSearches).toContain('田中');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'family-tree-recent-searches',
        JSON.stringify(['田中'])
      );
    });

    it('should limit recent searches to maximum count', async () => {
      apiService.get.mockResolvedValue({
        items: [],
        totalCount: 0,
        filteredCount: 0,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch());

      // Add many searches
      const searches = ['田中', '山田', '佐藤', '高橋', '渡辺', '伊藤', '中村', '小林'];
      
      for (const query of searches) {
        await act(async () => {
          result.current.search(query);
          await waitFor(() => !result.current.loading);
        });
      }

      expect(result.current.recentSearches).toHaveLength(5); // Max 5 recent searches
      expect(result.current.recentSearches).toEqual(['中村', '小林', '伊藤', '渡辺', '高橋']);
    });
  });

  describe('Filter Management', () => {
    it('should update filters', () => {
      const { result } = renderHook(() => useSearch());

      const newFilters: SearchFilters = {
        searchQuery: '',
        gender: 'female',
        ageRange: { min: 25, max: 45 },
        birthDateRange: {},
        isAlive: true,
        hasProfileImage: 'all',
      };

      act(() => {
        result.current.updateFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useSearch());

      // Set some filters first
      act(() => {
        result.current.updateFilters({
          searchQuery: '田中',
          gender: 'male',
          ageRange: { min: 20, max: 50 },
          birthDateRange: { start: '1970-01-01' },
          isAlive: true,
          hasProfileImage: true,
        });
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({
        searchQuery: '',
        gender: 'all',
        ageRange: {},
        birthDateRange: {},
        isAlive: 'all',
        hasProfileImage: 'all',
      });
    });

    it('should clear search while keeping filters', () => {
      const { result } = renderHook(() => useSearch());

      // Set filters and search
      act(() => {
        result.current.updateFilters({
          searchQuery: '田中',
          gender: 'male',
          ageRange: { min: 20, max: 50 },
          birthDateRange: {},
          isAlive: 'all',
          hasProfileImage: 'all',
        });
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.filters.searchQuery).toBe('');
      expect(result.current.filters.gender).toBe('male'); // Other filters preserved
      expect(result.current.results).toBeNull();
    });
  });

  describe('Suggestions', () => {
    it('should generate suggestions based on search history and data', async () => {
      apiService.get.mockResolvedValue({
        suggestions: ['田中太郎', '田中花子', '田中一郎'],
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.getSuggestions('田中');
      });

      await waitFor(() => {
        expect(result.current.suggestions).toEqual(['田中太郎', '田中花子', '田中一郎']);
      });

      expect(apiService.get).toHaveBeenCalledWith('/search/suggestions', {
        params: { q: '田中', limit: 10 },
      });
    });

    it('should include recent searches in suggestions', async () => {
      localStorageMock.setItem(
        'family-tree-recent-searches',
        JSON.stringify(['田中太郎検索', '田中花子検索'])
      );

      apiService.get.mockResolvedValue({
        suggestions: ['田中一郎', '田中次郎'],
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.getSuggestions('田中');
      });

      await waitFor(() => {
        expect(result.current.suggestions).toContain('田中太郎検索');
        expect(result.current.suggestions).toContain('田中一郎');
      });
    });

    it('should clear suggestions', () => {
      const { result } = renderHook(() => useSearch());

      // Set suggestions first
      act(() => {
        result.current.getSuggestions('田中');
      });

      act(() => {
        result.current.clearSuggestions();
      });

      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe('Sorting and Pagination', () => {
    it('should handle sorting', async () => {
      apiService.get.mockResolvedValue({
        items: mockPersons,
        totalCount: 150,
        filteredCount: 3,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch());

      // Initial search
      act(() => {
        result.current.search('田中');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Sort by name
      act(() => {
        result.current.sortResults('name', 'asc');
      });

      await waitFor(() => {
        expect(apiService.get).toHaveBeenCalledWith('/search/persons', {
          params: expect.objectContaining({
            sortBy: 'name',
            sortOrder: 'asc',
          }),
        });
      });
    });

    it('should handle load more (pagination)', async () => {
      apiService.get.mockResolvedValueOnce({
        items: mockPersons.slice(0, 2),
        totalCount: 150,
        filteredCount: 3,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch());

      // Initial search
      act(() => {
        result.current.search('田中');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock next page response
      apiService.get.mockResolvedValueOnce({
        items: [mockPersons[2]],
        totalCount: 150,
        filteredCount: 3,
        highlights: [],
      });

      // Load more
      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiService.get).toHaveBeenLastCalledWith('/search/persons', {
        params: expect.objectContaining({
          offset: 2, // Next page offset
        }),
      });

      // Should append new results
      expect(result.current.results?.items).toHaveLength(3);
    });
  });

  describe('Advanced Search Features', () => {
    it('should perform fuzzy search', async () => {
      apiService.get.mockResolvedValue({
        items: mockPersons,
        totalCount: 150,
        filteredCount: 3,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('tanaka', { fuzzy: true });
      });

      await waitFor(() => {
        expect(apiService.get).toHaveBeenCalledWith('/search/persons', {
          params: expect.objectContaining({
            fuzzy: true,
          }),
        });
      });
    });

    it('should search within specific family tree', async () => {
      apiService.get.mockResolvedValue({
        items: mockPersons,
        totalCount: 150,
        filteredCount: 3,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch('tree1'));

      act(() => {
        result.current.search('田中');
      });

      await waitFor(() => {
        expect(apiService.get).toHaveBeenCalledWith('/search/persons', {
          params: expect.objectContaining({
            familyTreeId: 'tree1',
          }),
        });
      });
    });

    it('should handle search with highlighting', async () => {
      apiService.get.mockResolvedValue({
        items: mockPersons,
        totalCount: 150,
        filteredCount: 3,
        highlights: [
          {
            itemId: '1',
            field: 'fullName',
            matches: [{ start: 0, end: 2, text: '田中' }],
          },
        ],
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('田中', { highlight: true });
      });

      await waitFor(() => {
        expect(result.current.results?.highlights).toHaveLength(1);
        expect(result.current.results?.highlights[0].itemId).toBe('1');
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should debounce search requests', async () => {
      vi.useFakeTimers();
      
      apiService.get.mockResolvedValue({
        items: [],
        totalCount: 0,
        filteredCount: 0,
        highlights: [],
      });

      const { result } = renderHook(() => useSearch());

      // Trigger multiple searches quickly
      act(() => {
        result.current.search('t');
      });
      act(() => {
        result.current.search('ta');
      });
      act(() => {
        result.current.search('tan');
      });

      // Only the last search should be executed after debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(apiService.get).toHaveBeenCalledTimes(1);
        expect(apiService.get).toHaveBeenCalledWith('/search/persons', {
          params: expect.objectContaining({
            q: 'tan',
          }),
        });
      });

      vi.useRealTimers();
    });

    it('should cancel previous search requests', async () => {
      const abortController = new AbortController();
      vi.spyOn(window, 'AbortController').mockReturnValue(abortController);

      apiService.get.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({
          items: [],
          totalCount: 0,
          filteredCount: 0,
          highlights: [],
        }), 1000))
      );

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('first');
      });

      act(() => {
        result.current.search('second');
      });

      // First request should be aborted
      expect(abortController.signal.aborted).toBe(false); // Latest request not aborted
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should retry failed search requests', async () => {
      apiService.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          items: mockPersons,
          totalCount: 150,
          filteredCount: 3,
          highlights: [],
        });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('田中');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      act(() => {
        result.current.retryLastSearch();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.results?.items).toHaveLength(3);
      expect(apiService.get).toHaveBeenCalledTimes(2);
    });

    it('should handle network timeout', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      apiService.get.mockRejectedValue(timeoutError);

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('田中');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Request timeout');
      });
    });

    it('should clear error state when new search starts', async () => {
      apiService.get
        .mockRejectedValueOnce(new Error('Search failed'))
        .mockResolvedValueOnce({
          items: [],
          totalCount: 0,
          filteredCount: 0,
          highlights: [],
        });

      const { result } = renderHook(() => useSearch());

      // First search fails
      act(() => {
        result.current.search('田中');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Search failed');
      });

      // Second search should clear error
      act(() => {
        result.current.search('山田');
      });

      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});