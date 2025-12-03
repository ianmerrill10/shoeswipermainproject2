import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';

// Mock config module
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

// Mock Supabase client
const mockFrom = vi.fn();
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn();
const mockRpc = vi.fn().mockResolvedValue({ error: null });

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table);
      return {
        insert: (...args: unknown[]) => mockInsert(...args),
        select: (...args: unknown[]) => {
          mockSelect(...args);
          return {
            count: vi.fn().mockReturnThis(),
            head: true,
            gte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], count: 0 }),
          };
        },
      };
    },
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

// Mock console.warn for demo mode logging
const originalWarn = console.warn;
const mockWarn = vi.fn();

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = mockWarn;
  });

  afterEach(() => {
    console.warn = originalWarn;
    vi.clearAllMocks();
  });

  it('should have trackEvent function', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(typeof result.current.trackEvent).toBe('function');
  });

  it('should have trackShoeView function', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(typeof result.current.trackShoeView).toBe('function');
  });

  it('should have trackShoeClick function', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(typeof result.current.trackShoeClick).toBe('function');
  });

  it('should have trackMusicClick function', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(typeof result.current.trackMusicClick).toBe('function');
  });

  it('should have trackPanelOpen function', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(typeof result.current.trackPanelOpen).toBe('function');
  });

  it('should have trackShare function', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(typeof result.current.trackShare).toBe('function');
  });

  it('should have trackFavorite function', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(typeof result.current.trackFavorite).toBe('function');
  });

  it('should have getAnalyticsSummary function', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(typeof result.current.getAnalyticsSummary).toBe('function');
  });

  it('should track shoe view event', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackShoeView('shoe-123');
    });

    // In demo mode, this logs to console
    expect(mockWarn).toHaveBeenCalled();
    expect(mockWarn.mock.calls.some(call => 
      call[0]?.includes?.('[Analytics]') && call[0]?.includes?.('shoe_view')
    )).toBe(true);
  });

  it('should track shoe click event', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackShoeClick('shoe-456');
    });

    expect(mockWarn).toHaveBeenCalled();
    expect(mockWarn.mock.calls.some(call => 
      call[0]?.includes?.('[Analytics]') && call[0]?.includes?.('shoe_click')
    )).toBe(true);
  });

  it('should track music click event with platform', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackMusicClick('spotify', 'shoe-123', 'SICKO MODE', 'Travis Scott');
    });

    expect(mockWarn).toHaveBeenCalled();
    expect(mockWarn.mock.calls.some(call => 
      call[0]?.includes?.('[Analytics]') && call[0]?.includes?.('music_click')
    )).toBe(true);
  });

  it('should track panel open event', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackPanelOpen('shoe', 'shoe-789');
    });

    expect(mockWarn).toHaveBeenCalled();
    expect(mockWarn.mock.calls.some(call => 
      call[0]?.includes?.('[Analytics]') && call[0]?.includes?.('panel_open')
    )).toBe(true);
  });

  it('should track share event', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackShare('shoe-123', 'native');
    });

    expect(mockWarn).toHaveBeenCalled();
    expect(mockWarn.mock.calls.some(call => 
      call[0]?.includes?.('[Analytics]') && call[0]?.includes?.('share')
    )).toBe(true);
  });

  it('should track favorite event', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackFavorite('shoe-123', 'add');
    });

    expect(mockWarn).toHaveBeenCalled();
    expect(mockWarn.mock.calls.some(call => 
      call[0]?.includes?.('[Analytics]') && call[0]?.includes?.('favorite')
    )).toBe(true);
  });

  it('should track favorite removal', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackFavorite('shoe-123', 'remove');
    });

    expect(mockWarn).toHaveBeenCalled();
  });

  it('should get analytics summary in demo mode', async () => {
    const { result } = renderHook(() => useAnalytics());

    // First track some events
    await act(async () => {
      result.current.trackShoeView('shoe-1');
      result.current.trackShoeView('shoe-2');
      result.current.trackShoeClick('shoe-1');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    expect(summary).toBeDefined();
    expect(typeof (summary as Record<string, unknown>).totalEvents).toBe('number');
    expect(typeof (summary as Record<string, unknown>).shoeViews).toBe('number');
    expect(typeof (summary as Record<string, unknown>).shoeClicks).toBe('number');
  });

  it('should accumulate shoe views in demo mode', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackShoeView('shoe-1');
      result.current.trackShoeView('shoe-1');
      result.current.trackShoeView('shoe-2');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    const typedSummary = summary as { shoeViews: number; totalEvents: number };
    expect(typedSummary.shoeViews).toBeGreaterThanOrEqual(3);
  });

  it('should accumulate shoe clicks in demo mode', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackShoeClick('shoe-1');
      result.current.trackShoeClick('shoe-2');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    const typedSummary = summary as { shoeClicks: number };
    expect(typedSummary.shoeClicks).toBeGreaterThanOrEqual(2);
  });

  it('should track music clicks by platform', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackMusicClick('spotify', 'shoe-1', 'Song1', 'Artist1');
      result.current.trackMusicClick('apple_music', 'shoe-2', 'Song2', 'Artist2');
      result.current.trackMusicClick('spotify', 'shoe-3', 'Song3', 'Artist3');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    const typedSummary = summary as { musicClicks: { spotify: number; apple_music: number; amazon_music: number } };
    expect(typedSummary.musicClicks.spotify).toBeGreaterThanOrEqual(2);
    expect(typedSummary.musicClicks.apple_music).toBeGreaterThanOrEqual(1);
  });

  it('should track panel opens by type', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackPanelOpen('shoe', 'shoe-1');
      result.current.trackPanelOpen('music', 'shoe-2');
      result.current.trackPanelOpen('shoe', 'shoe-3');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    const typedSummary = summary as { panelOpens: { shoe: number; music: number } };
    expect(typedSummary.panelOpens.shoe).toBeGreaterThanOrEqual(2);
    expect(typedSummary.panelOpens.music).toBeGreaterThanOrEqual(1);
  });

  it('should count shares in summary', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackShare('shoe-1', 'native');
      result.current.trackShare('shoe-2', 'clipboard');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    const typedSummary = summary as { shares: number };
    expect(typedSummary.shares).toBeGreaterThanOrEqual(2);
  });

  it('should count favorites in summary', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackFavorite('shoe-1', 'add');
      result.current.trackFavorite('shoe-2', 'add');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    const typedSummary = summary as { favorites: number };
    expect(typedSummary.favorites).toBeGreaterThanOrEqual(2);
  });

  it('should return recent events in summary', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackShoeView('shoe-1');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    const typedSummary = summary as { recentEvents: Array<{ event: string }> };
    expect(Array.isArray(typedSummary.recentEvents)).toBe(true);
  });

  it('should return top shoes in summary', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackShoeClick('shoe-1');
      result.current.trackShoeClick('shoe-1');
      result.current.trackShoeClick('shoe-2');
    });

    let summary: unknown;
    await act(async () => {
      summary = await result.current.getAnalyticsSummary();
    });

    const typedSummary = summary as { topShoes: Array<[string, number]> };
    expect(Array.isArray(typedSummary.topShoes)).toBe(true);
  });

  it('should track generic event with custom data', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackEvent('shoe_view', { shoe_id: 'custom-shoe', custom_field: 'value' });
    });

    expect(mockWarn).toHaveBeenCalled();
  });
});

describe('useAnalytics - Event Types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = mockWarn;
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  it('should support swipe event type', async () => {
    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      result.current.trackEvent('swipe', { direction: 'right', shoe_id: 'shoe-1' });
    });

    expect(mockWarn).toHaveBeenCalled();
  });
});
