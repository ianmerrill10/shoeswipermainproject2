// ============================================
// ENHANCED REACT QUERY CONFIGURATION
// Advanced caching and data fetching patterns
// ============================================

import { 
  QueryClient, 
  QueryClientConfig,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  DefaultOptions,
} from '@tanstack/react-query';
import { ApiError } from './apiTypes';

// ============================================
// CACHE TIME CONSTANTS
// ============================================

export const CacheTime = {
  /** 1 minute - For rapidly changing data */
  SHORT: 60 * 1000,
  /** 5 minutes - Default for most queries */
  MEDIUM: 5 * 60 * 1000,
  /** 30 minutes - For relatively stable data */
  LONG: 30 * 60 * 1000,
  /** 1 hour - For static reference data */
  VERY_LONG: 60 * 60 * 1000,
  /** 24 hours - For data that rarely changes */
  DAY: 24 * 60 * 60 * 1000,
} as const;

export const StaleTime = {
  /** Immediately stale - Always refetch on mount */
  IMMEDIATE: 0,
  /** 30 seconds - For frequently updated data */
  VERY_SHORT: 30 * 1000,
  /** 1 minute - For moderately dynamic data */
  SHORT: 60 * 1000,
  /** 5 minutes - Default for most queries */
  MEDIUM: 5 * 60 * 1000,
  /** 15 minutes - For stable data */
  LONG: 15 * 60 * 1000,
  /** 1 hour - For static data */
  VERY_LONG: 60 * 60 * 1000,
} as const;

// ============================================
// RETRY CONFIGURATION
// ============================================

/**
 * Custom retry function that respects ApiError types
 */
function shouldRetryQuery(failureCount: number, error: Error): boolean {
  // Don't retry more than 3 times
  if (failureCount >= 3) {
    return false;
  }

  // Don't retry client errors (4xx) except rate limiting
  if (error instanceof ApiError) {
    if (error.isClientError() && !error.isRateLimitError()) {
      return false;
    }
  }

  // Retry server errors and network issues
  return true;
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(attemptIndex: number, error: Error): number {
  // For rate limit errors, check the Retry-After header if available
  if (error instanceof ApiError && error.isRateLimitError()) {
    const retryAfter = error.details?.retryAfter;
    if (typeof retryAfter === 'number') {
      return retryAfter * 1000;
    }
    // Default to 60 seconds for rate limit
    return 60 * 1000;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, etc. with max of 30s
  const delay = Math.min(1000 * Math.pow(2, attemptIndex), 30000);
  // Add jitter
  return delay + Math.random() * 1000;
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Global error handler for queries
 */
function onQueryError(error: Error): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[React Query] Query error:', error.message);
  }

  // Handle authentication errors globally
  if (error instanceof ApiError && error.isAuthError()) {
    // Emit an event that the app can listen to for auth errors
    window.dispatchEvent(new CustomEvent('auth:error', { detail: error }));
  }
}

/**
 * Global error handler for mutations
 */
function onMutationError(error: Error): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[React Query] Mutation error:', error.message);
  }
}

// ============================================
// DEFAULT OPTIONS
// ============================================

const defaultQueryOptions: DefaultOptions['queries'] = {
  staleTime: StaleTime.MEDIUM,
  gcTime: CacheTime.MEDIUM, // Replaces cacheTime in v5
  retry: shouldRetryQuery,
  retryDelay: calculateRetryDelay,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: true,
};

const defaultMutationOptions: DefaultOptions['mutations'] = {
  retry: 1,
  retryDelay: 1000,
  onError: onMutationError,
};

// ============================================
// QUERY CLIENT CONFIGURATION
// ============================================

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
};

/**
 * Create a new QueryClient with enhanced configuration
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}

/**
 * Enhanced QueryClient with additional features
 */
export const enhancedQueryClient = createQueryClient();

// Add global error handling
enhancedQueryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.query.state.status === 'error') {
    const error = event.query.state.error;
    if (error instanceof Error) {
      onQueryError(error);
    }
  }
});

// ============================================
// QUERY KEY FACTORIES
// ============================================

/**
 * Query key factory for shoes
 */
export const shoeKeys = {
  all: ['shoes'] as const,
  lists: () => [...shoeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...shoeKeys.lists(), filters] as const,
  details: () => [...shoeKeys.all, 'detail'] as const,
  detail: (id: string) => [...shoeKeys.details(), id] as const,
  featured: () => [...shoeKeys.all, 'featured'] as const,
  trending: () => [...shoeKeys.all, 'trending'] as const,
  search: (query: string) => [...shoeKeys.all, 'search', query] as const,
};

/**
 * Query key factory for user data
 */
export const userKeys = {
  all: ['user'] as const,
  profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
  preferences: (userId: string) => [...userKeys.all, 'preferences', userId] as const,
  favorites: (userId: string) => [...userKeys.all, 'favorites', userId] as const,
  priceAlerts: (userId: string) => [...userKeys.all, 'priceAlerts', userId] as const,
};

