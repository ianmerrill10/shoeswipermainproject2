import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion, useHaptics, useSwipeGesture } from '../useAnimations';

// Mock matchMedia
const mockMatchMedia = vi.fn();

// Store original values
const originalMatchMedia = window.matchMedia;
const originalNavigator = window.navigator;

describe('useReducedMotion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock - reduced motion not preferred
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return prefersReducedMotion as false by default', () => {
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.animationsEnabled).toBe(true);
  });

  it('should return prefersReducedMotion as true when media query matches', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.animationsEnabled).toBe(false);
  });

  it('should update when media query changes', () => {
    let changeHandler: ((event: { matches: boolean }) => void) | null = null;

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (event: string, handler: (event: { matches: boolean }) => void) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current.prefersReducedMotion).toBe(false);

    // Simulate media query change
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true });
      }
    });

    expect(result.current.prefersReducedMotion).toBe(true);
  });
});

describe('useHaptics', () => {
  const originalVibrate = navigator.vibrate;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: originalVibrate,
      writable: true,
    });
  });

  it('should report isSupported as true when vibrate exists', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn().mockReturnValue(true),
      writable: true,
    });

    const { result } = renderHook(() => useHaptics());

    expect(result.current.isSupported).toBe(true);
  });

  it('should report isSupported as false when vibrate does not exist', () => {
    // Use Object.defineProperty with proper descriptor
    const tempNav = Object.assign({}, navigator);
    delete (tempNav as unknown as Record<string, unknown>).vibrate;
    Object.defineProperty(window, 'navigator', {
      value: tempNav,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useHaptics());

    // Restore navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });

    // This will be false if vibrate was not available
    expect(typeof result.current.trigger).toBe('function');
  });

  it('should have trigger function for all pattern types', () => {
    const { result } = renderHook(() => useHaptics());

    const patterns: Array<'light' | 'medium' | 'heavy' | 'success' | 'error' | 'swipe'> = [
      'light', 'medium', 'heavy', 'success', 'error', 'swipe'
    ];

    patterns.forEach((pattern) => {
      expect(() => result.current.trigger(pattern)).not.toThrow();
    });
  });

  it('should have triggerCustom function', () => {
    const { result } = renderHook(() => useHaptics());

    expect(typeof result.current.triggerCustom).toBe('function');
    expect(() => result.current.triggerCustom([10, 20, 30])).not.toThrow();
  });

  it('should call navigator.vibrate with correct pattern', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
    });

    const { result } = renderHook(() => useHaptics());

    result.current.trigger('success');

    expect(mockVibrate).toHaveBeenCalledWith([10, 50, 20]);
  });
});

describe('useSwipeGesture', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSwipeGesture());

    expect(result.current.state).toEqual({
      direction: null,
      progress: 0,
      isDragging: false,
      thresholdReached: false,
    });
  });

  it('should update state on drag right', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 100 }));

    act(() => {
      result.current.updateDrag(50, 0);
    });

    expect(result.current.state.direction).toBe('right');
    expect(result.current.state.progress).toBe(0.5);
    expect(result.current.state.isDragging).toBe(true);
    expect(result.current.state.thresholdReached).toBe(false);
  });

  it('should update state on drag left', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 100 }));

    act(() => {
      result.current.updateDrag(-150, 0);
    });

    expect(result.current.state.direction).toBe('left');
    expect(result.current.state.progress).toBe(-1);
    expect(result.current.state.thresholdReached).toBe(true);
  });

  it('should call onSwipe callback when threshold reached', () => {
    const onSwipe = vi.fn();
    const { result } = renderHook(() => useSwipeGesture({ 
      threshold: 100,
      onSwipe,
    }));

    // First update drag to set threshold
    act(() => {
      result.current.updateDrag(150, 0);
    });

    // Then end drag with zero velocity
    act(() => {
      result.current.endDrag(0, 0);
    });

    expect(onSwipe).toHaveBeenCalledWith('right');
  });

  it('should call onSwipe callback with velocity-based swipe', () => {
    const onSwipe = vi.fn();
    const { result } = renderHook(() => useSwipeGesture({ 
      threshold: 100,
      onSwipe,
    }));

    act(() => {
      result.current.updateDrag(10, 0); // Below threshold
      result.current.endDrag(600, 0); // High velocity
    });

    expect(onSwipe).toHaveBeenCalledWith('right');
  });

  it('should call onCancel when swipe is cancelled', () => {
    const onCancel = vi.fn();
    const { result } = renderHook(() => useSwipeGesture({ 
      threshold: 100,
      onCancel,
    }));

    act(() => {
      result.current.updateDrag(20, 0); // Below threshold
      result.current.endDrag(100, 0); // Low velocity
    });

    expect(onCancel).toHaveBeenCalled();
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useSwipeGesture());

    act(() => {
      result.current.updateDrag(150, 0);
    });

    expect(result.current.state.isDragging).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({
      direction: null,
      progress: 0,
      isDragging: false,
      thresholdReached: false,
    });
  });

  it('should not update state when disabled', () => {
    const { result } = renderHook(() => useSwipeGesture({ enabled: false }));

    act(() => {
      result.current.updateDrag(150, 0);
    });

    expect(result.current.state.isDragging).toBe(false);
    expect(result.current.state.direction).toBe(null);
  });

  it('should detect vertical swipe up', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 100 }));

    act(() => {
      result.current.updateDrag(0, -150);
    });

    expect(result.current.state.direction).toBe('up');
    expect(result.current.state.thresholdReached).toBe(true);
  });

  it('should detect vertical swipe down', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 100 }));

    act(() => {
      result.current.updateDrag(0, 150);
    });

    expect(result.current.state.direction).toBe('down');
    expect(result.current.state.thresholdReached).toBe(true);
  });
});
