// ============================================
// CUSTOM API HOOKS
// React Query hooks for data fetching
// ============================================

import { useCallback, useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData,
} from '@tanstack/react-query';
import { ApiError, PaginatedResponse, ShoeApiResponse, UserPreferencesApiResponse } from './apiTypes';
import { apiClient, get, post, put, del } from './apiClient';
import { 
  shoeKeys, 
  userKeys, 
  StaleTime, 
  createOptimisticUpdate,
} from './apiQueryConfig';
import { Shoe } from './types';

// ============================================
// GENERIC API HOOKS
// ============================================

/**
 * Generic query hook with built-in error handling
 */
export function useApiQuery<TData, TError = ApiError>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError, TData, QueryKey>({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Generic mutation hook with built-in error handling
 */
export function useApiMutation<TData, TVariables, TError = ApiError, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
) {
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...options,
  });
}

// ============================================
// SHOE HOOKS
// ============================================

/**
 * Fetch a single shoe by ID
 */
export function useShoe(
  shoeId: string,
  options?: Omit<UseQueryOptions<Shoe, ApiError, Shoe, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery<Shoe, ApiError>(
    shoeKeys.detail(shoeId),
    () => get<Shoe>(`/shoes/${shoeId}`),
    {
      staleTime: StaleTime.MEDIUM,
      enabled: Boolean(shoeId),
      ...options,
    }
  );
}

/**
 * Fetch a list of shoes with filters
 */
export function useShoes(
  filters: {
    brand?: string;
    gender?: 'men' | 'women' | 'unisex' | 'kids';
    styleTags?: string[];
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
  } = {},
  options?: Omit<UseQueryOptions<ShoeApiResponse[], ApiError, ShoeApiResponse[], QueryKey>, 'queryKey' | 'queryFn'>
) {
  const queryKey = shoeKeys.list(filters);
  
  return useApiQuery<ShoeApiResponse[], ApiError>(
    queryKey,
    () => get<ShoeApiResponse[]>('/shoes', { 
      params: {
        ...filters,
        styleTags: filters.styleTags?.join(','),
      } 
    }),
    {
      staleTime: StaleTime.SHORT,
      ...options,
    }
  );
}

/**
 * Fetch featured shoes
 */
export function useFeaturedShoes(
  options?: Omit<UseQueryOptions<Shoe[], ApiError, Shoe[], QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery<Shoe[], ApiError>(
    shoeKeys.featured(),
    () => get<Shoe[]>('/shoes/featured'),
    {
      staleTime: StaleTime.MEDIUM,
      ...options,
    }
  );
}

/**
 * Fetch trending shoes
 */
export function useTrendingShoes(
  options?: Omit<UseQueryOptions<Shoe[], ApiError, Shoe[], QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery<Shoe[], ApiError>(
    shoeKeys.trending(),
    () => get<Shoe[]>('/shoes/trending'),
    {
      staleTime: StaleTime.SHORT, // Trending changes frequently
      ...options,
    }
  );
}

/**
 * Search shoes with query
 */
export function useSearchShoes(
  query: string,
  options?: Omit<UseQueryOptions<Shoe[], ApiError, Shoe[], QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery<Shoe[], ApiError>(
    shoeKeys.search(query),
    () => get<Shoe[]>('/shoes/search', { params: { q: query } }),
    {
      staleTime: StaleTime.SHORT,
      enabled: query.length >= 2, // Only search with 2+ characters
      ...options,
    }
  );
}

/**
 * Infinite scroll for shoes
 */
