// ============================================
// REQUEST/RESPONSE INTERCEPTORS
// Auth token injection and response handling
// ============================================

import { supabase } from './supabaseClient';
import { ApiError, ApiErrorCode, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './apiTypes';
import { apiClient } from './apiClient';

// ============================================
// AUTH TOKEN INTERCEPTOR
// ============================================

/**
 * Token refresh state to prevent concurrent refresh requests
 */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Get the current auth token from Supabase
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Refresh the auth token
 */
async function refreshAuthToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[Interceptors] Token refresh failed:', error.message);
      }
      return null;
    }
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Get or refresh the auth token with deduplication
 */
async function getOrRefreshToken(): Promise<string | null> {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const token = await getAuthToken();
  if (token) {
    return token;
  }

  // Token is missing or expired, try to refresh
  isRefreshing = true;
  refreshPromise = refreshAuthToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Auth token request interceptor
 * Injects the Bearer token into request headers
 */
export const authTokenInterceptor: RequestInterceptor = async (url, options) => {
  // Skip if the request explicitly opts out
  const headers = options.headers as Record<string, string> | undefined;
  if (headers?.['X-Skip-Auth'] === 'true') {
    // Remove the skip flag before sending
    const newHeaders = { ...headers };
    delete newHeaders['X-Skip-Auth'];
    return {
      url,
      options: { ...options, headers: newHeaders },
    };
  }

  const token = await getOrRefreshToken();
  
  if (token) {
    return {
      url,
      options: {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
      },
    };
  }

  return { url, options };
};

// ============================================
// LOGGING INTERCEPTOR (DEV ONLY)
// ============================================

/**
 * Request logging interceptor
 * Only active in development mode
 */
export const requestLoggingInterceptor: RequestInterceptor = (url, options) => {
  if (import.meta.env.DEV) {
    const method = (options.method || 'GET').toUpperCase();
    const timestamp = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[API Request] ${timestamp} ${method} ${url}`);
    
    // Log body for non-GET requests (without sensitive data)
    if (options.body && method !== 'GET') {
      try {
        const body = JSON.parse(options.body as string);
        // Redact sensitive fields
        const redactedBody = redactSensitiveData(body);
        // eslint-disable-next-line no-console
        console.log('[API Request Body]', redactedBody);
      } catch {
        // Body is not JSON, skip logging
      }
    }
  }
  return { url, options };
};

/**
 * Response logging interceptor
 * Only active in development mode
 */
export const responseLoggingInterceptor: ResponseInterceptor = async (response, request) => {
  if (import.meta.env.DEV) {
    const method = (request.options.method || 'GET').toUpperCase();
    // eslint-disable-next-line no-console
    console.log(
      `[API Response] ${method} ${request.url} - ${response.status} ${response.statusText}`
    );
    
    // Log response headers for debugging
    if (response.status >= 400) {
      // eslint-disable-next-line no-console
      console.log('[API Response Headers]', Object.fromEntries(response.headers.entries()));
    }
  }
  return response;
};

/**
 * Redact sensitive data from objects before logging
 */
function redactSensitiveData(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization',
    'creditCard',
    'ssn',
  ];

  const redacted: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redactSensitiveData(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

// ============================================
// ERROR TRANSFORMATION INTERCEPTOR
// ============================================

/**
 * Error transformation interceptor
 * Transforms generic errors into ApiError instances
 */
export const errorTransformInterceptor: ErrorInterceptor = (error, _request) => {
  // Already an ApiError, return as-is
  if (error instanceof ApiError) {
    return error;
  }

  // Network error
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return new ApiError(
      'Network connection failed. Please check your internet connection.',
      0,
      ApiErrorCode.NETWORK_ERROR
    );
  }

  // Timeout/abort error
  if (error.name === 'AbortError') {
    return new ApiError(
      'Request timed out. Please try again.',
      0,
      ApiErrorCode.TIMEOUT
    );
  }

  // Unknown error
  return new ApiError(
    error.message || 'An unexpected error occurred',
    0,
    ApiErrorCode.UNKNOWN,
    { originalError: error.name }
  );
};

// ============================================
// UNAUTHORIZED RESPONSE HANDLER
// ============================================

/**
 * Handle 401 responses by attempting token refresh and retry
 */
export const unauthorizedResponseInterceptor: ResponseInterceptor = async (response, request) => {
  if (response.status === 401) {
    // Try to refresh the token
    const newToken = await refreshAuthToken();
    
    if (newToken) {
      // Retry the original request with the new token
      const retryOptions: RequestInit = {
        ...request.options,
        headers: {
          ...(request.options.headers as Record<string, string>),
          Authorization: `Bearer ${newToken}`,
        },
      };
      
      const retryResponse = await fetch(request.url, retryOptions);
      return retryResponse;
    }
    
    // Token refresh failed, sign out the user
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[Interceptors] Token refresh failed, signing out user');
    }
    await supabase.auth.signOut();
  }
  
  return response;
};

// ============================================
// RATE LIMIT HANDLER
// ============================================

/**
 * Handle 429 rate limit responses
 * Extracts retry-after header and provides helpful error
 */
export const rateLimitInterceptor: ResponseInterceptor = async (response, _request) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
    
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[Interceptors] Rate limited. Retry after ${retryAfterSeconds} seconds`);
    }
    
    // Add retry info to response for handling in the client
    // The original response is returned for the API client to handle
  }
  
  return response;
};

