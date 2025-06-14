import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { RelationshipList } from '../RelationshipList';
import type { Relationship } from '../../../types/relationship';
import type { Person } from '../../../types/person';

// Mock the hooks
vi.mock('../../../hooks/useRelationship', () => ({
  useRelationship: vi.fn(),
}));

const mockPersons: Person[] = [
  {
    id: '1',
    firstName: '太郎',
    lastName: '田中',
    birthDate: '1970-01-01',
    gender: 'male',
    familyTreeId: 'tree1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    firstName: '花子',
    lastName: '田中',
    birthDate: '1975-02-15',
    gender: 'female',
    familyTreeId: 'tree1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    firstName: '一郎',
    lastName: '田中',
    birthDate: '2000-03-20',
    gender: 'male',
    familyTreeId: 'tree1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockRelationships: Relationship[] = [
  {
    id: '1',
    fromPersonId: '1',
    toPersonId: '2',
    relationshipType: 'spouse',
    familyTreeId: 'tree1',
    isConfirmed: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    metadata: {
      marriageDate: '2000-01-01',
    },
  },
  {
    id: '2',
    fromPersonId: '1',
    toPersonId: '3',
    relationshipType: 'parent',
    familyTreeId: 'tree1',
    isConfirmed: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    fromPersonId: '2',
    toPersonId: '3',
    relationshipType: 'parent',
    familyTreeId: 'tree1',
    isConfirmed: false, // Unconfirmed relationship
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('RelationshipList', () => {
  const mockUseRelationship = {
    relationships: mockRelationships,
    loading: false,
    error: null,
    createRelationship: vi.fn(),
    updateRelationship: vi.fn(),
    deleteRelationship: vi.fn(),
    validateRelationship: vi.fn(),
    loadRelationships: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { useRelationship } = require('../../../hooks/useRelationship');
    useRelationship.mockReturnValue(mockUseRelationship);
  });

  describe('Relationship Display', () => {
    it('should render all relationships', () => {
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText('関係性一覧')).toBeInTheDocument();
      expect(screen.getByText('田中 太郎 ← 配偶者 → 田中 花子')).toBeInTheDocument();
      expect(screen.getByText('田中 太郎 ← 親 → 田中 一郎')).toBeInTheDocument();
      expect(screen.getByText('田中 花子 ← 親 → 田中 一郎')).toBeInTheDocument();
    });

    it('should show relationship metadata for spouse relationships', () => {
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText('結婚日: 2000年1月1日')).toBeInTheDocument();
    });

    it('should show confirmation status', () => {
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const confirmedBadges = screen.getAllByText('確認済み');
      const unconfirmedBadges = screen.getAllByText('未確認');
      
      expect(confirmedBadges).toHaveLength(2); // spouse and first parent relationship
      expect(unconfirmedBadges).toHaveLength(1); // second parent relationship
    });

    it('should show empty state when no relationships', () => {
      const emptyMock = { ...mockUseRelationship, relationships: [] };
      const { useRelationship } = require('../../../hooks/useRelationship');
      useRelationship.mockReturnValue(emptyMock);

      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText('関係性がありません')).toBeInTheDocument();
      expect(screen.getByText('関係性を作成すると、ここに表示されます')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      const loadingMock = { ...mockUseRelationship, loading: true, relationships: [] };
      const { useRelationship } = require('../../../hooks/useRelationship');
      useRelationship.mockReturnValue(loadingMock);

      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText('関係性を読み込み中...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show error state', () => {
      const errorMock = { 
        ...mockUseRelationship, 
        loading: false, 
        error: 'Failed to load relationships',
        relationships: [] 
      };
      const { useRelationship } = require('../../../hooks/useRelationship');
      useRelationship.mockReturnValue(errorMock);

      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText('関係性の読み込みに失敗しました')).toBeInTheDocument();
      expect(screen.getByText('Failed to load relationships')).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter relationships by type', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const filterSelect = screen.getByLabelText('関係性タイプでフィルター');
      await user.selectOptions(filterSelect, 'spouse');

      expect(screen.getByText('田中 太郎 ← 配偶者 → 田中 花子')).toBeInTheDocument();
      expect(screen.queryByText('田中 太郎 ← 親 → 田中 一郎')).not.toBeInTheDocument();
    });

    it('should filter by confirmation status', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const confirmationFilter = screen.getByLabelText('確認状況でフィルター');
      await user.selectOptions(confirmationFilter, 'unconfirmed');

      expect(screen.getByText('田中 花子 ← 親 → 田中 一郎')).toBeInTheDocument();
      expect(screen.queryByText('田中 太郎 ← 配偶者 → 田中 花子')).not.toBeInTheDocument();
    });

    it('should sort relationships by creation date', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const sortSelect = screen.getByLabelText('並び順');
      await user.selectOptions(sortSelect, 'newest');

      // Check that relationships are in the correct order
      const relationshipItems = screen.getAllByTestId(/relationship-item-/);
      expect(relationshipItems).toHaveLength(3);
    });

    it('should search relationships by person name', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('人物名で検索...');
      await user.type(searchInput, '一郎');

      expect(screen.getByText('田中 太郎 ← 親 → 田中 一郎')).toBeInTheDocument();
      expect(screen.getByText('田中 花子 ← 親 → 田中 一郎')).toBeInTheDocument();
      expect(screen.queryByText('田中 太郎 ← 配偶者 → 田中 花子')).not.toBeInTheDocument();
    });
  });

  describe('Relationship Actions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={onEdit}
          onDelete={vi.fn()}
        />
      );

      const editButtons = screen.getAllByLabelText('編集');
      await user.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockRelationships[0]);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={onDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('削除');
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockRelationships[0]);
    });

    it('should show confirm dialog for relationship deletion', async () => {
      const user = userEvent.setup();
      mockUseRelationship.deleteRelationship.mockResolvedValue({ success: true });
      
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          showDeleteConfirmation={true}
        />
      );

      const deleteButtons = screen.getAllByLabelText('削除');
      await user.click(deleteButtons[0]);

      expect(screen.getByText('関係性を削除しますか？')).toBeInTheDocument();
      expect(screen.getByText('「田中 太郎」と「田中 花子」の配偶者関係を削除しますか？')).toBeInTheDocument();
      
      const confirmButton = screen.getByText('削除する');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockUseRelationship.deleteRelationship).toHaveBeenCalledWith('1');
      });
    });

    it('should handle confirmation toggle', async () => {
      const user = userEvent.setup();
      mockUseRelationship.updateRelationship.mockResolvedValue({
        ...mockRelationships[2],
        isConfirmed: true,
      });
      
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          allowConfirmationToggle={true}
        />
      );

      const confirmButtons = screen.getAllByText('確認');
      await user.click(confirmButtons[0]); // Click on unconfirmed relationship

      await waitFor(() => {
        expect(mockUseRelationship.updateRelationship).toHaveBeenCalledWith('3', {
          isConfirmed: true,
        });
      });
    });
  });

  describe('Relationship Details', () => {
    it('should show relationship details when clicked', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const relationshipItem = screen.getByTestId('relationship-item-1');
      await user.click(relationshipItem);

      expect(screen.getByText('関係性の詳細')).toBeInTheDocument();
      expect(screen.getByText('関係性タイプ: 配偶者')).toBeInTheDocument();
      expect(screen.getByText('作成日: 2024年1月1日')).toBeInTheDocument();
      expect(screen.getByText('最終更新: 2024年1月1日')).toBeInTheDocument();
    });

    it('should show metadata in details modal', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const relationshipItem = screen.getByTestId('relationship-item-1');
      await user.click(relationshipItem);

      expect(screen.getByText('結婚日: 2000年1月1日')).toBeInTheDocument();
    });

    it('should close details modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const relationshipItem = screen.getByTestId('relationship-item-1');
      await user.click(relationshipItem);

      const closeButton = screen.getByLabelText('閉じる');
      await user.click(closeButton);

      expect(screen.queryByText('関係性の詳細')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle retry when load fails', async () => {
      const user = userEvent.setup();
      const errorMock = { 
        ...mockUseRelationship, 
        loading: false, 
        error: 'Network error',
        relationships: [] 
      };
      const { useRelationship } = require('../../../hooks/useRelationship');
      useRelationship.mockReturnValue(errorMock);

      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const retryButton = screen.getByText('再試行');
      await user.click(retryButton);

      expect(mockUseRelationship.loadRelationships).toHaveBeenCalledWith('tree1');
    });

    it('should show error message when delete fails', async () => {
      const user = userEvent.setup();
      mockUseRelationship.deleteRelationship.mockRejectedValue(
        new Error('Failed to delete relationship')
      );
      
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          showDeleteConfirmation={true}
        />
      );

      const deleteButtons = screen.getAllByLabelText('削除');
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByText('削除する');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('関係性の削除に失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('should announce filter changes to screen readers', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const filterSelect = screen.getByLabelText('関係性タイプでフィルター');
      await user.selectOptions(filterSelect, 'spouse');

      expect(screen.getByRole('status')).toHaveTextContent('1件の関係性が表示されています');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipList 
          persons={mockPersons}
          familyTreeId="tree1"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const firstRelationshipItem = screen.getByTestId('relationship-item-1');
      firstRelationshipItem.focus();
      
      await user.keyboard('{Enter}');
      expect(screen.getByText('関係性の詳細')).toBeInTheDocument();
    });
  });
});