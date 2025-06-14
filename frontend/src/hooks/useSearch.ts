import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api.service';
import type { 
  SearchFilters, 
  SearchResult, 
  PersonSearchResult, 
  SortField, 
  SortOrder 
} from '../types/search';

interface UseSearchOptions {
  familyTreeId?: string;
  debounceMs?: number;
  maxRecentSearches?: number;
}

interface SearchOptions {
  fuzzy?: boolean;
  highlight?: boolean;
}

export const useSearch = (familyTreeId?: string, options: UseSearchOptions = {}) => {
  const {
    debounceMs = 300,
    maxRecentSearches = 5,
  } = options;

  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    gender: 'all',
    ageRange: {},
    birthDateRange: {},
    isAlive: 'all',
    hasProfileImage: 'all',
  });

  const [results, setResults] = useState<SearchResult<PersonSearchResult> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('family-tree-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    localStorage.setItem('family-tree-recent-searches', JSON.stringify(searches));
  }, []);

  // Add to recent searches
  const addToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== query);
      const updated = [query, ...filtered].slice(0, maxRecentSearches);
      saveRecentSearches(updated);
      return updated;
    });
  }, [maxRecentSearches, saveRecentSearches]);

  // Build search parameters
  const buildSearchParams = useCallback((searchFilters: SearchFilters, searchOptions: SearchOptions = {}) => {
    const params: any = {
      q: searchFilters.searchQuery,
      limit: 20,
      offset: 0,
    };

    if (familyTreeId) {
      params.familyTreeId = familyTreeId;
    }

    if (searchFilters.gender && searchFilters.gender !== 'all') {
      params.gender = searchFilters.gender;
    } else {
      params.gender = 'all';
    }

    if (searchFilters.ageRange?.min !== undefined) {
      params.ageMin = searchFilters.ageRange.min;
    }

    if (searchFilters.ageRange?.max !== undefined) {
      params.ageMax = searchFilters.ageRange.max;
    }

    if (searchFilters.birthDateRange?.start) {
      params.birthDateStart = searchFilters.birthDateRange.start;
    }

    if (searchFilters.birthDateRange?.end) {
      params.birthDateEnd = searchFilters.birthDateRange.end;
    }

    if (searchFilters.isAlive !== 'all') {
      params.isAlive = searchFilters.isAlive;
    } else {
      params.isAlive = 'all';
    }

    if (searchFilters.hasProfileImage !== 'all') {
      params.hasProfileImage = searchFilters.hasProfileImage;
    } else {
      params.hasProfileImage = 'all';
    }

    if (searchOptions.fuzzy) {
      params.fuzzy = true;
    }

    if (searchOptions.highlight) {
      params.highlight = true;
    }

    return params;
  }, [familyTreeId]);

  // Perform search
  const performSearch = useCallback(async (searchFilters: SearchFilters, searchOptions: SearchOptions = {}) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const params = buildSearchParams(searchFilters, searchOptions);
      setLastSearchParams(params);

      const response = await apiService.get<any>('/search/persons', {
        params,
        signal: abortControllerRef.current.signal,
      });

      const result: SearchResult<PersonSearchResult> = {
        items: response.items,
        totalCount: response.totalCount,
        filteredCount: response.filteredCount,
        searchQuery: searchFilters.searchQuery,
        appliedFilters: searchFilters,
        highlights: response.highlights || [],
      };

      setResults(result);
      
      // Add to recent searches if there was a query
      if (searchFilters.searchQuery.trim()) {
        addToRecentSearches(searchFilters.searchQuery);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams, addToRecentSearches]);

  // Debounced search
  const debouncedSearch = useCallback((searchFilters: SearchFilters, searchOptions: SearchOptions = {}) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchFilters, searchOptions);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  // Public search method
  const search = useCallback((query: string, searchOptions: SearchOptions = {}) => {
    const searchFilters = { ...filters, searchQuery: query };
    setFilters(searchFilters);
    debouncedSearch(searchFilters, searchOptions);
  }, [filters, debouncedSearch]);

  // Search with filters
  const searchWithFilters = useCallback((searchFilters: SearchFilters, searchOptions: SearchOptions = {}) => {
    setFilters(searchFilters);
    performSearch(searchFilters, searchOptions);
  }, [performSearch]);

  // Update filters
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    const defaultFilters: SearchFilters = {
      searchQuery: '',
      gender: 'all',
      ageRange: {},
      birthDateRange: {},
      isAlive: 'all',
      hasProfileImage: 'all',
    };
    setFilters(defaultFilters);
    setResults(null);
  }, []);

  // Clear search (keep filters)
  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
    setResults(null);
  }, []);

  // Sort results
  const sortResults = useCallback(async (field: SortField, order: SortOrder) => {
    if (!lastSearchParams) return;

    const params = {
      ...lastSearchParams,
      sortBy: field,
      sortOrder: order,
    };

    setLoading(true);
    try {
      const response = await apiService.get<any>('/search/persons', { params });
      
      if (results) {
        setResults(prev => prev ? {
          ...prev,
          items: response.items,
        } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Sort failed');
    } finally {
      setLoading(false);
    }
  }, [lastSearchParams, results]);

  // Load more results (pagination)
  const loadMore = useCallback(async () => {
    if (!lastSearchParams || !results) return;

    const params = {
      ...lastSearchParams,
      offset: results.items.length,
    };

    setLoading(true);
    try {
      const response = await apiService.get<any>('/search/persons', { params });
      
      setResults(prev => prev ? {
        ...prev,
        items: [...prev.items, ...response.items],
      } : null);
    } catch (err: any) {
      setError(err.message || 'Load more failed');
    } finally {
      setLoading(false);
    }
  }, [lastSearchParams, results]);

  // Get suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await apiService.get<any>('/search/suggestions', {
        params: { q: query, limit: 10 },
      });

      // Combine API suggestions with relevant recent searches
      const relevantRecent = recentSearches.filter(search => 
        search.toLowerCase().includes(query.toLowerCase())
      );

      const combined = [...relevantRecent, ...response.suggestions]
        .filter((item, index, arr) => arr.indexOf(item) === index) // Remove duplicates
        .slice(0, 10);

      setSuggestions(combined);
    } catch (err) {
      // Fallback to recent searches only
      const relevantRecent = recentSearches.filter(search => 
        search.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(relevantRecent.slice(0, 5));
    }
  }, [recentSearches]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Retry last search
  const retryLastSearch = useCallback(() => {
    if (lastSearchParams) {
      performSearch(filters);
    }
  }, [lastSearchParams, filters, performSearch]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    filters,
    results,
    loading,
    error,
    recentSearches,
    suggestions,

    // Actions
    search,
    searchWithFilters,
    updateFilters,
    clearFilters,
    clearSearch,
    sortResults,
    loadMore,
    getSuggestions,
    clearSuggestions,
    retryLastSearch,
  };
};