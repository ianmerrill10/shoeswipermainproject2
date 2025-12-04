import { create } from 'zustand';
import { Profile } from '../lib/types';

interface AppState {
  // State
  user: Profile | null;
  isAuthenticated: boolean;
  favorites: Set<string>;
  theme: string;

  // Actions
  setUser: (user: Profile | null) => void;
  logout: () => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  favorites: new Set<string>(),
  theme: 'dark',

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  addFavorite: (id) =>
    set((state) => ({
      favorites: new Set(state.favorites).add(id),
    })),

  removeFavorite: (id) =>
    set((state) => {
      const newFavorites = new Set(state.favorites);
      newFavorites.delete(id);
      return { favorites: newFavorites };
    }),

  toggleFavorite: (id) =>
    set((state) => {
      const newFavorites = new Set(state.favorites);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return { favorites: newFavorites };
    }),

  setTheme: (theme) =>
    set({ theme }),
}));