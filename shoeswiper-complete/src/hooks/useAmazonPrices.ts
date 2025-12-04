import { useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEMO_MODE, AMAZON_API_CONFIG, AFFILIATE_TAG } from '../lib/config';
import { supabase, getAffiliateUrlFromAsin } from '../lib/supabaseClient';
import { AmazonPriceData } from '../lib/types';

/**
 * Amazon PA-API price response from Edge Function
 */
interface PriceResult {
  asin: string;
  price: number | null;
  currency: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';
  title?: string;
  imageUrl?: string;
  affiliateUrl: string;
  lastUpdated: string;
}

interface PriceResponse {
  results: PriceResult[];
  source: 'live' | 'mock';
  error?: string;
}

// In-memory cache for price data
const priceCache = new Map<string, { data: PriceResult; fetchedAt: number }>();

/**
 * Hook for fetching live Amazon prices via Supabase Edge Function
 * 
 * Security: All API calls are made server-side through the Edge Function.
 * The client NEVER has access to Amazon PA-API credentials.
 * 
 * @example
 * const { getPrice, getPrices, prefetchPrices, isLoading } = useAmazonPrices();
 * 
 * // Get single price
 * const priceData = await getPrice('B07QXLFLXT');
 * 
 * // Get multiple prices
 * const prices = await getPrices(['B07QXLFLXT', 'B09NLN47LP']);
 * 
 * // Prefetch prices for shoes in view
 * prefetchPrices(shoes.map(s => s.amazon_asin));
 */
