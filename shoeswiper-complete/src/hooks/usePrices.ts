import { useState, useCallback, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEMO_MODE } from '../lib/config';
import { supabase } from '../lib/supabaseClient';
import type { AmazonPriceData } from '../lib/types';

/**
 * Maximum ASINs per request (Amazon PA-API limit)
 */
const MAX_ASINS_PER_REQUEST = 10;

/**
 * Cache duration for prices (5 minutes)
 */
const PRICE_CACHE_TIME = 5 * 60 * 1000;

/**
 * Generate a random mock price between min and max
 */
const generateMockPrice = (min: number = 50, max: number = 300): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

/**
 * Generate mock availability status
 */
const generateMockAvailability = (): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  const random = Math.random();
  if (random < 0.7) return 'in_stock';
  if (random < 0.9) return 'low_stock';
  return 'out_of_stock';
};

/**
 * Generate mock price data for an ASIN
 */
const generateMockPriceData = (asin: string): AmazonPriceData => ({
  asin,
  price: generateMockPrice(),
  currency: 'USD',
  availability: generateMockAvailability(),
  lastUpdated: new Date().toISOString(),
});

/**
 * Split an array into chunks of specified size
 */
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Response type from the Edge Function
 */
interface EdgeFunctionResponse {
  prices: AmazonPriceData[];
  errors?: Array<{ asin: string; error: string }>;
}

/**
 * Hook for fetching and caching Amazon prices from the Edge Function.
 * Uses React Query for caching with 5-minute stale time.
 * Batches ASIN requests (max 10 per request per Amazon API limits).
 * 
 * @returns Object containing price data, methods, and loading state
 * @example
 * const { priceData, getPriceByAsin, fetchPrices, isLoading, error } = usePrices();
 * 
 * // Fetch prices for multiple ASINs
 * await fetchPrices(['B0ASIN123', 'B0ASIN456']);
 * 
 * // Get cached price for a single ASIN
 * const price = getPriceByAsin('B0ASIN123');
 */
export const usePrices = () => {
  const queryClient = useQueryClient();
  const [manualError, setManualError] = useState<string | null>(null);
  
  // Track pending ASINs for deduplication
  const pendingAsinsRef = useRef<Set<string>>(new Set());

  /**
   * Fetch prices from the Edge Function for a batch of ASINs
   */
  const fetchPricesFromApi = useCallback(async (asins: string[]): Promise<AmazonPriceData[]> => {
    // In DEMO_MODE, return mock prices
    if (DEMO_MODE) {
      if (import.meta.env.DEV) {
        console.log(`[Demo] Generating mock prices for ${asins.length} ASINs`);
      }
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      return asins.map(generateMockPriceData);
    }

    // Production: Call the Edge Function
    const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse>('get-amazon-prices', {
      body: { asins },
    });

    if (error) {
      throw new Error(`Failed to fetch prices: ${error.message}`);
    }

    if (!data || !data.prices) {
      throw new Error('Invalid response from price API');
    }

    // Log any partial errors in development
    if (import.meta.env.DEV && data.errors && data.errors.length > 0) {
      console.warn('[usePrices] Some ASINs failed:', data.errors);
    }

    return data.prices;
  }, []);

  /**
   * Main query for fetched price data
   * Uses a stable query key and transforms data to a Map for efficient lookup
   */
  const { data: queryData, isLoading: queryLoading, error: queryError } = useQuery({
    queryKey: ['amazon-prices'],
    queryFn: async () => {
      // Return empty map on initial load - prices are fetched on demand
      return new Map<string, AmazonPriceData>();
    },
    staleTime: PRICE_CACHE_TIME,
    gcTime: PRICE_CACHE_TIME * 2, // Keep in cache for 10 minutes
  });

  /**
   * Get the current price data Map
   */
  const priceData = useMemo(() => {
    return queryData ?? new Map<string, AmazonPriceData>();
  }, [queryData]);

  /**
   * Fetch prices for multiple ASINs with batching and deduplication
   */
  const fetchPrices = useCallback(async (asins: string[]): Promise<Map<string, AmazonPriceData>> => {
    setManualError(null);

    // Filter out ASINs that are already cached or pending
    const existingData = queryClient.getQueryData<Map<string, AmazonPriceData>>(['amazon-prices']) ?? new Map();
    const asinsToFetch = asins.filter(asin => 
      !existingData.has(asin) && !pendingAsinsRef.current.has(asin)
    );

    // Remove duplicates
    const uniqueAsins = [...new Set(asinsToFetch)];

    if (uniqueAsins.length === 0) {
      // All ASINs already cached or pending
      return existingData;
    }

    // Mark ASINs as pending
    uniqueAsins.forEach(asin => pendingAsinsRef.current.add(asin));

    try {
      // Split into batches of MAX_ASINS_PER_REQUEST
      const batches = chunkArray(uniqueAsins, MAX_ASINS_PER_REQUEST);
      const allPrices: AmazonPriceData[] = [];

      // Fetch all batches (could be parallelized, but sequential is safer for rate limits)
      for (const batch of batches) {
        const prices = await fetchPricesFromApi(batch);
        allPrices.push(...prices);
      }

      // Update the cache with new prices
      const updatedData = new Map(existingData);
      allPrices.forEach(price => {
        updatedData.set(price.asin, price);
      });

      // Update React Query cache
      queryClient.setQueryData<Map<string, AmazonPriceData>>(['amazon-prices'], updatedData);

      return updatedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prices';
      setManualError(errorMessage);
      throw err;
    } finally {
      // Remove from pending set
      uniqueAsins.forEach(asin => pendingAsinsRef.current.delete(asin));
    }
  }, [queryClient, fetchPricesFromApi]);

  /**
   * Get cached price for a single ASIN
   * Returns undefined if not cached - use fetchPrices to load first
   */
  const getPriceByAsin = useCallback((asin: string): AmazonPriceData | undefined => {
    const currentData = queryClient.getQueryData<Map<string, AmazonPriceData>>(['amazon-prices']);
    return currentData?.get(asin);
  }, [queryClient]);

  /**
   * Invalidate and refetch prices for specific ASINs
   */
  const refreshPrices = useCallback(async (asins: string[]): Promise<Map<string, AmazonPriceData>> => {
    // Remove from cache to force refetch
    const existingData = queryClient.getQueryData<Map<string, AmazonPriceData>>(['amazon-prices']) ?? new Map();
    const updatedData = new Map(existingData);
    asins.forEach(asin => updatedData.delete(asin));
    queryClient.setQueryData<Map<string, AmazonPriceData>>(['amazon-prices'], updatedData);

    // Fetch fresh prices
    return fetchPrices(asins);
  }, [queryClient, fetchPrices]);

  /**
   * Clear all cached prices
   */
  const clearPriceCache = useCallback(() => {
    queryClient.setQueryData<Map<string, AmazonPriceData>>(['amazon-prices'], new Map());
    setManualError(null);
  }, [queryClient]);

  // Combine loading states
  const isLoading = queryLoading || pendingAsinsRef.current.size > 0;

  // Combine error states
  const error = manualError || (queryError instanceof Error ? queryError.message : null);

  return {
    priceData,
    getPriceByAsin,
    fetchPrices,
    refreshPrices,
    clearPriceCache,
    isLoading,
    error,
  };
};
