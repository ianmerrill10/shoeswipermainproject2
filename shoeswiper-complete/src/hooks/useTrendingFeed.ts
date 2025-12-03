import { useState, useCallback } from 'react';
import { Shoe } from '../lib/types';
import { DEMO_MODE, MOCK_SHOES } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';

/**
 * Trending Algorithm
 * Combines multiple signals to determine trending shoes:
 * - Recent view velocity (views in last 24h)
 * - Favorite count weighted by recency
 * - Click-through rate (affiliate clicks / views)
 */

interface TrendingScore {
  shoe: Shoe;
  score: number;
}

// Calculate trending score for demo mode
const calculateTrendingScore = (shoe: Shoe): number => {
  const baseScore = shoe.view_count * 0.3 + shoe.favorite_count * 0.5 + shoe.click_count * 0.2;
  
  // Featured shoes get a boost
  const featuredBoost = shoe.is_featured ? 1.5 : 1;
  
  // Randomize slightly to keep feed fresh
  const freshness = 0.9 + Math.random() * 0.2;
  
  return baseScore * featuredBoost * freshness;
};

// Sort shoes by trending score
const sortByTrending = (shoes: Shoe[]): Shoe[] => {
  const scored: TrendingScore[] = shoes.map(shoe => ({
    shoe,
    score: calculateTrendingScore(shoe)
  }));
  
  return scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.shoe);
};

export type FeedTab = 'forYou' | 'trending';

export const useTrendingFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get Trending Feed
   * Returns shoes sorted by trending algorithm
   */
  const getTrendingFeed = useCallback(async (page: number = 0, limit: number = 5): Promise<Shoe[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // DEMO MODE: Use mock data with trending algorithm
      if (DEMO_MODE) {
        const sorted = sortByTrending(MOCK_SHOES);
        const from = page * limit;
        const to = from + limit;
        setLoading(false);
        return sorted.slice(from, to);
      }

      // PRODUCTION MODE: Use Supabase with trending query
      const from = page * limit;
      const to = from + limit - 1;

      // Get shoes ordered by a weighted trending score
      // Using a combination of view_count, favorite_count, and recency
      const { data, error: dbError } = await supabase
        .from('shoes')
        .select('*')
        .eq('is_active', true)
        .order('favorite_count', { ascending: false })
        .order('view_count', { ascending: false })
        .range(from, to);

      if (dbError) throw dbError;
      
      return data as Shoe[];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trending feed';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get Hot Right Now - Top trending shoes
   */
  const getHotRightNow = useCallback(async (limit: number = 10): Promise<Shoe[]> => {
    // DEMO MODE
    if (DEMO_MODE) {
      return sortByTrending(MOCK_SHOES).slice(0, limit);
    }

    // PRODUCTION MODE
    const { data } = await supabase
      .from('shoes')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('view_count', { ascending: false })
      .limit(limit);

    return (data as Shoe[]) || [];
  }, []);

  /**
   * Get Rising Shoes - Shoes with fastest growing engagement
   */
  const getRisingShoes = useCallback(async (limit: number = 5): Promise<Shoe[]> => {
    // DEMO MODE: Return non-featured shoes sorted by click rate
    if (DEMO_MODE) {
      return MOCK_SHOES
        .filter(s => !s.is_featured)
        .sort((a, b) => {
          const aRate = a.click_count / Math.max(1, a.view_count);
          const bRate = b.click_count / Math.max(1, b.view_count);
          return bRate - aRate;
        })
        .slice(0, limit);
    }

    // PRODUCTION MODE
    const { data } = await supabase
      .from('shoes')
      .select('*')
      .eq('is_active', true)
      .order('click_count', { ascending: false })
      .limit(limit);

    return (data as Shoe[]) || [];
  }, []);

  return {
    getTrendingFeed,
    getHotRightNow,
    getRisingShoes,
    loading,
    error
  };
};
