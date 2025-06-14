import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, isAxiosError } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { useLoadingStore } from '../stores/loading.store';

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends AxiosRequestConfig {
  loadingKey?: string;
  retry?: number;
  retryDelay?: number;
}

class ApiService {
  public axios: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: this.getDefaultHeaders(),
    });

    this.setupInterceptors();
  }

  private getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  private setupInterceptors() {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Clear auth state on 401
          useAuthStore.setState({
            token: null,
            user: null,
            isAuthenticated: false,
          });
          localStorage.removeItem('auth-token');
        }
        return Promise.reject(error);
      }
    );
  }

  async getAuthHeaders() {
    const token = useAuthStore.getState().token;
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
  }

  getBaseURL() {
    return this.baseURL;
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const { loadingKey, retry = 0, retryDelay = 1000, ...axiosOptions } = options;

    // Set loading state if key provided
    if (loadingKey) {
      useLoadingStore.getState().setLoading(loadingKey, true);
    }

    try {
      const response = await this.axios.request<T>({
        method,
        url,
        data,
        ...axiosOptions,
      });
      return response.data;
    } catch (error) {
      if (retry > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.request(method, url, data, { ...options, retry: retry - 1 });
      }

      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        throw new ApiError(
          axiosError.response?.data?.message || error.message,
          axiosError.response?.status || 0,
          axiosError.response?.data
        );
      }
      throw new ApiError(error.message, 0);
    } finally {
      // Clear loading state if key provided
      if (loadingKey) {
        useLoadingStore.getState().setLoading(loadingKey, false);
      }
    }
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('get', url, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('post', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('put', url, data, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('patch', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('delete', url, undefined, options);
  }
}

export const apiService = new ApiService();