export function useInfiniteShoes(
  filters: {
    brand?: string;
    gender?: 'men' | 'women' | 'unisex' | 'kids';
    styleTags?: string[];
  } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Shoe>,
      ApiError,
      InfiniteData<PaginatedResponse<Shoe>>,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) {
  return useInfiniteQuery<
    PaginatedResponse<Shoe>,
    ApiError,
    InfiniteData<PaginatedResponse<Shoe>>,
    QueryKey,
    number
  >({
    queryKey: [...shoeKeys.lists(), 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.get<PaginatedResponse<Shoe>>('/shoes', {
        params: {
          ...filters,
          page: pageParam,
          pageSize: 20,
          styleTags: filters.styleTags?.join(','),
        },
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: StaleTime.SHORT,
    ...options,
  });
}

// ============================================
// USER PREFERENCE HOOKS
// ============================================

/**
 * Fetch user preferences
 */
export function useUserPreferences(
  userId: string,
  options?: Omit<UseQueryOptions<UserPreferencesApiResponse, ApiError, UserPreferencesApiResponse, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery<UserPreferencesApiResponse, ApiError>(
    userKeys.preferences(userId),
    () => get<UserPreferencesApiResponse>(`/users/${userId}/preferences`),
    {
      staleTime: StaleTime.LONG,
      enabled: Boolean(userId),
      ...options,
    }
  );
}

/**
 * Update user preferences
 */
export function useUpdateUserPreferences(userId: string) {
  const queryClient = useQueryClient();
  
  return useApiMutation<UserPreferencesApiResponse, Partial<UserPreferencesApiResponse>, ApiError>(
    (preferences) => put<UserPreferencesApiResponse>(`/users/${userId}/preferences`, preferences),
    {
      onSuccess: (data) => {
        // Update the cache with new preferences
        queryClient.setQueryData(userKeys.preferences(userId), data);
      },
    }
  );
}

// ============================================
// FAVORITES HOOKS
// ============================================

interface FavoriteShoe {
  id: string;
  userId: string;
  shoeId: string;
  addedAt: string;
  shoe?: Shoe;
}

/**
 * Fetch user's favorite shoes
 */
export function useFavorites(
  userId: string,
  options?: Omit<UseQueryOptions<FavoriteShoe[], ApiError, FavoriteShoe[], QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery<FavoriteShoe[], ApiError>(
    userKeys.favorites(userId),
    () => get<FavoriteShoe[]>(`/users/${userId}/favorites`),
    {
      staleTime: StaleTime.MEDIUM,
      enabled: Boolean(userId),
      ...options,
    }
  );
}

/**
 * Add shoe to favorites with optimistic update
 */
export function useAddFavorite(userId: string) {
  const queryClient = useQueryClient();
  const queryKey = userKeys.favorites(userId);

  return useApiMutation<FavoriteShoe, { shoeId: string; shoe?: Shoe }, ApiError, { previousData: FavoriteShoe[] | undefined }>(
    ({ shoeId }) => post<FavoriteShoe>(`/users/${userId}/favorites`, { shoeId }),
    {
      ...createOptimisticUpdate<FavoriteShoe[]>(queryKey, (oldData) => {
        if (!oldData) return [];
        // This is a simplified optimistic update
        return oldData;
      }),
      onMutate: async ({ shoeId, shoe }) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<FavoriteShoe[]>(queryKey);
        
        // Optimistically add the favorite
        queryClient.setQueryData<FavoriteShoe[]>(queryKey, (old) => {
          const newFavorite: FavoriteShoe = {
            id: `temp-${Date.now()}`,
            userId,
            shoeId,
            addedAt: new Date().toISOString(),
            shoe,
          };
          return old ? [...old, newFavorite] : [newFavorite];
        });
        
        return { previousData };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }
  );
}

/**
 * Remove shoe from favorites with optimistic update
 */
export function useRemoveFavorite(userId: string) {
  const queryClient = useQueryClient();
  const queryKey = userKeys.favorites(userId);

  return useApiMutation<void, string, ApiError, { previousData: FavoriteShoe[] | undefined }>(
    (shoeId) => del<void>(`/users/${userId}/favorites/${shoeId}`),
    {
      onMutate: async (shoeId) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<FavoriteShoe[]>(queryKey);
        
        // Optimistically remove the favorite
        queryClient.setQueryData<FavoriteShoe[]>(queryKey, (old) => {
          return old?.filter((fav) => fav.shoeId !== shoeId) ?? [];
        });
        
        return { previousData };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }
  );
}

// ============================================
// PRICE ALERT HOOKS
// ============================================

interface PriceAlert {
  id: string;
  userId: string;
  shoeId: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  shoe?: Shoe;
}

/**
 * Fetch user's price alerts
 */
export function usePriceAlerts(
  userId: string,
  options?: Omit<UseQueryOptions<PriceAlert[], ApiError, PriceAlert[], QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery<PriceAlert[], ApiError>(
    userKeys.priceAlerts(userId),
    () => get<PriceAlert[]>(`/users/${userId}/price-alerts`),
    {
      staleTime: StaleTime.MEDIUM,
      enabled: Boolean(userId),
      ...options,
    }
  );
}

/**
 * Create a price alert
 */
export function useCreatePriceAlert(userId: string) {
  const queryClient = useQueryClient();
  
  return useApiMutation<
    PriceAlert,
    { shoeId: string; targetPrice: number },
    ApiError
  >(
    (data) => post<PriceAlert>(`/users/${userId}/price-alerts`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.priceAlerts(userId) });
      },
    }
  );
}