export const useAmazonPrices = () => {
  const queryClient = useQueryClient();
  const pendingFetches = useRef<Set<string>>(new Set());

  /**
   * Fetch prices from Edge Function (batched)
   */
  const fetchPricesFromApi = useCallback(async (asins: string[]): Promise<PriceResult[]> => {
    // Filter out invalid or already cached ASINs
    const validAsins = asins.filter(asin => 
      asin && 
      /^[A-Z0-9]{10}$/i.test(asin) &&
      !pendingFetches.current.has(asin)
    );

    if (validAsins.length === 0) {
      return [];
    }

    // Mark as pending to prevent duplicate fetches
    validAsins.forEach(asin => pendingFetches.current.add(asin));

    try {
      // DEMO MODE or API disabled: Return placeholder data
      if (DEMO_MODE || !AMAZON_API_CONFIG.enabled) {
        const mockResults: PriceResult[] = validAsins.map(asin => ({
          asin,
          price: null,
          currency: 'USD',
          availability: 'unknown',
          affiliateUrl: getAffiliateUrlFromAsin(asin),
          lastUpdated: new Date().toISOString(),
        }));
        return mockResults;
      }

      // Call Edge Function for live prices
      const { data, error } = await supabase.functions.invoke<PriceResponse>('amazon-prices', {
        body: { asins: validAsins },
      });

      if (error) {
        if (import.meta.env.DEV) console.error('[Prices] Edge Function error:', error);
        throw error;
      }

      if (!data || !data.results) {
        throw new Error('Invalid response from price API');
      }

      // Cache results
      const now = Date.now();
      data.results.forEach(result => {
        priceCache.set(result.asin, { data: result, fetchedAt: now });
        
        // Also cache in React Query
        queryClient.setQueryData(['amazon-price', result.asin], result);
      });

      return data.results;
    } catch (err) {
      if (import.meta.env.DEV) console.error('[Prices] Error fetching prices:', err);
      
      // Return fallback data on error
      return validAsins.map(asin => ({
        asin,
        price: null,
        currency: 'USD',
        availability: 'unknown',
        affiliateUrl: getAffiliateUrlFromAsin(asin),
        lastUpdated: new Date().toISOString(),
      }));
    } finally {
      // Clear pending status
      validAsins.forEach(asin => pendingFetches.current.delete(asin));
    }
  }, [queryClient]);

  /**
   * Get price for a single ASIN
   */
  const getPrice = useCallback(async (asin: string): Promise<PriceResult | null> => {
    if (!asin || !/^[A-Z0-9]{10}$/i.test(asin)) {
      return null;
    }

    // Check cache first
    const cached = priceCache.get(asin);
    if (cached && Date.now() - cached.fetchedAt < AMAZON_API_CONFIG.cacheDuration) {
      return cached.data;
    }

    // Fetch from API
    const results = await fetchPricesFromApi([asin]);
    return results[0] || null;
  }, [fetchPricesFromApi]);

  /**
   * Get prices for multiple ASINs (batched)
   */
  const getPrices = useCallback(async (asins: string[]): Promise<Map<string, PriceResult>> => {
    const results = new Map<string, PriceResult>();
    const toFetch: string[] = [];

    // Check cache for each ASIN
    asins.forEach(asin => {
      if (!asin || !/^[A-Z0-9]{10}$/i.test(asin)) return;

      const cached = priceCache.get(asin);
      if (cached && Date.now() - cached.fetchedAt < AMAZON_API_CONFIG.cacheDuration) {
        results.set(asin, cached.data);
      } else {
        toFetch.push(asin);
      }
    });

    // Fetch uncached ASINs in batches of 10 (PA-API limit)
    for (let i = 0; i < toFetch.length; i += 10) {
      const batch = toFetch.slice(i, i + 10);
      const batchResults = await fetchPricesFromApi(batch);
      batchResults.forEach(result => {
        results.set(result.asin, result);
      });
    }

    return results;
  }, [fetchPricesFromApi]);

  /**
   * Prefetch prices for ASINs (non-blocking)
   * Use this to warm the cache when shoes come into view
   */
  const prefetchPrices = useCallback((asins: string[]): void => {
    // Filter to only uncached ASINs
    const uncached = asins.filter(asin => {
      if (!asin || !/^[A-Z0-9]{10}$/i.test(asin)) return false;
      const cached = priceCache.get(asin);
      return !cached || Date.now() - cached.fetchedAt >= AMAZON_API_CONFIG.cacheDuration;
    });

    if (uncached.length === 0) return;

    // Fetch in background (don't await)
    fetchPricesFromApi(uncached.slice(0, 10)).catch(err => {
      if (import.meta.env.DEV) console.warn('[Prices] Prefetch failed:', err);
    });
  }, [fetchPricesFromApi]);

  /**
   * Convert PriceResult to AmazonPriceData type
   */
  const toPriceData = useCallback((result: PriceResult): AmazonPriceData => ({
    asin: result.asin,
    price: result.price ?? 0,
    currency: result.currency,
    availability: result.availability === 'unknown' ? 'in_stock' : result.availability,
    lastUpdated: result.lastUpdated,
  }), []);

  /**
   * Clear price cache (useful for testing or forcing refresh)
   */
  const clearCache = useCallback(() => {
    priceCache.clear();
    queryClient.invalidateQueries({ queryKey: ['amazon-price'] });
  }, [queryClient]);

  /**
   * Check if API is enabled and available
   */
  const isApiEnabled = AMAZON_API_CONFIG.enabled && !DEMO_MODE;

  return {
    getPrice,
    getPrices,
    prefetchPrices,
    toPriceData,
    clearCache,
    isApiEnabled,
    affiliateTag: AFFILIATE_TAG,
  };
};

/**
 * Hook for fetching a single shoe's price with React Query
 */
export const useShoePrice = (asin: string | undefined) => {
  const { getPrice, isApiEnabled } = useAmazonPrices();

  return useQuery({
    queryKey: ['amazon-price', asin],
    queryFn: () => {
      if (!asin) throw new Error('ASIN is required');
      return getPrice(asin);
    },
    enabled: !!asin && isApiEnabled,
    staleTime: AMAZON_API_CONFIG.cacheDuration,
    gcTime: AMAZON_API_CONFIG.cacheDuration * 2,
  });
};
