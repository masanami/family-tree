import { useCallback, useRef, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchOptimizationOptions {
  debounceMs?: number;
  minSearchLength?: number;
  maxSuggestions?: number;
}

export function useSearchOptimization(
  searchQuery: string,
  onSearch: (query: string) => void,
  options: UseSearchOptimizationOptions = {}
) {
  const {
    debounceMs = 300,
    minSearchLength = 2,
    maxSuggestions = 10,
  } = options;

  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);
  const previousQueryRef = useRef<string>('');
  const searchCacheRef = useRef<Map<string, any>>(new Map());

  // Clear cache when it gets too large
  useEffect(() => {
    if (searchCacheRef.current.size > 100) {
      const entriesToKeep = Array.from(searchCacheRef.current.entries())
        .slice(-50); // Keep last 50 entries
      searchCacheRef.current = new Map(entriesToKeep);
    }
  }, [debouncedSearchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (
      debouncedSearchQuery.trim().length >= minSearchLength &&
      debouncedSearchQuery !== previousQueryRef.current
    ) {
      previousQueryRef.current = debouncedSearchQuery;
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, minSearchLength, onSearch]);

  const getCachedResult = useCallback((query: string) => {
    return searchCacheRef.current.get(query);
  }, []);

  const setCachedResult = useCallback((query: string, result: any) => {
    searchCacheRef.current.set(query, result);
  }, []);

  const clearCache = useCallback(() => {
    searchCacheRef.current.clear();
  }, []);

  const isQueryTooShort = searchQuery.trim().length < minSearchLength;

  return {
    debouncedSearchQuery,
    getCachedResult,
    setCachedResult,
    clearCache,
    isQueryTooShort,
    maxSuggestions,
  };
}