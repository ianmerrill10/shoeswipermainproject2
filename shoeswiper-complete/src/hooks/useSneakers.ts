import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shoe } from '../lib/types';
import { DEMO_MODE, getShuffledShoes, getFeaturedShoes, MOCK_SHOES } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';
import {
  getAmazonProductsByAsin,
  amazonProductToShoe,
  ensureAffiliateTag,
} from '../lib/amazonApi';
import { AMAZON_API_CONFIG } from '../lib/config';

/**
 * Main sneaker feed data fetching hook with React Query caching.
 * Provides methods for fetching sneakers, featured items, and tracking analytics.
 * 
 * In DEMO_MODE: Uses mock data from mockData.ts
 * In PRODUCTION: Fetches from Supabase and enriches with Amazon PA-API data
 * 
 * @returns Object containing sneaker data, loading state, and methods
 * @example
 * const { getInfiniteFeed, trackView, trackClick, loading } = useSneakers();
 * 
 * // Load sneakers for infinite scroll
 * const shoes = await getInfiniteFeed(page, 5);
 * 
 * // Track when shoe becomes visible
 * trackView(shoe.id);
 */
export const useSneakers = () => {
  /**
   * Enriches shoes with fresh Amazon data if API is enabled
   */
  const enrichWithAmazonData = async (shoes: Shoe[]): Promise<Shoe[]> => {
    if (!AMAZON_API_CONFIG.enabled || shoes.length === 0) {
      return shoes;
    }

    try {
      // Get ASINs from shoes that have them
      const asins = shoes
        .map((shoe) => shoe.amazon_asin)
        .filter((asin): asin is string => !!asin);

      if (asins.length === 0) {
        return shoes;
      }

      const amazonProducts = await getAmazonProductsByAsin(asins);

      if (!amazonProducts || amazonProducts.length === 0) {
        return shoes;
      }

      // Create a map for quick lookup
      const productMap = new Map(amazonProducts.map((p) => [p.asin, p]));

      // Enrich shoes with Amazon data
      return shoes.map((shoe) => {
        const amazonData = shoe.amazon_asin
          ? productMap.get(shoe.amazon_asin)
          : null;

        if (amazonData) {
          return amazonProductToShoe(amazonData, shoe);
        }

        // Ensure affiliate tag even if no Amazon data
        return {
          ...shoe,
          amazon_url: ensureAffiliateTag(shoe.amazon_url),
        };
      });
    } catch (err) {
      console.error('[useSneakers] Amazon enrichment failed:', err);
      return shoes;
    }
  };

  /**
   * useQuery for sneakers - provides caching and automatic refetching
   */
  const { data: sneakersData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['sneakers'],
    queryFn: async () => {
      // DEMO MODE: Use mock data
      if (DEMO_MODE) {
        const shuffled = getShuffledShoes();
        return shuffled.slice(0, 50);
      }

      // PRODUCTION MODE: Use Supabase
      const { data, error } = await supabase
        .from('shoes')
        .select('*')
        .eq('is_active', true)
        .order('view_count', { ascending: false })
        .range(0, 49);

      if (error) throw error;
      
      const shoes = data as Shoe[];
      
      // Enrich with Amazon data if enabled
      return await enrichWithAmazonData(shoes);
    },
  });

  /**
   * Get Infinite Feed (backward compatible wrapper)
   */
  const getInfiniteFeed = useCallback(async (page: number = 0, limit: number = 5): Promise<Shoe[]> => {
    // DEMO MODE: Use mock data
    if (DEMO_MODE) {
      const shuffled = getShuffledShoes();
      const from = page * limit;
      const to = from + limit;
      return shuffled.slice(from, to);
    }

    // PRODUCTION MODE: Use Supabase
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('shoes')
      .select('*')
      .eq('is_active', true)
      .order('view_count', { ascending: false })
      .range(from, to);

    if (error) throw error;
    
    const shoes = data as Shoe[];
    
    // Enrich with Amazon data if enabled
    return await enrichWithAmazonData(shoes);
  }, []);

  /**
   * Get Featured Sneakers for "Hot Right Now" sections
   */
  const getFeaturedSneakers = useCallback(async (): Promise<Shoe[]> => {
    // DEMO MODE: Use mock data
    if (DEMO_MODE) {
      return getFeaturedShoes();
    }

    // PRODUCTION MODE: Use Supabase
    const { data } = await supabase
      .from('shoes')
      .select('*')
      .eq('is_featured', true)
      .limit(10);
    
    const shoes = (data as Shoe[]) || [];
    
    // Enrich with Amazon data if enabled
    return await enrichWithAmazonData(shoes);
  }, []);

  /**
   * Get Specific Sneaker
   */
  const getSneakerById = useCallback(async (id: string): Promise<Shoe | null> => {
    // DEMO MODE: Use mock data
    if (DEMO_MODE) {
      return MOCK_SHOES.find(shoe => shoe.id === id) || null;
    }

    // PRODUCTION MODE: Use Supabase
    const { data, error } = await supabase
      .from('shoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    
    const shoe = data as Shoe;
    
    // Enrich with Amazon data if enabled and ASIN exists
    if (AMAZON_API_CONFIG.enabled && shoe?.amazon_asin) {
      const enriched = await enrichWithAmazonData([shoe]);
      return enriched[0] || shoe;
    }
    
    return shoe;
  }, []);

  /**
   * Analytics: Track View
   * Uses Database RPC for atomic increment
   */
  const trackView = useCallback(async (id: string) => {
    // DEMO MODE: Just log
    if (DEMO_MODE) {
      if (import.meta.env.DEV) console.warn(`[Demo] View tracked: ${id}`);
      return;
    }

    // PRODUCTION MODE: Use Supabase
    supabase.rpc('increment_shoe_view', { shoe_id: id }).then(({ error }) => {
      if (error) console.error('Error tracking view:', error);
    });
  }, []);

  /**
   * Analytics: Track Click (Conversion intent)
   */
  const trackClick = useCallback(async (id: string) => {
    // DEMO MODE: Just log
    if (DEMO_MODE) {
      if (import.meta.env.DEV) console.warn(`[Demo] Click tracked: ${id}`);
      return;
    }

    // PRODUCTION MODE: Use Supabase
    supabase.rpc('increment_shoe_click', { shoe_id: id });

    supabase.from('affiliate_clicks').insert({
      shoe_id: id,
      clicked_at: new Date().toISOString()
    });
  }, []);

  return {
    getInfiniteFeed,
    getFeaturedSneakers,
    getSneakerById,
    trackView,
    trackClick,
    loading,
    error: queryError?.message || null,
    sneakersData, // Cached data from React Query
  };
};
