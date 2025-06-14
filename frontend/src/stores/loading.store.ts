import { create } from 'zustand';

interface LoadingState {
  loadingStates: Map<string, boolean>;
  globalLoading: boolean;
  
  // Actions
  setLoading: (key: string, isLoading: boolean) => void;
  setGlobalLoading: (isLoading: boolean) => void;
  isLoading: (key?: string) => boolean;
  clearAll: () => void;
  getActiveLoadingKeys: () => string[];
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingStates: new Map(),
  globalLoading: false,

  setLoading: (key: string, isLoading: boolean) => {
    set((state) => {
      const newStates = new Map(state.loadingStates);
      if (isLoading) {
        newStates.set(key, true);
      } else {
        newStates.delete(key);
      }
      return { loadingStates: newStates };
    });
  },

  setGlobalLoading: (isLoading: boolean) => {
    set({ globalLoading: isLoading });
  },

  isLoading: (key?: string) => {
    const state = get();
    
    // If global loading is true, everything is loading
    if (state.globalLoading) return true;
    
    // If checking specific key
    if (key) {
      return state.loadingStates.has(key);
    }
    
    // Check if any loading state is active
    return state.loadingStates.size > 0;
  },

  clearAll: () => {
    set({
      loadingStates: new Map(),
      globalLoading: false,
    });
  },

  getActiveLoadingKeys: () => {
    const state = get();
    return Array.from(state.loadingStates.keys());
  },
}));