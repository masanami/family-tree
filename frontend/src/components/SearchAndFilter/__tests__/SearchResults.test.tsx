import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SearchResults } from '../SearchResults';
import type { SearchResult, PersonSearchResult } from '../../../types/search';

// Mock the hooks
vi.mock('../../../hooks/useSearch', () => ({
  useSearch: vi.fn(),
}));

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
    profileImage: 'https://example.com/profile1.jpg',
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
    lastName: '田中',
    fullName: '田中一郎',
    birthDate: '2000-03-20',
    deathDate: '2020-01-01',
    gender: 'male',
    age: 20,
    isAlive: false,
    familyTreeId: 'tree1',
    relevanceScore: 0.85,
    matchedFields: ['lastName'],
  },
];

const mockSearchResult: SearchResult<PersonSearchResult> = {
  items: mockPersons,
  totalCount: 150,
  filteredCount: 3,
  searchQuery: '田中',
  appliedFilters: {
    searchQuery: '田中',
    gender: 'all',
    ageRange: {},
    birthDateRange: {},
    isAlive: 'all',
    hasProfileImage: 'all',
  },
  highlights: [
    {
      itemId: '1',
      field: 'fullName',
      matches: [
        { start: 0, end: 2, text: '田中' },
      ],
    },
    {
      itemId: '2',
      field: 'fullName',
      matches: [
        { start: 0, end: 2, text: '田中' },
      ],
    },
  ],
};

