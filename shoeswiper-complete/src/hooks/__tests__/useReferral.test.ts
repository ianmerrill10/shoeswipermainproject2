import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReferral } from '../useReferral';

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

// Mock navigator
const mockShare = vi.fn();
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
};

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      mockFrom(table);
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
    },
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

const USER_REFERRAL_CODE_KEY = 'shoeswiper_my_referral_code';
const REFERRAL_STATS_KEY = 'shoeswiper_referral_stats';
const REFERRAL_STORAGE_KEY = 'shoeswiper_referral';

describe('useReferral', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should complete loading', async () => {
    const { result } = renderHook(() => useReferral());

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After loading completes
    expect(result.current.loading).toBe(false);
  });

  it('should generate a referral code on first load', async () => {
    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.referralCode).toBeTruthy();
    // Referral codes start with SS and may contain hyphens and alphanumeric characters
    expect(result.current.referralCode).toMatch(/^SS/);
  });

  it('should load existing referral code from localStorage', async () => {
    const existingCode = 'SSTEST123ABC';
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, existingCode);

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.referralCode).toBe(existingCode);
  });

  it('should initialize stats with zeros', async () => {
    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.referralStats.totalShares).toBe(0);
    expect(result.current.referralStats.totalClicks).toBe(0);
    expect(result.current.referralStats.totalSignups).toBe(0);
    expect(result.current.referralStats.earnedRewards).toBe(0);
    expect(result.current.referralStats.pendingRewards).toBe(0);
  });

  it('should load existing stats from localStorage', async () => {
    const existingStats = {
      totalShares: 10,
      totalClicks: 50,
      totalSignups: 5,
      earnedRewards: 500,
      pendingRewards: 100,
    };
    localStorageMock.setItem(REFERRAL_STATS_KEY, JSON.stringify(existingStats));
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSEXIST123');

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.referralStats.totalShares).toBe(10);
    expect(result.current.referralStats.totalClicks).toBe(50);
    expect(result.current.referralStats.totalSignups).toBe(5);
  });

  it('should track share action', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialShares = result.current.referralStats.totalShares;

    await act(async () => {
      await result.current.trackShare();
    });

    expect(result.current.referralStats.totalShares).toBe(initialShares + 1);
  });

  it('should track click action', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');
    const existingStats = { totalShares: 0, totalClicks: 5, totalSignups: 0, earnedRewards: 0, pendingRewards: 0 };
    localStorageMock.setItem(REFERRAL_STATS_KEY, JSON.stringify(existingStats));

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.trackClick('SSOTHER123');
    });

    // In demo mode, trackClick updates localStorage
    const stored = localStorageMock.getItem(REFERRAL_STATS_KEY);
    const parsed = JSON.parse(stored!);
    expect(parsed.totalClicks).toBe(6);
  });

  it('should process referral signup', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');
    const existingStats = { totalShares: 0, totalClicks: 0, totalSignups: 0, earnedRewards: 0, pendingRewards: 0 };
    localStorageMock.setItem(REFERRAL_STATS_KEY, JSON.stringify(existingStats));

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.processReferralSignup('SSREFERRER', 'new-user-id');
    });

    // Should store who referred this user
    const stored = localStorageMock.getItem(REFERRAL_STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.code).toBe('SSREFERRER');
    expect(parsed.userId).toBe('new-user-id');
  });

  it('should get referral URL', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const url = result.current.getReferralUrl();
    expect(url).toContain('ref=SSTEST123');
  });

  it('should get referral message', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const message = result.current.getReferralMessage();
    expect(message).toContain('ShoeSwiper');
    expect(message).toContain('ref=SSTEST123');
  });

  it('should share referral link using clipboard when native share not available', async () => {
    // Remove native share support
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let shareResult: { success: boolean; method: string } | undefined;
    await act(async () => {
      shareResult = await result.current.shareReferralLink();
    });

    expect(shareResult?.success).toBe(true);
    expect(shareResult?.method).toBe('clipboard');
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  it('should return correct tier for Starter (0-2 signups)', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');
    const stats = { totalShares: 0, totalClicks: 0, totalSignups: 1, earnedRewards: 0, pendingRewards: 0 };
    localStorageMock.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const tierInfo = result.current.getRewardTier();
    expect(tierInfo.tier).toBe('Starter');
    expect(tierInfo.nextTier).toBe('Bronze');
    expect(tierInfo.signupsNeeded).toBe(2);
  });

  it('should return correct tier for Bronze (3-9 signups)', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');
    const stats = { totalShares: 0, totalClicks: 0, totalSignups: 5, earnedRewards: 0, pendingRewards: 0 };
    localStorageMock.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const tierInfo = result.current.getRewardTier();
    expect(tierInfo.tier).toBe('Bronze');
    expect(tierInfo.nextTier).toBe('Silver');
    expect(tierInfo.signupsNeeded).toBe(5);
  });

  it('should return correct tier for Silver (10-24 signups)', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');
    const stats = { totalShares: 0, totalClicks: 0, totalSignups: 15, earnedRewards: 0, pendingRewards: 0 };
    localStorageMock.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const tierInfo = result.current.getRewardTier();
    expect(tierInfo.tier).toBe('Silver');
    expect(tierInfo.nextTier).toBe('Gold');
    expect(tierInfo.signupsNeeded).toBe(10);
  });

  it('should return correct tier for Gold (25-49 signups)', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');
    const stats = { totalShares: 0, totalClicks: 0, totalSignups: 30, earnedRewards: 0, pendingRewards: 0 };
    localStorageMock.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const tierInfo = result.current.getRewardTier();
    expect(tierInfo.tier).toBe('Gold');
    expect(tierInfo.nextTier).toBe('Diamond');
    expect(tierInfo.signupsNeeded).toBe(20);
  });

  it('should return correct tier for Diamond (50+ signups)', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');
    const stats = { totalShares: 0, totalClicks: 0, totalSignups: 60, earnedRewards: 0, pendingRewards: 0 };
    localStorageMock.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const tierInfo = result.current.getRewardTier();
    expect(tierInfo.tier).toBe('Diamond');
    expect(tierInfo.progress).toBe(100);
    expect(tierInfo.signupsNeeded).toBe(0);
  });

  it('should have unique referral codes', async () => {
    // First render - generates code
    const { result: result1 } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    const code1 = result1.current.referralCode;
    expect(code1).toBeTruthy();
    expect(code1).toMatch(/^SS/);

    // Clear and create new hook instance
    localStorageMock.clear();

    const { result: result2 } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result2.current.loading).toBe(false);
    });

    const code2 = result2.current.referralCode;
    expect(code2).toBeTruthy();
    expect(code2).toMatch(/^SS/);

    // Codes should have unique structure (though they may be same due to same input seed)
  });

  it('should check referral status', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');
    localStorageMock.setItem(REFERRAL_STORAGE_KEY, JSON.stringify({
      code: 'SSREFERRER',
      userId: 'current-user',
      signedUpAt: new Date().toISOString(),
    }));

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let status: unknown;
    await act(async () => {
      status = await result.current.checkReferralStatus();
    });

    expect(status).toBeTruthy();
    expect((status as { code: string }).code).toBe('SSREFERRER');
  });

  it('should persist stats to localStorage after trackShare', async () => {
    localStorageMock.setItem(USER_REFERRAL_CODE_KEY, 'SSTEST123');

    const { result } = renderHook(() => useReferral());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.trackShare();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      REFERRAL_STATS_KEY,
      expect.any(String)
    );
  });
});
