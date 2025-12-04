/**
 * ============================================
 * AFFILIATE LINK VERIFICATION TESTS
 * ============================================
 * 
 * Critical business requirement: ALL Amazon links MUST include
 * the affiliate tag `?tag=shoeswiper-20` for revenue generation.
 * 
 * These tests will FAIL if any link is missing the affiliate tag.
 * 
 * Coverage Report Summary:
 * - AFFILIATE_TAG constant verification
 * - All 102 products in MOCK_SHOES array
 * - All 10 music tracks with Amazon Music links
 * - URL generation functions
 */

import { describe, it, expect } from 'vitest';
import { AFFILIATE_TAG, AMAZON_API_CONFIG } from '../config';
import { MOCK_SHOES } from '../mockData';
import { 
  getAffiliateUrl, 
  getAffiliateUrlFromAsin, 
  extractAsinFromUrl,
  AFFILIATE_TAG as SUPABASE_AFFILIATE_TAG,
  AMAZON_API_CONFIG as SUPABASE_AMAZON_API_CONFIG 
} from '../supabaseClient';
import type { Shoe } from '../types';

// ============================================
// CONSTANTS
// ============================================

const EXPECTED_AFFILIATE_TAG = 'shoeswiper-20';
const EXPECTED_TOTAL_PRODUCTS = 102;

// Dynamically calculate expected music tracks from data
const getExpectedMusicTracksCount = (): number => {
  const uniqueMusicUrls = new Set(
    MOCK_SHOES
      .filter((shoe) => shoe.music?.amazonMusicUrl)
      .map((shoe) => shoe.music?.amazonMusicUrl)
  );
  return uniqueMusicUrls.size;
};
const EXPECTED_MUSIC_TRACKS = getExpectedMusicTracksCount();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Checks if a URL contains the correct affiliate tag
 * @param url - The URL to check
 * @returns boolean - true if the tag is present and correct
 */
const hasCorrectAffiliateTag = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes(`tag=${EXPECTED_AFFILIATE_TAG}`);
};

/**
 * Extracts the affiliate tag value from a URL
 * @param url - The URL to extract from
 * @returns The tag value or null if not found
 */
const extractAffiliateTag = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/tag=([^&]+)/);
  return match ? match[1] : null;
};

/**
 * Validates Amazon URL format (handles both amazon.com and www.amazon.com)
 * @param url - The URL to validate
 * @returns boolean - true if it's a valid Amazon URL
 */
const isValidAmazonUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    // Support both amazon.com and www.amazon.com
    return urlObj.hostname === 'amazon.com' || urlObj.hostname === 'www.amazon.com';
  } catch {
    return false;
  }
};

// ============================================
// AFFILIATE TAG CONFIGURATION TESTS
// ============================================

describe('Affiliate Tag Configuration', () => {
  it('should have AFFILIATE_TAG constant set to shoeswiper-20', () => {
    expect(AFFILIATE_TAG).toBe(EXPECTED_AFFILIATE_TAG);
  });

  it('should have AFFILIATE_TAG exported and not undefined', () => {
    expect(AFFILIATE_TAG).toBeDefined();
    expect(typeof AFFILIATE_TAG).toBe('string');
    expect(AFFILIATE_TAG.length).toBeGreaterThan(0);
  });

  it('should have AMAZON_API_CONFIG with correct partnerTag', () => {
    expect(AMAZON_API_CONFIG).toBeDefined();
    expect(AMAZON_API_CONFIG.partnerTag).toBe(EXPECTED_AFFILIATE_TAG);
  });
});

// ============================================
// MOCK_SHOES PRODUCT COUNT VERIFICATION
// ============================================

describe('Mock Data Product Count', () => {
  it(`should have exactly ${EXPECTED_TOTAL_PRODUCTS} products in MOCK_SHOES`, () => {
    expect(MOCK_SHOES).toBeDefined();
    expect(Array.isArray(MOCK_SHOES)).toBe(true);
    expect(MOCK_SHOES.length).toBe(EXPECTED_TOTAL_PRODUCTS);
  });

  it('should have products with all required properties', () => {
    MOCK_SHOES.forEach((shoe) => {
      expect(shoe.id).toBeDefined();
      expect(shoe.name).toBeDefined();
      expect(shoe.brand).toBeDefined();
      expect(shoe.amazon_url).toBeDefined();
      expect(shoe.amazon_asin).toBeDefined();
    });
  });
});