/**
 * Delete a price alert
 */
export function useDeletePriceAlert(userId: string) {
  const queryClient = useQueryClient();
  
  return useApiMutation<void, string, ApiError>(
    (alertId) => del<void>(`/users/${userId}/price-alerts/${alertId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.priceAlerts(userId) });
      },
    }
  );
}

// ============================================
// AFFILIATE TRACKING HOOKS
// ============================================

interface AffiliateClickData {
  shoeId: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track affiliate click
 */
export function useTrackAffiliateClick() {
  return useApiMutation<void, AffiliateClickData, ApiError>(
    (data) => post<void>('/affiliate/track', data),
    {
      // Fire and forget - don't show errors to user
      onError: (error) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('[Affiliate] Click tracking failed:', error.message);
        }
      },
    }
  );
}

// ============================================
// CACHE UTILITY HOOKS
// ============================================

/**
 * Prefetch shoe data for faster navigation
 */
export function usePrefetchShoe() {
  const queryClient = useQueryClient();
  
  return useCallback(
    async (shoeId: string) => {
      await queryClient.prefetchQuery({
        queryKey: shoeKeys.detail(shoeId),
        queryFn: () => get<Shoe>(`/shoes/${shoeId}`),
        staleTime: StaleTime.MEDIUM,
      });
    },
    [queryClient]
  );
}

/**
 * Get cached shoe data without fetching
 */
export function useCachedShoe(shoeId: string): Shoe | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<Shoe>(shoeKeys.detail(shoeId));
}

/**
 * Get all cached shoes
 */
export function useCachedShoes(): Shoe[] {
  const queryClient = useQueryClient();
  
  return useMemo(() => {
    const cache = queryClient.getQueryCache();
    const shoeQueries = cache.findAll({ queryKey: shoeKeys.all });
    
    const shoes: Shoe[] = [];
    for (const query of shoeQueries) {
      const data = query.state.data;
      if (Array.isArray(data)) {
        shoes.push(...data);
      } else if (data && typeof data === 'object' && 'id' in data) {
        shoes.push(data as Shoe);
      }
    }
    
    return shoes;
  }, [queryClient]);
}

// ============================================
// QUERY STATE HOOKS
// ============================================

/**
 * Check if any shoe query is loading
 */
export function useIsLoadingShoes(): boolean {
  const queryClient = useQueryClient();
  
  return useMemo(() => {
    const cache = queryClient.getQueryCache();
    const shoeQueries = cache.findAll({ queryKey: shoeKeys.all });
    return shoeQueries.some((query) => query.state.status === 'pending');
  }, [queryClient]);
}

/**
 * Invalidate and refetch all shoe data
 */
export function useRefreshShoes() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: shoeKeys.all });
  }, [queryClient]);
}
