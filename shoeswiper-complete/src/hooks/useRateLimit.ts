import { useCallback, useRef } from 'react';

/**
 * Rate Limiting Configuration
 * 
 * These constants define rate limits for various API operations
 * to prevent abuse and protect against excessive API usage.
 */
export const RATE_LIMITS = {
  // General API calls
  API_CALLS_PER_MINUTE: 60,
  
  // Search operations
  SEARCH_REQUESTS_PER_MINUTE: 30,
  
  // Analytics tracking
  ANALYTICS_EVENTS_PER_MINUTE: 100,
  
  // AI outfit analysis (expensive operation)
  OUTFIT_ANALYSIS_PER_HOUR: 10,
  
  // Favorite/unfavorite operations
  FAVORITES_PER_MINUTE: 20,
  
  // Share operations
  SHARES_PER_MINUTE: 10,
  
  // Minimum interval between same operations (ms)
  MIN_INTERVAL_MS: 100,
} as const;

interface RateLimitState {
  timestamps: number[];
  lastCall: number;
}

/**
 * useRateLimit Hook
 * 
 * Provides rate limiting functionality for any operation.
 * Returns a function that checks if an operation is allowed
 * based on the configured rate limit.
 * 
 * @param maxCalls - Maximum number of calls allowed in the time window
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param minIntervalMs - Minimum interval between calls (default: 100ms)
 * 
 * @example
 * const { isAllowed, getRemainingCalls } = useRateLimit(30, 60000);
 * 
 * const handleSearch = () => {
 *   if (!isAllowed()) {
 *     console.log('Rate limit exceeded. Please wait.');
 *     return;
 *   }
 *   // Perform search...
 * };
 */
export const useRateLimit = (
  maxCalls: number = RATE_LIMITS.API_CALLS_PER_MINUTE,
  windowMs: number = 60000,
  minIntervalMs: number = RATE_LIMITS.MIN_INTERVAL_MS
) => {
  const stateRef = useRef<RateLimitState>({
    timestamps: [],
    lastCall: 0,
  });

  /**
   * Check if an operation is allowed under the current rate limit
   * Also records the timestamp if allowed
   */
  const isAllowed = useCallback((): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Check minimum interval
    if (now - state.lastCall < minIntervalMs) {
      return false;
    }

    // Remove timestamps outside the window
    state.timestamps = state.timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    // Check if under the limit
    if (state.timestamps.length >= maxCalls) {
      return false;
    }

    // Record this call
    state.timestamps.push(now);
    state.lastCall = now;

    return true;
  }, [maxCalls, windowMs, minIntervalMs]);

  /**
   * Check if allowed without recording (for UI purposes)
   */
  const checkOnly = useCallback((): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Check minimum interval
    if (now - state.lastCall < minIntervalMs) {
      return false;
    }

    // Count timestamps in window
    const validTimestamps = state.timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    return validTimestamps.length < maxCalls;
  }, [maxCalls, windowMs, minIntervalMs]);

  /**
   * Get remaining calls in the current window
   */
  const getRemainingCalls = useCallback((): number => {
    const now = Date.now();
    const validTimestamps = stateRef.current.timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );
    return Math.max(0, maxCalls - validTimestamps.length);
  }, [maxCalls, windowMs]);

  /**
   * Get time until next call is allowed (in ms)
   */
  const getTimeUntilNextAllowed = useCallback((): number => {
    const now = Date.now();
    const state = stateRef.current;

    // Check minimum interval first
    const intervalRemaining = minIntervalMs - (now - state.lastCall);
    if (intervalRemaining > 0) {
      return intervalRemaining;
    }

    // Check rate limit window
    const validTimestamps = state.timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (validTimestamps.length >= maxCalls && validTimestamps.length > 0) {
      const oldestInWindow = Math.min(...validTimestamps);
      return windowMs - (now - oldestInWindow);
    }

    return 0;
  }, [maxCalls, windowMs, minIntervalMs]);

  /**
   * Reset the rate limit state
   */
  const reset = useCallback((): void => {
    stateRef.current = {
      timestamps: [],
      lastCall: 0,
    };
  }, []);

  return {
    isAllowed,
    checkOnly,
    getRemainingCalls,
    getTimeUntilNextAllowed,
    reset,
  };
};

export default useRateLimit;
