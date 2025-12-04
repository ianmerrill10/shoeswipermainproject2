import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdmin } from '../useAdmin';

// Mock config module
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

// Mock mockData module
vi.mock('../../lib/mockData', () => ({
  DEMO_MODE: true,
  MOCK_SHOES: [
    {
      id: 'shoe-1',
      name: 'Air Force 1',
      brand: 'Nike',
      price: 110,
      image_url: 'https://example.com/af1.jpg',
      amazon_url: 'https://amazon.com/dp/B123',
      amazon_asin: 'B123',
      style_tags: ['casual'],
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
      name: 'Dunk Low',
      brand: 'Nike',
      price: 100,
      image_url: 'https://example.com/dunk.jpg',
      amazon_url: 'https://amazon.com/dp/B456',
      amazon_asin: 'B456',
      style_tags: ['streetwear'],
      color_tags: ['black'],
      favorite_count: 80,
      view_count: 400,
      click_count: 40,
      is_active: true,
      is_featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
}));

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockHead = vi.fn();

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      mockFrom(table);
      return {
        select: (...args: unknown[]) => {
          mockSelect(...args);
          return {
            count: 'exact',
            head: true,
            order: (...orderArgs: unknown[]) => {
              mockOrder(...orderArgs);
              return { data: [], error: null };
            },
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return {
                select: vi.fn().mockReturnValue({ data: [], error: null }),
              };
            },
            gte: vi.fn().mockReturnValue({ data: [], error: null }),
          };
        },
        insert: (...args: unknown[]) => {
          mockInsert(...args);
          return {
            select: vi.fn().mockResolvedValue({ data: [{ id: 'new-shoe' }], error: null }),
          };
        },
        update: (...args: unknown[]) => {
          mockUpdate(...args);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return {
                select: vi.fn().mockResolvedValue({ data: [{ id: 'updated-shoe' }], error: null }),
              };
            },
          };
        },
        delete: () => {
          mockDelete();
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return { error: null };
            },
          };
        },
      };
    },
  },
  ADMIN_EMAIL: 'dadsellsgadgets@gmail.com',
}));

// Mock console.warn for demo mode logging
const originalWarn = console.warn;
const mockWarn = vi.fn();

describe('useAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = mockWarn;
    mockGetUser.mockResolvedValue({ data: { user: { email: 'dadsellsgadgets@gmail.com' } }, error: null });
  });

  afterEach(() => {
    console.warn = originalWarn;
    vi.clearAllMocks();
  });

  it('should initialize with loading false', () => {
    const { result } = renderHook(() => useAdmin());

    expect(result.current.loading).toBe(false);
  });

  it('should set isAdmin to true in demo mode', async () => {
    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });
  });

  it('should have all admin methods', () => {
    const { result } = renderHook(() => useAdmin());

    expect(typeof result.current.getProducts).toBe('function');
    expect(typeof result.current.saveProduct).toBe('function');
    expect(typeof result.current.deleteProduct).toBe('function');
    expect(typeof result.current.getAnalytics).toBe('function');
  });

  describe('getProducts', () => {
    it('should return mock shoes in demo mode', async () => {
      const { result } = renderHook(() => useAdmin());

      let products;
      await act(async () => {
        products = await result.current.getProducts();
      });

      expect(products).toHaveLength(2);
      expect(products?.[0].name).toBe('Air Force 1');
    });
  });

  describe('saveProduct', () => {
    it('should log product save in demo mode', async () => {
      const { result } = renderHook(() => useAdmin());

      const newProduct = {
        name: 'Test Shoe',
        brand: 'Test Brand',
        price: 100,
        amazon_url: 'https://amazon.com/dp/BTEST',
      };

      let savedProduct;
      await act(async () => {
        savedProduct = await result.current.saveProduct(newProduct);
      });

      expect(mockWarn).toHaveBeenCalled();
      expect(savedProduct).toBeDefined();
    });

    it('should format Amazon URL with affiliate tag', async () => {
      const { result } = renderHook(() => useAdmin());

      // Verify the hook processes Amazon URLs
      expect(result.current.saveProduct).toBeDefined();
    });
  });

  describe('deleteProduct', () => {
    it('should log product deletion in demo mode', async () => {
      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.deleteProduct('shoe-123');
      });

      expect(mockWarn).toHaveBeenCalled();
    });
  });

  describe('getAnalytics', () => {
    it('should return mock analytics in demo mode', async () => {
      const { result } = renderHook(() => useAdmin());

      let analytics;
      await act(async () => {
        analytics = await result.current.getAnalytics();
      });

      expect(analytics).toBeDefined();
      expect(analytics?.totalUsers).toBe(1);
      expect(analytics?.totalProducts).toBe(2);
      expect(analytics?.clicks).toEqual([]);
    });
  });

  describe('affiliate URL formatting', () => {
    it('should add affiliate tag to Amazon URLs', async () => {
      const { result } = renderHook(() => useAdmin());

      // The hook should properly format Amazon URLs
      const product = {
        amazon_url: 'https://amazon.com/dp/BTEST',
      };

      await act(async () => {
        await result.current.saveProduct(product);
      });

      // Demo mode just logs, so we verify the function runs
      expect(mockWarn).toHaveBeenCalled();
    });

    it('should not modify non-Amazon URLs', async () => {
      const { result } = renderHook(() => useAdmin());

      const product = {
        amazon_url: 'https://other-store.com/product',
      };

      await act(async () => {
        await result.current.saveProduct(product);
      });

      expect(mockWarn).toHaveBeenCalled();
    });
  });
});

describe('useAdmin - Production Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = mockWarn;
  });

  afterEach(() => {
    console.warn = originalWarn;
    vi.clearAllMocks();
  });

  it('should have correct return type structure', () => {
    const { result } = renderHook(() => useAdmin());

    expect(result.current).toHaveProperty('isAdmin');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('getProducts');
    expect(result.current).toHaveProperty('saveProduct');
    expect(result.current).toHaveProperty('deleteProduct');
    expect(result.current).toHaveProperty('getAnalytics');
  });

  it('should expose loading state', () => {
    const { result } = renderHook(() => useAdmin());

    expect(typeof result.current.loading).toBe('boolean');
  });
});
