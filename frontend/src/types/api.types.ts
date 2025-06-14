import type { AxiosRequestConfig } from 'axios';

export interface ApiRequestOptions extends AxiosRequestConfig {
  loadingKey?: string;
  retry?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}