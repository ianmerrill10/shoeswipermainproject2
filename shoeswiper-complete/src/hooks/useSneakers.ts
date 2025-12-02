import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shoe } from '../lib/types';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

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
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get Featured Sneakers for "Hot Right Now" sections
   */
  const getFeaturedSneakers = useCallback(async (): Promise<Shoe[]> => {
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
    supabase.rpc('increment_shoe_view', { shoe_id: id }).then(({ error }) => {
      if (error) console.error('Error tracking view:', error);
    });
  }, []);

  /**
   * Analytics: Track Click (Conversion intent)
   */
  const trackClick = useCallback(async (id: string) => {
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