describe('SearchResults', () => {
  const mockOnPersonClick = vi.fn();
  const mockOnSort = vi.fn();
  const mockOnLoadMore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render search results list', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('田中花子')).toBeInTheDocument();
      expect(screen.getByText('田中一郎')).toBeInTheDocument();
    });

    it('should show search summary', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('「田中」の検索結果: 3件（全150件中）')).toBeInTheDocument();
    });

    it('should render person cards with correct information', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      // Check first person details
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('1970年1月1日生まれ')).toBeInTheDocument();
      expect(screen.getByText('54歳')).toBeInTheDocument();
      expect(screen.getByText('男性')).toBeInTheDocument();

      // Check profile image
      const profileImage = screen.getByAltText('田中太郎');
      expect(profileImage).toHaveAttribute('src', mockPersons[0].profileImage);
    });

    it('should show deceased indicator for non-living persons', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('故人')).toBeInTheDocument();
      expect(screen.getByText('2020年1月1日逝去')).toBeInTheDocument();
    });

    it('should handle persons without profile images', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      // Second person has no profile image
      const defaultImages = screen.getAllByAltText(/田中花子|田中一郎/);
      expect(defaultImages.some(img => 
        img.getAttribute('src')?.includes('default') || 
        img.getAttribute('src')?.includes('placeholder')
      )).toBe(true);
    });
  });

  describe('Search Highlighting', () => {
    it('should highlight search matches in person names', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          highlightMatches={true}
        />
      );

      const highlightedElements = screen.getAllByTestId('search-highlight');
      expect(highlightedElements.length).toBeGreaterThan(0);
      expect(highlightedElements[0]).toHaveTextContent('田中');
      expect(highlightedElements[0]).toHaveClass('bg-yellow-200');
    });

    it('should show relevance scores when enabled', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          showRelevanceScore={true}
        />
      );

      expect(screen.getByText('関連度: 95%')).toBeInTheDocument();
      expect(screen.getByText('関連度: 90%')).toBeInTheDocument();
      expect(screen.getByText('関連度: 85%')).toBeInTheDocument();
    });

    it('should show matched fields when enabled', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          showMatchedFields={true}
        />
      );

      expect(screen.getByText('マッチ: 名前, 苗字')).toBeInTheDocument();
      expect(screen.getByText('マッチ: 苗字')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('should render sort options', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByLabelText('並び順')).toBeInTheDocument();
      const sortSelect = screen.getByLabelText('並び順');
      expect(sortSelect).toContainHTML('<option value="relevance">関連度順</option>');
      expect(sortSelect).toContainHTML('<option value="name">名前順</option>');
      expect(sortSelect).toContainHTML('<option value="age">年齢順</option>');
      expect(sortSelect).toContainHTML('<option value="birthDate">生年月日順</option>');
    });

    it('should handle sort change', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      const sortSelect = screen.getByLabelText('並び順');
      await user.selectOptions(sortSelect, 'name');

      expect(mockOnSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should toggle sort order when same field is selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          currentSort={{ field: 'name', order: 'asc' }}
        />
      );

      const sortSelect = screen.getByLabelText('並び順');
      await user.selectOptions(sortSelect, 'name');

      expect(mockOnSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should show sort order indicator', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          currentSort={{ field: 'name', order: 'asc' }}
        />
      );

      expect(screen.getByText('↑')).toBeInTheDocument(); // Ascending indicator
    });
  });

  describe('Person Interaction', () => {
    it('should handle person card click', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      const personCard = screen.getByTestId('person-card-1');
      await user.click(personCard);

      expect(mockOnPersonClick).toHaveBeenCalledWith(mockPersons[0]);
    });

    it('should handle keyboard navigation on person cards', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      const personCard = screen.getByTestId('person-card-1');
      personCard.focus();
      await user.keyboard('{Enter}');

      expect(mockOnPersonClick).toHaveBeenCalledWith(mockPersons[0]);
    });

    it('should show hover effects on person cards', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      const personCard = screen.getByTestId('person-card-1');
      await user.hover(personCard);

      expect(personCard).toHaveClass('hover:shadow-lg');
    });
  });

  describe('Pagination and Load More', () => {
    it('should show load more button when more results available', () => {
      const resultWithMore = {
        ...mockSearchResult,
        filteredCount: 3,
        totalCount: 10,
      };

      render(
        <SearchResults
          results={resultWithMore}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          hasMore={true}
        />
      );

      expect(screen.getByText('さらに読み込む')).toBeInTheDocument();
    });

    it('should handle load more click', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          hasMore={true}
        />
      );

      const loadMoreButton = screen.getByText('さらに読み込む');
      await user.click(loadMoreButton);

      expect(mockOnLoadMore).toHaveBeenCalled();
    });

    it('should not show load more button when no more results', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          hasMore={false}
        />
      );

      expect(screen.queryByText('さらに読み込む')).not.toBeInTheDocument();
    });

    it('should show pagination when enabled', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          usePagination={true}
          currentPage={1}
          totalPages={5}
        />
      );

      expect(screen.getByText('1 / 5 ページ')).toBeInTheDocument();
      expect(screen.getByText('前へ')).toBeInTheDocument();
      expect(screen.getByText('次へ')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading skeleton when loading', () => {
      render(
        <SearchResults
          results={null}
          loading={true}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getAllByTestId('person-card-skeleton')).toHaveLength(6);
    });

    it('should show empty state when no results', () => {
      const emptyResult = {
        ...mockSearchResult,
        items: [],
        filteredCount: 0,
      };

      render(
        <SearchResults
          results={emptyResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument();
      expect(screen.getByText('検索条件を変更してもう一度お試しください')).toBeInTheDocument();
    });

    it('should show error state when error occurs', () => {
      render(
        <SearchResults
          results={null}
          loading={false}
          error="Failed to search"
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('検索中にエラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('Failed to search')).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });
  });

  describe('View Options', () => {
    it('should toggle between grid and list view', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          allowViewToggle={true}
        />
      );

      const listViewButton = screen.getByLabelText('リスト表示');
      await user.click(listViewButton);

      expect(screen.getByTestId('search-results-list')).toHaveClass('list-view');
    });

    it('should adjust card size in grid view', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          allowCardSizeAdjust={true}
        />
      );

      const sizeSlider = screen.getByLabelText('カードサイズ');
      fireEvent.change(sizeSlider, { target: { value: '150' } });

      const personCards = screen.getAllByTestId(/person-card-/);
      expect(personCards[0]).toHaveStyle({ width: '150px' });
    });
  });

  describe('Export Functionality', () => {
    it('should show export button when enabled', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          allowExport={true}
        />
      );

      expect(screen.getByText('エクスポート')).toBeInTheDocument();
    });

    it('should handle export functionality', async () => {
      const mockOnExport = vi.fn();
      const user = userEvent.setup();
      
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
          allowExport={true}
          onExport={mockOnExport}
        />
      );

      const exportButton = screen.getByText('エクスポート');
      await user.click(exportButton);

      expect(screen.getByText('エクスポート形式を選択')).toBeInTheDocument();
      
      const csvOption = screen.getByText('CSV');
      await user.click(csvOption);

      expect(mockOnExport).toHaveBeenCalledWith('csv', mockSearchResult.items);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
      
      listItems.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should announce search results to screen readers', () => {
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByRole('status')).toHaveTextContent('3件の検索結果が表示されています');
    });

    it('should support keyboard navigation between results', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          results={mockSearchResult}
          loading={false}
          onPersonClick={mockOnPersonClick}
          onSort={mockOnSort}
          onLoadMore={mockOnLoadMore}
        />
      );

      const firstCard = screen.getByTestId('person-card-1');
      firstCard.focus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('person-card-2')).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('person-card-3')).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByTestId('person-card-2')).toHaveFocus();
    });
  });
});