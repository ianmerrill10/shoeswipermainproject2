// ============================================
// SECURITY UTILITIES
// ShoeSwiper Security Module
// ============================================
// This module provides comprehensive security utilities including:
// - Rate limiting
// - CSRF protection
// - Secure session handling
// - Content Security Policy helpers
// - Input sanitization utilities
// ============================================

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  maxRequests: number;  // Maximum requests allowed in the window
  windowMs: number;     // Time window in milliseconds
}

/**
 * Default rate limit configurations for different actions
 */
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },      // 5 attempts per 15 minutes
  search: { maxRequests: 30, windowMs: 60 * 1000 },         // 30 searches per minute
  emailCapture: { maxRequests: 3, windowMs: 60 * 1000 },    // 3 captures per minute
  apiCall: { maxRequests: 100, windowMs: 60 * 1000 },       // 100 calls per minute
  fileUpload: { maxRequests: 10, windowMs: 60 * 1000 },     // 10 uploads per minute
  outfitAnalysis: { maxRequests: 5, windowMs: 60 * 1000 },  // 5 analyses per minute
} as const;

/**
 * Check if an action is rate limited
 * @param key - Unique identifier for the rate limit (e.g., 'auth:user@email.com')
 * @param config - Rate limit configuration
 * @returns Object indicating if limited and remaining attempts
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // If within window, check count
  if (entry.count >= config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// ============================================
// CSRF PROTECTION
// ============================================

const CSRF_TOKEN_KEY = 'shoeswiper_csrf_token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  const token = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
  
  // Store in sessionStorage (survives page refreshes but not new tabs)
  try {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch {
    // Fallback if sessionStorage is not available
    if (import.meta.env.DEV) {
      console.warn('[Security] sessionStorage not available for CSRF token');
    }
  }
  
  return token;
}

/**
 * Get the current CSRF token (generates one if not exists)
 */
export function getCsrfToken(): string {
  try {
    let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (!token) {
      token = generateCsrfToken();
    }
    return token;
  } catch {
    // Fallback for environments without sessionStorage
    return generateCsrfToken();
  }
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  try {
    const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
    return storedToken !== null && storedToken === token;
  } catch {
    return false;
  }
}

/**
 * Regenerate CSRF token (call after successful form submission)
 */
export function regenerateCsrfToken(): string {
  return generateCsrfToken();
}

// ============================================
// SECURE SESSION HANDLING
// ============================================

const SESSION_TIMEOUT_KEY = 'shoeswiper_session_timeout';
const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Session configuration
 */
export interface SessionConfig {
  timeoutMs: number;
  onTimeout?: () => void;
}

/**
 * Update session activity timestamp
 */
export function updateSessionActivity(): void {
  try {
    sessionStorage.setItem(SESSION_TIMEOUT_KEY, Date.now().toString());
  } catch {
    // Ignore if sessionStorage not available
  }
}

/**
 * Check if session has expired
 */
export function isSessionExpired(timeoutMs: number = DEFAULT_SESSION_TIMEOUT): boolean {
  try {
    const lastActivity = sessionStorage.getItem(SESSION_TIMEOUT_KEY);
    if (!lastActivity) {
      return false; // No activity recorded yet
    }
    
    const lastActivityTime = parseInt(lastActivity, 10);
    return Date.now() - lastActivityTime > timeoutMs;
  } catch {
    return false;
  }
}

/**
 * Clear session data
 */
export function clearSession(): void {
  try {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_TIMEOUT_KEY);
  } catch {
    // Ignore if sessionStorage not available
  }
}

// ============================================
// CONTENT SECURITY POLICY HELPERS
// ============================================

/**
 * CSP directives for the application
 * Note: These should be applied at the server level (vercel.json or server headers)
 * This is provided as a reference and for dynamic CSP generation if needed
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Required for Vite in dev mode
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://generativelanguage.googleapis.com',
    'https://api.amazon.com',
  ],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
} as const;

/**
 * Generate CSP header string from directives
 */
export function generateCspHeader(directives: typeof CSP_DIRECTIVES = CSP_DIRECTIVES): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Security headers that should be set (for reference)
 * These should be configured in vercel.json or server configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

// ============================================
// SECURE STORAGE UTILITIES
// ============================================

/**
 * List of keys that should NEVER be stored in localStorage
 * These should only be in memory or server-side
 */
const FORBIDDEN_STORAGE_KEYS = [
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'access_token',
  'refresh_token',
  'private_key',
  'credit_card',
  'ssn',
  'social_security',
];

/**
 * Check if a key is safe to store in localStorage
 */
export function isSafeStorageKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return !FORBIDDEN_STORAGE_KEYS.some((forbidden) =>
    lowerKey.includes(forbidden)
  );
}

/**
 * Safe localStorage wrapper that prevents storing sensitive data
 */
export const secureStorage = {
  setItem(key: string, value: string): boolean {
    if (!isSafeStorageKey(key)) {
      if (import.meta.env.DEV) {
        console.error(`[Security] Attempted to store sensitive data with key: ${key}`);
      }
      return false;
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

// ============================================
// INPUT SANITIZATION WRAPPERS
// ============================================

/**
 * Sanitize user input for safe display (escapes HTML entities)
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  
  // Block dangerous protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '';
  }
  
  return trimmed;
}

/**
 * Validate and sanitize redirect URLs (prevent open redirect vulnerabilities)
 */
export function sanitizeRedirectUrl(url: string, allowedOrigins: string[] = []): string {
  if (typeof url !== 'string') return '/';
  
  const trimmed = url.trim();
  
  // Allow relative URLs starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  
  try {
    const parsed = new URL(trimmed);
    const currentOrigin = window.location.origin;
    
    // Allow same origin
    if (parsed.origin === currentOrigin) {
      return trimmed;
    }
    
    // Allow explicitly allowed origins
    if (allowedOrigins.includes(parsed.origin)) {
      return trimmed;
    }
  } catch {
    // Invalid URL, return home
  }
  
  return '/';
}

// ============================================
// SECURITY INITIALIZATION
// ============================================

let isSecurityInitialized = false;

/**
 * Initialize security features
 * Call this at app startup (in main.tsx)
 */
export function initializeSecurity(): void {
  if (isSecurityInitialized) return;
  
  // Generate initial CSRF token
  getCsrfToken();
  
  // Update session activity
  updateSessionActivity();
  
  // Set up activity listeners
  if (typeof window !== 'undefined') {
    const updateActivity = () => updateSessionActivity();
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('keypress', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
  }
  
  // Set up periodic cleanup of rate limits
  setInterval(() => {
    cleanupRateLimits();
  }, 60 * 1000); // Clean up every minute
  
  isSecurityInitialized = true;
  
  if (import.meta.env.DEV) {
    console.log('[Security] Security module initialized');
  }
}

// ============================================
// EXPORT TYPE DEFINITIONS
// ============================================

export type { RateLimitConfig, SessionConfig };
