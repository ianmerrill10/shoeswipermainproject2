import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFavorites } from '../useFavorites';

// Mock the config module to ensure DEMO_MODE is true for testing
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

const FAVORITES_STORAGE_KEY = 'shoeswiper_favorites';

describe('useFavorites', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all console mocks
    vi.clearAllMocks();
  });

  it('should initialize with empty favorites and complete loading', async () => {
    const { result } = renderHook(() => useFavorites());

    // Initially should have empty favorites
    expect(result.current.favorites).toBeInstanceOf(Set);

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have no favorites
    expect(result.current.getFavoriteCount()).toBe(0);
  });

  it('should load favorites from localStorage on mount', async () => {
    const mockFavorites = ['shoe-1', 'shoe-2', 'shoe-3'];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getFavoriteCount()).toBe(3);
    expect(result.current.isFavorite('shoe-1')).toBe(true);
    expect(result.current.isFavorite('shoe-2')).toBe(true);
    expect(result.current.isFavorite('shoe-3')).toBe(true);
  });

  it('should add a favorite', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let addResult: boolean = false;
    await act(async () => {
      addResult = await result.current.addFavorite('shoe-123');
    });

    expect(addResult).toBe(true);
    expect(result.current.isFavorite('shoe-123')).toBe(true);
    expect(result.current.getFavoriteCount()).toBe(1);

    // Verify it was saved to localStorage
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toContain('shoe-123');
  });

  it('should remove a favorite', async () => {
    const mockFavorites = ['shoe-1', 'shoe-2'];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getFavoriteCount()).toBe(2);

    let removeResult: boolean = false;
    await act(async () => {
      removeResult = await result.current.removeFavorite('shoe-1');
    });

    expect(removeResult).toBe(true);
    expect(result.current.isFavorite('shoe-1')).toBe(false);
    expect(result.current.isFavorite('shoe-2')).toBe(true);
    expect(result.current.getFavoriteCount()).toBe(1);

    // Verify it was removed from localStorage
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    expect(stored).toBeTruthy();
    const storedArray = JSON.parse(stored!);
    expect(storedArray).not.toContain('shoe-1');
    expect(storedArray).toContain('shoe-2');
  });

  it('should toggle a favorite on and off', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Toggle on
    await act(async () => {
      await result.current.toggleFavorite('shoe-456');
    });

    expect(result.current.isFavorite('shoe-456')).toBe(true);
    expect(result.current.getFavoriteCount()).toBe(1);

    // Toggle off
    await act(async () => {
      await result.current.toggleFavorite('shoe-456');
    });

    expect(result.current.isFavorite('shoe-456')).toBe(false);
    expect(result.current.getFavoriteCount()).toBe(0);
  });

  it('should return array of favorite IDs', async () => {
    const mockFavorites = ['shoe-1', 'shoe-2', 'shoe-3'];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const favoriteIds = result.current.getFavoriteIds();
    expect(favoriteIds).toHaveLength(3);
    expect(favoriteIds).toEqual(expect.arrayContaining(mockFavorites));
  });

  it('should refresh favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getFavoriteCount()).toBe(0);

    // Add favorites to localStorage externally
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['shoe-new']));

    // Refresh
    await act(async () => {
      await result.current.refreshFavorites();
    });

    expect(result.current.getFavoriteCount()).toBe(1);
    expect(result.current.isFavorite('shoe-new')).toBe(true);
  });

  it('should handle multiple favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add multiple favorites sequentially to avoid race conditions
    await act(async () => {
      await result.current.addFavorite('shoe-1');
    });

    await act(async () => {
      await result.current.addFavorite('shoe-2');
    });

    await act(async () => {
      await result.current.addFavorite('shoe-3');
    });

    expect(result.current.getFavoriteCount()).toBe(3);
    expect(result.current.isFavorite('shoe-1')).toBe(true);
    expect(result.current.isFavorite('shoe-2')).toBe(true);
    expect(result.current.isFavorite('shoe-3')).toBe(true);
  });

  it('should check if shoe is not a favorite', async () => {
    const mockFavorites = ['shoe-1', 'shoe-2'];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorite('shoe-1')).toBe(true);
    expect(result.current.isFavorite('shoe-999')).toBe(false);
  });
});
