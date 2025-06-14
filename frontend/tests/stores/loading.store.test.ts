import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoadingStore } from '../../src/stores/loading.store';

describe('Loading Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useLoadingStore.setState({ 
      loadingStates: new Map(),
      globalLoading: false
    });
  });

  describe('グローバルローディング状態', () => {
    it('グローバルローディング状態を設定できること', () => {
      const { result } = renderHook(() => useLoadingStore());

      act(() => {
        result.current.setGlobalLoading(true);
      });

      expect(result.current.globalLoading).toBe(true);
      expect(result.current.isLoading()).toBe(true);

      act(() => {
        result.current.setGlobalLoading(false);
      });

      expect(result.current.globalLoading).toBe(false);
      expect(result.current.isLoading()).toBe(false);
    });
  });

  describe('個別ローディング状態', () => {
    it('キーごとにローディング状態を管理できること', () => {
      const { result } = renderHook(() => useLoadingStore());

      act(() => {
        result.current.setLoading('fetch-users', true);
      });

      expect(result.current.isLoading('fetch-users')).toBe(true);
      expect(result.current.isLoading('fetch-posts')).toBe(false);

      act(() => {
        result.current.setLoading('fetch-posts', true);
      });

      expect(result.current.isLoading('fetch-users')).toBe(true);
      expect(result.current.isLoading('fetch-posts')).toBe(true);
    });

    it('個別のローディング状態をクリアできること', () => {
      const { result } = renderHook(() => useLoadingStore());

      act(() => {
        result.current.setLoading('fetch-users', true);
        result.current.setLoading('fetch-posts', true);
      });

      act(() => {
        result.current.setLoading('fetch-users', false);
      });

      expect(result.current.isLoading('fetch-users')).toBe(false);
      expect(result.current.isLoading('fetch-posts')).toBe(true);
    });
  });

  describe('複合ローディング状態', () => {
    it('いずれかのローディング状態がtrueの場合、isLoadingがtrueを返すこと', () => {
      const { result } = renderHook(() => useLoadingStore());

      expect(result.current.isLoading()).toBe(false);

      act(() => {
        result.current.setLoading('fetch-users', true);
      });

      expect(result.current.isLoading()).toBe(true);

      act(() => {
        result.current.setLoading('fetch-posts', true);
      });

      expect(result.current.isLoading()).toBe(true);

      act(() => {
        result.current.setLoading('fetch-users', false);
      });

      expect(result.current.isLoading()).toBe(true);

      act(() => {
        result.current.setLoading('fetch-posts', false);
      });

      expect(result.current.isLoading()).toBe(false);
    });

    it('グローバルローディングが優先されること', () => {
      const { result } = renderHook(() => useLoadingStore());

      act(() => {
        result.current.setGlobalLoading(true);
      });

      expect(result.current.isLoading()).toBe(true);
      expect(result.current.isLoading('any-key')).toBe(true);
    });
  });

  describe('全ローディング状態のクリア', () => {
    it('clearAllで全てのローディング状態がクリアされること', () => {
      const { result } = renderHook(() => useLoadingStore());

      act(() => {
        result.current.setGlobalLoading(true);
        result.current.setLoading('fetch-users', true);
        result.current.setLoading('fetch-posts', true);
      });

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.globalLoading).toBe(false);
      expect(result.current.isLoading()).toBe(false);
      expect(result.current.isLoading('fetch-users')).toBe(false);
      expect(result.current.isLoading('fetch-posts')).toBe(false);
    });
  });

  describe('ローディング状態の取得', () => {
    it('全てのアクティブなローディングキーを取得できること', () => {
      const { result } = renderHook(() => useLoadingStore());

      act(() => {
        result.current.setLoading('fetch-users', true);
        result.current.setLoading('fetch-posts', true);
        result.current.setLoading('fetch-comments', false);
      });

      const activeKeys = result.current.getActiveLoadingKeys();
      expect(activeKeys).toContain('fetch-users');
      expect(activeKeys).toContain('fetch-posts');
      expect(activeKeys).not.toContain('fetch-comments');
      expect(activeKeys).toHaveLength(2);
    });
  });
});