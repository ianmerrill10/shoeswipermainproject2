import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Need to mock before importing the hook
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

const mockShoes = [
  {
    id: 'shoe-1',
    name: 'Air Force 1',
    brand: 'Nike',
    price: 110,
    image_url: 'https://example.com/af1.jpg',
    amazon_url: 'https://amazon.com/dp/B123?tag=shoeswiper-20',
    amazon_asin: 'B123',
    style_tags: ['casual', 'classic'],
    color_tags: ['white'],
    favorite_count: 100,
    view_count: 500,
    click_count: 50,
    is_active: true,
    is_featured: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'shoe-2',
    name: 'Air Jordan 1',
    brand: 'Nike',
    price: 180,
    image_url: 'https://example.com/aj1.jpg',
    amazon_url: 'https://amazon.com/dp/B456?tag=shoeswiper-20',
    amazon_asin: 'B456',
    style_tags: ['streetwear', 'basketball'],
    color_tags: ['red', 'black'],
    favorite_count: 200,
    view_count: 800,
    click_count: 100,
    is_active: true,
    is_featured: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'shoe-3',
    name: 'Dunk Low',
    brand: 'Nike',
    price: 100,
    image_url: 'https://example.com/dunk.jpg',
    amazon_url: 'https://amazon.com/dp/B789?tag=shoeswiper-20',
    amazon_asin: 'B789',
    style_tags: ['streetwear'],
    color_tags: ['black', 'white'],
    favorite_count: 150,
    view_count: 600,
    click_count: 70,
    is_active: true,
    is_featured: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

vi.mock('../../lib/mockData', () => ({
  DEMO_MODE: true,
  MOCK_SHOES: mockShoes,
  getShuffledShoes: () => [...mockShoes],
  getFeaturedShoes: () => mockShoes.filter(s => s.is_featured),
}));

// Mock Supabase client
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table);
      const chainable = {
        select: (...args: unknown[]) => {
          mockSelect(...args);
          return chainable;
        },
        eq: (...args: unknown[]) => {
          mockEq(...args);
          return chainable;
        },
        order: (...args: unknown[]) => {
          mockOrder(...args);
          return chainable;
        },
        range: (...args: unknown[]) => {
          mockRange(...args);
          return Promise.resolve({ data: mockShoes, error: null });
        },
        single: () => {
          mockSingle();
          return Promise.resolve({ data: mockShoes[0], error: null });
        },
        limit: () => Promise.resolve({ data: mockShoes.filter(s => s.is_featured), error: null }),
        insert: (...args: unknown[]) => {
          mockInsert(...args);
          return Promise.resolve({ error: null });
        },
      };
      return chainable;
    },
    rpc: (...args: unknown[]) => {
      mockRpc(...args);
      return Promise.resolve({ error: null });
    },
  },
}));

// Mock console.warn for demo mode logging
const originalWarn = console.warn;
const mockWarn = vi.fn();

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useSneakers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = mockWarn;
  });

  afterEach(() => {
    console.warn = originalWarn;
    vi.clearAllMocks();
  });

  it('should initialize with loading state', async () => {
    const { useSneakers } = await import('../useSneakers');
    const { result } = renderHook(() => useSneakers(), {
      wrapper: createWrapper(),
    });

    // Initially loading might be true
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should have all required methods', async () => {
    const { useSneakers } = await import('../useSneakers');
    const { result } = renderHook(() => useSneakers(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.getInfiniteFeed).toBe('function');
    expect(typeof result.current.getFeaturedSneakers).toBe('function');
    expect(typeof result.current.getSneakerById).toBe('function');
    expect(typeof result.current.trackView).toBe('function');
    expect(typeof result.current.trackClick).toBe('function');
  });

  describe('getInfiniteFeed', () => {
    it('should fetch sneakers for infinite feed', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      let shoes;
      await act(async () => {
        shoes = await result.current.getInfiniteFeed(0, 5);
      });

      expect(shoes).toBeDefined();
      expect(Array.isArray(shoes)).toBe(true);
    });

    it('should support pagination', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      let page1;
      let page2;
      await act(async () => {
        page1 = await result.current.getInfiniteFeed(0, 2);
        page2 = await result.current.getInfiniteFeed(1, 2);
      });

      expect(page1).toBeDefined();
      expect(page2).toBeDefined();
    });

    it('should use default limit when not specified', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      let shoes;
      await act(async () => {
        shoes = await result.current.getInfiniteFeed();
      });

      expect(shoes).toBeDefined();
    });
  });

  describe('getFeaturedSneakers', () => {
    it('should fetch featured sneakers', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      let featured;
      await act(async () => {
        featured = await result.current.getFeaturedSneakers();
      });

      expect(featured).toBeDefined();
      expect(Array.isArray(featured)).toBe(true);
    });

    it('should return only featured shoes in demo mode', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      let featured;
      await act(async () => {
        featured = await result.current.getFeaturedSneakers();
      });

      if (featured && featured.length > 0) {
        const allFeatured = featured.every((shoe: { is_featured: boolean }) => shoe.is_featured === true);
        expect(allFeatured).toBe(true);
      }
    });
  });

  describe('getSneakerById', () => {
    it('should fetch sneaker by ID', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      let shoe;
      await act(async () => {
        shoe = await result.current.getSneakerById('shoe-1');
      });

      expect(shoe).toBeDefined();
      expect(shoe?.id).toBe('shoe-1');
    });

    it('should return null for non-existent ID', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      let shoe;
      await act(async () => {
        shoe = await result.current.getSneakerById('nonexistent');
      });

      expect(shoe).toBeNull();
    });
  });

  describe('trackView', () => {
    it('should track shoe view in demo mode', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.trackView('shoe-1');
      });

      expect(mockWarn).toHaveBeenCalled();
      const hasViewLog = mockWarn.mock.calls.some(call =>
        call[0]?.includes?.('[Demo]') && call[0]?.includes?.('View tracked')
      );
      expect(hasViewLog).toBe(true);
    });

    it('should handle multiple view tracks', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.trackView('shoe-1');
        await result.current.trackView('shoe-2');
        await result.current.trackView('shoe-3');
      });

      const viewLogs = mockWarn.mock.calls.filter(call =>
        call[0]?.includes?.('View tracked')
      );
      expect(viewLogs.length).toBe(3);
    });
  });

  describe('trackClick', () => {
    it('should track shoe click in demo mode', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.trackClick('shoe-1');
      });

      expect(mockWarn).toHaveBeenCalled();
      const hasClickLog = mockWarn.mock.calls.some(call =>
        call[0]?.includes?.('[Demo]') && call[0]?.includes?.('Click tracked')
      );
      expect(hasClickLog).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should expose error state', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      // error should be null initially
      expect(result.current.error).toBeNull();
    });
  });

  describe('sneakersData', () => {
    it('should expose cached data from React Query', async () => {
      const { useSneakers } = await import('../useSneakers');
      const { result } = renderHook(() => useSneakers(), {
        wrapper: createWrapper(),
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // sneakersData should be available after loading
      expect(result.current.sneakersData).toBeDefined();
    });
  });
});