/**
 * Query key factory for NFTs
 */
export const nftKeys = {
  all: ['nft'] as const,
  lists: () => [...nftKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...nftKeys.lists(), filters] as const,
  details: () => [...nftKeys.all, 'detail'] as const,
  detail: (id: string) => [...nftKeys.details(), id] as const,
  owned: (userId: string) => [...nftKeys.all, 'owned', userId] as const,
};

/**
 * Query key factory for blog posts
 */
export const blogKeys = {
  all: ['blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (blogType: string, params: Record<string, unknown>) => 
    [...blogKeys.lists(), blogType, params] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (blogType: string, slug: string) => [...blogKeys.details(), blogType, slug] as const,
  featured: (blogType: string) => [...blogKeys.all, 'featured', blogType] as const,
  related: (blogType: string, postId: string) => [...blogKeys.all, 'related', blogType, postId] as const,
};

// ============================================
// QUERY OPTIONS FACTORIES
// ============================================

/**
 * Create standard query options with type safety
 */
export function createQueryOptions<TData, TError = Error>(
  options: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey'> & {
    queryKey: QueryKey;
  }
): UseQueryOptions<TData, TError, TData, QueryKey> {
  return {
    ...options,
    staleTime: options.staleTime ?? StaleTime.MEDIUM,
    gcTime: options.gcTime ?? CacheTime.MEDIUM,
  };
}

/**
 * Create mutation options with type safety
 */
export function createMutationOptions<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationOptions<TData, TError, TVariables, TContext> {
  return {
    ...options,
  };
}

// ============================================
// CACHE INVALIDATION HELPERS
// ============================================

/**
 * Invalidate all shoe-related queries
 */
export function invalidateShoeQueries(): Promise<void> {
  return enhancedQueryClient.invalidateQueries({ queryKey: shoeKeys.all });
}

/**
 * Invalidate all user-related queries
 */
export function invalidateUserQueries(userId?: string): Promise<void> {
  if (userId) {
    return enhancedQueryClient.invalidateQueries({ 
      queryKey: [...userKeys.all, userId] 
    });
  }
  return enhancedQueryClient.invalidateQueries({ queryKey: userKeys.all });
}

/**
 * Invalidate all NFT-related queries
 */
export function invalidateNftQueries(): Promise<void> {
  return enhancedQueryClient.invalidateQueries({ queryKey: nftKeys.all });
}

/**
 * Prefetch a query for faster navigation
 */
export async function prefetchQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  staleTime?: number
): Promise<void> {
  await enhancedQueryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: staleTime ?? StaleTime.MEDIUM,
  });
}

// ============================================
// OPTIMISTIC UPDATE HELPERS
// ============================================

/**
 * Create an optimistic update context for mutations
 */
export function createOptimisticUpdate<T>(
  queryKey: QueryKey,
  updateFn: (oldData: T | undefined) => T
): {
  onMutate: () => Promise<{ previousData: T | undefined }>;
  onError: (err: Error, variables: unknown, context: { previousData: T | undefined } | undefined) => void;
  onSettled: () => Promise<void>;
} {
  return {
    onMutate: async () => {
      // Cancel any outgoing refetches
      await enhancedQueryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = enhancedQueryClient.getQueryData<T>(queryKey);

      // Optimistically update
      enhancedQueryClient.setQueryData<T>(queryKey, updateFn);

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        enhancedQueryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: async () => {
      // Refetch after error or success
      await enhancedQueryClient.invalidateQueries({ queryKey });
    },
  };
}

// ============================================
// BACKGROUND REFRESH UTILITIES
// ============================================

/**
 * Setup background refresh for critical data
 */
export function setupBackgroundRefresh(intervalMs: number = 5 * 60 * 1000): () => void {
  const interval = setInterval(() => {
    // Refresh featured shoes in the background
    enhancedQueryClient.invalidateQueries({ 
      queryKey: shoeKeys.featured(),
      refetchType: 'none', // Don't force immediate refetch
    });

    // Refresh trending shoes
    enhancedQueryClient.invalidateQueries({
      queryKey: shoeKeys.trending(),
      refetchType: 'none',
    });
  }, intervalMs);

  return () => clearInterval(interval);
}

// ============================================
// QUERY STATE SELECTORS
// ============================================

/**
 * Check if a query is loading
 */
export function isQueryLoading(queryKey: QueryKey): boolean {
  const state = enhancedQueryClient.getQueryState(queryKey);
  return state?.status === 'pending';
}

/**
 * Check if a query has data
 */
export function hasQueryData(queryKey: QueryKey): boolean {
  return enhancedQueryClient.getQueryData(queryKey) !== undefined;
}

/**
 * Get query error if any
 */
export function getQueryError(queryKey: QueryKey): Error | null {
  const state = enhancedQueryClient.getQueryState(queryKey);
  return state?.error ?? null;
}

// Export the enhanced client as the default
export { enhancedQueryClient as queryClient };
