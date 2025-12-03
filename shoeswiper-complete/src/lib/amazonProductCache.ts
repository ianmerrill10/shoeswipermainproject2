// ============================================
// AMAZON PRODUCT DATA CACHE
// Client-side caching for product images and prices
// ============================================

import { AFFILIATE_TAG } from './config';

// ============================================
// TYPES
// ============================================

export interface AmazonProductData {
  asin: string;
  title: string | null;
  imageUrl: string | null;
  imageLarge: string | null;
  price: number | null; // in cents
  currency: string;
  availability: string;
  url: string;
  fetchedAt: number; // timestamp
  error?: string;
}

interface CacheEntry {
  data: AmazonProductData;
  expiresAt: number;
}

// ============================================
// CONSTANTS
// ============================================

const CACHE_KEY = 'shoeswiper_product_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 200; // Maximum products to cache
const BATCH_SIZE = 10; // PA-API limit per request

// Fallback images by brand (Unsplash)
export const FALLBACK_IMAGES: Record<string, string> = {
  'Nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  'Jordan': 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
  'Adidas': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
  'New Balance': 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
  'Converse': 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
  'Vans': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
  'Puma': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
  'Reebok': 'https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=800',
  'ASICS': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
  'On': 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
  'Brooks': 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
  'Skechers': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
  'Birkenstock': 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
  'default': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
};

// ============================================
// CACHE MANAGEMENT
// ============================================

/**
 * Load cache from localStorage
 */
function loadCache(): Map<string, CacheEntry> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return new Map();

    const parsed = JSON.parse(cached);
    const now = Date.now();

    // Filter out expired entries
    const validEntries = Object.entries(parsed).filter(
      ([, entry]) => (entry as CacheEntry).expiresAt > now
    );

    return new Map(validEntries as [string, CacheEntry][]);
  } catch {
    return new Map();
  }
}

/**
 * Save cache to localStorage
 */
function saveCache(cache: Map<string, CacheEntry>): void {
  try {
    // Limit cache size
    const entries = Array.from(cache.entries());
    if (entries.length > MAX_CACHE_SIZE) {
      // Remove oldest entries
      entries.sort((a, b) => a[1].data.fetchedAt - b[1].data.fetchedAt);
      entries.splice(0, entries.length - MAX_CACHE_SIZE);
    }

    const obj = Object.fromEntries(entries);
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    // localStorage might be full or unavailable
    console.warn('Failed to save product cache:', e);
  }
}

/**
 * Get cached product data
 */
export function getCachedProduct(asin: string): AmazonProductData | null {
  const cache = loadCache();
  const entry = cache.get(asin);

  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }

  return null;
}

/**
 * Set cached product data
 */
export function setCachedProduct(data: AmazonProductData): void {
  const cache = loadCache();
  cache.set(data.asin, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  saveCache(cache);
}

/**
 * Set multiple cached products
 */
export function setCachedProducts(products: AmazonProductData[]): void {
  const cache = loadCache();
  const now = Date.now();

  for (const data of products) {
    cache.set(data.asin, {
      data,
      expiresAt: now + CACHE_TTL_MS,
    });
  }

  saveCache(cache);
}

/**
 * Clear the entire cache
 */
export function clearProductCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch product data from Amazon PA-API Edge Function
 */
export async function fetchProductData(
  asins: string[],
  supabaseClient: { functions: { invoke: (name: string, options: { body: unknown }) => Promise<{ data: unknown; error: unknown }> } }
): Promise<AmazonProductData[]> {
  if (asins.length === 0) return [];

  // Check cache first
  const cached: AmazonProductData[] = [];
  const uncached: string[] = [];

  for (const asin of asins) {
    const cachedData = getCachedProduct(asin);
    if (cachedData) {
      cached.push(cachedData);
    } else {
      uncached.push(asin);
    }
  }

  // If all cached, return immediately
  if (uncached.length === 0) {
    return cached;
  }

  // Fetch uncached in batches
  const results: AmazonProductData[] = [...cached];

  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);

    try {
      const { data, error } = await supabaseClient.functions.invoke('amazon-product', {
        body: { asins: batch },
      });

      if (error) {
        console.error('Error fetching product data:', error);
        // Create fallback entries for failed batch
        for (const asin of batch) {
          results.push(createFallbackProduct(asin));
        }
        continue;
      }

      const response = data as {
        products: Array<{
          asin: string;
          title: string | null;
          imageUrl: string | null;
          imageLarge: string | null;
          price: number | null;
          currency: string;
          availability: string;
          url: string;
          error?: string;
        }>;
      };

      if (response.products) {
        const products = response.products.map(p => ({
          ...p,
          fetchedAt: Date.now(),
        }));

        // Cache the results
        setCachedProducts(products);
        results.push(...products);
      }
    } catch (e) {
      console.error('Error invoking amazon-product function:', e);
      // Create fallback entries
      for (const asin of batch) {
        results.push(createFallbackProduct(asin));
      }
    }

    // Small delay between batches to be nice to rate limits
    if (i + BATCH_SIZE < uncached.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Create a fallback product entry when API fails
 */
function createFallbackProduct(asin: string): AmazonProductData {
  return {
    asin,
    title: null,
    imageUrl: null,
    imageLarge: null,
    price: null,
    currency: 'USD',
    availability: 'unknown',
    url: `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`,
    fetchedAt: Date.now(),
    error: 'Fetch failed',
  };
}

// ============================================
// IMAGE HELPERS
// ============================================

/**
 * Get the best available image for a product
 * Priority: Amazon Large > Amazon Medium > Fallback by brand
 */
export function getProductImage(
  asin: string,
  brand: string,
  currentImageUrl?: string
): string {
  // Check cache for Amazon image
  const cached = getCachedProduct(asin);

  if (cached?.imageLarge) {
    return cached.imageLarge;
  }

  if (cached?.imageUrl) {
    return cached.imageUrl;
  }

  // Use current image if provided and not a fallback
  if (currentImageUrl && !currentImageUrl.includes('unsplash.com')) {
    return currentImageUrl;
  }

  // Fall back to brand image
  return FALLBACK_IMAGES[brand] || FALLBACK_IMAGES['default'];
}

/**
 * Get cached price for a product
 */
export function getProductPrice(asin: string): number | null {
  const cached = getCachedProduct(asin);
  return cached?.price ?? null;
}

/**
 * Check if product data needs refresh
 */
export function needsRefresh(asin: string): boolean {
  const cached = getCachedProduct(asin);
  if (!cached) return true;

  // Refresh if older than 12 hours
  const twelveHours = 12 * 60 * 60 * 1000;
  return Date.now() - cached.fetchedAt > twelveHours;
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Get ASINs that need refreshing from a list
 */
export function getStaleAsins(asins: string[]): string[] {
  return asins.filter(needsRefresh);
}

/**
 * Prefetch product data for a list of ASINs
 * Call this when loading a page with multiple products
 */
export async function prefetchProducts(
  asins: string[],
  supabaseClient: { functions: { invoke: (name: string, options: { body: unknown }) => Promise<{ data: unknown; error: unknown }> } }
): Promise<void> {
  const stale = getStaleAsins(asins);
  if (stale.length > 0) {
    await fetchProductData(stale, supabaseClient);
  }
}
