import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSneakerSearch } from '../useSneakerSearch';

// Mock config module
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

// Mock mockData module
const mockShoes = [
  {
    id: 'shoe-1',
    name: 'Air Force 1',
    brand: 'Nike',
    price: 110,
    image_url: 'https://example.com/af1.jpg',
    amazon_url: 'https://amazon.com/dp/B123',
    amazon_asin: 'B123',
    style_tags: ['casual', 'classic'],
    color_tags: ['white'],
    gender: 'men' as const,
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
    amazon_url: 'https://amazon.com/dp/B456',
    amazon_asin: 'B456',
    style_tags: ['streetwear', 'basketball'],
    color_tags: ['red', 'black'],
    gender: 'men' as const,
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
    name: 'Superstar',
    brand: 'Adidas',
    price: 90,
    image_url: 'https://example.com/superstar.jpg',
    amazon_url: 'https://amazon.com/dp/B789',
    amazon_asin: 'B789',
    style_tags: ['vintage', 'casual'],
    color_tags: ['white', 'black'],
    gender: 'unisex' as const,
    favorite_count: 150,
    view_count: 600,
    click_count: 70,
    is_active: true,
    is_featured: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'shoe-4',
    name: 'Classic Leather',
    brand: 'Reebok',
    price: 75,
    image_url: 'https://example.com/classic.jpg',
    amazon_url: 'https://amazon.com/dp/B101',
    amazon_asin: 'B101',
    style_tags: ['retro', 'casual'],
    color_tags: ['white'],
    gender: 'women' as const,
    favorite_count: 80,
    view_count: 300,
    click_count: 30,
    is_active: true,
    is_featured: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

vi.mock('../../lib/mockData', () => ({
  DEMO_MODE: true,
  searchShoes: (query: string) => {
    if (!query) return mockShoes;
    const lowerQuery = query.toLowerCase();
    return mockShoes.filter(
      shoe =>
        shoe.name.toLowerCase().includes(lowerQuery) ||
        shoe.brand.toLowerCase().includes(lowerQuery)
    );
  },
}));

// Mock Supabase client
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockTextSearch = vi.fn();
const mockIn = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockEq = vi.fn();
const mockContains = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

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
        textSearch: (...args: unknown[]) => {
          mockTextSearch(...args);
          return chainable;
        },
        in: (...args: unknown[]) => {
          mockIn(...args);
          return chainable;
        },
        gte: (...args: unknown[]) => {
          mockGte(...args);
          return chainable;
        },
        lte: (...args: unknown[]) => {
          mockLte(...args);
          return chainable;
        },
        contains: (...args: unknown[]) => {
          mockContains(...args);
          return chainable;
        },
        order: (...args: unknown[]) => {
          mockOrder(...args);
          return chainable;
        },
        limit: (...args: unknown[]) => {
          mockLimit(...args);
          return Promise.resolve({ data: mockShoes, error: null });
        },
      };
      return chainable;
    },
  },
}));

describe('useSneakerSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty results', () => {
    const { result } = renderHook(() => useSneakerSearch());

    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('should have searchSneakers function', () => {
    const { result } = renderHook(() => useSneakerSearch());

    expect(typeof result.current.searchSneakers).toBe('function');
  });

  describe('searchSneakers', () => {
    it('should search sneakers by query', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('air');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.isSearching).toBe(false);
    });

    it('should return results containing query', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('jordan');
      });

      const hasJordan = result.current.results.some(shoe =>
        shoe.name.toLowerCase().includes('jordan')
      );
      expect(hasJordan).toBe(true);
    });

    it('should search by brand name', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('nike');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      const allNike = result.current.results.every(shoe =>
        shoe.brand.toLowerCase() === 'nike' ||
        shoe.name.toLowerCase().includes('nike')
      );
      expect(allNike).toBe(true);
    });

    it('should return empty results for non-matching query', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('xyznonexistent');
      });

      expect(result.current.results).toEqual([]);
    });

    it('should be false after search completes', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('nike');
      });

      // After search completes, isSearching should be false
      expect(result.current.isSearching).toBe(false);
    });

    it('should return all shoes when query is empty', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
    });
  });

  describe('search with filters', () => {
    it('should filter by brand', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('', { brands: ['Nike'] });
      });

      const allNike = result.current.results.every(shoe => shoe.brand === 'Nike');
      expect(allNike).toBe(true);
    });

    it('should filter by gender', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('', { gender: 'women' });
      });

      const allWomen = result.current.results.every(shoe => shoe.gender === 'women');
      expect(allWomen).toBe(true);
    });

    it('should filter by style tags', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('', { styleTags: ['casual'] });
      });

      const allCasual = result.current.results.every(shoe =>
        shoe.style_tags.includes('casual')
      );
      expect(allCasual).toBe(true);
    });

    it('should combine query and filters', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('air', { brands: ['Nike'] });
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      const allNike = result.current.results.every(shoe => shoe.brand === 'Nike');
      expect(allNike).toBe(true);
    });

    it('should handle multiple brand filters', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('', { brands: ['Nike', 'Adidas'] });
      });

      const allNikeOrAdidas = result.current.results.every(
        shoe => shoe.brand === 'Nike' || shoe.brand === 'Adidas'
      );
      expect(allNikeOrAdidas).toBe(true);
    });
  });

  describe('isSearching state', () => {
    it('should start with isSearching false', () => {
      const { result } = renderHook(() => useSneakerSearch());

      expect(result.current.isSearching).toBe(false);
    });

    it('should be false after search completes', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('nike');
      });

      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('results limit', () => {
    it('should limit results to 50', async () => {
      const { result } = renderHook(() => useSneakerSearch());

      await act(async () => {
        await result.current.searchSneakers('');
      });

      expect(result.current.results.length).toBeLessThanOrEqual(50);
    });
  });
});
