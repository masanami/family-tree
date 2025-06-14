import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDragDrop } from '../useDragDrop';

describe('useDragDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useDragDrop());

      expect(result.current.dragSource).toBeNull();
      expect(result.current.dragTarget).toBeNull();
      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragPreview).toBeNull();
    });
  });

  describe('Drag Operations', () => {
    it('should start drag operation', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1', { x: 100, y: 200, sourcePersonName: '田中太郎' });
      });

      expect(result.current.dragSource).toBe('person1');
      expect(result.current.isDragging).toBe(true);
      expect(result.current.dragPreview).toEqual({
        x: 100,
        y: 200,
        sourcePersonName: '田中太郎',
      });
    });

    it('should handle drag start without preview', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
      });

      expect(result.current.dragSource).toBe('person1');
      expect(result.current.isDragging).toBe(true);
      expect(result.current.dragPreview).toBeNull();
    });

    it('should end drag operation', () => {
      const { result } = renderHook(() => useDragDrop());

      // Start drag first
      act(() => {
        result.current.startDrag('person1', { x: 100, y: 200, sourcePersonName: '田中太郎' });
      });

      expect(result.current.isDragging).toBe(true);

      // End drag
      act(() => {
        result.current.endDrag();
      });

      expect(result.current.dragSource).toBeNull();
      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragPreview).toBeNull();
      expect(result.current.dragTarget).toBeNull();
    });

    it('should update drag preview position', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1', { x: 100, y: 200, sourcePersonName: '田中太郎' });
      });

      act(() => {
        result.current.updateDragPreview({ x: 150, y: 250, sourcePersonName: '田中太郎' });
      });

      expect(result.current.dragPreview).toEqual({
        x: 150,
        y: 250,
        sourcePersonName: '田中太郎',
      });
    });

    it('should not update preview when not dragging', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.updateDragPreview({ x: 150, y: 250, sourcePersonName: '田中太郎' });
      });

      expect(result.current.dragPreview).toBeNull();
    });
  });

  describe('Drop Target Operations', () => {
    it('should set drag target', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.setDragTarget('person2');
      });

      expect(result.current.dragTarget).toBe('person2');
    });

    it('should clear drag target', () => {
      const { result } = renderHook(() => useDragDrop());

      // Set target first
      act(() => {
        result.current.setDragTarget('person2');
      });

      expect(result.current.dragTarget).toBe('person2');

      // Clear target
      act(() => {
        result.current.clearDragTarget();
      });

      expect(result.current.dragTarget).toBeNull();
    });

    it('should not set same person as drag target when dragging', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
      });

      act(() => {
        result.current.setDragTarget('person1');
      });

      expect(result.current.dragTarget).toBeNull();
    });

    it('should allow setting same person as target when not dragging', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.setDragTarget('person1');
      });

      expect(result.current.dragTarget).toBe('person1');
    });
  });

  describe('Validation', () => {
    it('should validate drop operation', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
        result.current.setDragTarget('person2');
      });

      const isValidDrop = result.current.isValidDrop();
      expect(isValidDrop).toBe(true);
    });

    it('should reject invalid drop when no drag source', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.setDragTarget('person2');
      });

      const isValidDrop = result.current.isValidDrop();
      expect(isValidDrop).toBe(false);
    });

    it('should reject invalid drop when no drag target', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
      });

      const isValidDrop = result.current.isValidDrop();
      expect(isValidDrop).toBe(false);
    });

    it('should reject self-drop', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
      });

      // Try to set same person as target (should be rejected)
      act(() => {
        result.current.setDragTarget('person1');
      });

      const isValidDrop = result.current.isValidDrop();
      expect(isValidDrop).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should reset all state when resetDragState is called', () => {
      const { result } = renderHook(() => useDragDrop());

      // Set up some state
      act(() => {
        result.current.startDrag('person1', { x: 100, y: 200, sourcePersonName: '田中太郎' });
        result.current.setDragTarget('person2');
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.dragSource).toBe('person1');
      expect(result.current.dragTarget).toBe('person2');

      // Reset state
      act(() => {
        result.current.resetDragState();
      });

      expect(result.current.dragSource).toBeNull();
      expect(result.current.dragTarget).toBeNull();
      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragPreview).toBeNull();
    });

    it('should get current drag data', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1', { x: 100, y: 200, sourcePersonName: '田中太郎' });
        result.current.setDragTarget('person2');
      });

      const dragData = result.current.getDragData();

      expect(dragData).toEqual({
        source: 'person1',
        target: 'person2',
        isValid: true,
        preview: { x: 100, y: 200, sourcePersonName: '田中太郎' },
      });
    });

    it('should return null drag data when not dragging', () => {
      const { result } = renderHook(() => useDragDrop());

      const dragData = result.current.getDragData();

      expect(dragData).toBeNull();
    });
  });

  describe('Event Handlers', () => {
    it('should handle drag enter with valid target', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
      });

      const mockEvent = new Event('dragenter') as DragEvent;

      act(() => {
        result.current.handleDragEnter('person2', mockEvent);
      });

      expect(result.current.dragTarget).toBe('person2');
    });

    it('should handle drag leave', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
        result.current.setDragTarget('person2');
      });

      const mockEvent = new Event('dragleave') as DragEvent;

      act(() => {
        result.current.handleDragLeave(mockEvent);
      });

      expect(result.current.dragTarget).toBeNull();
    });

    it('should handle drag over and update preview position', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1', { x: 100, y: 200, sourcePersonName: '田中太郎' });
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 250,
      } as unknown as DragEvent;

      act(() => {
        result.current.handleDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.dragPreview).toEqual({
        x: 150,
        y: 250,
        sourcePersonName: '田中太郎',
      });
    });

    it('should handle drop and return drag data', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
        result.current.setDragTarget('person2');
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      let dropData: any = null;

      act(() => {
        dropData = result.current.handleDrop(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(dropData).toEqual({
        source: 'person1',
        target: 'person2',
        isValid: true,
        preview: null,
      });

      // State should be reset after drop
      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragSource).toBeNull();
      expect(result.current.dragTarget).toBeNull();
    });

    it('should return null on invalid drop', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
        // No target set
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      let dropData: any = null;

      act(() => {
        dropData = result.current.handleDrop(mockEvent);
      });

      expect(dropData).toBeNull();
    });
  });

  describe('Accessibility Support', () => {
    it('should provide keyboard drop support', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
      });

      const dropData = result.current.handleKeyboardDrop('person2');

      expect(dropData).toEqual({
        source: 'person1',
        target: 'person2',
        isValid: true,
        preview: null,
      });

      // State should be reset after keyboard drop
      expect(result.current.isDragging).toBe(false);
    });

    it('should return null for invalid keyboard drop', () => {
      const { result } = renderHook(() => useDragDrop());

      const dropData = result.current.handleKeyboardDrop('person2');

      expect(dropData).toBeNull();
    });

    it('should get accessibility announcement', () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.startDrag('person1');
      });

      const announcement = result.current.getAccessibilityAnnouncement('田中太郎');

      expect(announcement).toBe('田中太郎をドラッグ中。関係性を作成したい人物の上にドロップしてください。');
    });

    it('should return empty string when not dragging', () => {
      const { result } = renderHook(() => useDragDrop());

      const announcement = result.current.getAccessibilityAnnouncement('田中太郎');

      expect(announcement).toBe('');
    });
  });
});