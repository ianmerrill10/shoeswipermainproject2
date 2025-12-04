import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmailCapture } from '../useEmailCapture';

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

const EMAIL_CAPTURE_KEY = 'shoeswiper_email_capture';
const EMAIL_LIST_KEY = 'shoeswiper_email_list';

// Mock console.warn for demo mode logging
const originalWarn = console.warn;
const mockWarn = vi.fn();

describe('useEmailCapture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    console.warn = mockWarn;
  });

  afterEach(() => {
    console.warn = originalWarn;
    vi.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useEmailCapture());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.email).toBeNull();
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.preferences.priceAlerts).toBe(true);
    expect(result.current.preferences.newReleases).toBe(true);
    expect(result.current.preferences.weeklyDigest).toBe(false);
    expect(result.current.preferences.promotions).toBe(false);
  });

  it('should load saved email from localStorage', async () => {
    const savedData = {
      email: 'saved@example.com',
      preferences: {
        priceAlerts: true,
        newReleases: false,
        weeklyDigest: true,
        promotions: false,
      },
    };
    localStorageMock.setItem(EMAIL_CAPTURE_KEY, JSON.stringify(savedData));

    const { result } = renderHook(() => useEmailCapture());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.email).toBe('saved@example.com');
    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.preferences.newReleases).toBe(false);
    expect(result.current.preferences.weeklyDigest).toBe(true);
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isValidEmail('test@example.com')).toBe(true);
      expect(result.current.isValidEmail('user.name@domain.org')).toBe(true);
      expect(result.current.isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isValidEmail('invalid')).toBe(false);
      expect(result.current.isValidEmail('no@domain')).toBe(false);
      expect(result.current.isValidEmail('@nodomain.com')).toBe(false);
      expect(result.current.isValidEmail('spaces in@email.com')).toBe(false);
    });
  });

  describe('captureEmail', () => {
    it('should capture email for price alert', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let captureResult;
      await act(async () => {
        captureResult = await result.current.captureEmail(
          'test@example.com',
          'price_alert',
          { id: 'shoe-1', name: 'Air Force 1' },
          { priceAlerts: true }
        );
      });

      expect(captureResult?.success).toBe(true);
      expect(result.current.email).toBe('test@example.com');
      expect(result.current.isSubscribed).toBe(true);
    });

    it('should capture email for newsletter', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let captureResult;
      await act(async () => {
        captureResult = await result.current.captureEmail(
          'newsletter@example.com',
          'newsletter',
          undefined,
          { weeklyDigest: true }
        );
      });

      expect(captureResult?.success).toBe(true);
      expect(result.current.email).toBe('newsletter@example.com');
    });

    it('should capture email for exit intent', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let captureResult;
      await act(async () => {
        captureResult = await result.current.captureEmail(
          'exit@example.com',
          'exit_intent'
        );
      });

      expect(captureResult?.success).toBe(true);
    });

    it('should capture email for referral', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let captureResult;
      await act(async () => {
        captureResult = await result.current.captureEmail(
          'referral@example.com',
          'referral'
        );
      });

      expect(captureResult?.success).toBe(true);
    });

    it('should return error for invalid email', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let captureResult;
      await act(async () => {
        captureResult = await result.current.captureEmail(
          'invalid-email',
          'price_alert'
        );
      });

      expect(captureResult?.success).toBe(false);
      expect(captureResult?.error).toContain('valid email');
    });

    it('should normalize email to lowercase and trim', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.captureEmail(
          '  Test@Example.COM  ',
          'newsletter'
        );
      });

      // Wait for state update
      await waitFor(() => {
        expect(result.current.email).toBe('test@example.com');
      });
    });

    it('should persist to localStorage and email list', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.captureEmail(
          'persist@example.com',
          'newsletter'
        );
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        EMAIL_CAPTURE_KEY,
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        EMAIL_LIST_KEY,
        expect.any(String)
      );
    });
  });

  describe('updatePreferences', () => {
    it('should update email preferences', async () => {
      // First capture an email
      localStorageMock.setItem(EMAIL_CAPTURE_KEY, JSON.stringify({
        email: 'test@example.com',
        preferences: {
          priceAlerts: true,
          newReleases: true,
          weeklyDigest: false,
          promotions: false,
        },
      }));

      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updatePreferences({
          weeklyDigest: true,
          promotions: true,
        });
      });

      expect(updateResult).toBe(true);
      expect(result.current.preferences.weeklyDigest).toBe(true);
      expect(result.current.preferences.promotions).toBe(true);
    });

    it('should return false when no email is captured', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updatePreferences({
          weeklyDigest: true,
        });
      });

      expect(updateResult).toBe(false);
    });

    it('should persist updated preferences to localStorage', async () => {
      localStorageMock.setItem(EMAIL_CAPTURE_KEY, JSON.stringify({
        email: 'test@example.com',
        preferences: {
          priceAlerts: true,
          newReleases: true,
          weeklyDigest: false,
          promotions: false,
        },
      }));

      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({ promotions: true });
      });

      const stored = localStorageMock.getItem(EMAIL_CAPTURE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed.preferences.promotions).toBe(true);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe and clear email', async () => {
      localStorageMock.setItem(EMAIL_CAPTURE_KEY, JSON.stringify({
        email: 'unsubscribe@example.com',
        preferences: {
          priceAlerts: true,
          newReleases: true,
          weeklyDigest: false,
          promotions: false,
        },
      }));

      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.email).toBe('unsubscribe@example.com');
      expect(result.current.isSubscribed).toBe(true);

      let unsubResult;
      await act(async () => {
        unsubResult = await result.current.unsubscribe();
      });

      expect(unsubResult).toBe(true);
      expect(result.current.email).toBeNull();
      expect(result.current.isSubscribed).toBe(false);
    });

    it('should return false when no email to unsubscribe', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let unsubResult;
      await act(async () => {
        unsubResult = await result.current.unsubscribe();
      });

      expect(unsubResult).toBe(false);
    });

    it('should remove localStorage entry', async () => {
      localStorageMock.setItem(EMAIL_CAPTURE_KEY, JSON.stringify({
        email: 'test@example.com',
        preferences: {},
      }));

      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.unsubscribe();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(EMAIL_CAPTURE_KEY);
    });
  });

  describe('getAllEmails', () => {
    it('should return all captured emails', async () => {
      const emailList = [
        {
          email: 'user1@example.com',
          source: 'newsletter',
          createdAt: '2024-01-01T00:00:00Z',
          preferences: {
            priceAlerts: true,
            newReleases: true,
            weeklyDigest: false,
            promotions: false,
          },
        },
        {
          email: 'user2@example.com',
          source: 'price_alert',
          shoeId: 'shoe-1',
          shoeName: 'Air Force 1',
          createdAt: '2024-01-02T00:00:00Z',
          preferences: {
            priceAlerts: true,
            newReleases: true,
            weeklyDigest: false,
            promotions: false,
          },
        },
      ];
      localStorageMock.setItem(EMAIL_LIST_KEY, JSON.stringify(emailList));

      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let emails;
      await act(async () => {
        emails = await result.current.getAllEmails();
      });

      expect(emails).toHaveLength(2);
      expect(emails?.[0].email).toBe('user1@example.com');
      expect(emails?.[1].shoeId).toBe('shoe-1');
    });

    it('should return empty array when no emails captured', async () => {
      const { result } = renderHook(() => useEmailCapture());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let emails;
      await act(async () => {
        emails = await result.current.getAllEmails();
      });

      expect(emails).toEqual([]);
    });
  });

  describe('loading state', () => {
    it('should complete loading', async () => {
      const { result } = renderHook(() => useEmailCapture());

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
