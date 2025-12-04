import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOutfitAnalysis } from '../useOutfitAnalysis';

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
      amazon_url: 'https://amazon.com/dp/B123?tag=shoeswiper-20',
      amazon_asin: 'B123',
      style_tags: ['streetwear', 'casual'],
      color_tags: ['white'],
      favorite_count: 100,
      view_count: 500,
      click_count: 50,
      is_active: true,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'shoe-2',
      name: 'Samba OG',
      brand: 'Adidas',
      price: 100,
      image_url: 'https://example.com/samba.jpg',
      amazon_url: 'https://amazon.com/dp/B456?tag=shoeswiper-20',
      amazon_asin: 'B456',
      style_tags: ['vintage', 'casual'],
      color_tags: ['black', 'white'],
      favorite_count: 80,
      view_count: 400,
      click_count: 40,
      is_active: true,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
}));

// Mock Supabase client
const mockInvoke = vi.fn();
const mockRpc = vi.fn();
const mockSelect = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();

vi.mock('../../lib/supabaseClient', () => {
  const usageSelect = vi.fn(() => ({
    maybeSingle: vi.fn(async () => ({
      data: {
        monthly_limit: 5,
        used_this_month: 1,
        period_start: new Date().toISOString(),
      },
      error: null,
    })),
  }));

  return {
    supabase: {
      functions: {
        invoke: (...args: unknown[]) => mockInvoke(...args),
      },
      rpc: (...args: unknown[]) => mockRpc(...args),
      from: vi.fn((table: string) => {
        if (table === 'ai_usage_limits') {
          return { select: usageSelect } as any;
        }

        return {
          select: mockSelect,
          order: mockOrder,
          limit: mockLimit,
        };
      }),
    },
  };
});

describe('useOutfitAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useOutfitAnalysis());

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.analysis).toBeNull();
    expect(result.current.recommendations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should perform demo mode analysis successfully', async () => {
    const { result } = renderHook(() => useOutfitAnalysis());

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.analyzeImage(mockFile);
    });

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    // In demo mode, we expect mock analysis result
    expect(result.current.analysis).toBeTruthy();
    expect(result.current.analysis?.rating).toBe(8);
    expect(result.current.analysis?.style_tags).toContain('streetwear');
    expect(result.current.analysis?.style_tags).toContain('casual');
    expect(result.current.analysis?.dominant_colors).toContain('black');
    expect(result.current.analysis?.dominant_colors).toContain('white');
    expect(result.current.analysis?.detected_shoe).toBe('Demo Analysis');
    expect(result.current.error).toBeNull();
    expect(result.current.usage?.monthly_limit).toBe(5);
  });

  it('should provide recommendations after demo analysis', async () => {
    const { result } = renderHook(() => useOutfitAnalysis());

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.analyzeImage(mockFile);
    });

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    // Should have recommendations from mock shoes
    expect(result.current.recommendations.length).toBeGreaterThan(0);
  });

  it('should perform manual analysis with selected style', async () => {
    const { result } = renderHook(() => useOutfitAnalysis());

    await act(async () => {
      await result.current.manualAnalyze('Streetwear');
    });

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(result.current.analysis).toBeTruthy();
    expect(result.current.analysis?.style_tags).toContain('streetwear');
    expect(result.current.analysis?.detected_shoe).toBe('Manual Selection');
    expect(result.current.analysis?.feedback).toContain('Streetwear');
  });

  it('should set isAnalyzing to false after analyzing completes', async () => {
    const { result } = renderHook(() => useOutfitAnalysis());

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.analyzeImage(mockFile);
    });

    // After analysis completes, isAnalyzing should be false
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('should provide feedback in analysis result', async () => {
    const { result } = renderHook(() => useOutfitAnalysis());

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.analyzeImage(mockFile);
    });

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(result.current.analysis?.feedback).toBeTruthy();
    expect(typeof result.current.analysis?.feedback).toBe('string');
  });

  it('should have correct OutfitAnalysis interface structure', async () => {
    const { result } = renderHook(() => useOutfitAnalysis());

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.analyzeImage(mockFile);
    });

    await waitFor(() => {
      expect(result.current.analysis).not.toBeNull();
    });

    const analysis = result.current.analysis!;
    expect(typeof analysis.rating).toBe('number');
    expect(Array.isArray(analysis.style_tags)).toBe(true);
    expect(Array.isArray(analysis.dominant_colors)).toBe(true);
    expect(typeof analysis.detected_shoe).toBe('string');
    expect(typeof analysis.feedback).toBe('string');
  });
});

