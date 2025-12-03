// ============================================
// SECURITY HOOK
// ShoeSwiper Security Hook for React Components
// ============================================

import { useCallback, useRef } from 'react';
import {
  checkRateLimit,
  RateLimitConfig,
  RATE_LIMITS,
  getCsrfToken,
  validateCsrfToken,
  regenerateCsrfToken,
  updateSessionActivity,
  isSessionExpired,
} from '../lib/security';

/**
 * Custom hook for security features in React components
 */
export const useSecurity = () => {
  const csrfTokenRef = useRef<string>(getCsrfToken());

  /**
   * Check if an action is rate limited
   */
  const isRateLimited = useCallback((key: string, config: RateLimitConfig = RATE_LIMITS.apiCall) => {
    const result = checkRateLimit(key, config);
    return {
      limited: result.limited,
      remaining: result.remaining,
      resetInSeconds: Math.ceil(result.resetIn / 1000),
    };
  }, []);

  /**
   * Get the current CSRF token for form submissions
   */
  const getToken = useCallback(() => {
    return csrfTokenRef.current;
  }, []);

  /**
   * Validate a CSRF token
   */
  const verifyToken = useCallback((token: string) => {
    return validateCsrfToken(token);
  }, []);

  /**
   * Regenerate CSRF token (call after successful form submission)
   */
  const refreshToken = useCallback(() => {
    csrfTokenRef.current = regenerateCsrfToken();
    return csrfTokenRef.current;
  }, []);

  /**
   * Update session activity timestamp
   */
  const keepSessionAlive = useCallback(() => {
    updateSessionActivity();
  }, []);

  /**
   * Check if the session has expired
   */
  const hasSessionExpired = useCallback((timeoutMs?: number) => {
    return isSessionExpired(timeoutMs);
  }, []);

  /**
   * Perform a rate-limited action
   * Returns a wrapper function that checks rate limit before executing
   */
  const withRateLimit = useCallback(<T extends unknown[], R>(
    key: string,
    action: (...args: T) => R,
    config: RateLimitConfig = RATE_LIMITS.apiCall,
    onLimited?: (resetIn: number) => void
  ) => {
    return (...args: T): R | null => {
      const result = checkRateLimit(key, config);
      if (result.limited) {
        if (onLimited) {
          onLimited(Math.ceil(result.resetIn / 1000));
        }
        return null;
      }
      return action(...args);
    };
  }, []);

  return {
    // Rate limiting
    isRateLimited,
    withRateLimit,
    RATE_LIMITS,

    // CSRF protection
    getToken,
    verifyToken,
    refreshToken,

    // Session management
    keepSessionAlive,
    hasSessionExpired,
  };
};

export default useSecurity;
