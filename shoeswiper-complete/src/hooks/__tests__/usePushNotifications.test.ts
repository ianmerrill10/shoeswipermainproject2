import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePushNotifications } from '../usePushNotifications';

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

// Mock ServiceWorker
const mockServiceWorkerRegister = vi.fn();
const mockPushSubscription = {
  endpoint: 'https://example.com/push',
  unsubscribe: vi.fn().mockResolvedValue(true),
};
const mockServiceWorkerRegistration = {
  scope: '/',
  active: {
    postMessage: vi.fn(),
  },
  pushManager: {
    subscribe: vi.fn().mockResolvedValue(mockPushSubscription),
    getSubscription: vi.fn().mockResolvedValue(null),
  },
};
const mockServiceWorkerReady = Promise.resolve(mockServiceWorkerRegistration);

// Must set up mocks before any tests run
const mockNotificationConstructor = vi.fn();
let mockNotificationPermission = 'default';

// Create proper Notification mock class
class MockNotification {
  constructor(...args: unknown[]) {
    mockNotificationConstructor(...args);
  }
  static get permission(): NotificationPermission {
    return mockNotificationPermission as NotificationPermission;
  }
  static requestPermission = vi.fn();
}

Object.defineProperty(window, 'Notification', {
  value: MockNotification,
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: mockServiceWorkerRegister,
    ready: mockServiceWorkerReady,
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'PushManager', {
  value: class MockPushManager {},
  writable: true,
  configurable: true,
});

const PUSH_SETTINGS_KEY = 'shoeswiper_push_settings';

// Mock console.warn for demo mode logging
const originalWarn = console.warn;
const mockWarn = vi.fn();

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    console.warn = mockWarn;
    mockNotificationPermission = 'default';
    MockNotification.requestPermission.mockResolvedValue('default');
    mockServiceWorkerRegister.mockResolvedValue(mockServiceWorkerRegistration);
  });

  afterEach(() => {
    console.warn = originalWarn;
    vi.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isSupported).toBe(true);
    expect(result.current.permission).toBe('default');
    expect(result.current.settings.enabled).toBe(false);
    expect(result.current.settings.priceDrops).toBe(true);
    expect(result.current.settings.newReleases).toBe(true);
    expect(result.current.settings.restocks).toBe(true);
    expect(result.current.settings.promotions).toBe(false);
  });

  it('should load settings from localStorage', async () => {
    const savedSettings = {
      enabled: true,
      priceDrops: true,
      newReleases: false,
      restocks: true,
      promotions: true,
      subscribedAt: '2024-01-01T00:00:00Z',
    };
    localStorageMock.setItem(PUSH_SETTINGS_KEY, JSON.stringify(savedSettings));

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings.enabled).toBe(true);
    expect(result.current.settings.newReleases).toBe(false);
    expect(result.current.settings.promotions).toBe(true);
  });

  describe('isEnabled', () => {
    it('should return false when permission not granted', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isEnabled).toBe(false);
    });

    it('should return false when settings disabled', async () => {
      mockNotificationPermission = 'granted';
      localStorageMock.setItem(PUSH_SETTINGS_KEY, JSON.stringify({
        enabled: false,
        priceDrops: true,
        newReleases: true,
        restocks: true,
        promotions: false,
      }));

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('updateSettings', () => {
    it('should update notification settings', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateSettings({
          priceDrops: false,
          promotions: true,
        });
      });

      expect(result.current.settings.priceDrops).toBe(false);
      expect(result.current.settings.promotions).toBe(true);
    });

    it('should persist updated settings to localStorage', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateSettings({ newReleases: false });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        PUSH_SETTINGS_KEY,
        expect.any(String)
      );
    });
  });

  describe('disablePush', () => {
    it('should disable push notifications', async () => {
      localStorageMock.setItem(PUSH_SETTINGS_KEY, JSON.stringify({
        enabled: true,
        priceDrops: true,
        newReleases: true,
        restocks: true,
        promotions: false,
      }));

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.disablePush();
      });

      expect(result.current.settings.enabled).toBe(false);
    });
  });

  describe('notification triggers', () => {
    beforeEach(() => {
      mockNotificationPermission = 'granted';
      localStorageMock.setItem(PUSH_SETTINGS_KEY, JSON.stringify({
        enabled: true,
        priceDrops: true,
        newReleases: true,
        restocks: true,
        promotions: false,
      }));
    });

    describe('notifyPriceDrop', () => {
      it('should not send when priceDrops disabled', async () => {
        localStorageMock.setItem(PUSH_SETTINGS_KEY, JSON.stringify({
          enabled: true,
          priceDrops: false,
          newReleases: true,
          restocks: true,
          promotions: false,
        }));

        const { result } = renderHook(() => usePushNotifications());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        let notifyResult;
        await act(async () => {
          notifyResult = await result.current.notifyPriceDrop(
            'Air Force 1',
            120,
            90,
            'https://amazon.com',
            'shoe-123'
          );
        });

        expect(notifyResult).toBe(false);
      });

      it('should not send when notifications disabled', async () => {
        localStorageMock.setItem(PUSH_SETTINGS_KEY, JSON.stringify({
          enabled: false,
          priceDrops: true,
          newReleases: true,
          restocks: true,
          promotions: false,
        }));

        const { result } = renderHook(() => usePushNotifications());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        let notifyResult;
        await act(async () => {
          notifyResult = await result.current.notifyPriceDrop(
            'Air Force 1',
            120,
            90,
            'https://amazon.com',
            'shoe-123'
          );
        });

        expect(notifyResult).toBe(false);
      });
    });

    describe('notifyNewRelease', () => {
      it('should not send when newReleases disabled', async () => {
        localStorageMock.setItem(PUSH_SETTINGS_KEY, JSON.stringify({
          enabled: true,
          priceDrops: true,
          newReleases: false,
          restocks: true,
          promotions: false,
        }));

        const { result } = renderHook(() => usePushNotifications());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        let notifyResult;
        await act(async () => {
          notifyResult = await result.current.notifyNewRelease(
            'Air Jordan 1',
            'Nike',
            'shoe-456'
          );
        });

        expect(notifyResult).toBe(false);
      });
    });

    describe('notifyRestock', () => {
      it('should not send when restocks disabled', async () => {
        localStorageMock.setItem(PUSH_SETTINGS_KEY, JSON.stringify({
          enabled: true,
          priceDrops: true,
          newReleases: true,
          restocks: false,
          promotions: false,
        }));

        const { result } = renderHook(() => usePushNotifications());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        let notifyResult;
        await act(async () => {
          notifyResult = await result.current.notifyRestock(
            'Yeezy Boost 350',
            'https://amazon.com',
            'shoe-789'
          );
        });

        expect(notifyResult).toBe(false);
      });
    });

    describe('showLocalNotification', () => {
      it('should return false when permission not granted', async () => {
        mockNotificationPermission = 'denied';

        const { result } = renderHook(() => usePushNotifications());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        let notifyResult;
        await act(async () => {
          notifyResult = await result.current.showLocalNotification(
            'Test',
            'Test body'
          );
        });

        expect(notifyResult).toBe(false);
      });
    });
  });

  describe('hook interface', () => {
    it('should expose all required methods', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.requestPermission).toBe('function');
      expect(typeof result.current.disablePush).toBe('function');
      expect(typeof result.current.updateSettings).toBe('function');
      expect(typeof result.current.registerServiceWorker).toBe('function');
      expect(typeof result.current.showLocalNotification).toBe('function');
      expect(typeof result.current.notifyPriceDrop).toBe('function');
      expect(typeof result.current.notifyNewRelease).toBe('function');
      expect(typeof result.current.notifyRestock).toBe('function');
    });

    it('should expose all required state', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty('isSupported');
      expect(result.current).toHaveProperty('permission');
      expect(result.current).toHaveProperty('settings');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('isEnabled');
    });
  });
});
