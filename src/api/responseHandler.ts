import { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse, ApiRequestError } from './types';

export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  const payload = response.data;

  if (!payload) {
    throw new ApiRequestError('Empty response from server', { status: response.status });
  }

  if (!payload.success) {
    throw new ApiRequestError(payload.message || 'Request failed', {
      status: response.status,
      code: payload.code,
    });
  }

  return payload.data;
};

export const handleApiError = (error: unknown): never => {
  if (!error || typeof error !== 'object' || !('response' in error) || !('isAxiosError' in error)) {
    throw new ApiRequestError('Unexpected error occurred');
  }

  const axiosError = error as AxiosError<ApiResponse<unknown>>;
  const status = axiosError.response?.status;
  const responseBody = axiosError.response?.data;
  const message = responseBody?.message || mapHttpStatusToMessage(status);
  const code = responseBody?.code || 'HTTP_ERROR';

  throw new ApiRequestError(message, { status, code });
};

const mapHttpStatusToMessage = (status?: number): string => {
  switch (status) {
    case 400:
      return 'Bad request (400)';
    case 401:
      return 'Unauthorized (401), please sign in again';
    case 403:
      return 'Forbidden (403), permission denied';
    case 404:
      return 'Resource not found (404)';
    case 500:
      return 'Internal server error (500)';
    default:
      return 'Request failed';
  }
};
