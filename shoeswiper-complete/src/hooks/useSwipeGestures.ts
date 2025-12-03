import { useRef, useEffect, useCallback } from 'react';
import { triggerHapticFeedback } from '../lib/pwaUtils';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
}

export interface SwipeOptions {
  /** Minimum distance (in pixels) to register as a swipe */
  threshold?: number;
  /** Minimum velocity (pixels/ms) to register as a swipe */
  velocityThreshold?: number;
  /** Enable haptic feedback on swipe */
  hapticFeedback?: boolean;
  /** Prevent default touch behavior */
  preventDefault?: boolean;
  /** Only register horizontal swipes */
  horizontalOnly?: boolean;
  /** Only register vertical swipes */
  verticalOnly?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
}

const DEFAULT_OPTIONS: Required<SwipeOptions> = {
  threshold: 50,
  velocityThreshold: 0.3,
  hapticFeedback: true,
  preventDefault: false,
  horizontalOnly: false,
  verticalOnly: false,
};

export interface UseSwipeGesturesReturn {
  /** Ref to attach to the element you want to track swipes on */
  ref: React.RefObject<HTMLElement>;
  /** Current swipe state for animations */
  swipeState: {
    deltaX: number;
    deltaY: number;
    isSwiping: boolean;
    direction: SwipeDirection | null;
  };
}

export const useSwipeGestures = (
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
): UseSwipeGesturesReturn => {
  const ref = useRef<HTMLElement>(null);
  const touchStateRef = useRef<TouchState | null>(null);
  const swipeStateRef = useRef({
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
    direction: null as SwipeDirection | null,
  });

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Determine swipe direction based on deltas
  const getSwipeDirection = useCallback(
    (deltaX: number, deltaY: number): SwipeDirection | null => {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (opts.horizontalOnly && absY > absX) return null;
      if (opts.verticalOnly && absX > absY) return null;

      if (absX > absY) {
        // Horizontal swipe
        if (absX < opts.threshold) return null;
        return deltaX > 0 ? 'right' : 'left';
      } else {
        // Vertical swipe
        if (absY < opts.threshold) return null;
        return deltaY > 0 ? 'down' : 'up';
      }
    },
    [opts.horizontalOnly, opts.verticalOnly, opts.threshold]
  );

  // Calculate velocity
  const calculateVelocity = useCallback(
    (delta: number, startTime: number): number => {
      const elapsed = Date.now() - startTime;
      return elapsed > 0 ? Math.abs(delta) / elapsed : 0;
    },
    []
  );

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
    };
    swipeStateRef.current = {
      deltaX: 0,
      deltaY: 0,
      isSwiping: true,
      direction: null,
    };
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStateRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStateRef.current.startX;
      const deltaY = touch.clientY - touchStateRef.current.startY;

      touchStateRef.current.currentX = touch.clientX;
      touchStateRef.current.currentY = touch.clientY;

      swipeStateRef.current = {
        deltaX,
        deltaY,
        isSwiping: true,
        direction: getSwipeDirection(deltaX, deltaY),
      };

      if (opts.preventDefault) {
        e.preventDefault();
      }
    },
    [getSwipeDirection, opts.preventDefault]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStateRef.current) return;

    const { startX, startY, startTime, currentX, currentY } = touchStateRef.current;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Calculate velocities
    const velocityX = calculateVelocity(deltaX, startTime);
    const velocityY = calculateVelocity(deltaY, startTime);
    const velocity = Math.max(velocityX, velocityY);

    // Check if it's a valid swipe
    const direction = getSwipeDirection(deltaX, deltaY);
    const meetsVelocityThreshold = velocity >= opts.velocityThreshold;
    const meetsDistanceThreshold = Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= opts.threshold;

    if (direction && (meetsVelocityThreshold || meetsDistanceThreshold)) {
      // Trigger haptic feedback
      if (opts.hapticFeedback) {
        triggerHapticFeedback(10);
      }

      // Call the appropriate callback
      switch (direction) {
        case 'left':
          callbacks.onSwipeLeft?.();
          break;
        case 'right':
          callbacks.onSwipeRight?.();
          break;
        case 'up':
          callbacks.onSwipeUp?.();
          break;
        case 'down':
          callbacks.onSwipeDown?.();
          break;
      }

      // Call the generic onSwipe callback
      callbacks.onSwipe?.(direction);
    }

    // Reset state
    touchStateRef.current = null;
    swipeStateRef.current = {
      deltaX: 0,
      deltaY: 0,
      isSwiping: false,
      direction: null,
    };
  }, [callbacks, calculateVelocity, getSwipeDirection, opts]);

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    touchStateRef.current = null;
    swipeStateRef.current = {
      deltaX: 0,
      deltaY: 0,
      isSwiping: false,
      direction: null,
    };
  }, []);

  // Attach event listeners
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Use passive listeners for better performance, unless preventDefault is needed
    const listenerOptions: AddEventListenerOptions = {
      passive: !opts.preventDefault,
    };

    element.addEventListener('touchstart', handleTouchStart, listenerOptions);
    element.addEventListener('touchmove', handleTouchMove, listenerOptions);
    element.addEventListener('touchend', handleTouchEnd, listenerOptions);
    element.addEventListener('touchcancel', handleTouchCancel, listenerOptions);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, opts.preventDefault]);

  return {
    ref: ref as React.RefObject<HTMLElement>,
    swipeState: swipeStateRef.current,
  };
};

/**
 * Hook for tracking continuous swipe position (useful for animations)
 */
export interface SwipePosition {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
}

export interface UseSwipePositionReturn {
  ref: React.RefObject<HTMLElement>;
  position: SwipePosition;
}

export const useSwipePosition = (): UseSwipePositionReturn => {
  const ref = useRef<HTMLElement>(null);
  const positionRef = useRef<SwipePosition>({
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
  });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      positionRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        deltaX: 0,
        deltaY: 0,
        isSwiping: true,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const startPos = startPosRef.current;
      if (!startPos) return;

      positionRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        deltaX: touch.clientX - startPos.x,
        deltaY: touch.clientY - startPos.y,
        isSwiping: true,
      };
    };

    const handleTouchEnd = () => {
      startPosRef.current = null;
      positionRef.current = {
        ...positionRef.current,
        isSwiping: false,
      };
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return {
    ref: ref as React.RefObject<HTMLElement>,
    position: positionRef.current,
  };
};
