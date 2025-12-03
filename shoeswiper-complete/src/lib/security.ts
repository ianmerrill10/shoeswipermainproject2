// ============================================
// SECURITY UTILITIES
// ShoeSwiper Security-First Approach
// ============================================

/**
 * Input Sanitization
 * Remove potentially dangerous characters from user input
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, '') // Remove dangerous chars
    .trim()
    .slice(0, 1000); // Limit length
};

/**
 * Sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>"']/g, '')
    .slice(0, 254); // RFC 5321 max length
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Secure Storage Wrapper
 * Prevents storing sensitive data in plain localStorage
 * Uses sessionStorage for sensitive data and adds basic obfuscation
 */
export const SecureStorage = {
  // Non-sensitive data - uses localStorage
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('SecureStorage: Unable to save to localStorage');
    }
  },

  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('SecureStorage: Unable to read from localStorage');
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('SecureStorage: Unable to remove from localStorage');
    }
  },

  // Sensitive data - uses sessionStorage only (cleared when browser closes)
  setSessionItem: (key: string, value: string): void => {
    try {
      // Add basic obfuscation for defense in depth
      const encoded = btoa(encodeURIComponent(value));
      sessionStorage.setItem(key, encoded);
    } catch (e) {
      console.warn('SecureStorage: Unable to save to sessionStorage');
    }
  },

  getSessionItem: (key: string): string | null => {
    try {
      const encoded = sessionStorage.getItem(key);
      if (!encoded) return null;
      return decodeURIComponent(atob(encoded));
    } catch (e) {
      console.warn('SecureStorage: Unable to read from sessionStorage');
      return null;
    }
  },

  removeSessionItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('SecureStorage: Unable to remove from sessionStorage');
    }
  },

  // Clear all stored data
  clearAll: (): void => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('SecureStorage: Unable to clear storage');
    }
  }
};

/**
 * Client-side Rate Limiter
 * Prevents abuse by limiting actions per time window
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();

export const RateLimiter = {
  /**
   * Check if action is allowed under rate limit
   * @param key - Unique identifier for the action type
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limited
   */
  checkLimit: (key: string, config: RateLimitConfig): boolean => {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // If no entry or window expired, create new entry
    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    // If within window, check count
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  },

  /**
   * Get remaining requests in current window
   */
  getRemainingRequests: (key: string, config: RateLimitConfig): number => {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - entry.count);
  },

  /**
   * Reset rate limit for a key
   */
  reset: (key: string): void => {
    rateLimitStore.delete(key);
  }
};

// Pre-configured rate limits for common actions
export const RATE_LIMITS = {
  // AI outfit analysis - 5 per minute
  AI_ANALYSIS: { maxRequests: 5, windowMs: 60000 },
  // Form submissions - 3 per 30 seconds
  FORM_SUBMIT: { maxRequests: 3, windowMs: 30000 },
  // API calls - 30 per minute
  API_CALL: { maxRequests: 30, windowMs: 60000 },
  // Share actions - 10 per minute
  SHARE: { maxRequests: 10, windowMs: 60000 },
  // Login attempts - 5 per 5 minutes
  LOGIN: { maxRequests: 5, windowMs: 300000 }
};

/**
 * URL Validator
 * Validates URLs to prevent open redirects and XSS
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Check if URL is a safe external link
 * Only allows known affiliate partner domains
 */
const ALLOWED_DOMAINS = [
  'amazon.com',
  'www.amazon.com',
  'music.apple.com',
  'open.spotify.com',
  'stockx.com',
  'goat.com',
  'nike.com',
  'footlocker.com'
];

export const isSafeExternalUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
};

/**
 * Content Security
 * Basic XSS prevention for user-generated content display
 */
export const escapeHtml = (unsafe: string): string => {
  if (!unsafe || typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
