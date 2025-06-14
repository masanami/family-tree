import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { RelationshipCreator } from '../RelationshipCreator';
import type { Person } from '../../../types/person';
import type { RelationshipType } from '../../../types/relationship';

// Mock the hooks
vi.mock('../../../hooks/useRelationship', () => ({
  useRelationship: vi.fn(),
}));

vi.mock('../../../hooks/useDragDrop', () => ({
  useDragDrop: vi.fn(),
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

describe('RelationshipCreator', () => {
  const mockUseRelationship = {
    relationships: [],
    loading: false,
    error: null,
    createRelationship: vi.fn(),
    updateRelationship: vi.fn(),
    deleteRelationship: vi.fn(),
    validateRelationship: vi.fn(),
  };

  const mockUseDragDrop = {
    dragSource: null,
    dragTarget: null,
    isDragging: false,
    dragPreview: null,
    startDrag: vi.fn(),
    endDrag: vi.fn(),
    setDragTarget: vi.fn(),
    clearDragTarget: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { useRelationship } = require('../../../hooks/useRelationship');
    const { useDragDrop } = require('../../../hooks/useDragDrop');
    useRelationship.mockReturnValue(mockUseRelationship);
    useDragDrop.mockReturnValue(mockUseDragDrop);
  });

  describe('Drag and Drop Functionality', () => {
    it('should enable drag on person cards', () => {
      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      const personCards = screen.getAllByTestId(/person-card-/);
      expect(personCards).toHaveLength(3);
      
      personCards.forEach(card => {
        expect(card).toHaveAttribute('draggable', 'true');
      });
    });

    it('should start drag when dragstart event is triggered', () => {
      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      const firstPersonCard = screen.getByTestId('person-card-1');
      fireEvent.dragStart(firstPersonCard);

      expect(mockUseDragDrop.startDrag).toHaveBeenCalledWith('1');
    });

    it('should handle drag over event on valid drop targets', () => {
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      const secondPersonCard = screen.getByTestId('person-card-2');
      fireEvent.dragOver(secondPersonCard);

      expect(mockUseDragDrop.setDragTarget).toHaveBeenCalledWith('2');
    });

    it('should show visual feedback during drag', () => {
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      const sourceCard = screen.getByTestId('person-card-1');
      const targetCard = screen.getByTestId('person-card-2');

      expect(sourceCard).toHaveClass('opacity-50'); // Dragging source
      expect(targetCard).toHaveClass('ring-2 ring-blue-500'); // Drop target
    });

    it('should open relationship selection modal on drop', () => {
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      const targetCard = screen.getByTestId('person-card-2');
      fireEvent.drop(targetCard);

      expect(screen.getByText('関係性を選択してください')).toBeInTheDocument();
      expect(screen.getByText('田中 太郎 → 田中 花子')).toBeInTheDocument();
    });
  });

  describe('Relationship Type Selection', () => {
    it('should show all available relationship types', () => {
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));

      const relationshipTypes = [
        '配偶者',
        '親',
        '子',
        '兄弟・姉妹',
        '祖父母',
        '孫',
        '叔父・叔母',
        '甥・姪',
        'いとこ',
      ];

      relationshipTypes.forEach(type => {
        expect(screen.getByText(type)).toBeInTheDocument();
      });
    });

    it('should handle relationship type selection', async () => {
      const user = userEvent.setup();
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));
      
      const spouseOption = screen.getByText('配偶者');
      await user.click(spouseOption);

      expect(spouseOption.closest('input')).toBeChecked();
    });

    it('should show metadata fields for spouse relationship', async () => {
      const user = userEvent.setup();
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));
      
      const spouseOption = screen.getByText('配偶者');
      await user.click(spouseOption);

      expect(screen.getByLabelText('結婚日')).toBeInTheDocument();
      expect(screen.getByLabelText('離婚日（任意）')).toBeInTheDocument();
      expect(screen.getByLabelText('備考（任意）')).toBeInTheDocument();
    });

    it('should show adoption date field for parent-child relationship', async () => {
      const user = userEvent.setup();
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '3';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-3'));
      
      const parentOption = screen.getByText('親');
      await user.click(parentOption);

      expect(screen.getByLabelText('養子縁組日（任意）')).toBeInTheDocument();
    });
  });

  describe('Relationship Validation', () => {
    it('should prevent self-referencing relationships', () => {
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '1';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      const sourceCard = screen.getByTestId('person-card-1');
      fireEvent.drop(sourceCard);

      expect(screen.getByText('自分自身との関係性は作成できません')).toBeInTheDocument();
      expect(screen.queryByText('関係性を選択してください')).not.toBeInTheDocument();
    });

    it('should validate relationship constraints', async () => {
      const user = userEvent.setup();
      mockUseRelationship.validateRelationship.mockReturnValue({
        isValid: false,
        errors: ['この人物は既に配偶者がいます'],
        warnings: [],
      });

      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));
      
      const spouseOption = screen.getByText('配偶者');
      await user.click(spouseOption);

      const confirmButton = screen.getByText('関係性を作成');
      await user.click(confirmButton);

      expect(screen.getByText('この人物は既に配偶者がいます')).toBeInTheDocument();
      expect(mockUseRelationship.createRelationship).not.toHaveBeenCalled();
    });

    it('should show warnings but allow creation', async () => {
      const user = userEvent.setup();
      mockUseRelationship.validateRelationship.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: ['年齢差が大きいため、関係性をご確認ください'],
      });

      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '3';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-3'));
      
      const parentOption = screen.getByText('親');
      await user.click(parentOption);

      expect(screen.getByText('年齢差が大きいため、関係性をご確認ください')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');
    });
  });

  describe('Relationship Creation', () => {
    it('should create relationship with valid data', async () => {
      const user = userEvent.setup();
      const onRelationshipCreated = vi.fn();
      mockUseRelationship.validateRelationship.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      });
      mockUseRelationship.createRelationship.mockResolvedValue({
        id: 'rel1',
        fromPersonId: '1',
        toPersonId: '2',
        relationshipType: 'spouse',
        familyTreeId: 'tree1',
        isConfirmed: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={onRelationshipCreated}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));
      
      const spouseOption = screen.getByText('配偶者');
      await user.click(spouseOption);

      const marriageDateInput = screen.getByLabelText('結婚日');
      await user.type(marriageDateInput, '2000-01-01');

      const confirmButton = screen.getByText('関係性を作成');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockUseRelationship.createRelationship).toHaveBeenCalledWith({
          fromPersonId: '1',
          toPersonId: '2',
          relationshipType: 'spouse',
          familyTreeId: 'tree1',
          metadata: {
            marriageDate: '2000-01-01',
          },
        });
      });

      expect(onRelationshipCreated).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const user = userEvent.setup();
      mockUseRelationship.validateRelationship.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      });
      mockUseRelationship.createRelationship.mockRejectedValue(
        new Error('Failed to create relationship')
      );

      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));
      
      const spouseOption = screen.getByText('配偶者');
      await user.click(spouseOption);

      const confirmButton = screen.getByText('関係性を作成');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('関係性の作成に失敗しました')).toBeInTheDocument();
      });
    });

    it('should close modal after successful creation', async () => {
      const user = userEvent.setup();
      mockUseRelationship.validateRelationship.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      });
      mockUseRelationship.createRelationship.mockResolvedValue({
        id: 'rel1',
        fromPersonId: '1',
        toPersonId: '2',
        relationshipType: 'spouse',
        familyTreeId: 'tree1',
        isConfirmed: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));
      
      const spouseOption = screen.getByText('配偶者');
      await user.click(spouseOption);

      const confirmButton = screen.getByText('関係性を作成');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('関係性を選択してください')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal Interaction', () => {
    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));

      const cancelButton = screen.getByText('キャンセル');
      await user.click(cancelButton);

      expect(screen.queryByText('関係性を選択してください')).not.toBeInTheDocument();
    });

    it('should close modal when clicking outside', () => {
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';
      mockUseDragDrop.dragTarget = '2';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      fireEvent.drop(screen.getByTestId('person-card-2'));

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);

      expect(screen.queryByText('関係性を選択してください')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for drag and drop', () => {
      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      const firstPersonCard = screen.getByTestId('person-card-1');
      expect(firstPersonCard).toHaveAttribute('aria-label', '田中 太郎 - ドラッグして関係性を作成');
      expect(firstPersonCard).toHaveAttribute('role', 'button');
    });

    it('should announce drag and drop state to screen readers', () => {
      mockUseDragDrop.isDragging = true;
      mockUseDragDrop.dragSource = '1';

      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      expect(screen.getByText('田中 太郎をドラッグ中。関係性を作成したい人物の上にドロップしてください。')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('should have keyboard navigation support', async () => {
      const user = userEvent.setup();
      render(
        <RelationshipCreator
          persons={mockPersons}
          familyTreeId="tree1"
          onRelationshipCreated={vi.fn()}
        />
      );

      const firstPersonCard = screen.getByTestId('person-card-1');
      firstPersonCard.focus();
      
      await user.keyboard('{Enter}');
      expect(screen.getByText('関係性を作成する人物を選択してください')).toBeInTheDocument();
    });
  });
});