// ============================================
// SETUP INTERCEPTORS
// ============================================

/**
 * Setup all default interceptors on the API client
 */
export function setupDefaultInterceptors(): () => void {
  const removeAuth = apiClient.addRequestInterceptor(authTokenInterceptor);
  const removeRequestLogging = apiClient.addRequestInterceptor(requestLoggingInterceptor);
  const removeResponseLogging = apiClient.addResponseInterceptor(responseLoggingInterceptor);
  const removeUnauthorized = apiClient.addResponseInterceptor(unauthorizedResponseInterceptor);
  const removeRateLimit = apiClient.addResponseInterceptor(rateLimitInterceptor);
  const removeErrorTransform = apiClient.addErrorInterceptor(errorTransformInterceptor);

  // Return cleanup function
  return () => {
    removeAuth();
    removeRequestLogging();
    removeResponseLogging();
    removeUnauthorized();
    removeRateLimit();
    removeErrorTransform();
  };
}

// ============================================
// CUSTOM INTERCEPTOR FACTORIES
// ============================================

/**
 * Create a custom header injection interceptor
 */
export function createHeaderInterceptor(
  headers: Record<string, string>
): RequestInterceptor {
  return (url, options) => ({
    url,
    options: {
      ...options,
      headers: {
        ...(options.headers as Record<string, string>),
        ...headers,
      },
    },
  });
}

/**
 * Create a custom response transformation interceptor
 */
export function createResponseTransformInterceptor<T, R>(
  transform: (data: T) => R
): ResponseInterceptor {
  return async (response, _request) => {
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        const transformed = transform(data);
        
        // Create a new response with transformed data
        return new Response(JSON.stringify(transformed), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
    }
    return response;
  };
}

/**
 * Create an error retry interceptor for specific error codes
 */
export function createConditionalRetryInterceptor(
  shouldRetry: (error: Error) => boolean,
  maxRetries: number = 3
): ErrorInterceptor {
  const retryCount = new Map<string, number>();
  
  return async (error, request) => {
    const requestKey = `${request.options.method || 'GET'}-${request.url}`;
    const currentRetries = retryCount.get(requestKey) || 0;
    
    if (shouldRetry(error) && currentRetries < maxRetries) {
      retryCount.set(requestKey, currentRetries + 1);
      // Note: Actual retry logic would need to be implemented in the client
      // This interceptor just tracks and allows the retry
    }
    
    return error;
  };
}
