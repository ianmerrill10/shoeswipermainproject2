import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { amazon_asin: 'B08N5WRWNW', amazon_url: 'https://amazon.com/dp/B08N5WRWNW' }, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
  AFFILIATE_TAG: 'shoeswiper-20',
}));

import {
  analyzeOutfit,
  trackAffiliateClick,
  createCheckoutSession,
  matchShoesForOutfit,
  trackAnalyticsEvent,
} from '../edgeFunctionsApi';
import { supabase } from '../supabaseClient';

describe('edgeFunctionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // ANALYZE OUTFIT TESTS
  // ============================================

  describe('analyzeOutfit', () => {
    it('should return error for empty image data', async () => {
      const result = await analyzeOutfit('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid image data provided');
        expect(result.fallback).toBe(true);
      }
    });

    it('should return error for null image data', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await analyzeOutfit(null as any);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid image data provided');
      }
    });

    it('should return error for image larger than 10MB', async () => {
      const largeImage = 'a'.repeat(11 * 1024 * 1024);
      const result = await analyzeOutfit(largeImage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Image too large. Maximum size is 10MB.');
      }
    });

    it('should strip data URL prefix from base64 image', async () => {
      const mockResponse = {
        rating: 8,
        feedback: 'Great outfit!',
        style_tags: ['streetwear'],
        dominant_colors: ['black'],
        detected_shoe: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      });

      const imageWithPrefix = 'data:image/jpeg;base64,/9j/4AAQ...';
      const result = await analyzeOutfit(imageWithPrefix);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-outfit', {
        body: { image: '/9j/4AAQ...' },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rating).toBe(8);
      }
    });

    it('should return error when Edge Function fails', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Function error', name: 'FunctionError' },
      });

      const result = await analyzeOutfit('validBase64Image');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Function error');
      }
    });

    it('should return error when response contains error field', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { error: 'AI service unavailable', fallback: true },
        error: null,
      });

      const result = await analyzeOutfit('validBase64Image');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('AI service unavailable');
        expect(result.fallback).toBe(true);
      }
    });
  });

  // ============================================
  // TRACK AFFILIATE CLICK TESTS
  // ============================================

  describe('trackAffiliateClick', () => {
    it('should return error for invalid UUID format', async () => {
      const result = await trackAffiliateClick('invalid-uuid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid shoe ID format');
      }
    });

    it('should return error for empty shoe ID', async () => {
      const result = await trackAffiliateClick('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid shoe ID format');
      }
    });

    it('should successfully track click with valid UUID', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          success: true,
          tracked: true,
          affiliateUrl: `https://www.amazon.com/dp/B08N5WRWNW?tag=shoeswiper-20`,
          message: 'Click tracked successfully',
        },
        error: null,
      });

      const result = await trackAffiliateClick(validUUID);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tracked).toBe(true);
        expect(result.data.affiliateUrl).toContain('shoeswiper-20');
      }
    });

    it('should include source and metadata in request', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          success: true,
          tracked: true,
          message: 'Click tracked successfully',
        },
        error: null,
      });

      await trackAffiliateClick(validUUID, 'search', { category: 'sneakers' });

      expect(supabase.functions.invoke).toHaveBeenCalledWith('track-affiliate', {
        body: {
          shoeId: validUUID,
          source: 'search',
          metadata: { category: 'sneakers' },
        },
      });
    });
  });

  // ============================================
  // CREATE CHECKOUT SESSION TESTS
  // ============================================

  describe('createCheckoutSession', () => {
    it('should return error for empty items array', async () => {
      const result = await createCheckoutSession({
        items: [],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('At least one item is required');
      }
    });

    it('should return error for missing success URL', async () => {
      const result = await createCheckoutSession({
        items: [{ priceId: 'price_123', quantity: 1 }],
        successUrl: '',
        cancelUrl: 'https://example.com/cancel',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Success and cancel URLs are required');
      }
    });

    it('should return error for missing cancel URL', async () => {
      const result = await createCheckoutSession({
        items: [{ priceId: 'price_123', quantity: 1 }],
        successUrl: 'https://example.com/success',
        cancelUrl: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Success and cancel URLs are required');
      }
    });

    it('should return error for invalid URL format', async () => {
      const result = await createCheckoutSession({
        items: [{ priceId: 'price_123', quantity: 1 }],
        successUrl: 'not-a-valid-url',
        cancelUrl: 'https://example.com/cancel',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid success or cancel URL');
      }
    });

    it('should successfully create checkout session', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          sessionId: 'cs_123',
          url: 'https://checkout.stripe.com/session/cs_123',
        },
        error: null,
      });

      const result = await createCheckoutSession({
        items: [{ priceId: 'price_123', quantity: 1 }],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessionId).toBe('cs_123');
        expect(result.data.url).toContain('stripe.com');
      }
    });
  });

  // ============================================
  // MATCH SHOES FOR OUTFIT TESTS
  // ============================================

  describe('matchShoesForOutfit', () => {
    it('should return matched shoes with affiliate tags', async () => {
      const mockShoes = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Air Jordan 1',
          brand: 'Nike',
          price: 170,
          image_url: 'https://example.com/shoe.jpg',
          amazon_url: 'https://amazon.com/dp/B08N5WRWNW',
          style_tags: ['streetwear'],
          color_tags: ['black'],
          match_score: 80,
        },
      ];

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockShoes,
        error: null,
      });

      const result = await matchShoesForOutfit(['streetwear'], ['black']);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].amazon_url).toContain('shoeswiper-20');
      }
    });

    it('should handle RPC error gracefully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error', details: '', hint: '', code: '' },
      });

      const result = await matchShoesForOutfit(['streetwear'], ['black']);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Database error');
      }
    });

    it('should not duplicate affiliate tag if already present', async () => {
      const mockShoes = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Air Jordan 1',
          brand: 'Nike',
          price: 170,
          image_url: 'https://example.com/shoe.jpg',
          amazon_url: 'https://amazon.com/dp/B08N5WRWNW?tag=shoeswiper-20',
          style_tags: ['streetwear'],
          color_tags: ['black'],
          match_score: 80,
        },
      ];

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockShoes,
        error: null,
      });

      const result = await matchShoesForOutfit(['streetwear'], ['black']);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should not have duplicate tag
        const tagMatches = result.data[0].amazon_url.match(/shoeswiper-20/g);
        expect(tagMatches?.length).toBe(1);
      }
    });
  });

  // ============================================
  // TRACK ANALYTICS EVENT TESTS
  // ============================================

  describe('trackAnalyticsEvent', () => {
    it('should successfully track shoe_view event', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await trackAnalyticsEvent('shoe_view', { shoe_id: '123' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tracked).toBe(true);
      }
    });

    it('should return tracked: false on database error but not fail', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await trackAnalyticsEvent('shoe_click', { shoe_id: '123' });

      // Should still succeed but with tracked: false
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tracked).toBe(false);
      }
    });

    it('should track all supported event types', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const eventTypes = [
        'shoe_view',
        'shoe_click',
        'music_click',
        'panel_open',
        'share',
        'favorite',
        'swipe',
      ] as const;

      for (const eventType of eventTypes) {
        const result = await trackAnalyticsEvent(eventType, { shoe_id: '123' });
        expect(result.success).toBe(true);
      }
    });
  });
});