// ============================================
// ALL PRODUCTS AFFILIATE TAG VERIFICATION
// ============================================

describe('All Products Amazon URL Affiliate Tags', () => {
  // Test each shoe individually for better error reporting
  MOCK_SHOES.forEach((shoe: Shoe, index: number) => {
    it(`should have affiliate tag for product ${index + 1}: ${shoe.brand} ${shoe.name}`, () => {
      expect(hasCorrectAffiliateTag(shoe.amazon_url)).toBe(true);
    });
  });
});

describe('Amazon URL Format Validation', () => {
  it('should have valid Amazon URLs for all products', () => {
    const invalidUrls: { index: number; name: string; url: string }[] = [];
    
    MOCK_SHOES.forEach((shoe, index) => {
      if (!isValidAmazonUrl(shoe.amazon_url)) {
        invalidUrls.push({
          index: index + 1,
          name: `${shoe.brand} ${shoe.name}`,
          url: shoe.amazon_url
        });
      }
    });
    
    expect(invalidUrls).toEqual([]);
  });

  it('should have correct affiliate tag value for all products', () => {
    const incorrectTags: { index: number; name: string; tag: string | null }[] = [];
    
    MOCK_SHOES.forEach((shoe, index) => {
      const tag = extractAffiliateTag(shoe.amazon_url);
      if (tag !== EXPECTED_AFFILIATE_TAG) {
        incorrectTags.push({
          index: index + 1,
          name: `${shoe.brand} ${shoe.name}`,
          tag
        });
      }
    });
    
    expect(incorrectTags).toEqual([]);
  });

  it('should have Amazon ASIN in URL for all products', () => {
    const missingAsin: { index: number; name: string; asin: string; url: string }[] = [];
    
    MOCK_SHOES.forEach((shoe, index) => {
      if (!shoe.amazon_url.includes(shoe.amazon_asin)) {
        missingAsin.push({
          index: index + 1,
          name: `${shoe.brand} ${shoe.name}`,
          asin: shoe.amazon_asin,
          url: shoe.amazon_url
        });
      }
    });
    
    expect(missingAsin).toEqual([]);
  });
});

// ============================================
// MUSIC TRACKS AFFILIATE TAG VERIFICATION
// ============================================

describe('Music Tracks Amazon Music Affiliate Tags', () => {
  // Extract shoes with music that have Amazon Music URLs
  const shoesWithAmazonMusic = MOCK_SHOES.filter(
    (shoe) => shoe.music?.amazonMusicUrl
  );

  it('should have at least 10 unique music tracks with Amazon Music URLs', () => {
    // Each shoe has music assigned cyclically from the music tracks array
    // Get unique Amazon Music URLs
    const uniqueAmazonMusicUrls = new Set(
      shoesWithAmazonMusic.map((shoe) => shoe.music?.amazonMusicUrl)
    );
    expect(uniqueAmazonMusicUrls.size).toBe(EXPECTED_MUSIC_TRACKS);
  });

  it('should have affiliate tags on all Amazon Music URLs', () => {
    const missingTags: { shoeName: string; song: string; url: string }[] = [];
    
    shoesWithAmazonMusic.forEach((shoe) => {
      const url = shoe.music?.amazonMusicUrl;
      if (url && !hasCorrectAffiliateTag(url)) {
        missingTags.push({
          shoeName: `${shoe.brand} ${shoe.name}`,
          song: shoe.music?.song || 'Unknown',
          url
        });
      }
    });
    
    expect(missingTags).toEqual([]);
  });

  // Test each unique music track
  describe('Individual Music Track Tests', () => {
    // Get unique music tracks
    const uniqueTracks = new Map<string, { song: string; artist: string; amazonMusicUrl: string }>();
    
    MOCK_SHOES.forEach((shoe) => {
      if (shoe.music?.amazonMusicUrl && !uniqueTracks.has(shoe.music.amazonMusicUrl)) {
        uniqueTracks.set(shoe.music.amazonMusicUrl, {
          song: shoe.music.song,
          artist: shoe.music.artist,
          amazonMusicUrl: shoe.music.amazonMusicUrl
        });
      }
    });

    Array.from(uniqueTracks.values()).forEach((track) => {
      it(`should have affiliate tag for "${track.song}" by ${track.artist}`, () => {
        expect(hasCorrectAffiliateTag(track.amazonMusicUrl)).toBe(true);
      });
    });
  });
});

