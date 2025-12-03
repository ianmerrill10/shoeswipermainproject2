import { useState, useEffect, useCallback, useRef } from 'react';
import { SecureStorage } from '../lib/security';

interface ExitIntentConfig {
  /** Delay in ms before enabling detection (prevents false triggers) */
  delay?: number;
  /** Minimum session time in ms before showing popup */
  minSessionTime?: number;
  /** Cooldown period in hours between popup shows */
  cooldownHours?: number;
}

interface ExitIntentState {
  isShowing: boolean;
  hasTriggered: boolean;
}

const DEFAULT_CONFIG: Required<ExitIntentConfig> = {
  delay: 3000, // 3 seconds
  minSessionTime: 10000, // 10 seconds
  cooldownHours: 24, // Once per day
};

const EXIT_INTENT_STORAGE_KEY = 'shoeswiper_exit_intent_last_shown';
const EXIT_INTENT_DISMISSED_KEY = 'shoeswiper_exit_intent_dismissed';

/**
 * Hook for detecting exit intent behavior
 * Triggers when user moves cursor toward browser chrome (desktop)
 * or when they switch tabs/background the app (mobile)
 */
export const useExitIntent = (config: ExitIntentConfig = {}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<ExitIntentState>({
    isShowing: false,
    hasTriggered: false,
  });
  
  const sessionStartRef = useRef<number>(Date.now());
  const enabledRef = useRef<boolean>(false);
  const triggeredRef = useRef<boolean>(false);

  // Check if we should show based on cooldown
  const shouldShowPopup = useCallback((): boolean => {
    // Check if user permanently dismissed
    const dismissed = SecureStorage.getItem(EXIT_INTENT_DISMISSED_KEY);
    if (dismissed === 'true') return false;

    // Check cooldown
    const lastShown = SecureStorage.getItem(EXIT_INTENT_STORAGE_KEY);
    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      const cooldownMs = mergedConfig.cooldownHours * 60 * 60 * 1000;
      if (Date.now() - lastShownTime < cooldownMs) {
        return false;
      }
    }

    // Check minimum session time
    const sessionTime = Date.now() - sessionStartRef.current;
    if (sessionTime < mergedConfig.minSessionTime) {
      return false;
    }

    return true;
  }, [mergedConfig.cooldownHours, mergedConfig.minSessionTime]);

  // Trigger the popup
  const triggerPopup = useCallback(() => {
    if (triggeredRef.current || !enabledRef.current || !shouldShowPopup()) {
      return;
    }

    triggeredRef.current = true;
    setState({ isShowing: true, hasTriggered: true });
    
    // Record timestamp
    SecureStorage.setItem(EXIT_INTENT_STORAGE_KEY, Date.now().toString());
  }, [shouldShowPopup]);

  // Close the popup
  const closePopup = useCallback(() => {
    setState(prev => ({ ...prev, isShowing: false }));
  }, []);

  // Permanently dismiss (don't show again)
  const dismissPermanently = useCallback(() => {
    SecureStorage.setItem(EXIT_INTENT_DISMISSED_KEY, 'true');
    closePopup();
  }, [closePopup]);

  // Reset for testing
  const reset = useCallback(() => {
    SecureStorage.removeItem(EXIT_INTENT_STORAGE_KEY);
    SecureStorage.removeItem(EXIT_INTENT_DISMISSED_KEY);
    triggeredRef.current = false;
    setState({ isShowing: false, hasTriggered: false });
  }, []);

  // Desktop: Mouse leave detection (moving toward browser chrome)
  useEffect(() => {
    // Enable after delay
    const enableTimer = setTimeout(() => {
      enabledRef.current = true;
    }, mergedConfig.delay);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if leaving toward top of viewport (closing tab intent)
      // Use 50px threshold to reduce false positives from toolbar interactions
      if (e.clientY < 50 && enabledRef.current) {
        triggerPopup();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(enableTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mergedConfig.delay, triggerPopup]);

  // Mobile: Tab/App switch detection (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && enabledRef.current) {
        // User is leaving/switching tabs
        triggerPopup();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [triggerPopup]);

  // Mobile: Back button/swipe back detection
  useEffect(() => {
    const handlePopState = () => {
      if (enabledRef.current) {
        triggerPopup();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [triggerPopup]);

  return {
    isShowing: state.isShowing,
    hasTriggered: state.hasTriggered,
    closePopup,
    dismissPermanently,
    reset,
    // Manual trigger for testing
    manualTrigger: triggerPopup,
  };
};
