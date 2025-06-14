import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import type { SearchFilters } from '../../types/search';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  showClearButton?: boolean;
  debounceMs?: number;
  maxLength?: number;
  autoFocus?: boolean;
}

export const SearchBar = memo<SearchBarProps>(({
  value,
  onChange,
  onSearch,
  placeholder = '人を検索...',
  disabled = false,
  loading = false,
  suggestions = [],
  onSuggestionSelect,
  showClearButton = true,
  maxLength = 100,
  autoFocus = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionRefs.current[selectedSuggestionIndex]) {
      suggestionRefs.current[selectedSuggestionIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedSuggestionIndex]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  }, [onChange, suggestions.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && onSearch) {
        e.preventDefault();
        onSearch(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else if (onSearch) {
          onSearch(value);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, onSearch, value]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onChange(suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  }, [onChange, onSuggestionSelect]);

  const handleClear = useCallback(() => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    if (value.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [value, suggestions.length]);

  const handleInputBlur = useCallback(() => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 150);
  }, []);

  return (
    <div className="relative w-full" data-testid="search-bar">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="検索"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={showSuggestions ? "search-suggestions" : undefined}
          data-testid="search-input"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center" data-testid="loading-spinner">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" aria-label="検索中"></div>
          </div>
        )}

        {/* Clear Button */}
        {showClearButton && value && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            data-testid="clear-button"
            aria-label="検索をクリア"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-label="検索候補"
          data-testid="suggestions-list"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`suggestion-${index}`}
              ref={el => { suggestionRefs.current[index] = el; }}
              className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${
                index === selectedSuggestionIndex 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === selectedSuggestionIndex}
              data-testid={`suggestion-${index}`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';