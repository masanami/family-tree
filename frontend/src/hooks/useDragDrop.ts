import { useState, useCallback } from 'react';
import type { DragDropContext } from '../types/relationship';

interface DragPreview {
  x: number;
  y: number;
  sourcePersonName: string;
}

interface DragData {
  source: string;
  target: string;
  isValid: boolean;
  preview: DragPreview | null;
}

export const useDragDrop = () => {
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [dragTarget, setDragTargetInternal] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);

  const startDrag = useCallback((personId: string, preview?: DragPreview) => {
    setDragSource(personId);
    setIsDragging(true);
    setDragPreview(preview || null);
  }, []);

  const endDrag = useCallback(() => {
    setDragSource(null);
    setDragTargetInternal(null);
    setIsDragging(false);
    setDragPreview(null);
  }, []);

  const setDragTarget = useCallback((personId: string) => {
    // Prevent setting same person as target when dragging
    if (isDragging && dragSource === personId) {
      return;
    }
    setDragTargetInternal(personId);
  }, [isDragging, dragSource]);

  const clearDragTarget = useCallback(() => {
    setDragTargetInternal(null);
  }, []);

  const updateDragPreview = useCallback((preview: DragPreview) => {
    if (!isDragging) return;
    setDragPreview(preview);
  }, [isDragging]);

  const isValidDrop = useCallback(() => {
    return dragSource !== null && 
           dragTarget !== null && 
           dragSource !== dragTarget;
  }, [dragSource, dragTarget]);

  const getDragData = useCallback((): DragData | null => {
    if (!dragSource) return null;
    
    return {
      source: dragSource,
      target: dragTarget || '',
      isValid: isValidDrop(),
      preview: dragPreview,
    };
  }, [dragSource, dragTarget, dragPreview, isValidDrop]);

  const resetDragState = useCallback(() => {
    setDragSource(null);
    setDragTargetInternal(null);
    setIsDragging(false);
    setDragPreview(null);
  }, []);

  // Event handlers
  const handleDragEnter = useCallback((personId: string, event: DragEvent) => {
    event.preventDefault();
    if (!isDragging || dragSource === personId) return;
    setDragTarget(personId);
  }, [isDragging, dragSource, setDragTarget]);

  const handleDragLeave = useCallback((event: DragEvent) => {
    // Clear target when leaving drag area
    clearDragTarget();
  }, [clearDragTarget]);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (!isDragging) return;

    // Update preview position if available
    if (dragPreview && event.clientX && event.clientY) {
      updateDragPreview({
        ...dragPreview,
        x: event.clientX,
        y: event.clientY,
      });
    }
  }, [isDragging, dragPreview, updateDragPreview]);

  const handleDrop = useCallback((event: DragEvent): DragData | null => {
    event.preventDefault();
    
    const dragData = getDragData();
    resetDragState();
    
    return dragData?.isValid ? dragData : null;
  }, [getDragData, resetDragState]);

  // Keyboard accessibility support
  const handleKeyboardDrop = useCallback((targetPersonId: string): DragData | null => {
    if (!dragSource) return null;
    
    const dragData: DragData = {
      source: dragSource,
      target: targetPersonId,
      isValid: dragSource !== targetPersonId,
      preview: null,
    };
    
    resetDragState();
    return dragData.isValid ? dragData : null;
  }, [dragSource, resetDragState]);

  const getAccessibilityAnnouncement = useCallback((personName: string): string => {
    if (!isDragging) return '';
    return `${personName}をドラッグ中。関係性を作成したい人物の上にドロップしてください。`;
  }, [isDragging]);

  return {
    // State
    dragSource,
    dragTarget,
    isDragging,
    dragPreview,
    
    // Actions
    startDrag,
    endDrag,
    setDragTarget,
    clearDragTarget,
    updateDragPreview,
    resetDragState,
    
    // Validation
    isValidDrop,
    getDragData,
    
    // Event handlers
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    
    // Accessibility
    handleKeyboardDrop,
    getAccessibilityAnnouncement,
  };
};