export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  error?: unknown;
}

export class ApiRequestError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = options?.status;
    this.code = options?.code;
  }
}
