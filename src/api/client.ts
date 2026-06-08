import axios, { AxiosInstance } from 'axios';
import { ApiResponse } from './types';
import { createRequestInterceptor, createResponseInterceptor, createErrorInterceptor } from './interceptors';
import { handleApiResponse, handleApiError } from './responseHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor(onUnauthorized?: () => void) {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Register interceptors
    this.client.interceptors.request.use(
      createRequestInterceptor()
    );
    this.client.interceptors.response.use(
      createResponseInterceptor(),
      createErrorInterceptor({ onUnauthorized })
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, { params });
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async post<T>(url: string, body?: unknown): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, body);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async put<T>(url: string, body: unknown): Promise<T> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, body);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async patch<T>(url: string, body: unknown): Promise<T> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, body);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const apiClient = new ApiClient(() => {
  console.warn('Session expired, awaiting auth redirect...');
});
export default apiClient;
