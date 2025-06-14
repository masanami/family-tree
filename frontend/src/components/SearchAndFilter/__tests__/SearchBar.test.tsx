import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SearchBar } from '../SearchBar';
import type { SearchFilters } from '../../../types/search';

// Mock the hooks
vi.mock('../../../hooks/useSearch', () => ({
  useSearch: vi.fn(),
}));

vi.mock('../../../hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value),
}));

describe('SearchBar', () => {
  const mockUseSearch = {
    filters: {
      searchQuery: '',
      gender: 'all',
      ageRange: {},
      birthDateRange: {},
      isAlive: 'all',
      hasProfileImage: 'all',
    } as SearchFilters,
    results: null,
    loading: false,
    error: null,
    recentSearches: ['田中', '山田太郎', '1990'],
    suggestions: ['田中太郎', '田中花子', '田中一郎'],
    search: vi.fn(),
    updateFilters: vi.fn(),
    clearSearch: vi.fn(),
    clearFilters: vi.fn(),
  };

  const mockOnSearch = vi.fn();
  const mockOnFilterChange = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const { useSearch } = require('../../../hooks/useSearch');
    useSearch.mockReturnValue(mockUseSearch);
  });

  describe('Basic Rendering', () => {
    it('should render search input field', () => {
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByPlaceholderText('名前で検索...')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render search button', () => {
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
    });

    it('should render clear button when search query exists', () => {
      mockUseSearch.filters.searchQuery = '田中';
      
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByRole('button', { name: 'クリア' })).toBeInTheDocument();
    });

    it('should not render clear button when search query is empty', () => {
      mockUseSearch.filters.searchQuery = '';
      
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.queryByRole('button', { name: 'クリア' })).not.toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('should handle search input changes', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.type(searchInput, '田中');

      expect(searchInput).toHaveValue('田中');
    });

    it('should call onSearch when search button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      const searchButton = screen.getByRole('button', { name: '検索' });

      await user.type(searchInput, '田中');
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledWith('田中');
    });

    it('should call onSearch when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.type(searchInput, '田中');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('田中');
    });

    it('should handle search input with debounced auto-search', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          autoSearch={true}
          debounceMs={300}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.type(searchInput, '田中');

      // Should trigger auto-search after debounce
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('田中');
      }, { timeout: 500 });
    });
  });

  describe('Search Suggestions', () => {
    it('should show suggestions dropdown when input is focused', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showSuggestions={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.click(searchInput);

      expect(screen.getByTestId('suggestions-dropdown')).toBeInTheDocument();
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('田中花子')).toBeInTheDocument();
      expect(screen.getByText('田中一郎')).toBeInTheDocument();
    });

    it('should filter suggestions based on input', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showSuggestions={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.type(searchInput, '花');

      expect(screen.getByText('田中花子')).toBeInTheDocument();
      expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
    });

    it('should select suggestion when clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showSuggestions={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.click(searchInput);

      const suggestion = screen.getByText('田中太郎');
      await user.click(suggestion);

      expect(searchInput).toHaveValue('田中太郎');
      expect(mockOnSearch).toHaveBeenCalledWith('田中太郎');
    });

    it('should navigate suggestions with keyboard', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showSuggestions={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.click(searchInput);

      // Navigate down
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('田中太郎')).toHaveClass('bg-blue-50');

      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('田中花子')).toHaveClass('bg-blue-50');

      // Navigate up
      await user.keyboard('{ArrowUp}');
      expect(screen.getByText('田中太郎')).toHaveClass('bg-blue-50');

      // Select with Enter
      await user.keyboard('{Enter}');
      expect(searchInput).toHaveValue('田中太郎');
    });
  });

  describe('Recent Searches', () => {
    it('should show recent searches when enabled', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showRecentSearches={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.click(searchInput);

      expect(screen.getByText('最近の検索')).toBeInTheDocument();
      expect(screen.getByText('田中')).toBeInTheDocument();
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('1990')).toBeInTheDocument();
    });

    it('should select recent search when clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showRecentSearches={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.click(searchInput);

      const recentSearch = screen.getByText('田中');
      await user.click(recentSearch);

      expect(searchInput).toHaveValue('田中');
      expect(mockOnSearch).toHaveBeenCalledWith('田中');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearch.filters.searchQuery = '田中';
      
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const clearButton = screen.getByRole('button', { name: 'クリア' });
      await user.click(clearButton);

      expect(mockOnClear).toHaveBeenCalled();
    });

    it('should clear search with Escape key', async () => {
      const user = userEvent.setup();
      mockUseSearch.filters.searchQuery = '田中';
      
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      searchInput.focus();
      await user.keyboard('{Escape}');

      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading indicator when searching', () => {
      mockUseSearch.loading = true;
      
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByTestId('search-loading')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '検索' })).toBeDisabled();
    });

    it('should show error message when search fails', () => {
      mockUseSearch.error = 'Failed to search';
      
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Failed to search')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Advanced Search Toggle', () => {
    it('should toggle advanced search mode', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showAdvancedToggle={true}
        />
      );

      const advancedToggle = screen.getByText('詳細検索');
      await user.click(advancedToggle);

      expect(screen.getByText('基本検索')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-search-panel')).toBeInTheDocument();
    });

    it('should show advanced search filters when enabled', async () => {
      const user = userEvent.setup();
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showAdvancedToggle={true}
          defaultAdvanced={true}
        />
      );

      expect(screen.getByTestId('advanced-search-panel')).toBeInTheDocument();
      expect(screen.getByLabelText('性別')).toBeInTheDocument();
      expect(screen.getByLabelText('年齢範囲')).toBeInTheDocument();
      expect(screen.getByLabelText('生年月日範囲')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      expect(searchInput).toHaveAttribute('role', 'searchbox');
      expect(searchInput).toHaveAttribute('aria-label', '人物名検索');

      const searchButton = screen.getByRole('button', { name: '検索' });
      expect(searchButton).toHaveAttribute('type', 'submit');
    });

    it('should announce search results to screen readers', async () => {
      const user = userEvent.setup();
      mockUseSearch.results = {
        items: [],
        totalCount: 5,
        filteredCount: 5,
        searchQuery: '田中',
        appliedFilters: mockUseSearch.filters,
        highlights: [],
      };

      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      await user.type(searchInput, '田中');
      await user.keyboard('{Enter}');

      expect(screen.getByRole('status')).toHaveTextContent('5件の検索結果が見つかりました');
    });

    it('should support keyboard navigation for suggestions', () => {
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showSuggestions={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('名前で検索...');
      expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
      expect(searchInput).toHaveAttribute('aria-expanded', 'false');
    });
  });
});