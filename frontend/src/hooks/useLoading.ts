import { useLoadingStore } from '../stores/loading.store';

export const useLoading = (key?: string) => {
  const {
    isLoading,
    setLoading,
    setGlobalLoading,
    clearAll,
    getActiveLoadingKeys,
  } = useLoadingStore();

  return {
    isLoading: key ? isLoading(key) : isLoading(),
    setLoading: (loading: boolean) => {
      if (key) {
        setLoading(key, loading);
      } else {
        setGlobalLoading(loading);
      }
    },
    clearAll,
    activeKeys: getActiveLoadingKeys(),
  };
};