import { useState, useEffect, useCallback, useRef } from 'react';

interface UseExitIntentOptions {
  /** Delay in ms before exit intent can trigger (default: 5000) */
  delay?: number;
  /** Cookie/storage duration in days (default: 7) */
  cookieDays?: number;
  /** Threshold for mouse Y position to trigger (default: 10) */
  threshold?: number;
  /** Key for localStorage to track if already shown */
  storageKey?: string;
}

interface UseExitIntentReturn {
  /** Whether the exit intent popup should be shown */
  showExitIntent: boolean;
  /** Function to dismiss the popup */
  dismiss: () => void;
  /** Function to manually trigger the popup */
  trigger: () => void;
  /** Reset to allow showing again (for testing) */
  reset: () => void;
}

/**
 * Hook to detect exit intent (user about to leave page)
 * Triggers when mouse moves to top of viewport (desktop)
 * Or after back button / tab switch (mobile)
 */
export function useExitIntent(options: UseExitIntentOptions = {}): UseExitIntentReturn {
  const {
    delay = 5000,
    cookieDays = 7,
    threshold = 10,
    storageKey = 'shoeswiper_exit_intent_shown',
  } = options;

  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReady = useRef(false);

  // Check if already shown recently
  const wasRecentlyShown = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return false;

      const { timestamp } = JSON.parse(stored);
      const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      return daysSince < cookieDays;
    } catch {
      return false;
    }
  }, [storageKey, cookieDays]);

  // Mark as shown
  const markAsShown = useCallback(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ timestamp: Date.now(), shown: true })
      );
    } catch {
      // localStorage not available
    }
  }, [storageKey]);

  // Trigger the popup
  const trigger = useCallback(() => {
    if (hasTriggered || wasRecentlyShown()) return;

    setHasTriggered(true);
    setShowExitIntent(true);
    markAsShown();
  }, [hasTriggered, wasRecentlyShown, markAsShown]);

  // Dismiss the popup
  const dismiss = useCallback(() => {
    setShowExitIntent(false);
  }, []);

  // Reset for testing
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasTriggered(false);
      setShowExitIntent(false);
    } catch {
      // localStorage not available
    }
  }, [storageKey]);

  // Desktop: Mouse leave detection
  useEffect(() => {
    // Skip if already shown
    if (wasRecentlyShown()) {
      setHasTriggered(true);
      return;
    }

    // Wait for delay before enabling
    timeoutRef.current = setTimeout(() => {
      isReady.current = true;
    }, delay);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse exits from top of page
      if (!isReady.current || hasTriggered) return;

      if (e.clientY <= threshold) {
        trigger();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, threshold, hasTriggered, wasRecentlyShown, trigger]);

  // Mobile: Visibility change detection (tab switch)
  useEffect(() => {
    if (wasRecentlyShown()) return;

    const handleVisibilityChange = () => {
      if (!isReady.current || hasTriggered) return;

      if (document.visibilityState === 'hidden') {
        // User switched tabs or minimized - show on return
        const handleReturn = () => {
          if (!hasTriggered) {
            trigger();
          }
          document.removeEventListener('visibilitychange', handleReturn);
        };

        // Show popup when they return
        document.addEventListener('visibilitychange', handleReturn);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasTriggered, wasRecentlyShown, trigger]);

  return {
    showExitIntent,
    dismiss,
    trigger,
    reset,
  };
}

export default useExitIntent;
