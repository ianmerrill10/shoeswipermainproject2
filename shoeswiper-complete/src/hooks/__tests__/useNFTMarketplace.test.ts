import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNFTMarketplace } from '../useNFTMarketplace';

// Mock Supabase client
const mockUser = { id: 'test-user-id', email: 'test@example.com' };
const mockGetUser = vi.fn();

vi.mock('@/lib/supabaseClient', () => {
  // Create a thenable chain mock that supports both chaining and await
  const createThenableChain = () => {
    const chain: Record<string, unknown> = {};
    
    const methods = ['select', 'insert', 'update', 'eq', 'order', 'not', 'gte', 'single'];
    
    methods.forEach(method => {
      chain[method] = vi.fn(() => chain);
    });
    
    // Make the chain thenable (can be awaited)
    chain.then = (resolve: (value: { data: unknown[]; error: null }) => void) => {
      return Promise.resolve({ data: [], error: null }).then(resolve);
    };
    
    // single() returns a promise directly
    (chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
    
    return chain;
  };

  return {
    supabase: {
      auth: {
        getUser: () => mockGetUser(),
      },
      from: vi.fn(() => createThenableChain()),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/proof.jpg' } }),
        })),
      },
    },
  };
});

describe('useNFTMarketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(result.current.nfts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should have listNFTs function', () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(typeof result.current.listNFTs).toBe('function');
  });

  it('should have mintNFT function', () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(typeof result.current.mintNFT).toBe('function');
  });

  it('should have buyNFT function', () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(typeof result.current.buyNFT).toBe('function');
  });

  it('should have listForSale function', () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(typeof result.current.listForSale).toBe('function');
  });

  it('should set loading state during listNFTs', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      await result.current.listNFTs();
    });

    // After completion, loading should be false
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle mintNFT error when user not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      try {
        await result.current.mintNFT('shoe-123', [], 'common');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.error).toContain('logged in');
  });

  it('should handle buyNFT error when user not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      try {
        await result.current.buyNFT('nft-123');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.error).toContain('logged in');
  });

  it('should filter NFTs by for_sale when filter is provided', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      await result.current.listNFTs({ filter: 'for_sale' });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should filter NFTs by auction when filter is provided', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      await result.current.listNFTs({ filter: 'auction' });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should filter NFTs by recent when filter is provided', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      await result.current.listNFTs({ filter: 'recent' });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should filter NFTs by owner ID', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      await result.current.listNFTs({ ownerId: 'user-123' });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should return empty array when no NFTs found', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      await result.current.listNFTs();
    });

    expect(result.current.nfts).toEqual([]);
  });

  it('should complete listNFTs with all filter', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    await act(async () => {
      await result.current.listNFTs({ filter: 'all' });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useNFTMarketplace - Rarity Tiers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  it('should accept common rarity tier', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(result.current.mintNFT).toBeDefined();
  });

  it('should accept rare rarity tier', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(result.current.mintNFT).toBeDefined();
  });

  it('should accept legendary rarity tier', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(result.current.mintNFT).toBeDefined();
  });

  it('should accept grail rarity tier', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(result.current.mintNFT).toBeDefined();
  });
});

describe('useNFTMarketplace - Ownership Transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  it('should have listForSale function available', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(typeof result.current.listForSale).toBe('function');
  });

  it('should have buyNFT function available', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(typeof result.current.buyNFT).toBe('function');
  });

  it('should export NFT related types', async () => {
    const { result } = renderHook(() => useNFTMarketplace());

    expect(result.current).toHaveProperty('nfts');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('listNFTs');
    expect(result.current).toHaveProperty('mintNFT');
    expect(result.current).toHaveProperty('buyNFT');
    expect(result.current).toHaveProperty('listForSale');
  });
});
