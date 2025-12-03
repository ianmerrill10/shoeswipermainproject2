// ============================================
// TYPED API CLIENT WITH RETRY LOGIC
// ShoeSwiper API Layer
// ============================================

import {
  ApiError,
  ApiErrorCode,
  ApiRequestOptions,
  ApiResponse,
  HttpMethod,
  Interceptors,
  NetworkError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  TimeoutError,
} from './apiTypes';

// Default configuration values
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second
const DEFAULT_MAX_RETRY_DELAY = 30000; // 30 seconds
const DEFAULT_BACKOFF_MULTIPLIER = 2;

/**
 * Get error code from HTTP status
 */
function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return ApiErrorCode.FORBIDDEN;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 422:
      return ApiErrorCode.VALIDATION_ERROR;
    case 429:
      return ApiErrorCode.RATE_LIMITED;
    default:
      if (status >= 500) return ApiErrorCode.SERVER_ERROR;
      return ApiErrorCode.UNKNOWN;
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  multiplier: number = DEFAULT_BACKOFF_MULTIPLIER
): number {
  // Exponential backoff: baseDelay * multiplier^attempt
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);
  
  // Add jitter (random variation of ±25%) to prevent thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  const delayWithJitter = exponentialDelay + jitter;
  
  // Cap at maximum delay
  return Math.min(delayWithJitter, maxDelay);
}

/**
 * Build URL with query parameters
 */
function buildUrl(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  // Combine base URL and endpoint
  let url = baseUrl;
  if (endpoint) {
    // Remove trailing slash from base URL and leading slash from endpoint
    url = baseUrl.replace(/\/$/, '') + '/' + endpoint.replace(/^\//, '');
  }

  // Add query parameters
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  return url;
}

/**
 * Parse error response from the server
 */
async function parseErrorResponse(response: Response): Promise<{
  message: string;
  details?: Record<string, unknown>;
}> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const json = await response.json();
      return {
        message: json.message || json.error || response.statusText,
        details: json,
      };
    }
    const text = await response.text();
    return {
      message: text || response.statusText,
    };
  } catch {
    return {
      message: response.statusText || 'Unknown error',
    };
  }
}

/**
 * Create a timeout signal that aborts after the specified duration
 */
function createTimeoutSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller.signal;
}

/**
 * Combine multiple abort signals
 */
function combineSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController();
  
  for (const signal of signals) {
    if (signal) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }
  
  return controller.signal;
}

/**
 * Type-safe API Client with retry logic and interceptors
 */
