import { useLoadingStore } from '../stores/loading.store';

export const useLoading = (key?: string) => {
  const store = useLoadingStore();
  const {
    globalLoading,
    loadingStates,
    isLoading,
    setLoading,
    setGlobalLoading,
    clearAll,
    getActiveLoadingKeys,
  } = store;

  return {
    // State
    isGlobalLoading: globalLoading,
    keyStates: loadingStates ? Object.fromEntries(loadingStates) : {},
    activeKeys: getActiveLoadingKeys(),
    
    // Actions
    setGlobalLoading,
    setKeyLoading: setLoading,
    isKeyLoading: isLoading,
    clearAll,
    
    // Convenience for key-specific usage
    isLoading: key ? isLoading(key) : isLoading(),
    setLoading: (loading: boolean) => {
      if (key) {
        setLoading(key, loading);
      } else {
        setGlobalLoading(loading);
      }
    },
  };
};