describe('useOutfitAnalysis - Production Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules to test production mode
    vi.resetModules();
  });

  it('should surface remaining usage after successful analysis', async () => {
    vi.doMock('../../lib/config', () => ({ DEMO_MODE: false }));
    vi.doMock('../../lib/mockData', () => ({ DEMO_MODE: false, MOCK_SHOES: [] }));

    const usageSelect = vi.fn(() => ({
      maybeSingle: vi.fn(async () => ({
        data: {
          monthly_limit: 3,
          used_this_month: 1,
          period_start: new Date().toISOString(),
        },
        error: null,
      })),
    }));

    const mockAnalysis = {
      rating: 7,
      style_tags: ['streetwear'],
      dominant_colors: ['black'],
      detected_shoe: 'Test shoe',
      feedback: 'Looks good',
    };

    vi.doMock('../../lib/supabaseClient', () => ({
      supabase: {
        functions: {
          invoke: vi.fn(async () => ({
            data: { analysis: mockAnalysis, usage: { monthly_limit: 3, remaining: 1 } },
            error: null,
          })),
        },
        rpc: vi.fn(async () => ({ data: [], error: null })),
        from: vi.fn((table: string) => {
          if (table === 'ai_usage_limits') {
            return { select: usageSelect } as any;
          }

          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      },
    }));

    const { useOutfitAnalysis: prodUseOutfitAnalysis } = await import('../useOutfitAnalysis');
    const { result } = renderHook(() => prodUseOutfitAnalysis());

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.analyzeImage(mockFile);
    });

    await waitFor(() => {
      expect(result.current.analysis?.rating).toBe(7);
      expect(result.current.usage?.remaining).toBe(1);
    });
  });

  it('should surface quota errors when limit is reached', async () => {
    vi.doMock('../../lib/config', () => ({ DEMO_MODE: false }));
    vi.doMock('../../lib/mockData', () => ({ DEMO_MODE: false, MOCK_SHOES: [] }));

    const usageSelect = vi.fn(() => ({
      maybeSingle: vi.fn(async () => ({
        data: {
          monthly_limit: 1,
          used_this_month: 1,
          period_start: new Date().toISOString(),
        },
        error: null,
      })),
    }));

    vi.doMock('../../lib/supabaseClient', () => ({
      supabase: {
        functions: {
          invoke: vi.fn(async () => ({
            data: { error: 'Monthly AI analysis limit reached', usage: { monthly_limit: 1, remaining: 0 } },
            error: { message: 'Monthly AI analysis limit reached' },
          })),
        },
        rpc: vi.fn(async () => ({ data: [], error: null })),
        from: vi.fn((table: string) => {
          if (table === 'ai_usage_limits') {
            return { select: usageSelect } as any;
          }

          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      },
    }));

    const { useOutfitAnalysis: prodUseOutfitAnalysis } = await import('../useOutfitAnalysis');
    const { result } = renderHook(() => prodUseOutfitAnalysis());

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.analyzeImage(mockFile);
    });

    await waitFor(() => {
      expect(result.current.error).toContain('Monthly AI analysis limit reached');
      expect(result.current.usage?.remaining).toBe(0);
      expect(result.current.analysis).toBeNull();
    });
  });
});
