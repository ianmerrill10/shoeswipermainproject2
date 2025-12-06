/**
 * SHOESWIPER RATE LIMITING MIDDLEWARE
 * Phase 1 Security Hardening
 * 
 * Implements sliding window rate limiting for all API endpoints
 * Prevents DDoS attacks and API abuse
 */

import { supabase } from './supabaseClient';

// ============================================
// RATE LIMIT CONFIGURATION
// ============================================

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  message: string;       // Error message when limit exceeded
}

// Rate limits by endpoint type
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  
  // AI endpoints - moderate limits (expensive)
  ai: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,          // 10 requests per minute
    message: 'AI analysis rate limit exceeded. Please wait a moment.',
  },
  
  // Search endpoints - generous limits
  search: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,          // 60 requests per minute
    message: 'Search rate limit exceeded. Please slow down.',
  },
  
  // General API endpoints
  api: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // 100 requests per minute
    message: 'API rate limit exceeded. Please slow down.',
  },
  
  // Email capture - strict to prevent spam
  email: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,          // 10 submissions per hour
    message: 'Email submission limit exceeded. Please try again later.',
  },
  
  // Price alerts - moderate limits
  alerts: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30,          // 30 requests per minute
    message: 'Too many price alert requests. Please slow down.',
  },
  
  // Affiliate clicks - track but allow many
  affiliate: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 120,         // 120 clicks per minute
    message: 'Click tracking rate limit exceeded.',
  },
};

// ============================================
// IN-MEMORY RATE LIMITER (Primary)
// ============================================

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries older than 1 hour
    if (now - entry.windowStart > 60 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request should be rate limited
 * Returns true if request should be allowed, false if blocked
 */
export function checkRateLimit(
  identifier: string,  // IP address hash or user ID
  endpoint: string,    // Endpoint category (auth, ai, search, etc.)
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.api;
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  // No entry or window expired - create new entry
  if (!entry || now - entry.windowStart >= config.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  // Within window - check count
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.windowStart + config.windowMs,
    };
  }
  
  // Increment and allow
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.windowStart + config.windowMs,
  };
}

// ============================================
// SLIDING WINDOW RATE LIMITER (More Accurate)
// ============================================

interface SlidingWindowEntry {
  timestamps: number[];
}

const slidingWindowStore = new Map<string, SlidingWindowEntry>();

/**
 * Sliding window rate limiter - more accurate than fixed window
 */
export function checkSlidingWindowRateLimit(
  identifier: string,
  endpoint: string,
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.api;
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  let entry = slidingWindowStore.get(key);
  
  if (!entry) {
    entry = { timestamps: [] };
    slidingWindowStore.set(key, entry);
  }
  
  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);
  
  // Check if limit exceeded
  if (entry.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetTime: oldestTimestamp + config.windowMs,
    };
  }
  
  // Add current timestamp and allow
  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetTime: now + config.windowMs,
  };
}

// ============================================
// IP HASHING FOR PRIVACY
// ============================================

/**
 * Hash IP address for privacy-compliant rate limiting
 */
export async function hashIP(ip: string): Promise<string> {
  // Add salt for security
  const salt = 'shoeswiper-rate-limit-salt-2024';
  const data = new TextEncoder().encode(ip + salt);
  
  // Use Web Crypto API for hashing
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }
  
  // Fallback: Simple hash (not cryptographically secure, but better than nothing)
  let hash = 0;
  const str = ip + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ============================================
// DATABASE-BACKED RATE LIMITER
// For distributed deployments
// ============================================

/**
 * Check rate limit using Supabase for distributed rate limiting
 * Use this for production deployments with multiple servers
 */
export async function checkDatabaseRateLimit(
  identifier: string,
  endpoint: string,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.api;
  const windowMs = config.windowMs;
  const windowStart = new Date(Date.now() - windowMs).toISOString();
  
  try {
    // Count requests in current window
    const { count, error } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart);
    
    if (error) {
      console.error('[RateLimit] Database error:', error);
      // Fail open - allow request but log error
      return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + windowMs };
    }
    
    const currentCount = count || 0;
    
    if (currentCount >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + windowMs,
      };
    }
    
    // Log this request
    await supabase.from('rate_limits').insert({
      identifier,
      endpoint,
      window_start: new Date().toISOString(),
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      resetTime: Date.now() + windowMs,
    };
  } catch (err) {
    console.error('[RateLimit] Error checking rate limit:', err);
    // Fail open
    return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + windowMs };
  }
}

// ============================================
// REACT HOOK FOR CLIENT-SIDE RATE LIMITING
// ============================================

import { useState, useCallback, useRef } from 'react';

interface UseRateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function useRateLimit(options: UseRateLimitOptions = { maxRequests: 10, windowMs: 60000 }) {
  const [isLimited, setIsLimited] = useState(false);
  const [remaining, setRemaining] = useState(options.maxRequests);
  const requestTimestamps = useRef<number[]>([]);
  
  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    // Remove old timestamps
    requestTimestamps.current = requestTimestamps.current.filter(ts => ts > windowStart);
    
    if (requestTimestamps.current.length >= options.maxRequests) {
      setIsLimited(true);
      setRemaining(0);
      return false;
    }
    
    requestTimestamps.current.push(now);
    setRemaining(options.maxRequests - requestTimestamps.current.length);
    setIsLimited(false);
    return true;
  }, [options.maxRequests, options.windowMs]);
  
  const reset = useCallback(() => {
    requestTimestamps.current = [];
    setIsLimited(false);
    setRemaining(options.maxRequests);
  }, [options.maxRequests]);
  
  return {
    isLimited,
    remaining,
    checkLimit,
    reset,
  };
}

// ============================================
// EXPRESS MIDDLEWARE (for backend API)
// ============================================

/**
 * Express middleware for rate limiting
 * Usage: app.use('/api', rateLimitMiddleware('api'));
 */
export function createRateLimitMiddleware(endpoint: string) {
  return async (req: any, res: any, next: any) => {
    // Get identifier from IP or user ID
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userId = req.user?.id;
    const identifier = userId || await hashIP(ip);
    
    const result = checkSlidingWindowRateLimit(identifier, endpoint);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': RATE_LIMITS[endpoint]?.maxRequests || RATE_LIMITS.api.maxRequests,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000),
    });
    
    if (!result.allowed) {
      const config = RATE_LIMITS[endpoint] || RATE_LIMITS.api;
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: config.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
      return;
    }
    
    next();
  };
}

// ============================================
// HELPER: Rate limit wrapper for functions
// ============================================

/**
 * Wrapper to add rate limiting to any async function
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  identifier: string,
  endpoint: string,
): T {
  return (async (...args: any[]) => {
    const result = checkSlidingWindowRateLimit(identifier, endpoint);
    
    if (!result.allowed) {
      const config = RATE_LIMITS[endpoint] || RATE_LIMITS.api;
      throw new Error(config.message);
    }
    
    return fn(...args);
  }) as T;
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  RATE_LIMITS,
  checkRateLimit,
  checkSlidingWindowRateLimit,
  checkDatabaseRateLimit,
  hashIP,
  useRateLimit,
  createRateLimitMiddleware,
  withRateLimit,
};