export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetryCount: number;
  private defaultRetryDelay: number;
  private defaultMaxRetryDelay: number;
  private defaultHeaders: Record<string, string>;
  private interceptors: Interceptors;

  constructor(config: {
    baseUrl: string;
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
    maxRetryDelay?: number;
    defaultHeaders?: Record<string, string>;
    interceptors?: Partial<Interceptors>;
  }) {
    this.baseUrl = config.baseUrl;
    this.defaultTimeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.defaultRetryCount = config.retryCount ?? DEFAULT_RETRY_COUNT;
    this.defaultRetryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;
    this.defaultMaxRetryDelay = config.maxRetryDelay ?? DEFAULT_MAX_RETRY_DELAY;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
    this.interceptors = {
      request: config.interceptors?.request ?? [],
      response: config.interceptors?.response ?? [],
      error: config.interceptors?.error ?? [],
    };
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.interceptors.request.push(interceptor);
    return () => {
      const index = this.interceptors.request.indexOf(interceptor);
      if (index !== -1) {
        this.interceptors.request.splice(index, 1);
      }
    };
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.interceptors.response.push(interceptor);
    return () => {
      const index = this.interceptors.response.indexOf(interceptor);
      if (index !== -1) {
        this.interceptors.response.splice(index, 1);
      }
    };
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.interceptors.error.push(interceptor);
    return () => {
      const index = this.interceptors.error.indexOf(interceptor);
      if (index !== -1) {
        this.interceptors.error.splice(index, 1);
      }
    };
  }

  /**
   * Execute request with all interceptors
   */
  private async executeWithInterceptors(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    // Apply request interceptors
    let currentUrl = url;
    let currentOptions = options;
    
    for (const interceptor of this.interceptors.request) {
      const result = await interceptor(currentUrl, currentOptions);
      currentUrl = result.url;
      currentOptions = result.options;
    }

    // Execute the request
    let response: Response;
    try {
      response = await fetch(currentUrl, currentOptions);
    } catch (error) {
      // Apply error interceptors
      let currentError = error instanceof Error ? error : new Error(String(error));
      for (const interceptor of this.interceptors.error) {
        currentError = await interceptor(currentError, { url: currentUrl, options: currentOptions });
      }
      throw currentError;
    }

    // Apply response interceptors
    let currentResponse = response;
    for (const interceptor of this.interceptors.response) {
      currentResponse = await interceptor(currentResponse, { url: currentUrl, options: currentOptions });
    }

    return currentResponse;
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry(
    url: string,
    options: RequestInit,
    retryCount: number,
    retryDelay: number,
    maxRetryDelay: number
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await this.executeWithInterceptors(url, options);

        // If the request succeeded but returned an error status
        if (!response.ok) {
          const { message, details } = await parseErrorResponse(response);
          const error = new ApiError(
            message,
            response.status,
            getErrorCodeFromStatus(response.status),
            details
          );

          // Only retry if the error is retryable and we have attempts left
          if (!error.shouldRetry() || attempt >= retryCount) {
            throw error;
          }

          lastError = error;
        } else {
          return response;
        }
      } catch (error) {
        // Handle abort errors (don't retry)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new TimeoutError('Request was aborted');
        }

        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          lastError = new NetworkError('Network request failed');
        } else if (error instanceof Error) {
          lastError = error;
        } else {
          lastError = new Error(String(error));
        }

        // Check if we should retry
        const shouldRetry = 
          (lastError instanceof NetworkError && lastError.shouldRetry()) ||
          (lastError instanceof TimeoutError && lastError.shouldRetry()) ||
          (lastError instanceof ApiError && lastError.shouldRetry());

        if (!shouldRetry || attempt >= retryCount) {
          throw lastError;
        }
      }

      // Calculate delay with exponential backoff and wait before retrying
      if (attempt < retryCount) {
        const delay = calculateBackoffDelay(attempt, retryDelay, maxRetryDelay);
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log(`[ApiClient] Retry attempt ${attempt + 1}/${retryCount} after ${Math.round(delay)}ms`);
        }
        await sleep(delay);
      }
    }

    // Should never reach here, but TypeScript needs this
    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Make an HTTP request
   */
  async request<TResponse, TBody = unknown>(
    method: HttpMethod,
    endpoint: string,
    options: ApiRequestOptions<TBody> = {}
  ): Promise<ApiResponse<TResponse>> {
    const {
      body,
      params,
      headers,
      timeout = this.defaultTimeout,
      retryCount = this.defaultRetryCount,
      retryDelay = this.defaultRetryDelay,
      maxRetryDelay = this.defaultMaxRetryDelay,
      signal,
      skipAuth: _skipAuth,
      ...restOptions
    } = options;

    // Build the full URL
    const url = buildUrl(this.baseUrl, endpoint, params);

    // Create timeout signal
    const timeoutSignal = createTimeoutSignal(timeout);
    const combinedSignal = combineSignals(timeoutSignal, signal);

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      signal: combinedSignal,
      ...restOptions,
    };

    // Add body for methods that support it
    if (body !== undefined && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Execute with retry
    const response = await this.executeWithRetry(
      url,
      requestOptions,
      retryCount,
      retryDelay,
      maxRetryDelay
    );

    // Parse response
    const contentType = response.headers.get('content-type');
    let data: TResponse;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as TResponse;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  /**
   * GET request
   */
  async get<TResponse>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse>('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TBody>('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   */
  async put<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TBody>('PUT', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   */
  async patch<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TBody>('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete<TResponse>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse>('DELETE', endpoint, options);
  }
}

// ============================================
// DEFAULT API CLIENT INSTANCE
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Default API client instance
 */
export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  retryCount: DEFAULT_RETRY_COUNT,
  retryDelay: DEFAULT_RETRY_DELAY,
  maxRetryDelay: DEFAULT_MAX_RETRY_DELAY,
});

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Typed GET request
 */
export async function get<T>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient.get<T>(endpoint, options);
  return response.data;
}

/**
 * Typed POST request
 */
export async function post<T, B = unknown>(
  endpoint: string,
  body?: B,
  options?: Omit<ApiRequestOptions<B>, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient.post<T, B>(endpoint, body, options);
  return response.data;
}

/**
 * Typed PUT request
 */
export async function put<T, B = unknown>(
  endpoint: string,
  body?: B,
  options?: Omit<ApiRequestOptions<B>, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient.put<T, B>(endpoint, body, options);
  return response.data;
}

/**
 * Typed PATCH request
 */
export async function patch<T, B = unknown>(
  endpoint: string,
  body?: B,
  options?: Omit<ApiRequestOptions<B>, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient.patch<T, B>(endpoint, body, options);
  return response.data;
}

/**
 * Typed DELETE request
 */
export async function del<T>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient.delete<T>(endpoint, options);
  return response.data;
}

export { buildUrl, calculateBackoffDelay, sleep };
