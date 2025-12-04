// ============================================
// API TYPES
// Type-safe definitions for the API layer
// ============================================

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Custom API error class with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    // Maintain proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if the error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if the error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if the error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if the error is a forbidden error
   */
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  /**
   * Check if the error is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if the error is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * Check if the error should be retried
   */
  shouldRetry(): boolean {
    // Don't retry client errors (except rate limiting)
    if (this.isClientError() && !this.isRateLimitError()) {
      return false;
    }
    return true;
  }
}

/**
 * Network error class for connection failures
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }

  shouldRetry(): boolean {
    return true;
  }
}

/**
 * Timeout error class
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }

  shouldRetry(): boolean {
    return true;
  }
}

/**
 * API error codes
 */
export const ApiErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ApiErrorCodeType = typeof ApiErrorCode[keyof typeof ApiErrorCode];

/**
 * Request configuration options
 */
export interface RequestConfig {
  /** Request headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retryCount?: number;
  /** Initial delay between retries in milliseconds */
  retryDelay?: number;
  /** Maximum delay between retries in milliseconds */
  maxRetryDelay?: number;
  /** Skip authentication header injection */
  skipAuth?: boolean;
  /** AbortController signal for request cancellation */
  signal?: AbortSignal;
}

/**
 * API request options
 */
export interface ApiRequestOptions<TBody = unknown> extends RequestConfig {
  /** HTTP method */
  method?: HttpMethod;
  /** Request body */
  body?: TBody;
  /** URL query parameters */
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (
  url: string,
  options: RequestInit
) => Promise<{ url: string; options: RequestInit }> | { url: string; options: RequestInit };

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = (
  response: Response,
  request: { url: string; options: RequestInit }
) => Promise<Response> | Response;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (
  error: Error,
  request: { url: string; options: RequestInit }
) => Promise<Error> | Error;

/**
 * Interceptors configuration
 */
export interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
  error: ErrorInterceptor[];
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Base URL for all requests */
  baseUrl: string;
  /** Default request timeout in milliseconds */
  timeout?: number;
  /** Default number of retry attempts */
  retryCount?: number;
  /** Default retry delay in milliseconds */
  retryDelay?: number;
  /** Maximum retry delay in milliseconds */
  maxRetryDelay?: number;
  /** Default headers for all requests */
  defaultHeaders?: Record<string, string>;
  /** Request interceptors */
  interceptors?: Partial<Interceptors>;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Cache time-to-live in milliseconds */
  ttl: number;
  /** Maximum cache entries */
  maxEntries?: number;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Number of retry attempts */
  count: number;
  /** Initial delay between retries in milliseconds */
  delay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
}

/**
 * Shoe API response types (matching existing types)
 */
export interface ShoeApiResponse {
  id: string;
  name: string;
  brand: string;
  price?: number | null;
  image_url: string;
  amazon_url: string;
  amazon_asin: string;
  style_tags: string[];
  color_tags: string[];
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  favorite_count: number;
  view_count: number;
  click_count: number;
  is_active: boolean;
  is_featured: boolean;
}

/**
 * User preferences API response
 */
export interface UserPreferencesApiResponse {
  userId: string;
  preferredBrands: string[];
  preferredStyles: string[];
  preferredColors: string[];
  gender: 'men' | 'women' | 'unisex' | 'kids';
  priceRange: {
    min: number;
    max: number;
  };
}

/**
 * Auth token response
 */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Generic API list response
 */
export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// EDGE FUNCTION API TYPES
// ============================================

/**
 * Outfit analysis request payload
 */
export interface AnalyzeOutfitRequest {
  image: string; // Base64 encoded image data (without prefix)
}

/**
 * Outfit analysis response from Gemini Vision API
 */
export interface AnalyzeOutfitResponse {
  rating: number; // 1-10 rating
  feedback: string; // Personalized style feedback
  style_tags: string[]; // Detected style tags
  dominant_colors: string[]; // Dominant colors in the outfit
  detected_shoe: string | null; // Description of shoes if visible
}

/**
 * Affiliate click tracking request
 */
export interface TrackAffiliateRequest {
  shoeId: string;
  source?: string; // Where the click originated (feed, search, etc.)
  metadata?: Record<string, unknown>; // Additional tracking data
}

/**
 * Affiliate click tracking response
 */
export interface TrackAffiliateResponse {
  success: boolean;
  tracked: boolean;
  affiliateUrl?: string;
  message: string;
}

/**
 * Checkout session request for Stripe
 */
export interface CreateCheckoutRequest {
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

/**
 * Checkout session response from Stripe
 */
export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Error response structure from Edge Functions
 */
export interface EdgeFunctionError {
  error: string;
  fallback?: boolean;
}

/**
 * Result type for Edge Function calls - Success case
 */
export interface EdgeFunctionSuccess<T> {
  success: true;
  data: T;
}

/**
 * Result type for Edge Function calls - Error case
 */
export interface EdgeFunctionFailure {
  success: false;
  error: string;
  fallback: boolean;
}

/**
 * Result type for Edge Function calls
 */
export type EdgeFunctionResult<T> = EdgeFunctionSuccess<T> | EdgeFunctionFailure;

/**
 * Shoe match result from outfit analysis
 */
export interface ShoeMatchResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  amazon_url: string;
  style_tags: string[];
  color_tags: string[];
  match_score: number;
}

/**
 * Analytics event types
 */
export type AnalyticsEventType =
  | 'shoe_view'
  | 'shoe_click'
  | 'music_click'
  | 'panel_open'
  | 'share'
  | 'favorite'
  | 'swipe';

/**
 * Analytics tracking result
 */
export interface AnalyticsTrackingResult {
  tracked: boolean;
}
