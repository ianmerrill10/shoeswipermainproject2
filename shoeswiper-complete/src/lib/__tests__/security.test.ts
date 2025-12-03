import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  checkRateLimit,
  clearRateLimit,
  generateCsrfToken,
  getCsrfToken,
  validateCsrfToken,
  regenerateCsrfToken,
  updateSessionActivity,
  isSessionExpired,
  clearSession,
  isSafeStorageKey,
  secureStorage,
  escapeHtml,
  sanitizeUrl,
  sanitizeRedirectUrl,
  RATE_LIMITS,
} from '../security';

// ============================================
// RATE LIMITING TESTS
// ============================================

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    clearRateLimit('test-key');
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('test-key', { maxRequests: 5, windowMs: 60000 });
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(4);
    });

    it('should track multiple requests', () => {
      const config = { maxRequests: 3, windowMs: 60000 };
      
      checkRateLimit('test-key', config);
      checkRateLimit('test-key', config);
      const result = checkRateLimit('test-key', config);
      
      expect(result.limited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should use different keys independently', () => {
      const config = { maxRequests: 2, windowMs: 60000 };
      
      checkRateLimit('key-1', config);
      checkRateLimit('key-1', config);
      const key1Result = checkRateLimit('key-1', config);
      const key2Result = checkRateLimit('key-2', config);
      
      expect(key1Result.limited).toBe(true);
      expect(key2Result.limited).toBe(false);
    });
  });

  describe('RATE_LIMITS', () => {
    it('should have auth rate limit configured', () => {
      expect(RATE_LIMITS.auth.maxRequests).toBe(5);
      expect(RATE_LIMITS.auth.windowMs).toBe(15 * 60 * 1000);
    });

    it('should have search rate limit configured', () => {
      expect(RATE_LIMITS.search.maxRequests).toBe(30);
      expect(RATE_LIMITS.search.windowMs).toBe(60 * 1000);
    });
  });
});

// ============================================
// CSRF PROTECTION TESTS
// ============================================

describe('CSRF Protection', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('generateCsrfToken', () => {
    it('should generate a token', () => {
      const token = generateCsrfToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes * 2 hex chars
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      clearSession();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('getCsrfToken', () => {
    it('should return stored token if exists', () => {
      const token = generateCsrfToken();
      const retrieved = getCsrfToken();
      expect(retrieved).toBe(token);
    });

    it('should generate new token if none exists', () => {
      const token = getCsrfToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64);
    });
  });

  describe('validateCsrfToken', () => {
    it('should validate correct token', () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(token)).toBe(true);
    });

    it('should reject invalid token', () => {
      generateCsrfToken();
      expect(validateCsrfToken('invalid-token')).toBe(false);
    });

    it('should reject empty token', () => {
      generateCsrfToken();
      expect(validateCsrfToken('')).toBe(false);
    });

    it('should reject null token', () => {
      generateCsrfToken();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(validateCsrfToken(null as any)).toBe(false);
    });
  });

  describe('regenerateCsrfToken', () => {
    it('should generate new token', () => {
      const token1 = generateCsrfToken();
      const token2 = regenerateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });
});

// ============================================
// SESSION HANDLING TESTS
// ============================================

describe('Session Handling', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('updateSessionActivity', () => {
    it('should update session timestamp', () => {
      updateSessionActivity();
      const stored = sessionStorage.getItem('shoeswiper_session_timeout');
      expect(stored).toBeDefined();
      expect(parseInt(stored!, 10)).toBeGreaterThan(0);
    });
  });

  describe('isSessionExpired', () => {
    it('should return false when no activity recorded', () => {
      expect(isSessionExpired()).toBe(false);
    });

    it('should return false for recent activity', () => {
      updateSessionActivity();
      expect(isSessionExpired(60000)).toBe(false);
    });

    it('should return true for expired session', () => {
      sessionStorage.setItem('shoeswiper_session_timeout', (Date.now() - 100000).toString());
      expect(isSessionExpired(50000)).toBe(true);
    });
  });

  describe('clearSession', () => {
    it('should clear session data', () => {
      generateCsrfToken();
      updateSessionActivity();
      clearSession();
      expect(sessionStorage.getItem('shoeswiper_csrf_token')).toBeNull();
      expect(sessionStorage.getItem('shoeswiper_session_timeout')).toBeNull();
    });
  });
});

// ============================================
// SECURE STORAGE TESTS
// ============================================

describe('Secure Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isSafeStorageKey', () => {
    it('should allow safe keys', () => {
      expect(isSafeStorageKey('user_preferences')).toBe(true);
      expect(isSafeStorageKey('theme')).toBe(true);
      expect(isSafeStorageKey('cart_items')).toBe(true);
    });

    it('should block sensitive keys', () => {
      expect(isSafeStorageKey('password')).toBe(false);
      expect(isSafeStorageKey('access_token')).toBe(false);
      expect(isSafeStorageKey('api_key')).toBe(false);
      expect(isSafeStorageKey('user_password')).toBe(false);
      expect(isSafeStorageKey('TOKEN')).toBe(false);
    });
  });

  describe('secureStorage', () => {
    it('should store safe keys', () => {
      const result = secureStorage.setItem('theme', 'dark');
      expect(result).toBe(true);
      expect(secureStorage.getItem('theme')).toBe('dark');
    });

    it('should reject sensitive keys', () => {
      const result = secureStorage.setItem('password', 'secret123');
      expect(result).toBe(false);
      expect(localStorage.getItem('password')).toBeNull();
    });

    it('should retrieve items', () => {
      localStorage.setItem('test', 'value');
      expect(secureStorage.getItem('test')).toBe('value');
    });

    it('should remove items', () => {
      localStorage.setItem('test', 'value');
      secureStorage.removeItem('test');
      expect(localStorage.getItem('test')).toBeNull();
    });
  });
});

// ============================================
// INPUT SANITIZATION TESTS
// ============================================

describe('Input Sanitization', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
      expect(escapeHtml("'test'")).toBe('&#x27;test&#x27;');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(escapeHtml(123 as any)).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
    });

    it('should block javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
    });

    it('should block data: URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should block vbscript: URLs', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('should block file: URLs', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    });

    it('should handle empty input', () => {
      expect(sanitizeUrl('')).toBe('');
    });
  });

  describe('sanitizeRedirectUrl', () => {
    // Mock window.location for tests
    const originalLocation = window.location;
    
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://shoeswiper.com' },
        writable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('should allow relative URLs', () => {
      expect(sanitizeRedirectUrl('/dashboard')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('/user/profile')).toBe('/user/profile');
    });

    it('should block protocol-relative URLs', () => {
      expect(sanitizeRedirectUrl('//evil.com')).toBe('/');
    });

    it('should allow same-origin URLs', () => {
      expect(sanitizeRedirectUrl('https://shoeswiper.com/path')).toBe('https://shoeswiper.com/path');
    });

    it('should block different-origin URLs', () => {
      expect(sanitizeRedirectUrl('https://evil.com')).toBe('/');
    });

    it('should allow explicitly allowed origins', () => {
      const result = sanitizeRedirectUrl('https://trusted.com/path', ['https://trusted.com']);
      expect(result).toBe('https://trusted.com/path');
    });

    it('should handle invalid URLs', () => {
      expect(sanitizeRedirectUrl('not a url')).toBe('/');
    });
  });
});
