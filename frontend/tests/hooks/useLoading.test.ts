import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoading } from '../../src/hooks/useLoading';
import { useLoadingStore } from '../../src/stores/loading.store';

// Mock the loading store
vi.mock('../../src/stores/loading.store', () => ({
  useLoadingStore: vi.fn()
}));

describe('useLoading Hook', () => {
  const mockLoadingStore = {
    globalLoading: false,
    loadingStates: new Map(),
    isLoading: vi.fn().mockReturnValue(false),
    setLoading: vi.fn(),
    setGlobalLoading: vi.fn(),
    clearAll: vi.fn(),
    getActiveLoadingKeys: vi.fn().mockReturnValue([])
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLoadingStore as any).mockReturnValue(mockLoadingStore);
  });

  describe('Global Loading State', () => {
    it('should return global loading state', () => {
      const { result } = renderHook(() => useLoading());

      expect(result.current.isGlobalLoading).toBe(false);
    });

    it('should provide setGlobalLoading function', () => {
      const { result } = renderHook(() => useLoading());

      expect(typeof result.current.setGlobalLoading).toBe('function');
    });

    it('should call store setGlobalLoading when hook function is called', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.setGlobalLoading(true);
      });

      expect(mockLoadingStore.setGlobalLoading).toHaveBeenCalledWith(true);
    });

    it('should reflect global loading state changes', () => {
      const { result, rerender } = renderHook(() => useLoading());

      // Initially not loading
      expect(result.current.isGlobalLoading).toBe(false);

      // Mock store state change to loading
      (useLoadingStore as any).mockReturnValue({
        ...mockLoadingStore,
        isGlobalLoading: true
      });

      rerender();

      expect(result.current.isGlobalLoading).toBe(true);
    });
  });

  describe('Key-specific Loading State', () => {
    it('should provide setKeyLoading function', () => {
      const { result } = renderHook(() => useLoading());

      expect(typeof result.current.setKeyLoading).toBe('function');
    });

    it('should provide isKeyLoading function', () => {
      const { result } = renderHook(() => useLoading());

      expect(typeof result.current.isKeyLoading).toBe('function');
    });

    it('should call store setKeyLoading when hook function is called', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.setKeyLoading('test-key', true);
      });

      expect(mockLoadingStore.setLoading).toHaveBeenCalledWith('test-key', true);
    });

    it('should call store isKeyLoading when hook function is called', () => {
      const { result } = renderHook(() => useLoading());

      result.current.isKeyLoading('test-key');

      expect(mockLoadingStore.isLoading).toHaveBeenCalledWith('test-key');
    });

    it('should return correct key loading state', () => {
      // Mock specific key loading state
      mockLoadingStore.isLoading.mockImplementation((key: string) => {
        return key === 'loading-key';
      });

      const { result } = renderHook(() => useLoading());

      expect(result.current.isKeyLoading('loading-key')).toBe(true);
      expect(result.current.isKeyLoading('non-loading-key')).toBe(false);
    });
  });

  describe('Key States and Active Keys', () => {
    it('should return key states', () => {
      const mockKeyStates = new Map([
        ['key1', true],
        ['key2', false],
        ['key3', true]
      ]);

      (useLoadingStore as any).mockReturnValue({
        ...mockLoadingStore,
        loadingStates: mockKeyStates
      });

      const { result } = renderHook(() => useLoading());

      expect(result.current.keyStates).toEqual({
        'key1': true,
        'key2': false,
        'key3': true
      });
    });

    it('should return active keys', () => {
      const mockActiveKeys = ['key1', 'key3'];

      (useLoadingStore as any).mockReturnValue({
        ...mockLoadingStore,
        getActiveLoadingKeys: vi.fn().mockReturnValue(mockActiveKeys)
      });

      const { result } = renderHook(() => useLoading());

      expect(result.current.activeKeys).toEqual(mockActiveKeys);
    });

    it('should reflect key states changes', () => {
      const { result, rerender } = renderHook(() => useLoading());

      // Initially empty
      expect(result.current.keyStates).toEqual({});
      expect(result.current.activeKeys).toEqual([]);

      // Mock store state change
      (useLoadingStore as any).mockReturnValue({
        ...mockLoadingStore,
        loadingStates: new Map([['api-call', true]]),
        getActiveLoadingKeys: vi.fn().mockReturnValue(['api-call'])
      });

      rerender();

      expect(result.current.keyStates).toEqual({ 'api-call': true });
      expect(result.current.activeKeys).toEqual(['api-call']);
    });
  });

  describe('Clear All Functionality', () => {
    it('should provide clearAll function', () => {
      const { result } = renderHook(() => useLoading());

      expect(typeof result.current.clearAll).toBe('function');
    });

    it('should call store clearAll when hook function is called', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.clearAll();
      });

      expect(mockLoadingStore.clearAll).toHaveBeenCalledOnce();
    });
  });

  describe('Hook with Key Parameter', () => {
    it('should work without key parameter', () => {
      const { result } = renderHook(() => useLoading());

      expect(result.current).toBeDefined();
      expect(result.current.isGlobalLoading).toBeDefined();
      expect(result.current.setGlobalLoading).toBeDefined();
    });

    it('should provide convenient key-specific interface', () => {
      const testKey = 'test-operation';
      const { result } = renderHook(() => useLoading(testKey));

      // Hook should still provide all functionality
      expect(result.current.isKeyLoading).toBeDefined();
      expect(result.current.setKeyLoading).toBeDefined();

      // Test key-specific usage
      act(() => {
        result.current.setKeyLoading(testKey, true);
      });

      expect(mockLoadingStore.setKeyLoading).toHaveBeenCalledWith(testKey, true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle multiple concurrent loading states', () => {
      const mockStates = {
        keyStates: {
          'api-call-1': true,
          'api-call-2': true,
          'api-call-3': false
        },
        activeKeys: ['api-call-1', 'api-call-2'],
        isGlobalLoading: false
      };

      (useLoadingStore as any).mockReturnValue({
        ...mockLoadingStore,
        ...mockStates
      });

      const { result } = renderHook(() => useLoading());

      expect(result.current.activeKeys).toHaveLength(2);
      expect(result.current.activeKeys).toContain('api-call-1');
      expect(result.current.activeKeys).toContain('api-call-2');
      expect(result.current.keyStates['api-call-3']).toBe(false);
    });

    it('should handle global loading priority over key loading', () => {
      (useLoadingStore as any).mockReturnValue({
        ...mockLoadingStore,
        isGlobalLoading: true,
        keyStates: { 'test-key': true },
        activeKeys: ['test-key']
      });

      const { result } = renderHook(() => useLoading());

      expect(result.current.isGlobalLoading).toBe(true);
      expect(result.current.activeKeys).toContain('test-key');
    });

    it('should support loading state transitions', () => {
      const { result, rerender } = renderHook(() => useLoading());

      // Start with no loading
      expect(result.current.isGlobalLoading).toBe(false);
      expect(result.current.activeKeys).toHaveLength(0);

      // Set key loading
      act(() => {
        result.current.setKeyLoading('operation-1', true);
      });

      // Set global loading
      act(() => {
        result.current.setGlobalLoading(true);
      });

      // Clear all
      act(() => {
        result.current.clearAll();
      });

      expect(mockLoadingStore.setKeyLoading).toHaveBeenCalledWith('operation-1', true);
      expect(mockLoadingStore.setGlobalLoading).toHaveBeenCalledWith(true);
      expect(mockLoadingStore.clearAll).toHaveBeenCalledOnce();
    });
  });

  describe('Hook Cleanup', () => {
    it('should not cause memory leaks on unmount', () => {
      const { unmount } = renderHook(() => useLoading());

      expect(() => unmount()).not.toThrow();
    });

    it('should not cause memory leaks with key parameter', () => {
      const { unmount } = renderHook(() => useLoading('test-key'));

      expect(() => unmount()).not.toThrow();
    });
  });
});