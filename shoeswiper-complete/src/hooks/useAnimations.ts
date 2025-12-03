import { useState, useEffect, useCallback } from 'react';

interface UseReducedMotionReturn {
  /** Whether the user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Whether animations are enabled (inverse of prefersReducedMotion) */
  animationsEnabled: boolean;
}

/**
 * Hook to detect user's prefers-reduced-motion setting
 * Returns true if user prefers reduced motion for accessibility
 */
export const useReducedMotion = (): UseReducedMotionReturn => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Use addEventListener for modern browsers, addListener for legacy (Safari <14, IE)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy support for Safari <14 and older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Legacy support for Safari <14 and older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return {
    prefersReducedMotion,
    animationsEnabled: !prefersReducedMotion,
  };
};

interface UseHapticsReturn {
  /** Whether haptic feedback is supported */
  isSupported: boolean;
  /** Trigger haptic feedback with a predefined pattern */
  trigger: (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'swipe') => void;
  /** Trigger custom haptic pattern */
  triggerCustom: (pattern: number[]) => void;
}

// Haptic feedback patterns (duration in ms)
const HAPTIC_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 20],
  error: [30, 50, 30],
  swipe: [10, 30, 10],
};

/**
 * Hook to manage haptic feedback
 * Returns methods to trigger vibration patterns on supported devices
 */
export const useHaptics = (): UseHapticsReturn => {
  const [isSupported] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  });

  const trigger = useCallback((pattern: keyof typeof HAPTIC_PATTERNS) => {
    if (!isSupported) return;
    try {
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
    } catch {
      // Haptic feedback not supported or blocked
    }
  }, [isSupported]);

  const triggerCustom = useCallback((pattern: number[]) => {
    if (!isSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptic feedback not supported or blocked
    }
  }, [isSupported]);

  return {
    isSupported,
    trigger,
    triggerCustom,
  };
};

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface SwipeState {
  /** Current swipe direction based on drag */
  direction: SwipeDirection;
  /** Normalized progress of the swipe (-1 to 1) */
  progress: number;
  /** Whether the card is being dragged */
  isDragging: boolean;
  /** Whether the swipe threshold has been reached */
  thresholdReached: boolean;
}

interface UseSwipeGestureConfig {
  /** Threshold in pixels to trigger a swipe */
  threshold?: number;
  /** Callback when swipe is completed */
  onSwipe?: (direction: SwipeDirection) => void;
  /** Callback when swipe is cancelled */
  onCancel?: () => void;
  /** Whether swipe is enabled */
  enabled?: boolean;
}

interface UseSwipeGestureReturn {
  /** Current swipe state */
  state: SwipeState;
  /** Reset swipe state to initial */
  reset: () => void;
  /** Update state based on drag position */
  updateDrag: (x: number, y: number) => void;
  /** Complete the swipe gesture */
  endDrag: (velocityX: number, velocityY: number) => void;
}

/**
 * Hook to manage swipe gesture state
 * Provides state tracking and callbacks for swipe interactions
 */
export const useSwipeGesture = (config: UseSwipeGestureConfig = {}): UseSwipeGestureReturn => {
  const {
    threshold = 100,
    onSwipe,
    onCancel,
    enabled = true,
  } = config;

  const [state, setState] = useState<SwipeState>({
    direction: null,
    progress: 0,
    isDragging: false,
    thresholdReached: false,
  });

  const reset = useCallback(() => {
    setState({
      direction: null,
      progress: 0,
      isDragging: false,
      thresholdReached: false,
    });
  }, []);

  const updateDrag = useCallback((x: number, y: number) => {
    if (!enabled) return;

    const absX = Math.abs(x);
    const absY = Math.abs(y);
    
    let direction: SwipeDirection = null;
    let maxDist = 0;

    // Determine primary direction
    if (absX > absY) {
      direction = x > 0 ? 'right' : 'left';
      maxDist = absX;
    } else if (absY > 0) {
      direction = y > 0 ? 'down' : 'up';
      maxDist = absY;
    }

    const progress = Math.min(maxDist / threshold, 1) * (direction === 'left' || direction === 'up' ? -1 : 1);
    const thresholdReached = maxDist >= threshold;

    setState({
      direction,
      progress,
      isDragging: true,
      thresholdReached,
    });
  }, [enabled, threshold]);

  const endDrag = useCallback((velocityX: number, velocityY: number) => {
    if (!enabled) return;

    const velocityThreshold = 500;
    const absVelX = Math.abs(velocityX);
    const absVelY = Math.abs(velocityY);

    let finalDirection: SwipeDirection = null;

    // Check if velocity or position threshold is met
    if (state.thresholdReached || absVelX > velocityThreshold || absVelY > velocityThreshold) {
      if (absVelX > absVelY) {
        finalDirection = velocityX > 0 ? 'right' : 'left';
      } else if (absVelY > velocityThreshold) {
        finalDirection = velocityY > 0 ? 'down' : 'up';
      } else {
        finalDirection = state.direction;
      }

      if (finalDirection) {
        onSwipe?.(finalDirection);
      }
    } else {
      onCancel?.();
    }

    reset();
  }, [enabled, state.thresholdReached, state.direction, onSwipe, onCancel, reset]);

  return {
    state,
    reset,
    updateDrag,
    endDrag,
  };
};
