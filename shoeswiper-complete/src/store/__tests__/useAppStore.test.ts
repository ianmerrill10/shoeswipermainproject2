import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useAppStore.setState({
      user: null,
      isAuthenticated: false,
      favorites: new Set<string>(),
      theme: 'dark',
    });
  });

  describe('Initial State', () => {
    it('should have null user initially', () => {
      const { user } = useAppStore.getState();
      expect(user).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const { isAuthenticated } = useAppStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('should have empty favorites initially', () => {
      const { favorites } = useAppStore.getState();
      expect(favorites.size).toBe(0);
    });

    it('should have dark theme initially', () => {
      const { theme } = useAppStore.getState();
      expect(theme).toBe('dark');
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        created_at: '2024-01-01T00:00:00Z',
      };

      useAppStore.getState().setUser(mockUser);

      const { user, isAuthenticated } = useAppStore.getState();
      expect(user).toEqual(mockUser);
      expect(isAuthenticated).toBe(true);
    });

    it('should set user to null and mark as not authenticated', () => {
      // First set a user
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        created_at: '2024-01-01T00:00:00Z',
      };
      useAppStore.getState().setUser(mockUser);

      // Then set to null
      useAppStore.getState().setUser(null);

      const { user, isAuthenticated } = useAppStore.getState();
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      // First set a user
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        created_at: '2024-01-01T00:00:00Z',
      };
      useAppStore.getState().setUser(mockUser);

      expect(useAppStore.getState().isAuthenticated).toBe(true);

      // Then logout
      useAppStore.getState().logout();

      const { user, isAuthenticated } = useAppStore.getState();
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('addFavorite', () => {
    it('should add a shoe to favorites', () => {
      useAppStore.getState().addFavorite('shoe-1');

      const { favorites } = useAppStore.getState();
      expect(favorites.has('shoe-1')).toBe(true);
      expect(favorites.size).toBe(1);
    });

    it('should add multiple shoes to favorites', () => {
      useAppStore.getState().addFavorite('shoe-1');
      useAppStore.getState().addFavorite('shoe-2');
      useAppStore.getState().addFavorite('shoe-3');

      const { favorites } = useAppStore.getState();
      expect(favorites.has('shoe-1')).toBe(true);
      expect(favorites.has('shoe-2')).toBe(true);
      expect(favorites.has('shoe-3')).toBe(true);
      expect(favorites.size).toBe(3);
    });

    it('should not duplicate favorites', () => {
      useAppStore.getState().addFavorite('shoe-1');
      useAppStore.getState().addFavorite('shoe-1');

      const { favorites } = useAppStore.getState();
      expect(favorites.size).toBe(1);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a shoe from favorites', () => {
      useAppStore.getState().addFavorite('shoe-1');
      useAppStore.getState().addFavorite('shoe-2');

      expect(useAppStore.getState().favorites.has('shoe-1')).toBe(true);

      useAppStore.getState().removeFavorite('shoe-1');

      const { favorites } = useAppStore.getState();
      expect(favorites.has('shoe-1')).toBe(false);
      expect(favorites.has('shoe-2')).toBe(true);
      expect(favorites.size).toBe(1);
    });

    it('should handle removing non-existent favorite gracefully', () => {
      useAppStore.getState().addFavorite('shoe-1');

      useAppStore.getState().removeFavorite('non-existent');

      const { favorites } = useAppStore.getState();
      expect(favorites.size).toBe(1);
      expect(favorites.has('shoe-1')).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('should add shoe if not in favorites', () => {
      expect(useAppStore.getState().favorites.has('shoe-toggle')).toBe(false);

      useAppStore.getState().toggleFavorite('shoe-toggle');

      expect(useAppStore.getState().favorites.has('shoe-toggle')).toBe(true);
    });

    it('should remove shoe if already in favorites', () => {
      useAppStore.getState().addFavorite('shoe-toggle');
      expect(useAppStore.getState().favorites.has('shoe-toggle')).toBe(true);

      useAppStore.getState().toggleFavorite('shoe-toggle');

      expect(useAppStore.getState().favorites.has('shoe-toggle')).toBe(false);
    });

    it('should toggle correctly multiple times', () => {
      useAppStore.getState().toggleFavorite('shoe-multi');
      expect(useAppStore.getState().favorites.has('shoe-multi')).toBe(true);

      useAppStore.getState().toggleFavorite('shoe-multi');
      expect(useAppStore.getState().favorites.has('shoe-multi')).toBe(false);

      useAppStore.getState().toggleFavorite('shoe-multi');
      expect(useAppStore.getState().favorites.has('shoe-multi')).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      useAppStore.getState().setTheme('light');

      const { theme } = useAppStore.getState();
      expect(theme).toBe('light');
    });

    it('should set theme to dark', () => {
      useAppStore.getState().setTheme('light');
      useAppStore.getState().setTheme('dark');

      const { theme } = useAppStore.getState();
      expect(theme).toBe('dark');
    });
  });

  describe('Combined Operations', () => {
    it('should maintain favorites after user logout', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        created_at: '2024-01-01T00:00:00Z',
      };

      useAppStore.getState().setUser(mockUser);
      useAppStore.getState().addFavorite('shoe-1');
      useAppStore.getState().addFavorite('shoe-2');

      useAppStore.getState().logout();

      // Favorites are still maintained (store doesn't clear favorites on logout)
      const { favorites } = useAppStore.getState();
      expect(favorites.size).toBe(2);
    });

    it('should maintain theme after user changes', () => {
      useAppStore.getState().setTheme('light');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        created_at: '2024-01-01T00:00:00Z',
      };

      useAppStore.getState().setUser(mockUser);
      useAppStore.getState().logout();

      // Theme is still maintained
      const { theme } = useAppStore.getState();
      expect(theme).toBe('light');
    });
  });
});