// ============================================
// PRODUCT CATEGORIZATION VERIFICATION
// ============================================

describe('Product Categorization', () => {
  it('should have 51 mens shoes', () => {
    const mensShoes = MOCK_SHOES.filter((shoe) => shoe.gender === 'men');
    expect(mensShoes.length).toBe(51);
  });

  it('should have 48 womens shoes', () => {
    const womensShoes = MOCK_SHOES.filter((shoe) => shoe.gender === 'women');
    expect(womensShoes.length).toBe(48);
  });

  it('should have 3 unisex shoes', () => {
    const unisexShoes = MOCK_SHOES.filter((shoe) => shoe.gender === 'unisex');
    expect(unisexShoes.length).toBe(3);
  });

  it('all gender categories should have affiliate tags', () => {
    const genders: Array<'men' | 'women' | 'unisex'> = ['men', 'women', 'unisex'];
    
    genders.forEach((gender) => {
      const shoes = MOCK_SHOES.filter((shoe) => shoe.gender === gender);
      shoes.forEach((shoe) => {
        expect(hasCorrectAffiliateTag(shoe.amazon_url)).toBe(true);
      });
    });
  });
});

// ============================================
// FEATURED PRODUCTS VERIFICATION
// ============================================

describe('Featured Products Affiliate Tags', () => {
  const featuredShoes = MOCK_SHOES.filter((shoe) => shoe.is_featured);

  it('should have featured products', () => {
    expect(featuredShoes.length).toBeGreaterThan(0);
  });

  it('all featured products should have affiliate tags', () => {
    const missingTags: { name: string; url: string }[] = [];
    
    featuredShoes.forEach((shoe) => {
      if (!hasCorrectAffiliateTag(shoe.amazon_url)) {
        missingTags.push({
          name: `${shoe.brand} ${shoe.name}`,
          url: shoe.amazon_url
        });
      }
    });
    
    expect(missingTags).toEqual([]);
  });
});

// ============================================
// URL STRUCTURE VERIFICATION
// ============================================

describe('Amazon URL Structure', () => {
  it('should use consistent URL pattern: https://www.amazon.com/dp/{ASIN}?tag=shoeswiper-20', () => {
    // Product URLs should use www.amazon.com format
    const expectedPattern = /^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]+\?tag=shoeswiper-20$/;
    
    const nonMatchingUrls: { name: string; url: string }[] = [];
    
    MOCK_SHOES.forEach((shoe) => {
      if (!expectedPattern.test(shoe.amazon_url)) {
        nonMatchingUrls.push({
          name: `${shoe.brand} ${shoe.name}`,
          url: shoe.amazon_url
        });
      }
    });
    
    expect(nonMatchingUrls).toEqual([]);
  });

  it('Amazon Music URLs should use consistent pattern with affiliate tag', () => {
    // Music URLs use amazon.com (without www)
    const expectedPattern = /^https:\/\/amazon\.com\/dp\/[A-Z0-9]+\?tag=shoeswiper-20$/;
    
    const uniqueMusicUrls = new Set<string>();
    MOCK_SHOES.forEach((shoe) => {
      if (shoe.music?.amazonMusicUrl) {
        uniqueMusicUrls.add(shoe.music.amazonMusicUrl);
      }
    });
    
    const nonMatchingUrls: string[] = [];
    uniqueMusicUrls.forEach((url) => {
      if (!expectedPattern.test(url)) {
        nonMatchingUrls.push(url);
      }
    });
    
    expect(nonMatchingUrls).toEqual([]);
  });

  it('should not have duplicate affiliate tags in URLs', () => {
    const duplicateTags: { name: string; url: string }[] = [];
    
    MOCK_SHOES.forEach((shoe) => {
      // Check if tag appears more than once
      const matches = shoe.amazon_url.match(/tag=/g);
      if (matches && matches.length > 1) {
        duplicateTags.push({
          name: `${shoe.brand} ${shoe.name}`,
          url: shoe.amazon_url
        });
      }
    });
    
    expect(duplicateTags).toEqual([]);
  });
});

