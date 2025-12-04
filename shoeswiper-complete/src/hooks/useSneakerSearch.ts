import { useState } from 'react';
import { Shoe } from '../lib/types';
import { DEMO_MODE, searchShoes } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';
import {
  searchAmazonProducts,
  getAmazonProductsByAsin,
  amazonProductToShoe,
  ensureAffiliateTag,
} from '../lib/amazonApi';
import { AMAZON_API_CONFIG } from '../lib/config';

/**
 * Search filter options for sneaker queries.
 */
export interface SearchFilters {
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  styleTags?: string[];
  colorTags?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'trending';
}

/**
 * Search and filter sneakers hook with full-text search support.
 * Supports filtering by brand, price range, gender, style tags, and color tags.
 * 
 * In DEMO_MODE: Uses mock data search
 * In PRODUCTION: Searches Supabase database, optionally enriched with Amazon data
 * When Amazon API is enabled: Can also search Amazon directly for products
 * 
 * @returns Object containing search method, results, and loading state
 * @example
 * const { searchSneakers, searchAmazon, results, isSearching } = useSneakerSearch();
 * 
 * // Search with filters
 * await searchSneakers('jordan', {
 *   brands: ['Nike'],
 *   minPrice: 100,
 *   maxPrice: 300,
 *   sortBy: 'price_asc'
 * });
 * 
 * // Search Amazon directly (if enabled)
 * await searchAmazon('nike air max');
 */
export const useSneakerSearch = () => {
  const [results, setResults] = useState<Shoe[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Enriches shoes with fresh Amazon data if API is enabled
   */
  const enrichWithAmazonData = async (shoes: Shoe[]): Promise<Shoe[]> => {
    if (!AMAZON_API_CONFIG.enabled || shoes.length === 0) {
      return shoes;
    }

    try {
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

      const productMap = new Map(amazonProducts.map((p) => [p.asin, p]));

      return shoes.map((shoe) => {
        const amazonData = shoe.amazon_asin
          ? productMap.get(shoe.amazon_asin)
          : null;

        if (amazonData) {
          return amazonProductToShoe(amazonData, shoe);
        }

        return {
          ...shoe,
          amazon_url: ensureAffiliateTag(shoe.amazon_url),
        };
      });
    } catch (err) {
      console.error('[useSneakerSearch] Amazon enrichment failed:', err);
      return shoes;
    }
  };

  /**
   * Search sneakers in database with optional Amazon enrichment
   */
  const searchSneakers = async (query: string, filters: SearchFilters = {}) => {
    setIsSearching(true);

    try {
      // DEMO MODE: Use mock data
      if (DEMO_MODE) {
        let results = searchShoes(query);

        // Apply filters
        if (filters.brands && filters.brands.length > 0) {
          results = results.filter(shoe => filters.brands!.includes(shoe.brand));
        }
        if (filters.gender) {
          results = results.filter(shoe => shoe.gender === filters.gender);
        }
        if (filters.styleTags && filters.styleTags.length > 0) {
          results = results.filter(shoe =>
            shoe.style_tags.some(tag => filters.styleTags!.includes(tag))
          );
        }

        setResults(results.slice(0, 50));
        setIsSearching(false);
        return;
      }

      // PRODUCTION MODE: Use Supabase
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
      
      let shoes = data as Shoe[];
      
      // Enrich with Amazon data if enabled
      shoes = await enrichWithAmazonData(shoes);
      
      setResults(shoes);
      
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Search Amazon directly (only available when Amazon API is enabled)
   * This searches Amazon's product catalog, not just our database
   */
  const searchAmazon = async (keywords: string): Promise<void> => {
    if (!AMAZON_API_CONFIG.enabled) {
      if (import.meta.env.DEV) {
        console.warn('[useSneakerSearch] Amazon API not enabled');
      }
      return;
    }

    setIsSearching(true);

    try {
      const result = await searchAmazonProducts(keywords, {
        searchIndex: 'Fashion',
        itemCount: 10,
      });

      if (result) {
        setResults(result.products);
      }
    } catch (err) {
      console.error('Amazon search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchSneakers,
    searchAmazon,
    results,
    isSearching,
    isAmazonEnabled: AMAZON_API_CONFIG.enabled,
  };
};
