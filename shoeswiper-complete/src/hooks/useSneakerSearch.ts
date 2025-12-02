import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shoe } from '../lib/types';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export interface SearchFilters {
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  styleTags?: string[];
  colorTags?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'trending';
}

export const useSneakerSearch = () => {
  const [results, setResults] = useState<Shoe[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchSneakers = async (query: string, filters: SearchFilters = {}) => {
    setIsSearching(true);
    
    try {
      let dbQuery = supabase.from('shoes').select('*').eq('is_active', true);

      // 1. Text Search (if query exists)
      if (query.trim().length > 0) {
        dbQuery = dbQuery.textSearch('name', query, {
          type: 'websearch',
          config: 'english'
        });
      }

      // 2. Apply Filters
      if (filters.brands && filters.brands.length > 0) {
        dbQuery = dbQuery.in('brand', filters.brands);
      }

      if (filters.minPrice !== undefined) {
        dbQuery = dbQuery.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        dbQuery = dbQuery.lte('price', filters.maxPrice);
      }

      if (filters.gender) {
        dbQuery = dbQuery.eq('gender', filters.gender);
      }

      // Array Overlap Checks
      if (filters.styleTags && filters.styleTags.length > 0) {
        dbQuery = dbQuery.contains('style_tags', filters.styleTags);
      }
      
      if (filters.colorTags && filters.colorTags.length > 0) {
        dbQuery = dbQuery.contains('color_tags', filters.colorTags);
      }

      // 3. Sorting
      switch (filters.sortBy) {
        case 'price_asc':
          dbQuery = dbQuery.order('price', { ascending: true });
          break;
        case 'price_desc':
          dbQuery = dbQuery.order('price', { ascending: false });
          break;
        case 'newest':
          dbQuery = dbQuery.order('created_at', { ascending: false });
          break;
        case 'trending':
          dbQuery = dbQuery.order('view_count', { ascending: false });
          break;
        default:
          if (!query) dbQuery = dbQuery.order('favorite_count', { ascending: false });
      }

      const { data, error } = await dbQuery.limit(50);
      
      if (error) throw error;
      setResults(data as Shoe[]);
      
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchSneakers,
    results,
    isSearching
  };
};
