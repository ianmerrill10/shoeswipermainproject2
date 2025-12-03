import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePriceAlerts } from '../usePriceAlerts';

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

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

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
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    },
  },
}));

const PRICE_ALERTS_KEY = 'shoeswiper_price_alerts';
const PRICE_NOTIFICATIONS_KEY = 'shoeswiper_price_notifications';

describe('usePriceAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty alerts', async () => {
    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.alerts).toEqual([]);
    expect(result.current.notifications).toEqual([]);
  });

  it('should load alerts from localStorage in demo mode', async () => {
    const mockAlerts = [
      {
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'https://example.com/af1.jpg',
        amazonUrl: 'https://amazon.com/dp/B123',
        targetPrice: 90,
        originalPrice: 110,
        currentPrice: 110,
        createdAt: new Date().toISOString(),
        triggered: false,
      },
    ];
    localStorageMock.setItem(PRICE_ALERTS_KEY, JSON.stringify(mockAlerts));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].shoeId).toBe('shoe-1');
  });

  it('should add a new price alert', async () => {
    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const shoe = {
      id: 'shoe-123',
      name: 'Dunk Low',
      brand: 'Nike',
      image_url: 'https://example.com/dunk.jpg',
      amazon_url: 'https://amazon.com/dp/B456',
      price: 100,
    };

    let addResult: boolean = false;
    await act(async () => {
      addResult = await result.current.addAlert(shoe, 80);
    });

    expect(addResult).toBe(true);
    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].targetPrice).toBe(80);
    expect(result.current.alerts[0].shoeName).toBe('Dunk Low');
  });

  it('should remove a price alert', async () => {
    const mockAlerts = [
      {
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'https://example.com/af1.jpg',
        amazonUrl: 'https://amazon.com/dp/B123',
        targetPrice: 90,
        createdAt: new Date().toISOString(),
        triggered: false,
      },
    ];
    localStorageMock.setItem(PRICE_ALERTS_KEY, JSON.stringify(mockAlerts));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.alerts).toHaveLength(1);

    let removeResult: boolean = false;
    await act(async () => {
      removeResult = await result.current.removeAlert('shoe-1');
    });

    expect(removeResult).toBe(true);
    expect(result.current.alerts).toHaveLength(0);
  });

  it('should check if alert exists for a shoe', async () => {
    const mockAlerts = [
      {
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'https://example.com/af1.jpg',
        amazonUrl: 'https://amazon.com/dp/B123',
        targetPrice: 90,
        createdAt: new Date().toISOString(),
        triggered: false,
      },
    ];
    localStorageMock.setItem(PRICE_ALERTS_KEY, JSON.stringify(mockAlerts));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAlert('shoe-1')).toBe(true);
    expect(result.current.hasAlert('shoe-999')).toBe(false);
  });

  it('should get specific alert for a shoe', async () => {
    const mockAlerts = [
      {
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'https://example.com/af1.jpg',
        amazonUrl: 'https://amazon.com/dp/B123',
        targetPrice: 90,
        createdAt: new Date().toISOString(),
        triggered: false,
      },
    ];
    localStorageMock.setItem(PRICE_ALERTS_KEY, JSON.stringify(mockAlerts));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const alert = result.current.getAlert('shoe-1');
    expect(alert).toBeDefined();
    expect(alert?.targetPrice).toBe(90);

    const nonExistent = result.current.getAlert('shoe-999');
    expect(nonExistent).toBeUndefined();
  });

  it('should detect price drop and trigger notification', async () => {
    const mockAlerts = [
      {
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'https://example.com/af1.jpg',
        amazonUrl: 'https://amazon.com/dp/B123',
        targetPrice: 90,
        originalPrice: 110,
        currentPrice: 110,
        createdAt: new Date().toISOString(),
        triggered: false,
      },
    ];
    localStorageMock.setItem(PRICE_ALERTS_KEY, JSON.stringify(mockAlerts));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate price drop below target
    await act(async () => {
      await result.current.simulatePriceDrop('shoe-1', 85);
    });

    // Alert should be marked as triggered
    expect(result.current.alerts[0].triggered).toBe(true);
    expect(result.current.alerts[0].currentPrice).toBe(85);

    // Notification should be created
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].newPrice).toBe(85);
  });

  it('should not trigger for price above target', async () => {
    const mockAlerts = [
      {
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'https://example.com/af1.jpg',
        amazonUrl: 'https://amazon.com/dp/B123',
        targetPrice: 90,
        originalPrice: 110,
        currentPrice: 110,
        createdAt: new Date().toISOString(),
        triggered: false,
      },
    ];
    localStorageMock.setItem(PRICE_ALERTS_KEY, JSON.stringify(mockAlerts));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate price that's still above target
    await act(async () => {
      await result.current.simulatePriceDrop('shoe-1', 95);
    });

    // Alert should NOT be triggered
    expect(result.current.alerts[0].triggered).toBe(false);
    expect(result.current.notifications).toHaveLength(0);
  });

  it('should mark notification as read', async () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'https://example.com/af1.jpg',
        amazonUrl: 'https://amazon.com/dp/B123',
        oldPrice: 110,
        newPrice: 85,
        savedAmount: 25,
        percentOff: 23,
        createdAt: new Date().toISOString(),
        read: false,
      },
    ];
    localStorageMock.setItem(PRICE_NOTIFICATIONS_KEY, JSON.stringify(mockNotifications));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(1);

    await act(async () => {
      await result.current.markNotificationRead('notif-1');
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should clear all notifications', async () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'https://example.com/af1.jpg',
        amazonUrl: 'https://amazon.com/dp/B123',
        oldPrice: 110,
        newPrice: 85,
        savedAmount: 25,
        percentOff: 23,
        createdAt: new Date().toISOString(),
        read: false,
      },
    ];
    localStorageMock.setItem(PRICE_NOTIFICATIONS_KEY, JSON.stringify(mockNotifications));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toHaveLength(1);

    await act(async () => {
      await result.current.clearNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should calculate correct unread count', async () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        shoeId: 'shoe-1',
        shoeName: 'Air Force 1',
        shoeBrand: 'Nike',
        shoeImage: 'test.jpg',
        amazonUrl: 'https://amazon.com',
        oldPrice: 110,
        newPrice: 85,
        savedAmount: 25,
        percentOff: 23,
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: 'notif-2',
        shoeId: 'shoe-2',
        shoeName: 'Dunk Low',
        shoeBrand: 'Nike',
        shoeImage: 'test2.jpg',
        amazonUrl: 'https://amazon.com',
        oldPrice: 100,
        newPrice: 75,
        savedAmount: 25,
        percentOff: 25,
        createdAt: new Date().toISOString(),
        read: true,
      },
    ];
    localStorageMock.setItem(PRICE_NOTIFICATIONS_KEY, JSON.stringify(mockNotifications));

    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(1);
  });

  it('should persist alerts to localStorage', async () => {
    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const shoe = {
      id: 'shoe-new',
      name: 'New Shoe',
      brand: 'Nike',
      image_url: 'https://example.com/new.jpg',
      amazon_url: 'https://amazon.com/dp/BNEW',
      price: 120,
    };

    await act(async () => {
      await result.current.addAlert(shoe, 100);
    });

    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      PRICE_ALERTS_KEY,
      expect.any(String)
    );

    const stored = localStorageMock.getItem(PRICE_ALERTS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].shoeId).toBe('shoe-new');
  });

  it('should have refreshAlerts function', async () => {
    const { result } = renderHook(() => usePriceAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refreshAlerts).toBe('function');
  });
});
