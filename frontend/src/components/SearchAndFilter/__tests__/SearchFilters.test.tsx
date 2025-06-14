import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SearchFilters } from '../SearchFilters';
import type { SearchFilters as SearchFiltersType } from '../../../types/search';

describe('SearchFilters', () => {
  const defaultFilters: SearchFiltersType = {
    searchQuery: '',
    gender: 'all',
    ageRange: {},
    birthDateRange: {},
    isAlive: 'all',
    hasProfileImage: 'all',
  };

  const mockOnFilterChange = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render all filter controls', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByLabelText('性別')).toBeInTheDocument();
      expect(screen.getByLabelText('最小年齢')).toBeInTheDocument();
      expect(screen.getByLabelText('最大年齢')).toBeInTheDocument();
      expect(screen.getByLabelText('生年月日（開始）')).toBeInTheDocument();
      expect(screen.getByLabelText('生年月日（終了）')).toBeInTheDocument();
      expect(screen.getByLabelText('生存状況')).toBeInTheDocument();
      expect(screen.getByLabelText('プロフィール写真')).toBeInTheDocument();
    });

    it('should render clear filters button', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('フィルターをクリア')).toBeInTheDocument();
    });

    it('should show applied filters count', () => {
      const filtersWithValues: SearchFiltersType = {
        ...defaultFilters,
        gender: 'male',
        ageRange: { min: 20, max: 50 },
        isAlive: true,
      };

      render(
        <SearchFilters
          filters={filtersWithValues}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('3個のフィルターが適用されています')).toBeInTheDocument();
    });
  });

  describe('Gender Filter', () => {
    it('should handle gender filter change', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const genderSelect = screen.getByLabelText('性別');
      await user.selectOptions(genderSelect, 'male');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        gender: 'male',
      });
    });

    it('should display correct gender options', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const genderSelect = screen.getByLabelText('性別');
      expect(genderSelect).toContainHTML('<option value="all">すべて</option>');
      expect(genderSelect).toContainHTML('<option value="male">男性</option>');
      expect(genderSelect).toContainHTML('<option value="female">女性</option>');
      expect(genderSelect).toContainHTML('<option value="other">その他</option>');
    });
  });

  describe('Age Range Filter', () => {
    it('should handle minimum age change', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const minAgeInput = screen.getByLabelText('最小年齢');
      await user.type(minAgeInput, '20');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        ageRange: { min: 20 },
      });
    });

    it('should handle maximum age change', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const maxAgeInput = screen.getByLabelText('最大年齢');
      await user.type(maxAgeInput, '50');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        ageRange: { max: 50 },
      });
    });

    it('should validate age range (min <= max)', async () => {
      const user = userEvent.setup();
      const filtersWithAge: SearchFiltersType = {
        ...defaultFilters,
        ageRange: { min: 20, max: 50 },
      };

      render(
        <SearchFilters
          filters={filtersWithAge}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const minAgeInput = screen.getByLabelText('最小年齢');
      await user.clear(minAgeInput);
      await user.type(minAgeInput, '60'); // Greater than max

      expect(screen.getByText('最小年齢は最大年齢以下である必要があります')).toBeInTheDocument();
    });

    it('should handle age range preset buttons', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showAgePresets={true}
        />
      );

      const childrenButton = screen.getByText('子ども（0-17歳）');
      await user.click(childrenButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        ageRange: { min: 0, max: 17 },
      });
    });
  });

  describe('Birth Date Range Filter', () => {
    it('should handle birth date start change', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const startDateInput = screen.getByLabelText('生年月日（開始）');
      await user.type(startDateInput, '1990-01-01');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        birthDateRange: { start: '1990-01-01' },
      });
    });

    it('should handle birth date end change', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const endDateInput = screen.getByLabelText('生年月日（終了）');
      await user.type(endDateInput, '2000-12-31');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        birthDateRange: { end: '2000-12-31' },
      });
    });

    it('should validate birth date range (start <= end)', async () => {
      const user = userEvent.setup();
      const filtersWithDates: SearchFiltersType = {
        ...defaultFilters,
        birthDateRange: { start: '1990-01-01', end: '2000-12-31' },
      };

      render(
        <SearchFilters
          filters={filtersWithDates}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const startDateInput = screen.getByLabelText('生年月日（開始）');
      await user.clear(startDateInput);
      await user.type(startDateInput, '2001-01-01'); // After end date

      expect(screen.getByText('開始日は終了日以前である必要があります')).toBeInTheDocument();
    });

    it('should handle birth date preset buttons', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          showDatePresets={true}
        />
      );

      const this90sButton = screen.getByText('1990年代');
      await user.click(this90sButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        birthDateRange: { start: '1990-01-01', end: '1999-12-31' },
      });
    });
  });

  describe('Living Status Filter', () => {
    it('should handle living status change', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const livingSelect = screen.getByLabelText('生存状況');
      await user.selectOptions(livingSelect, 'true');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        isAlive: true,
      });
    });

    it('should display correct living status options', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const livingSelect = screen.getByLabelText('生存状況');
      expect(livingSelect).toContainHTML('<option value="all">すべて</option>');
      expect(livingSelect).toContainHTML('<option value="true">存命</option>');
      expect(livingSelect).toContainHTML('<option value="false">故人</option>');
    });
  });

  describe('Profile Image Filter', () => {
    it('should handle profile image filter change', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const imageSelect = screen.getByLabelText('プロフィール写真');
      await user.selectOptions(imageSelect, 'true');

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        hasProfileImage: true,
      });
    });

    it('should display correct profile image options', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const imageSelect = screen.getByLabelText('プロフィール写真');
      expect(imageSelect).toContainHTML('<option value="all">すべて</option>');
      expect(imageSelect).toContainHTML('<option value="true">写真あり</option>');
      expect(imageSelect).toContainHTML('<option value="false">写真なし</option>');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      const filtersWithValues: SearchFiltersType = {
        searchQuery: '',
        gender: 'male',
        ageRange: { min: 20, max: 50 },
        birthDateRange: { start: '1990-01-01', end: '2000-12-31' },
        isAlive: true,
        hasProfileImage: true,
      };

      render(
        <SearchFilters
          filters={filtersWithValues}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const clearButton = screen.getByText('フィルターをクリア');
      await user.click(clearButton);

      expect(mockOnClear).toHaveBeenCalled();
    });

    it('should show confirmation dialog for clear all', async () => {
      const user = userEvent.setup();
      const filtersWithValues: SearchFiltersType = {
        searchQuery: '',
        gender: 'male',
        ageRange: { min: 20, max: 50 },
        birthDateRange: { start: '1990-01-01', end: '2000-12-31' },
        isAlive: true,
        hasProfileImage: true,
      };

      render(
        <SearchFilters
          filters={filtersWithValues}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          confirmClear={true}
        />
      );

      const clearButton = screen.getByText('フィルターをクリア');
      await user.click(clearButton);

      expect(screen.getByText('フィルターをクリアしますか？')).toBeInTheDocument();
      expect(screen.getByText('設定されたフィルター条件がすべて削除されます。')).toBeInTheDocument();
      
      const confirmButton = screen.getByText('クリア');
      await user.click(confirmButton);

      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  describe('Collapsible Sections', () => {
    it('should toggle filter sections', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          collapsible={true}
        />
      );

      const ageToggle = screen.getByText('年齢フィルター');
      await user.click(ageToggle);

      expect(screen.queryByLabelText('最小年齢')).not.toBeVisible();
      expect(screen.queryByLabelText('最大年齢')).not.toBeVisible();
    });

    it('should remember collapsed state', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          collapsible={true}
        />
      );

      const ageToggle = screen.getByText('年齢フィルター');
      await user.click(ageToggle); // Collapse
      await user.click(ageToggle); // Expand

      expect(screen.getByLabelText('最小年齢')).toBeVisible();
      expect(screen.getByLabelText('最大年齢')).toBeVisible();
    });
  });

  describe('Responsive Design', () => {
    it('should render in compact mode on mobile', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          compact={true}
        />
      );

      expect(screen.getByTestId('filters-compact-mode')).toBeInTheDocument();
    });

    it('should show filter summary in compact mode', () => {
      const filtersWithValues: SearchFiltersType = {
        ...defaultFilters,
        gender: 'male',
        ageRange: { min: 20, max: 50 },
      };

      render(
        <SearchFilters
          filters={filtersWithValues}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          compact={true}
        />
      );

      expect(screen.getByText('フィルター (2)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and descriptions', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const genderSelect = screen.getByLabelText('性別');
      expect(genderSelect).toHaveAttribute('aria-describedby');

      const minAgeInput = screen.getByLabelText('最小年齢');
      expect(minAgeInput).toHaveAttribute('type', 'number');
      expect(minAgeInput).toHaveAttribute('min', '0');
      expect(minAgeInput).toHaveAttribute('max', '150');
    });

    it('should announce filter changes to screen readers', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      const genderSelect = screen.getByLabelText('性別');
      await user.selectOptions(genderSelect, 'male');

      expect(screen.getByRole('status')).toHaveTextContent('性別フィルターが「男性」に設定されました');
    });

    it('should support keyboard navigation for all controls', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      );

      // Tab through all form controls
      await user.tab();
      expect(screen.getByLabelText('性別')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('最小年齢')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('最大年齢')).toHaveFocus();
    });
  });
});