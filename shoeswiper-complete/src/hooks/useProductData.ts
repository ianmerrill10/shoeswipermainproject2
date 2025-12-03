import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  AmazonProductData,
  fetchProductData,
  getProductImage,
  getProductPrice,
  getCachedProduct,
  prefetchProducts,
  FALLBACK_IMAGES,
} from '../lib/amazonProductCache';
import { AMAZON_API_CONFIG } from '../lib/config';

interface UseProductDataResult {
  // Get image for a single product
  getImage: (asin: string, brand: string, currentImage?: string) => string;

  // Get price for a single product (null if not available)
  getPrice: (asin: string) => number | null;

  // Get full product data
  getProductData: (asin: string) => AmazonProductData | null;

  // Prefetch data for multiple products
  prefetch: (asins: string[]) => Promise<void>;

  // Loading state
  loading: boolean;

  // Whether Amazon API is enabled
  apiEnabled: boolean;
}

/**
 * Hook for accessing Amazon product data (images, prices)
 * Handles caching and fallbacks automatically
 */
export function useProductData(): UseProductDataResult {
  const [loading, setLoading] = useState(false);
  const prefetchedRef = useRef<Set<string>>(new Set());

  /**
   * Get the best available image for a product
   */
  const getImage = useCallback(
    (asin: string, brand: string, currentImage?: string): string => {
      return getProductImage(asin, brand, currentImage);
    },
    []
  );

  /**
   * Get cached price for a product
   */
  const getPrice = useCallback((asin: string): number | null => {
    return getProductPrice(asin);
  }, []);

  /**
   * Get full cached product data
   */
  const getProductData = useCallback((asin: string): AmazonProductData | null => {
    return getCachedProduct(asin);
  }, []);

  /**
   * Prefetch product data for a list of ASINs
   * Skips already prefetched ASINs in this session
   */
  const prefetch = useCallback(async (asins: string[]): Promise<void> => {
    // Filter out already prefetched
    const newAsins = asins.filter(asin => !prefetchedRef.current.has(asin));
    if (newAsins.length === 0) return;

    // Mark as prefetched
    newAsins.forEach(asin => prefetchedRef.current.add(asin));

    setLoading(true);
    try {
      await prefetchProducts(newAsins, supabase);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getImage,
    getPrice,
    getProductData,
    prefetch,
    loading,
    apiEnabled: AMAZON_API_CONFIG.enabled,
  };
}

/**
 * Hook for a single product's data
 * Automatically fetches if not cached
 */
export function useSingleProductData(asin: string | null, brand: string) {
  const [productData, setProductData] = useState<AmazonProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(
    FALLBACK_IMAGES[brand] || FALLBACK_IMAGES['default']
  );

  useEffect(() => {
    if (!asin) return;

    // Check cache first
    const cached = getCachedProduct(asin);
    if (cached) {
      setProductData(cached);
      setImageUrl(cached.imageLarge || cached.imageUrl || FALLBACK_IMAGES[brand] || FALLBACK_IMAGES['default']);
      return;
    }

    // Fetch if not cached
    let mounted = true;
    setLoading(true);

    fetchProductData([asin], supabase)
      .then(results => {
        if (!mounted) return;
        const data = results.find(r => r.asin === asin);
        if (data) {
          setProductData(data);
          setImageUrl(
            data.imageLarge || data.imageUrl || FALLBACK_IMAGES[brand] || FALLBACK_IMAGES['default']
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [asin, brand]);

  return {
    productData,
    imageUrl,
    price: productData?.price ?? null,
    loading,
  };
}

/**
 * Hook for batch product data
 * Fetches all products on mount
 */
export function useBatchProductData(asins: string[]) {
  const [products, setProducts] = useState<Map<string, AmazonProductData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asins.length === 0) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    fetchProductData(asins, supabase)
      .then(results => {
        if (!mounted) return;
        const map = new Map<string, AmazonProductData>();
        results.forEach(p => map.set(p.asin, p));
        setProducts(map);
      })
      .catch(e => {
        if (!mounted) return;
        setError(e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [asins.join(',')]); // Re-fetch if asins change

  const getImage = useCallback(
    (asin: string, brand: string): string => {
      const data = products.get(asin);
      return data?.imageLarge || data?.imageUrl || FALLBACK_IMAGES[brand] || FALLBACK_IMAGES['default'];
    },
    [products]
  );

  const getPrice = useCallback(
    (asin: string): number | null => {
      return products.get(asin)?.price ?? null;
    },
    [products]
  );

  return {
    products,
    loading,
    error,
    getImage,
    getPrice,
  };
}

export default useProductData;
