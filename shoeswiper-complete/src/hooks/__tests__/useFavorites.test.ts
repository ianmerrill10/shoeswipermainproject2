import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFavorites } from '../useFavorites';

// Mock config module
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const FAVORITES_STORAGE_KEY = 'shoeswiper_favorites';

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getFavoriteCount()).toBe(0);
    expect(result.current.getFavoriteIds()).toEqual([]);
  });

  it('should load favorites from localStorage in demo mode', async () => {
    const mockFavorites = ['shoe-1', 'shoe-2', 'shoe-3'];
    localStorageMock.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

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
  });

  it('should remove a favorite', async () => {
    const mockFavorites = ['shoe-1', 'shoe-2'];
    localStorageMock.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorite('shoe-1')).toBe(true);

    let removeResult: boolean = false;
    await act(async () => {
      removeResult = await result.current.removeFavorite('shoe-1');
    });

    expect(removeResult).toBe(true);
    expect(result.current.isFavorite('shoe-1')).toBe(false);
    expect(result.current.getFavoriteCount()).toBe(1);
  });

  it('should toggle favorite - add when not present', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorite('shoe-toggle')).toBe(false);

    await act(async () => {
      await result.current.toggleFavorite('shoe-toggle');
    });

    expect(result.current.isFavorite('shoe-toggle')).toBe(true);
  });

  it('should toggle favorite - remove when present', async () => {
    const mockFavorites = ['shoe-toggle'];
    localStorageMock.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorite('shoe-toggle')).toBe(true);

    await act(async () => {
      await result.current.toggleFavorite('shoe-toggle');
    });

    expect(result.current.isFavorite('shoe-toggle')).toBe(false);
  });

  it('should return correct favorite ids', async () => {
    const mockFavorites = ['shoe-a', 'shoe-b', 'shoe-c'];
    localStorageMock.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const ids = result.current.getFavoriteIds();
    expect(ids).toHaveLength(3);
    expect(ids).toContain('shoe-a');
    expect(ids).toContain('shoe-b');
    expect(ids).toContain('shoe-c');
  });

  it('should return correct favorite count', async () => {
    const mockFavorites = ['shoe-1', 'shoe-2', 'shoe-3', 'shoe-4'];
    localStorageMock.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getFavoriteCount()).toBe(4);
  });

  it('should persist favorites to localStorage after adding', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addFavorite('shoe-persist');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      FAVORITES_STORAGE_KEY,
      expect.any(String)
    );

    const stored = localStorageMock.getItem(FAVORITES_STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toContain('shoe-persist');
  });

  it('should persist favorites to localStorage after removing', async () => {
    const mockFavorites = ['shoe-1', 'shoe-2'];
    localStorageMock.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.removeFavorite('shoe-1');
    });

    const stored = localStorageMock.getItem(FAVORITES_STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).not.toContain('shoe-1');
    expect(parsed).toContain('shoe-2');
  });

  it('should return false for isFavorite when shoe not in favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorite('non-existent-shoe')).toBe(false);
  });

  it('should handle refreshFavorites function', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refreshFavorites).toBe('function');

    // Add a favorite then refresh
    await act(async () => {
      await result.current.addFavorite('shoe-refresh');
    });

    expect(result.current.isFavorite('shoe-refresh')).toBe(true);

    await act(async () => {
      await result.current.refreshFavorites();
    });

    // Should still have the favorite after refresh
    expect(result.current.isFavorite('shoe-refresh')).toBe(true);
  });

  it('should handle adding duplicate favorites gracefully', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addFavorite('shoe-dup');
    });

    expect(result.current.getFavoriteCount()).toBe(1);

    await act(async () => {
      await result.current.addFavorite('shoe-dup');
    });

    // Should still only have 1 (Set behavior)
    expect(result.current.getFavoriteCount()).toBe(1);
  });

  it('should handle removing non-existent favorite gracefully', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let removeResult: boolean = false;
    await act(async () => {
      removeResult = await result.current.removeFavorite('non-existent');
    });

    expect(removeResult).toBe(true);
    expect(result.current.getFavoriteCount()).toBe(0);
  });

  it('should have loading property', () => {
    const { result } = renderHook(() => useFavorites());
    
    // The hook has a loading property that is a boolean
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should return favorites Set', async () => {
    const mockFavorites = ['shoe-1'];
    localStorageMock.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(mockFavorites));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.favorites).toBeInstanceOf(Set);
    expect(result.current.favorites.has('shoe-1')).toBe(true);
  });
});
