/**
 * Amazon PA-API Client Service
 *
 * Client-side service to call the Amazon PA-API via Supabase Edge Function.
 * All API calls are proxied through the Edge Function to keep credentials secure.
 *
 * SECURITY: Amazon API credentials are NEVER exposed to the client.
 * All requests go through `supabase/functions/amazon-products`.
 */

import { supabase } from './supabaseClient';
import { Shoe } from './types';
import { AFFILIATE_TAG } from './config';

// Types for Amazon API responses
export interface AmazonProduct {
  asin: string;
  name: string;
  brand: string;
  price: number | null;
  currency: string;
  image_url: string;
  amazon_url: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  features: string[];
  category: string | null;
}

export interface AmazonSearchResult {
  products: AmazonProduct[];
  totalResults: number;
}

export interface AmazonPriceHistoryEntry {
  price: number;
  currency: string;
  recorded_at: string;
}

// Cache configuration
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1000; // 1 second between requests (PA-API limit)

/**
 * Wait for rate limit cooldown if necessary
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
}

/**
 * Get cached data if still fresh
 */
function getCached<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  memoryCache.delete(key);
  return null;
}

/**
 * Set cache entry
 */
function setCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Ensures Amazon URL has the affiliate tag
 */
export function ensureAffiliateTag(url: string): string {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('tag', AFFILIATE_TAG);
    return urlObj.toString();
  } catch {
    // If URL parsing fails, append manually
    if (url.includes('amazon.com')) {
      if (url.includes('?')) {
        return url.includes('tag=') ? url : `${url}&tag=${AFFILIATE_TAG}`;
      }
      return `${url}?tag=${AFFILIATE_TAG}`;
    }
    return url;
  }
}

/**
 * Transforms Amazon API product to Shoe type
 */
export function amazonProductToShoe(
  product: AmazonProduct,
  existingData?: Partial<Shoe>
): Shoe {
  const now = new Date().toISOString();

  return {
    id: existingData?.id || `amazon-${product.asin}`,
    name: product.name,
    brand: product.brand || existingData?.brand || 'Unknown',
    price: product.price,
    currency: product.currency,
    price_last_updated: now,
    image_url: product.image_url || existingData?.image_url || '',
    amazon_url: ensureAffiliateTag(product.amazon_url),
    amazon_asin: product.asin,
    style_tags: existingData?.style_tags || [],
    color_tags: existingData?.color_tags || [],
    gender: existingData?.gender,
    description: product.features?.join('. ') || existingData?.description,
    favorite_count: existingData?.favorite_count || 0,
    view_count: existingData?.view_count || 0,
    click_count: existingData?.click_count || 0,
    is_active: product.availability !== 'out_of_stock',
    is_featured: existingData?.is_featured || false,
    stock_status: product.availability,
    created_at: existingData?.created_at || now,
    updated_at: now,
    music: existingData?.music,
  };
}

/**
 * Search for products on Amazon
 *
 * @param keywords - Search keywords
 * @param options - Optional search parameters
 * @returns Search results with transformed products
 */
