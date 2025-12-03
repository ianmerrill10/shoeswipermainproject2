import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/config';

const FAVORITES_STORAGE_KEY = 'shoeswiper_favorites';

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
        if (import.meta.env.DEV) console.log('[Demo] Favorites loaded from localStorage');
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

  const addFavorite = useCallback(async (shoeId: string): Promise<boolean> => {
    try {
      if (DEMO_MODE) {
        // DEMO MODE: Save to localStorage
        const newFavorites = new Set(favorites);
        newFavorites.add(shoeId);
        setFavorites(newFavorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...newFavorites]));
        if (import.meta.env.DEV) console.log(`[Demo] Added to favorites: ${shoeId}`);
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
            if (import.meta.env.DEV) console.log('[Favorites] Already favorited');
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

  const removeFavorite = useCallback(async (shoeId: string): Promise<boolean> => {
    try {
      if (DEMO_MODE) {
        // DEMO MODE: Remove from localStorage
        const newFavorites = new Set(favorites);
        newFavorites.delete(shoeId);
        setFavorites(newFavorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...newFavorites]));
        if (import.meta.env.DEV) console.log(`[Demo] Removed from favorites: ${shoeId}`);
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

  const toggleFavorite = useCallback(async (shoeId: string): Promise<boolean> => {
    if (favorites.has(shoeId)) {
      return removeFavorite(shoeId);
    } else {
      return addFavorite(shoeId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((shoeId: string): boolean => {
    return favorites.has(shoeId);
  }, [favorites]);

  const getFavoriteCount = useCallback((): number => {
    return favorites.size;
  }, [favorites]);

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
