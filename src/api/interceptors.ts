import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from './types';

export interface RequestInterceptorConfig {
  onUnauthorized?: () => void;
}

let isRedirectingToLogin = false;

export const createRequestInterceptor = () => {
  return (axiosConfig: InternalAxiosRequestConfig) => {
    // If we already detected a 401 and are redirecting, abort all subsequent requests
    // so polling intervals don't keep hitting the server.
    if (isRedirectingToLogin) {
      const controller = new AbortController();
      axiosConfig.signal = controller.signal;
      controller.abort();
      return axiosConfig;
    }

    const correlationId = localStorage.getItem('correlation_id') || generateUuid();
    const requestId = generateUuid();

    localStorage.setItem('correlation_id', correlationId);

    axiosConfig.headers.Authorization = getAuthHeader();
    axiosConfig.headers['X-Correlation-Id'] = correlationId;
    axiosConfig.headers['X-Request-Id'] = requestId;
    axiosConfig.headers['X-Client-App'] = 'ai-agent-coding-dashboard';
    axiosConfig.headers['Content-Type'] = 'application/json';
    axiosConfig.headers['Accept'] = 'application/json';

    return axiosConfig;
  };
};

export const createResponseInterceptor = () => {
  return (response: AxiosResponse) => {
    const correlationId = response.headers['x-correlation-id'];
    const requestId = response.headers['x-request-id'];

    if (correlationId) {
      localStorage.setItem('correlation_id', correlationId);
    }

    console.debug('API Response', {
      status: response.status,
      correlationId,
      requestId,
      path: response.config.url,
    });

    return response;
  };
};

export const createErrorInterceptor = (config: RequestInterceptorConfig) => {
  return (error: AxiosError<ApiResponse<unknown>>) => {
    // Silently ignore aborted requests (caused by our own cancellation above)
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const correlationId = error.response?.headers['x-correlation-id'] as string | undefined;
    const requestId = error.response?.headers['x-request-id'] as string | undefined;

    console.error('API Error', {
      status,
      correlationId,
      requestId,
      message: error.message,
      code: error.response?.data?.code,
    });

    if (status === 401) {
      handleUnauthorized(config);
    }

    return Promise.reject(error);
  };
};

function getAuthHeader(): string {
  const token = localStorage.getItem('auth_token');
  return token ? `Bearer ${token}` : '';
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function resetRedirectFlag(): void {
  isRedirectingToLogin = false;
}

function handleUnauthorized(config: RequestInterceptorConfig) {
  if (isRedirectingToLogin) {
    return;
  }
  isRedirectingToLogin = true;

  localStorage.removeItem('auth_token');
  localStorage.removeItem('correlation_id');

  // Notify AadAuthGate (or other auth handlers) to trigger a proper re-login flow.
  // This allows MSAL to do acquireTokenRedirect instead of a bare window.location reload.
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));

  if (config.onUnauthorized) {
    config.onUnauthorized();
  }
}
