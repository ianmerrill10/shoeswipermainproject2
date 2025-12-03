import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shoe } from '../lib/types';
import { DEMO_MODE, getShuffledShoes, getFeaturedShoes, MOCK_SHOES } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';

export const useSneakers = () => {
  /**
   * Fetch function for infinite feed
   */
  const fetchInfiniteFeed = async (page: number = 0, limit: number = 5): Promise<Shoe[]> => {
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
    return data as Shoe[];
  };

  /**
   * useQuery for sneakers - provides caching and automatic refetching
   */
  const { data: sneakersData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['sneakers'],
    queryFn: () => fetchInfiniteFeed(0, 50), // Load initial batch
  });

  /**
   * Get Infinite Feed (backward compatible wrapper)
   */
  const getInfiniteFeed = useCallback(async (page: number = 0, limit: number = 5): Promise<Shoe[]> => {
    return fetchInfiniteFeed(page, limit);
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
    return data as Shoe[] || [];
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
    return data as Shoe;
  }, []);

  /**
   * Analytics: Track View
   * Uses Database RPC for atomic increment
   */
  const trackView = useCallback(async (id: string) => {
    // DEMO MODE: Just log
    if (DEMO_MODE) {
      if (import.meta.env.DEV) console.log(`[Demo] View tracked: ${id}`);
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
      if (import.meta.env.DEV) console.log(`[Demo] Click tracked: ${id}`);
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
