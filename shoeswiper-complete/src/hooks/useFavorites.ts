import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/config';

const FAVORITES_STORAGE_KEY = 'shoeswiper_favorites';

/**
 * User favorites/closet management hook.
 * Manages adding, removing, and checking favorite sneakers.
 * In DEMO_MODE, favorites are stored in localStorage.
 * 
 * @returns Object containing favorites state and methods
 * @example
 * const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
 * 
 * // Toggle favorite status
 * await toggleFavorite(shoe.id);
 * 
 * // Check if shoe is favorited
 * const isFav = isFavorite(shoe.id);
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // DEMO MODE: Load from localStorage
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const ids = JSON.parse(stored) as string[];
          setFavorites(new Set(ids));
        }
        if (import.meta.env.DEV) console.warn('[Demo] Favorites loaded from localStorage');
      } else {
        // PRODUCTION MODE: Load from Supabase
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('user_sneakers')
            .select('shoe_id')
            .eq('user_id', user.id);

          if (!error && data) {
            setFavorites(new Set(data.map((item: { shoe_id: string }) => item.shoe_id)));
          }
        }
      }
    } catch (err) {
      console.error('[Favorites] Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a shoe to the user's favorites.
   * @param shoeId - The ID of the shoe to add
   * @returns Promise resolving to true if successful
   */
  const addFavorite = useCallback(async (shoeId: string): Promise<boolean> => {
    try {
      if (DEMO_MODE) {
        // DEMO MODE: Save to localStorage
        const newFavorites = new Set(favorites);
        newFavorites.add(shoeId);
        setFavorites(newFavorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...newFavorites]));
        if (import.meta.env.DEV) console.warn(`[Demo] Added to favorites: ${shoeId}`);
        return true;
      } else {
        // PRODUCTION MODE: Save to Supabase
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error('[Favorites] User not authenticated');
          return false;
        }

        const { error } = await supabase.from('user_sneakers').insert({
          user_id: user.id,
          shoe_id: shoeId,
          added_at: new Date().toISOString(),
        });

        if (error) {
          // Check if already exists (unique constraint)
          if (error.code === '23505') {
            if (import.meta.env.DEV) console.warn('[Favorites] Already favorited');
            return true;
          }
          throw error;
        }

        setFavorites(prev => new Set([...prev, shoeId]));
        return true;
      }
    } catch (err) {
      console.error('[Favorites] Error adding favorite:', err);
      return false;
    }
  }, [favorites]);

  /**
   * Removes a shoe from the user's favorites.
   * @param shoeId - The ID of the shoe to remove
   * @returns Promise resolving to true if successful
   */
  const removeFavorite = useCallback(async (shoeId: string): Promise<boolean> => {
    try {
      if (DEMO_MODE) {
        // DEMO MODE: Remove from localStorage
        const newFavorites = new Set(favorites);
        newFavorites.delete(shoeId);
        setFavorites(newFavorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...newFavorites]));
        if (import.meta.env.DEV) console.warn(`[Demo] Removed from favorites: ${shoeId}`);
        return true;
      } else {
        // PRODUCTION MODE: Remove from Supabase
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error('[Favorites] User not authenticated');
          return false;
        }

        const { error } = await supabase
          .from('user_sneakers')
          .delete()
          .eq('user_id', user.id)
          .eq('shoe_id', shoeId);

        if (error) throw error;

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(shoeId);
          return newSet;
        });
        return true;
      }
    } catch (err) {
      console.error('[Favorites] Error removing favorite:', err);
      return false;
    }
  }, [favorites]);

  /**
   * Toggles the favorite status of a shoe.
   * @param shoeId - The ID of the shoe to toggle
   * @returns Promise resolving to true if successful
   */
  const toggleFavorite = useCallback(async (shoeId: string): Promise<boolean> => {
    if (favorites.has(shoeId)) {
      return removeFavorite(shoeId);
    } else {
      return addFavorite(shoeId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  /**
   * Checks if a shoe is in the user's favorites.
   * @param shoeId - The ID of the shoe to check
   * @returns True if the shoe is favorited
   */
  const isFavorite = useCallback((shoeId: string): boolean => {
    return favorites.has(shoeId);
  }, [favorites]);

  /**
   * Gets the total count of favorited shoes.
   * @returns Number of favorites
   */
  const getFavoriteCount = useCallback((): number => {
    return favorites.size;
  }, [favorites]);

  /**
   * Gets all favorite shoe IDs as an array.
   * @returns Array of shoe IDs
   */
  const getFavoriteIds = useCallback((): string[] => {
    return [...favorites];
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    getFavoriteIds,
    refreshFavorites: loadFavorites,
  };
};