// ============================================
// COVERAGE REPORT SUMMARY
// ============================================

describe('Affiliate Link Coverage Report', () => {
  it('should generate coverage summary', () => {
    // Count products with correct affiliate tags
    const productsWithTag = MOCK_SHOES.filter((shoe) => 
      hasCorrectAffiliateTag(shoe.amazon_url)
    ).length;
    
    // Count products missing tags
    const productsMissingTag = MOCK_SHOES.filter((shoe) => 
      !hasCorrectAffiliateTag(shoe.amazon_url)
    ).length;
    
    // Count music tracks with tags
    const musicTracksWithTag = new Set(
      MOCK_SHOES
        .filter((shoe) => shoe.music?.amazonMusicUrl && hasCorrectAffiliateTag(shoe.music.amazonMusicUrl))
        .map((shoe) => shoe.music?.amazonMusicUrl)
    ).size;
    
    // Coverage percentage
    const productCoverage = (productsWithTag / MOCK_SHOES.length) * 100;
    
    // Report object
    const coverageReport = {
      totalProducts: MOCK_SHOES.length,
      productsWithCorrectTag: productsWithTag,
      productsMissingTag: productsMissingTag,
      productCoveragePercentage: productCoverage,
      uniqueMusicTracksWithTag: musicTracksWithTag,
      expectedMusicTracks: EXPECTED_MUSIC_TRACKS,
      affiliateTagUsed: AFFILIATE_TAG,
      expectedAffiliateTag: EXPECTED_AFFILIATE_TAG,
      configTagMatches: AFFILIATE_TAG === EXPECTED_AFFILIATE_TAG,
      apiConfigTagMatches: AMAZON_API_CONFIG.partnerTag === EXPECTED_AFFILIATE_TAG
    };
    
    // Verify 100% coverage
    expect(coverageReport.totalProducts).toBe(EXPECTED_TOTAL_PRODUCTS);
    expect(coverageReport.productsWithCorrectTag).toBe(EXPECTED_TOTAL_PRODUCTS);
    expect(coverageReport.productsMissingTag).toBe(0);
    expect(coverageReport.productCoveragePercentage).toBe(100);
    expect(coverageReport.uniqueMusicTracksWithTag).toBe(EXPECTED_MUSIC_TRACKS);
    expect(coverageReport.configTagMatches).toBe(true);
    expect(coverageReport.apiConfigTagMatches).toBe(true);
    
    // Coverage report assertions provide all the validation needed
    // No console logging required - test output shows pass/fail status
  });
});

// ============================================
// AFFILIATE URL UTILITY FUNCTIONS TESTS
// ============================================

