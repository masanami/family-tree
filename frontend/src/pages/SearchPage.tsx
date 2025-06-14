import React, { useState, useCallback, useMemo } from 'react';
import { SearchBar, SearchFilters, SearchResults } from '../components/SearchAndFilter';
import { useSearch } from '../hooks/useSearch';
import type { SearchFilters as SearchFiltersType, PersonSearchResult, SortField, SortOrder } from '../types/search';

export const SearchPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    filters,
    results,
    loading,
    error,
    suggestions,
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
  } = useSearch();

  const handleSearchChange = useCallback((value: string) => {
    const newFilters = { ...filters, searchQuery: value };
    updateFilters(newFilters);
    
    if (value.trim()) {
      getSuggestions(value);
      search(value);
    } else {
      clearSuggestions();
      clearSearch();
    }
  }, [filters, updateFilters, getSuggestions, search, clearSuggestions, clearSearch]);

  // Memoize filter visibility to prevent unnecessary re-renders
  const hasActiveFilters = useMemo(() => {
    return (
      filters.gender !== 'all' || 
      filters.ageRange?.min !== undefined || 
      filters.ageRange?.max !== undefined ||
      filters.birthDateRange?.start ||
      filters.birthDateRange?.end ||
      filters.isAlive !== 'all' ||
      filters.hasProfileImage !== 'all'
    );
  }, [filters]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    search(suggestion);
    clearSuggestions();
  }, [search, clearSuggestions]);

  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    updateFilters(newFilters);
    searchWithFilters(newFilters);
  }, [updateFilters, searchWithFilters]);

  const handlePersonClick = useCallback((person: PersonSearchResult) => {
    console.log('Person clicked:', person);
    // TODO: Navigate to person detail page or open modal
  }, []);

  const handleSort = useCallback((field: SortField, order: SortOrder) => {
    sortResults(field, order);
  }, [sortResults]);

  const handleExport = useCallback((format: string, data: PersonSearchResult[]) => {
    console.log('Export requested:', format, data);
    // TODO: Implement export functionality
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            家族を検索
          </h1>
          <p className="text-gray-600">
            名前、年齢、その他の条件で家族メンバーを検索できます
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              value={filters.searchQuery}
              onChange={handleSearchChange}
              onSuggestionSelect={handleSuggestionSelect}
              suggestions={suggestions}
              loading={loading}
              placeholder="名前で検索..."
              autoFocus={true}
            />

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <svg 
                  className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>詳細フィルター</span>
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  フィルターをクリア
                </button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4 animate-fadeIn">
                <SearchFilters
                  filters={filters}
                  onFilterChange={handleFiltersChange}
                  onClear={clearFilters}
                  disabled={loading}
                  showAgePresets={true}
                  showDatePresets={true}
                  collapsible={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <SearchResults
            results={results}
            loading={loading}
            error={error}
            onPersonClick={handlePersonClick}
            onSort={handleSort}
            onLoadMore={loadMore}
            onRetry={retryLastSearch}
            onExport={handleExport}
            hasMore={results ? results.items.length < results.filteredCount : false}
            highlightMatches={true}
            showRelevanceScore={false}
            showMatchedFields={false}
            allowViewToggle={true}
            allowCardSizeAdjust={true}
            allowExport={true}
          />
        </div>
      </div>
    </div>
  );
};