export async function searchAmazonProducts(
  keywords: string,
  options: {
    searchIndex?: string;
    itemCount?: number;
  } = {}
): Promise<{ products: Shoe[]; totalResults: number } | null> {
  const cacheKey = `search:${keywords}:${JSON.stringify(options)}`;
  const cached = getCached<{ products: Shoe[]; totalResults: number }>(cacheKey);
  if (cached) {
    if (import.meta.env.DEV) {
      console.warn('[AmazonAPI] Cache hit for search:', keywords);
    }
    return cached;
  }

  try {
    await waitForRateLimit();

    const { data, error } = await supabase.functions.invoke('amazon-products', {
      body: {
        operation: 'SearchItems',
        keywords,
        searchIndex: options.searchIndex || 'Fashion',
        itemCount: options.itemCount || 10,
      },
    });

    if (error) {
      console.error('[AmazonAPI] Search error:', error);
      return null;
    }

    if (data.error) {
      console.error('[AmazonAPI] API error:', data.error);
      return null;
    }

    const result = {
      products: (data.products || []).map((p: AmazonProduct) =>
        amazonProductToShoe(p)
      ),
      totalResults: data.totalResults || 0,
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[AmazonAPI] Search failed:', err);
    return null;
  }
}

/**
 * Get products by ASIN(s)
 *
 * @param asins - Array of ASINs to fetch
 * @returns Products data
 */
export async function getAmazonProductsByAsin(
  asins: string[]
): Promise<AmazonProduct[] | null> {
  if (!asins.length) return [];

  // Validate ASINs (10 alphanumeric characters)
  const validAsins = asins.filter((asin) => /^[A-Z0-9]{10}$/i.test(asin));
  if (validAsins.length === 0) {
    console.error('[AmazonAPI] No valid ASINs provided');
    return null;
  }

  // Check cache for each ASIN
  const cachedProducts: AmazonProduct[] = [];
  const uncachedAsins: string[] = [];

  for (const asin of validAsins) {
    const cached = getCached<AmazonProduct>(`asin:${asin}`);
    if (cached) {
      cachedProducts.push(cached);
    } else {
      uncachedAsins.push(asin);
    }
  }

  // If all ASINs are cached, return immediately
  if (uncachedAsins.length === 0) {
    if (import.meta.env.DEV) {
      console.warn('[AmazonAPI] All ASINs found in cache');
    }
    return cachedProducts;
  }

  try {
    await waitForRateLimit();

    // Amazon PA-API allows max 10 ASINs per request
    const chunks: string[][] = [];
    for (let i = 0; i < uncachedAsins.length; i += 10) {
      chunks.push(uncachedAsins.slice(i, i + 10));
    }

    const allProducts: AmazonProduct[] = [...cachedProducts];

    for (const chunk of chunks) {
      const { data, error } = await supabase.functions.invoke('amazon-products', {
        body: {
          operation: 'GetItems',
          itemIds: chunk,
        },
      });

      if (error) {
        console.error('[AmazonAPI] GetItems error:', error);
        continue;
      }

      if (data.error) {
        console.error('[AmazonAPI] API error:', data.error);
        continue;
      }

      const products = data.products || [];

      // Cache each product
      for (const product of products) {
        setCache(`asin:${product.asin}`, product);
        allProducts.push(product);
      }

      // Rate limit between chunks
      if (chunks.length > 1) {
        await waitForRateLimit();
      }
    }

    return allProducts;
  } catch (err) {
    console.error('[AmazonAPI] GetItems failed:', err);
    return cachedProducts.length > 0 ? cachedProducts : null;
  }
}

/**
 * Get fresh price data for a single ASIN
 *
 * @param asin - The ASIN to fetch price for
 * @returns Product with updated price or null
 */
export async function getAmazonPrice(asin: string): Promise<{
  price: number | null;
  currency: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
} | null> {
  const products = await getAmazonProductsByAsin([asin]);

  if (!products || products.length === 0) {
    return null;
  }

  const product = products[0];
  return {
    price: product.price,
    currency: product.currency,
    availability: product.availability,
  };
}

/**
 * Get price history from Supabase cache
 *
 * @param asin - The ASIN to get history for
 * @param days - Number of days of history (default 30)
 * @returns Array of price history entries
 */
export async function getPriceHistory(
  asin: string,
  days: number = 30
): Promise<AmazonPriceHistoryEntry[]> {
  try {
    const { data, error } = await supabase.rpc('get_amazon_price_history', {
      p_asin: asin,
      p_days: days,
    });

    if (error) {
      console.error('[AmazonAPI] Price history error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[AmazonAPI] Price history failed:', err);
    return [];
  }
}

/**
 * Get lowest price in the last N days
 *
 * @param asin - The ASIN to check
 * @param days - Number of days to check (default 30)
 * @returns Lowest price or null
 */
export async function getLowestPrice(
  asin: string,
  days: number = 30
): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc('get_amazon_lowest_price', {
      p_asin: asin,
      p_days: days,
    });

    if (error) {
      console.error('[AmazonAPI] Lowest price error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[AmazonAPI] Lowest price failed:', err);
    return null;
  }
}

/**
 * Check if Amazon PA-API is configured and available
 *
 * @returns True if API is available
 */
export async function isAmazonApiAvailable(): Promise<boolean> {
  try {
    // Make a minimal test request
    const { data, error } = await supabase.functions.invoke('amazon-products', {
      body: {
        operation: 'SearchItems',
        keywords: 'test',
        itemCount: 1,
      },
    });

    if (error || data?.code === 'CREDENTIALS_NOT_CONFIGURED') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clear the in-memory cache
 */
export function clearAmazonCache(): void {
  memoryCache.clear();
  if (import.meta.env.DEV) {
    console.warn('[AmazonAPI] Cache cleared');
  }
}
