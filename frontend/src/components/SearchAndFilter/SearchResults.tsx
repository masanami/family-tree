import { useState, useMemo, useCallback, memo } from 'react';
import type { SearchResult, PersonSearchResult, SortField, SortOrder } from '../../types/search';
import { PersonCard } from './PersonCard';

interface SearchResultsProps {
  results: SearchResult<PersonSearchResult> | null;
  loading: boolean;
  error?: string | null;
  onPersonClick: (person: PersonSearchResult) => void;
  onSort: (field: SortField, order: SortOrder) => void;
  onLoadMore: () => void;
  onRetry?: () => void;
  onExport?: (format: string, data: PersonSearchResult[]) => void;
  currentSort?: { field: SortField; order: SortOrder };
  hasMore?: boolean;
  usePagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  highlightMatches?: boolean;
  showRelevanceScore?: boolean;
  showMatchedFields?: boolean;
  allowViewToggle?: boolean;
  allowCardSizeAdjust?: boolean;
  allowExport?: boolean;
}

export const SearchResults = memo<SearchResultsProps>(({
  results,
  loading,
  error,
  onPersonClick,
  onSort,
  onLoadMore,
  onRetry,
  onExport,
  currentSort,
  hasMore = false,
  usePagination = false,
  currentPage = 1,
  totalPages = 1,
  highlightMatches = false,
  showRelevanceScore = false,
  showMatchedFields = false,
  allowViewToggle = false,
  allowCardSizeAdjust = false,
  allowExport = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cardSize, setCardSize] = useState(200);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleSortChange = useCallback((field: SortField) => {
    const newOrder: SortOrder = 
      currentSort?.field === field && currentSort?.order === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  }, [currentSort, onSort]);

  const renderHighlightedText = useCallback((text: string, highlights?: any[]) => {
    if (!highlightMatches || !highlights) {
      return text;
    }

    // Simple highlighting implementation
    const parts = [];
    let lastIndex = 0;

    highlights.forEach((highlight, index) => {
      if (highlight.matches) {
        highlight.matches.forEach((match: any) => {
          if (match.start > lastIndex) {
            parts.push(text.slice(lastIndex, match.start));
          }
          parts.push(
            <span 
              key={`highlight-${index}-${match.start}`}
              className="bg-yellow-200 font-semibold"
              data-testid="search-highlight"
            >
              {match.text}
            </span>
          );
          lastIndex = match.end;
        });
      }
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  }, [highlightMatches]);

  const personCards = useMemo(() => {
    if (!results) return [];
    
    return results.items.map(person => {
      const highlights = results.highlights?.filter(h => h.itemId === person.id) || [];
      const highlightedText = highlights.length > 0 && highlightMatches
        ? renderHighlightedText(person.fullName, highlights)
        : undefined;
      
      return (
        <PersonCard
          key={person.id}
          person={person}
          onClick={onPersonClick}
          highlightedText={highlightedText}
          showRelevanceScore={showRelevanceScore}
          showMatchedFields={showMatchedFields}
          cardSize={allowCardSizeAdjust ? cardSize : undefined}
        />
      );
    });
  }, [results, renderHighlightedText, onPersonClick, showRelevanceScore, showMatchedFields, allowCardSizeAdjust, cardSize, highlightMatches]);

  const renderLoadingSkeleton = () => {
    return Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse" data-testid="person-card-skeleton">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    ));
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="text-gray-500 text-lg mb-2">検索結果が見つかりませんでした</div>
      <div className="text-gray-400">検索条件を変更してもう一度お試しください</div>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="text-red-600 text-lg mb-2">検索中にエラーが発生しました</div>
      <div className="text-gray-600 mb-4">{error}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          再試行
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (error) {
    return renderErrorState();
  }

  if (!results || results.items.length === 0) {
    return renderEmptyState();
  }

  return (
    <main role="main" className="space-y-4">
      {/* Search Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          「{results.searchQuery}」の検索結果: {results.filteredCount}件（全{results.totalCount}件中）
        </h2>
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          {allowViewToggle && (
            <div className="flex border border-gray-300 rounded">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                aria-label="グリッド表示"
              >
                グリッド
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                aria-label="リスト表示"
              >
                リスト
              </button>
            </div>
          )}

          {/* Export Button */}
          {allowExport && (
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              エクスポート
            </button>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-4">
        <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
          並び順
        </label>
        <select
          id="sort-select"
          onChange={(e) => handleSortChange(e.target.value as SortField)}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="relevance">関連度順</option>
          <option value="name">名前順</option>
          <option value="age">年齢順</option>
          <option value="birthDate">生年月日順</option>
        </select>
        {currentSort && (
          <span className="text-sm text-gray-500">
            {currentSort.order === 'asc' ? '↑' : '↓'}
          </span>
        )}

        {/* Card Size Adjuster */}
        {allowCardSizeAdjust && viewMode === 'grid' && (
          <div className="flex items-center space-x-2">
            <label htmlFor="card-size" className="text-sm text-gray-700">
              カードサイズ
            </label>
            <input
              id="card-size"
              type="range"
              min="150"
              max="300"
              value={cardSize}
              onChange={(e) => setCardSize(Number(e.target.value))}
              className="w-20"
            />
          </div>
        )}
      </div>

      {/* Results List */}
      <div
        className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1 list-view' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}
        role="list"
        data-testid="search-results-list"
      >
        {personCards}
      </div>

      {/* Pagination or Load More */}
      {usePagination ? (
        <div className="flex items-center justify-center space-x-4">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50">
            前へ
          </button>
          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages} ページ
          </span>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50">
            次へ
          </button>
        </div>
      ) : (
        hasMore && (
          <div className="text-center">
            <button
              onClick={onLoadMore}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              さらに読み込む
            </button>
          </div>
        )
      )}

      {/* Screen Reader Announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {results.filteredCount}件の検索結果が表示されています
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">エクスポート形式を選択</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onExport?.('csv', results.items);
                  setShowExportModal(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
              >
                CSV
              </button>
              <button
                onClick={() => {
                  onExport?.('excel', results.items);
                  setShowExportModal(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
              >
                Excel
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </main>
  );
});

SearchResults.displayName = 'SearchResults';