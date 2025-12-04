import { describe, it, expect } from 'vitest';
import {
  getAffiliateUrl,
  getAffiliateUrlFromAsin,
  extractAsinFromUrl,
  AFFILIATE_TAG,
} from '../supabaseClient';

// ============================================
// AFFILIATE URL HELPER TESTS
// ============================================

describe('AFFILIATE_TAG constant', () => {
  it('should be shoeswiper-20', () => {
    expect(AFFILIATE_TAG).toBe('shoeswiper-20');
  });
});

describe('getAffiliateUrlFromAsin', () => {
  it('should build correct affiliate URL from ASIN', () => {
    const url = getAffiliateUrlFromAsin('B07QXLFLXT');
    expect(url).toBe('https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20');
  });

  it('should handle lowercase ASIN', () => {
    const url = getAffiliateUrlFromAsin('b07qxlflxt');
    expect(url).toContain('b07qxlflxt');
    expect(url).toContain('tag=shoeswiper-20');
  });
});

describe('getAffiliateUrl', () => {
  describe('URL without tag', () => {
    it('should add affiliate tag to URL without existing parameters', () => {
      const url = getAffiliateUrl('https://www.amazon.com/dp/B07QXLFLXT');
      expect(url).toContain('tag=shoeswiper-20');
    });

    it('should add affiliate tag to URL with existing parameters', () => {
      const url = getAffiliateUrl('https://www.amazon.com/dp/B07QXLFLXT?ref=sr_1_1');
      expect(url).toContain('tag=shoeswiper-20');
    });
  });

  describe('URL with correct tag', () => {
    it('should return URL unchanged if already has correct tag', () => {
      const original = 'https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20';
      const url = getAffiliateUrl(original);
      expect(url).toBe(original);
    });
  });

  describe('URL with incorrect tag', () => {
    it('should replace other affiliate tags with shoeswiper-20', () => {
      const url = getAffiliateUrl('https://www.amazon.com/dp/B07QXLFLXT?tag=other-tag-20');
      expect(url).toContain('tag=shoeswiper-20');
      expect(url).not.toContain('tag=other-tag-20');
    });

    it('should handle tag in middle of URL parameters', () => {
      const url = getAffiliateUrl('https://www.amazon.com/dp/B07QXLFLXT?ref=sr&tag=competitor-21&qid=12345');
      expect(url).toContain('tag=shoeswiper-20');
      expect(url).not.toContain('tag=competitor-21');
    });
  });

  describe('ASIN extraction', () => {
    it('should extract ASIN and build clean URL from dp format', () => {
      const url = getAffiliateUrl('https://www.amazon.com/Some-Product-Name/dp/B07QXLFLXT/ref=sr');
      expect(url).toBe('https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20');
    });

    it('should extract ASIN from gp/product format', () => {
      const url = getAffiliateUrl('https://www.amazon.com/gp/product/B07QXLFLXT');
      expect(url).toBe('https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for empty input', () => {
      const url = getAffiliateUrl('');
      expect(url).toBe('');
    });

    it('should handle null-like input', () => {
      // @ts-expect-error Testing runtime behavior
      const url = getAffiliateUrl(null);
      expect(url).toBe(null);
    });

    it('should handle non-Amazon URL gracefully', () => {
      const url = getAffiliateUrl('https://example.com/product');
      expect(url).toContain('tag=shoeswiper-20');
    });
  });
});

describe('extractAsinFromUrl', () => {
  describe('dp format', () => {
    it('should extract ASIN from standard dp URL', () => {
      const asin = extractAsinFromUrl('https://www.amazon.com/dp/B07QXLFLXT');
      expect(asin).toBe('B07QXLFLXT');
    });

    it('should extract ASIN from dp URL with extra path', () => {
      const asin = extractAsinFromUrl('https://www.amazon.com/Nike-Air/dp/B07QXLFLXT/ref=sr');
      expect(asin).toBe('B07QXLFLXT');
    });
  });

  describe('gp/product format', () => {
    it('should extract ASIN from gp/product URL', () => {
      const asin = extractAsinFromUrl('https://www.amazon.com/gp/product/B07QXLFLXT');
      expect(asin).toBe('B07QXLFLXT');
    });
  });

  describe('asin parameter format', () => {
    it('should extract ASIN from query parameter', () => {
      const asin = extractAsinFromUrl('https://www.amazon.com?asin=B07QXLFLXT');
      expect(asin).toBe('B07QXLFLXT');
    });
  });

  describe('invalid URLs', () => {
    it('should return null for URL without ASIN', () => {
      const asin = extractAsinFromUrl('https://www.amazon.com/search?q=shoes');
      expect(asin).toBeNull();
    });

    it('should return null for empty string', () => {
      const asin = extractAsinFromUrl('');
      expect(asin).toBeNull();
    });

    it('should return null for invalid ASIN format', () => {
      const asin = extractAsinFromUrl('https://www.amazon.com/dp/SHORT');
      expect(asin).toBeNull();
    });
  });
});
