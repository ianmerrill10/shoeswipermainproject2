import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnboarding } from '../useOnboarding';

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

const ONBOARDING_KEY = 'shoeswiper_onboarding';
const PREFERENCES_KEY = 'shoeswiper_preferences';

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completed).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.stylePreferences).toEqual([]);
    expect(result.current.favoriteBrands).toEqual([]);
    expect(result.current.emailCaptured).toBe(false);
    expect(result.current.pushEnabled).toBe(false);
  });

  it('should load onboarding state from localStorage', async () => {
    const mockState = {
      completed: true,
      currentStep: 3,
      stylePreferences: ['casual', 'streetwear'],
      favoriteBrands: ['Nike', 'Adidas'],
      emailCaptured: true,
      pushEnabled: true,
    };
    localStorageMock.setItem(ONBOARDING_KEY, JSON.stringify(mockState));

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completed).toBe(true);
    expect(result.current.currentStep).toBe(3);
    expect(result.current.stylePreferences).toEqual(['casual', 'streetwear']);
    expect(result.current.favoriteBrands).toEqual(['Nike', 'Adidas']);
    expect(result.current.emailCaptured).toBe(true);
    expect(result.current.pushEnabled).toBe(true);
  });

  it('should set current step', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setCurrentStep(2);
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('should go to next step', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentStep).toBe(0);

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('should go to previous step', async () => {
    const mockState = {
      completed: false,
      currentStep: 3,
      stylePreferences: [],
      favoriteBrands: [],
      emailCaptured: false,
      pushEnabled: false,
    };
    localStorageMock.setItem(ONBOARDING_KEY, JSON.stringify(mockState));

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentStep).toBe(3);

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('should not go below step 0 when calling previousStep', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentStep).toBe(0);

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('should set style preferences', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setStylePreferences(['streetwear', 'athletic']);
    });

    expect(result.current.stylePreferences).toEqual(['streetwear', 'athletic']);
  });

  it('should set favorite brands', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setFavoriteBrands(['Nike', 'Jordan', 'New Balance']);
    });

    expect(result.current.favoriteBrands).toEqual(['Nike', 'Jordan', 'New Balance']);
  });

  it('should set email captured', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emailCaptured).toBe(false);

    act(() => {
      result.current.setEmailCaptured(true);
    });

    expect(result.current.emailCaptured).toBe(true);
  });

  it('should set push enabled', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pushEnabled).toBe(false);

    act(() => {
      result.current.setPushEnabled(true);
    });

    expect(result.current.pushEnabled).toBe(true);
  });

  it('should complete onboarding', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completed).toBe(false);

    act(() => {
      result.current.completeOnboarding();
    });

    expect(result.current.completed).toBe(true);
  });

  it('should skip onboarding', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completed).toBe(false);

    act(() => {
      result.current.skipOnboarding();
    });

    expect(result.current.completed).toBe(true);
  });

  it('should reset onboarding', async () => {
    const mockState = {
      completed: true,
      currentStep: 5,
      stylePreferences: ['casual'],
      favoriteBrands: ['Nike'],
      emailCaptured: true,
      pushEnabled: true,
    };
    localStorageMock.setItem(ONBOARDING_KEY, JSON.stringify(mockState));

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completed).toBe(true);

    act(() => {
      result.current.resetOnboarding();
    });

    expect(result.current.completed).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.stylePreferences).toEqual([]);
    expect(result.current.favoriteBrands).toEqual([]);
    expect(result.current.emailCaptured).toBe(false);
    expect(result.current.pushEnabled).toBe(false);
  });

  it('should get preferences', async () => {
    const mockPrefs = {
      stylePreferences: ['streetwear'],
      favoriteBrands: ['Adidas'],
    };
    localStorageMock.setItem(PREFERENCES_KEY, JSON.stringify(mockPrefs));

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const prefs = result.current.getPreferences();
    expect(prefs.stylePreferences).toEqual(['streetwear']);
    expect(prefs.favoriteBrands).toEqual(['Adidas']);
  });

  it('should return empty preferences when none set', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const prefs = result.current.getPreferences();
    expect(prefs.stylePreferences).toEqual([]);
    expect(prefs.favoriteBrands).toEqual([]);
  });

  it('should persist state to localStorage', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setStylePreferences(['casual']);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      ONBOARDING_KEY,
      expect.any(String)
    );
  });

  it('should persist preferences separately for feed algorithm', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setStylePreferences(['athletic', 'casual']);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      PREFERENCES_KEY,
      expect.any(String)
    );
  });

  it('should remove localStorage keys on reset', async () => {
    const mockState = {
      completed: true,
      currentStep: 5,
      stylePreferences: ['casual'],
      favoriteBrands: ['Nike'],
      emailCaptured: true,
      pushEnabled: true,
    };
    localStorageMock.setItem(ONBOARDING_KEY, JSON.stringify(mockState));
    localStorageMock.setItem(PREFERENCES_KEY, JSON.stringify({ stylePreferences: ['casual'], favoriteBrands: ['Nike'] }));

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.resetOnboarding();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(ONBOARDING_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PREFERENCES_KEY);
  });

  it('should have loading property', () => {
    const { result } = renderHook(() => useOnboarding());
    
    // The hook has a loading property that is a boolean
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should handle getPreferences with invalid JSON gracefully', async () => {
    // Set invalid JSON
    localStorageMock.setItem(PREFERENCES_KEY, 'invalid-json');

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return empty preferences on parse error
    const prefs = result.current.getPreferences();
    expect(prefs.stylePreferences).toEqual([]);
    expect(prefs.favoriteBrands).toEqual([]);
  });
});
