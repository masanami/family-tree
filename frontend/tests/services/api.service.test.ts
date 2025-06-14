import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiService, ApiError } from '../../src/services/api.service';
import { useAuthStore } from '../../src/stores/auth.store';
import { useLoadingStore } from '../../src/stores/loading.store';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
      },
      response: {
        use: vi.fn(),
        eject: vi.fn(),
      },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockAxios };
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({ token: null });
    useLoadingStore.setState({ loadingStates: new Map(), globalLoading: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本設定', () => {
    it('正しいベースURLで初期化されること', () => {
      expect(apiService.getBaseURL()).toBe(import.meta.env.VITE_API_URL || 'http://localhost:8000');
    });

    it('デフォルトヘッダーが設定されること', () => {
      const headers = apiService.getDefaultHeaders();
      expect(headers['Content-Type']).toBe('application/json');
    });
  });

  describe('認証ヘッダー', () => {
    it('トークンが存在する場合、Authorizationヘッダーが追加されること', async () => {
      useAuthStore.setState({ token: 'test-token' });
      
      const config = await apiService.getAuthHeaders();
      expect(config.headers.Authorization).toBe('Bearer test-token');
    });

    it('トークンが存在しない場合、Authorizationヘッダーが追加されないこと', async () => {
      const config = await apiService.getAuthHeaders();
      expect(config.headers.Authorization).toBeUndefined();
    });
  });

  describe('HTTPメソッド', () => {
    it('GET リクエストが正しく実行されること', async () => {
      const mockData = { id: 1, name: 'Test' };
      apiService.axios.get.mockResolvedValueOnce({ data: mockData });

      const result = await apiService.get('/test');
      
      expect(apiService.axios.get).toHaveBeenCalledWith('/test', expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('POST リクエストが正しく実行されること', async () => {
      const postData = { name: 'New Item' };
      const mockResponse = { id: 1, ...postData };
      apiService.axios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await apiService.post('/test', postData);
      
      expect(apiService.axios.post).toHaveBeenCalledWith('/test', postData, expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('PUT リクエストが正しく実行されること', async () => {
      const putData = { id: 1, name: 'Updated Item' };
      apiService.axios.put.mockResolvedValueOnce({ data: putData });

      const result = await apiService.put('/test/1', putData);
      
      expect(apiService.axios.put).toHaveBeenCalledWith('/test/1', putData, expect.any(Object));
      expect(result).toEqual(putData);
    });

    it('PATCH リクエストが正しく実行されること', async () => {
      const patchData = { name: 'Patched Item' };
      const mockResponse = { id: 1, name: 'Patched Item', updated: true };
      apiService.axios.patch.mockResolvedValueOnce({ data: mockResponse });

      const result = await apiService.patch('/test/1', patchData);
      
      expect(apiService.axios.patch).toHaveBeenCalledWith('/test/1', patchData, expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('DELETE リクエストが正しく実行されること', async () => {
      apiService.axios.delete.mockResolvedValueOnce({ data: { success: true } });

      const result = await apiService.delete('/test/1');
      
      expect(apiService.axios.delete).toHaveBeenCalledWith('/test/1', expect.any(Object));
      expect(result).toEqual({ success: true });
    });
  });

  describe('エラーハンドリング', () => {
    it('4xx エラーが適切にハンドリングされること', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        },
      };
      apiService.axios.get.mockRejectedValueOnce(errorResponse);

      await expect(apiService.get('/test')).rejects.toThrow(ApiError);
      
      try {
        await apiService.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(400);
        expect(error.message).toBe('Bad Request');
      }
    });

    it('401 エラーで認証情報がクリアされること', async () => {
      useAuthStore.setState({ token: 'test-token', user: { id: '1' } });
      
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      apiService.axios.get.mockRejectedValueOnce(errorResponse);

      try {
        await apiService.get('/test');
      } catch (error) {
        expect(error.status).toBe(401);
        expect(useAuthStore.getState().token).toBeNull();
        expect(useAuthStore.getState().user).toBeNull();
      }
    });

    it('5xx エラーが適切にハンドリングされること', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      apiService.axios.get.mockRejectedValueOnce(errorResponse);

      await expect(apiService.get('/test')).rejects.toThrow(ApiError);
      
      try {
        await apiService.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(500);
        expect(error.message).toBe('Internal Server Error');
      }
    });

    it('ネットワークエラーが適切にハンドリングされること', async () => {
      const networkError = new Error('Network Error');
      apiService.axios.get.mockRejectedValueOnce(networkError);

      try {
        await apiService.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(0);
        expect(error.message).toBe('Network Error');
      }
    });
  });

  describe('ローディング状態管理', () => {
    it('リクエスト中にローディング状態が更新されること', async () => {
      const loadingStore = useLoadingStore.getState();
      const setLoadingSpy = vi.spyOn(loadingStore, 'setLoading');

      apiService.axios.get.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
      );

      const promise = apiService.get('/test', { loadingKey: 'test-loading' });
      
      // ローディング開始
      expect(setLoadingSpy).toHaveBeenCalledWith('test-loading', true);
      
      await promise;
      
      // ローディング終了
      expect(setLoadingSpy).toHaveBeenCalledWith('test-loading', false);
    });

    it('エラー時にもローディング状態がクリアされること', async () => {
      const loadingStore = useLoadingStore.getState();
      const setLoadingSpy = vi.spyOn(loadingStore, 'setLoading');

      apiService.axios.get.mockRejectedValueOnce(new Error('Test Error'));

      try {
        await apiService.get('/test', { loadingKey: 'test-loading' });
      } catch (error) {
        // エラー時にもローディング終了
        expect(setLoadingSpy).toHaveBeenLastCalledWith('test-loading', false);
      }
    });
  });

  describe('リトライ機能', () => {
    it('指定回数リトライが実行されること', async () => {
      let attempts = 0;
      apiService.axios.get.mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary Error'));
        }
        return Promise.resolve({ data: { success: true } });
      });

      const result = await apiService.get('/test', { retry: 3, retryDelay: 10 });
      
      expect(attempts).toBe(3);
      expect(result).toEqual({ success: true });
    });

    it('リトライ回数を超えた場合エラーがスローされること', async () => {
      apiService.axios.get.mockRejectedValue(new Error('Persistent Error'));

      await expect(
        apiService.get('/test', { retry: 2, retryDelay: 10 })
      ).rejects.toThrow('Persistent Error');
      
      expect(apiService.axios.get).toHaveBeenCalledTimes(3); // 初回 + 2回リトライ
    });
  });
});