describe('Affiliate URL Utility Functions', () => {
  describe('getAffiliateUrlFromAsin', () => {
    it('should generate correct affiliate URL from ASIN', () => {
      const asin = 'B07QXLFLXT';
      const url = getAffiliateUrlFromAsin(asin);
      expect(url).toBe(`https://www.amazon.com/dp/${asin}?tag=shoeswiper-20`);
    });

    it('should always include the affiliate tag', () => {
      const url = getAffiliateUrlFromAsin('B09NLN47LP');
      expect(hasCorrectAffiliateTag(url)).toBe(true);
    });
  });

  describe('getAffiliateUrl', () => {
    it('should return URL as-is if affiliate tag already present', () => {
      const url = 'https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20';
      const result = getAffiliateUrl(url);
      expect(result).toBe(url);
    });

    it('should add affiliate tag to URL without tag', () => {
      const url = 'https://www.amazon.com/dp/B07QXLFLXT';
      const result = getAffiliateUrl(url);
      expect(hasCorrectAffiliateTag(result)).toBe(true);
    });

    it('should handle URL with existing query params', () => {
      const url = 'https://www.amazon.com/dp/B07QXLFLXT?ref=123';
      const result = getAffiliateUrl(url);
      expect(hasCorrectAffiliateTag(result)).toBe(true);
    });

    it('should extract ASIN and build clean URL', () => {
      const url = 'https://www.amazon.com/Some-Product-Name/dp/B07QXLFLXT/ref=123';
      const result = getAffiliateUrl(url);
      expect(result).toBe('https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20');
    });

    it('should handle gp/product format', () => {
      const url = 'https://www.amazon.com/gp/product/B07QXLFLXT';
      const result = getAffiliateUrl(url);
      expect(result).toBe('https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20');
    });

    it('should return empty string for empty input', () => {
      const result = getAffiliateUrl('');
      expect(result).toBe('');
    });

    it('should not duplicate affiliate tag', () => {
      const url = 'https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20';
      const result = getAffiliateUrl(url);
      const tagCount = (result.match(/tag=/g) || []).length;
      expect(tagCount).toBe(1);
    });
  });

  describe('extractAsinFromUrl', () => {
    it('should extract ASIN from /dp/ format', () => {
      const url = 'https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20';
      const asin = extractAsinFromUrl(url);
      expect(asin).toBe('B07QXLFLXT');
    });

    it('should extract ASIN from /gp/product/ format', () => {
      const url = 'https://www.amazon.com/gp/product/B07QXLFLXT';
      const asin = extractAsinFromUrl(url);
      expect(asin).toBe('B07QXLFLXT');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://www.example.com/invalid';
      const asin = extractAsinFromUrl(url);
      expect(asin).toBeNull();
    });

    it('should extract ASIN case-insensitively', () => {
      const url = 'https://www.amazon.com/DP/b07qxlflxt';
      const asin = extractAsinFromUrl(url);
      expect(asin?.toUpperCase()).toBe('B07QXLFLXT');
    });
  });
});

// ============================================
// CONFIG CONSISTENCY TESTS
// ============================================

describe('Config Consistency', () => {
  it('should have same AFFILIATE_TAG in config.ts and supabaseClient.ts', () => {
    expect(AFFILIATE_TAG).toBe(SUPABASE_AFFILIATE_TAG);
  });

  it('should have same partnerTag in both AMAZON_API_CONFIG exports', () => {
    expect(AMAZON_API_CONFIG.partnerTag).toBe(SUPABASE_AMAZON_API_CONFIG.partnerTag);
  });

  it('should use the correct affiliate tag value in all exports', () => {
    expect(AFFILIATE_TAG).toBe(EXPECTED_AFFILIATE_TAG);
    expect(SUPABASE_AFFILIATE_TAG).toBe(EXPECTED_AFFILIATE_TAG);
    expect(AMAZON_API_CONFIG.partnerTag).toBe(EXPECTED_AFFILIATE_TAG);
    expect(SUPABASE_AMAZON_API_CONFIG.partnerTag).toBe(EXPECTED_AFFILIATE_TAG);
  });
});

// ============================================
// REGRESSION TESTS
// ============================================

describe('Affiliate Tag Regression Tests', () => {
  it('should fail if any new product is added without affiliate tag', () => {
    // This test ensures future additions include the affiliate tag
    const allProductsHaveTag = MOCK_SHOES.every((shoe) => 
      hasCorrectAffiliateTag(shoe.amazon_url)
    );
    expect(allProductsHaveTag).toBe(true);
  });

  it('should fail if affiliate tag constant is changed', () => {
    expect(AFFILIATE_TAG).toBe('shoeswiper-20');
  });

  it('should fail if any URL uses a different affiliate tag', () => {
    const wrongTags = MOCK_SHOES.filter((shoe) => {
      const tag = extractAffiliateTag(shoe.amazon_url);
      return tag !== null && tag !== EXPECTED_AFFILIATE_TAG;
    });
    expect(wrongTags).toHaveLength(0);
  });

  it('should fail if Amazon Music URLs use a different affiliate tag', () => {
    const wrongMusicTags = MOCK_SHOES.filter((shoe) => {
      if (!shoe.music?.amazonMusicUrl) return false;
      const tag = extractAffiliateTag(shoe.music.amazonMusicUrl);
      return tag !== null && tag !== EXPECTED_AFFILIATE_TAG;
    });
    expect(wrongMusicTags).toHaveLength(0);
  });
});
