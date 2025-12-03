import { useState, useCallback } from 'react';
import { Shoe } from '../lib/types';
import { DEMO_MODE, getShuffledShoes, getFeaturedShoes, MOCK_SHOES } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';

export const useSneakers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get Infinite Feed (Randomized or Algorithmically Sorted)
   * TikTok style usually implies a mix of popularity and randomness.
   */
  const getInfiniteFeed = useCallback(async (page: number = 0, limit: number = 5): Promise<Shoe[]> => {
    setLoading(true);
    try {
      // DEMO MODE: Use mock data
      if (DEMO_MODE) {
        const shuffled = getShuffledShoes();
        const from = page * limit;
        const to = from + limit;
        setLoading(false);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sneakers';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
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
      console.log(`[Demo] View tracked: ${id}`);
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
      console.log(`[Demo] Click tracked: ${id}`);
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
    error
  };
};
