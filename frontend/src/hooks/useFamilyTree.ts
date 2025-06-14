import { useState, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import type {
  FamilyTree,
  CreateFamilyTreeRequest,
  UpdateFamilyTreeRequest,
  FamilyTreeListResponse,
} from '../types/familyTree';

interface UseFamilyTreeState {
  familyTrees: FamilyTree[];
  currentFamilyTree: FamilyTree | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

interface UseFamilyTreeActions {
  loadFamilyTrees: (page?: number) => Promise<void>;
  loadFamilyTree: (id: string) => Promise<void>;
  createFamilyTree: (data: CreateFamilyTreeRequest) => Promise<FamilyTree>;
  updateFamilyTree: (id: string, data: UpdateFamilyTreeRequest) => Promise<FamilyTree>;
  deleteFamilyTree: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export type UseFamilyTreeReturn = UseFamilyTreeState & UseFamilyTreeActions;

const initialState: UseFamilyTreeState = {
  familyTrees: [],
  currentFamilyTree: null,
  loading: false,
  error: null,
  hasMore: false,
  page: 1,
};

export const useFamilyTree = (): UseFamilyTreeReturn => {
  const [state, setState] = useState<UseFamilyTreeState>(initialState);

  const updateState = useCallback((updates: Partial<UseFamilyTreeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading });
  }, [updateState]);

  const setError = useCallback((error: string | null) => {
    updateState({ error, loading: false });
  }, [updateState]);

  const loadFamilyTrees = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get<FamilyTreeListResponse>(
        `${API_ENDPOINTS.FAMILY_TREES.BASE}?page=${page}&limit=10`
      );

      if (page === 1) {
        updateState({
          familyTrees: response.trees,
          hasMore: response.hasMore,
          page: response.page,
          loading: false,
        });
      } else {
        updateState({
          familyTrees: [...state.familyTrees, ...response.trees],
          hasMore: response.hasMore,
          page: response.page,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load family trees:', error);
      setError('家系図の読み込みに失敗しました');
    }
  }, [setLoading, setError, updateState, state.familyTrees]);

  const loadFamilyTree = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get<FamilyTree>(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(id)
      );

      updateState({
        currentFamilyTree: response,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load family tree:', error);
      setError('家系図の読み込みに失敗しました');
    }
  }, [setLoading, setError, updateState]);

  const createFamilyTree = useCallback(async (data: CreateFamilyTreeRequest): Promise<FamilyTree> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post<FamilyTree>(
        API_ENDPOINTS.FAMILY_TREES.BASE,
        data
      );

      updateState({
        familyTrees: [response, ...state.familyTrees],
        loading: false,
      });

      return response;
    } catch (error) {
      console.error('Failed to create family tree:', error);
      setError('家系図の作成に失敗しました');
      throw error;
    }
  }, [setLoading, setError, updateState, state.familyTrees]);

  const updateFamilyTree = useCallback(async (
    id: string,
    data: UpdateFamilyTreeRequest
  ): Promise<FamilyTree> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.put<FamilyTree>(
        API_ENDPOINTS.FAMILY_TREES.BY_ID(id),
        data
      );

      updateState({
        familyTrees: state.familyTrees.map(tree =>
          tree.id === id ? response : tree
        ),
        currentFamilyTree: state.currentFamilyTree?.id === id ? response : state.currentFamilyTree,
        loading: false,
      });

      return response;
    } catch (error) {
      console.error('Failed to update family tree:', error);
      setError('家系図の更新に失敗しました');
      throw error;
    }
  }, [setLoading, setError, updateState, state.familyTrees, state.currentFamilyTree]);

  const deleteFamilyTree = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiService.delete(API_ENDPOINTS.FAMILY_TREES.BY_ID(id));

      updateState({
        familyTrees: state.familyTrees.filter(tree => tree.id !== id),
        currentFamilyTree: state.currentFamilyTree?.id === id ? null : state.currentFamilyTree,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to delete family tree:', error);
      setError('家系図の削除に失敗しました');
      throw error;
    }
  }, [setLoading, setError, updateState, state.familyTrees, state.currentFamilyTree]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;
    await loadFamilyTrees(state.page + 1);
  }, [state.hasMore, state.loading, state.page, loadFamilyTrees]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    loadFamilyTrees,
    loadFamilyTree,
    createFamilyTree,
    updateFamilyTree,
    deleteFamilyTree,
    loadMore,
    clearError,
    reset,
  };
};