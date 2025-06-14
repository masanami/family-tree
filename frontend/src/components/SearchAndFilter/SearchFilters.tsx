import React, { useState } from 'react';
import type { SearchFilters as SearchFiltersType } from '../../types/search';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
  onClear: () => void;
  disabled?: boolean;
  compact?: boolean;
  collapsible?: boolean;
  showAgePresets?: boolean;
  showDatePresets?: boolean;
  confirmClear?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onClear,
  disabled = false,
  compact = false,
  collapsible = false,
  showAgePresets = false,
  showDatePresets = false,
  confirmClear = false,
}) => {
  const [collapsed, setCollapsed] = useState({
    age: false,
    date: false,
    other: false,
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
    
    // Announce changes to screen readers
    announceFilterChange(key, value);
  };

  const announceFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    
    let message = '';
    switch (key) {
      case 'gender':
        message = `性別フィルターが「${getGenderLabel(value)}」に設定されました`;
        break;
      case 'isAlive':
        message = `生存状況フィルターが「${getLivingStatusLabel(value)}」に設定されました`;
        break;
      default:
        message = `フィルターが更新されました`;
    }
    
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const getGenderLabel = (value: string) => {
    switch (value) {
      case 'male': return '男性';
      case 'female': return '女性';
      case 'other': return 'その他';
      default: return 'すべて';
    }
  };

  const getLivingStatusLabel = (value: string | boolean) => {
    if (value === true) return '存命';
    if (value === false) return '故人';
    return 'すべて';
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (filters.gender && filters.gender !== 'all') count++;
    if (filters.ageRange?.min !== undefined || filters.ageRange?.max !== undefined) count++;
    if (filters.birthDateRange?.start || filters.birthDateRange?.end) count++;
    if (filters.isAlive !== 'all') count++;
    if (filters.hasProfileImage !== 'all') count++;
    return count;
  };

  const handleAgeRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    const newAgeRange = { ...filters.ageRange, [type]: numValue };
    updateFilter('ageRange', newAgeRange);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const newDateRange = { ...filters.birthDateRange, [type]: value || undefined };
    updateFilter('birthDateRange', newDateRange);
  };

  const handleAgePreset = (min: number, max: number) => {
    updateFilter('ageRange', { min, max });
  };

  const handleDatePreset = (start: string, end: string) => {
    updateFilter('birthDateRange', { start, end });
  };

  const handleClearFilters = () => {
    if (confirmClear) {
      setShowClearConfirm(true);
    } else {
      onClear();
    }
  };

  const confirmClearFilters = () => {
    onClear();
    setShowClearConfirm(false);
  };

  const toggleSection = (section: 'age' | 'date' | 'other') => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const appliedCount = getAppliedFiltersCount();

  if (compact) {
    return (
      <div className="border border-gray-200 rounded-lg p-3" data-testid="filters-compact-mode">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">フィルター ({appliedCount})</span>
          {appliedCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              クリア
            </button>
          )}
        </div>
        {appliedCount > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {appliedCount}個のフィルターが適用されています
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">フィルター</h3>
        {appliedCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {appliedCount}個のフィルターが適用されています
            </span>
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded"
              disabled={disabled}
            >
              フィルターをクリア
            </button>
          </div>
        )}
      </div>

      {/* Gender Filter */}
      <div className="space-y-2">
        <label htmlFor="gender-filter" className="block text-sm font-medium text-gray-700">
          性別
        </label>
        <select
          id="gender-filter"
          value={filters.gender || 'all'}
          onChange={(e) => updateFilter('gender', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          aria-describedby="gender-help"
        >
          <option value="all">すべて</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
          <option value="other">その他</option>
        </select>
        <div id="gender-help" className="text-xs text-gray-500">
          性別でフィルタリング
        </div>
      </div>

      {/* Age Range Filter */}
      <div className="space-y-2">
        {collapsible && (
          <button
            onClick={() => toggleSection('age')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
          >
            年齢フィルター
            <span className="text-gray-400">
              {collapsed.age ? '▼' : '▲'}
            </span>
          </button>
        )}
        {(!collapsible || !collapsed.age) && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="min-age" className="block text-sm font-medium text-gray-700">
                  最小年齢
                </label>
                <input
                  id="min-age"
                  type="number"
                  min="0"
                  max="150"
                  value={filters.ageRange?.min || ''}
                  onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="max-age" className="block text-sm font-medium text-gray-700">
                  最大年齢
                </label>
                <input
                  id="max-age"
                  type="number"
                  min="0"
                  max="150"
                  value={filters.ageRange?.max || ''}
                  onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {filters.ageRange?.min !== undefined && filters.ageRange?.max !== undefined && 
             filters.ageRange.min > filters.ageRange.max && (
              <div className="text-red-600 text-sm">
                最小年齢は最大年齢以下である必要があります
              </div>
            )}
            {showAgePresets && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAgePreset(0, 17)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  子ども（0-17歳）
                </button>
                <button
                  onClick={() => handleAgePreset(18, 64)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  成人（18-64歳）
                </button>
                <button
                  onClick={() => handleAgePreset(65, 150)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  高齢者（65歳以上）
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Birth Date Range Filter */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="birth-start" className="block text-sm font-medium text-gray-700">
              生年月日（開始）
            </label>
            <input
              id="birth-start"
              type="date"
              value={filters.birthDateRange?.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="birth-end" className="block text-sm font-medium text-gray-700">
              生年月日（終了）
            </label>
            <input
              id="birth-end"
              type="date"
              value={filters.birthDateRange?.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {filters.birthDateRange?.start && filters.birthDateRange?.end && 
         filters.birthDateRange.start > filters.birthDateRange.end && (
          <div className="text-red-600 text-sm">
            開始日は終了日以前である必要があります
          </div>
        )}
        {showDatePresets && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDatePreset('1990-01-01', '1999-12-31')}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              1990年代
            </button>
            <button
              onClick={() => handleDatePreset('2000-01-01', '2009-12-31')}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              2000年代
            </button>
          </div>
        )}
      </div>

      {/* Living Status Filter */}
      <div className="space-y-2">
        <label htmlFor="living-filter" className="block text-sm font-medium text-gray-700">
          生存状況
        </label>
        <select
          id="living-filter"
          value={filters.isAlive === true ? 'true' : filters.isAlive === false ? 'false' : 'all'}
          onChange={(e) => {
            const value = e.target.value === 'true' ? true : e.target.value === 'false' ? false : 'all';
            updateFilter('isAlive', value);
          }}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">すべて</option>
          <option value="true">存命</option>
          <option value="false">故人</option>
        </select>
      </div>

      {/* Profile Image Filter */}
      <div className="space-y-2">
        <label htmlFor="image-filter" className="block text-sm font-medium text-gray-700">
          プロフィール写真
        </label>
        <select
          id="image-filter"
          value={filters.hasProfileImage === true ? 'true' : filters.hasProfileImage === false ? 'false' : 'all'}
          onChange={(e) => {
            const value = e.target.value === 'true' ? true : e.target.value === 'false' ? false : 'all';
            updateFilter('hasProfileImage', value);
          }}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">すべて</option>
          <option value="true">写真あり</option>
          <option value="false">写真なし</option>
        </select>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h4 className="text-lg font-semibold mb-2">フィルターをクリアしますか？</h4>
            <p className="text-gray-600 mb-4">設定されたフィルター条件がすべて削除されます。</p>
            <div className="flex space-x-3">
              <button
                onClick={confirmClearFilters}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                クリア
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};