// ============================================
// EDGE FUNCTIONS API SERVICE
// Centralized service for calling Supabase Edge Functions
// ============================================

import { supabase } from './supabaseClient';
import { AFFILIATE_TAG } from './config';

// ============================================
// TYPES
// ============================================

/**
 * Outfit analysis request payload
 */
export interface AnalyzeOutfitRequest {
  image: string; // Base64 encoded image data (without prefix)
}

/**
 * Outfit analysis response from Gemini Vision API
 */
export interface AnalyzeOutfitResponse {
  rating: number; // 1-10 rating
  feedback: string; // Personalized style feedback
  style_tags: string[]; // Detected style tags
  dominant_colors: string[]; // Dominant colors in the outfit
  detected_shoe: string | null; // Description of shoes if visible
}

/**
 * Affiliate click tracking request
 */
export interface TrackAffiliateRequest {
  shoeId: string;
  source?: string; // Where the click originated (feed, search, etc.)
  metadata?: Record<string, unknown>; // Additional tracking data
}

/**
 * Affiliate click tracking response
 */
export interface TrackAffiliateResponse {
  success: boolean;
  tracked: boolean;
  affiliateUrl?: string;
  message: string;
}

/**
 * Checkout session request for Stripe
 */
export interface CreateCheckoutRequest {
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

/**
 * Checkout session response from Stripe
 */
export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Error response structure from Edge Functions
 */
export interface EdgeFunctionError {
  error: string;
  fallback?: boolean;
}

/**
 * Result type for Edge Function calls
 */
export type EdgeFunctionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; fallback: boolean };

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generic Edge Function invoker with proper error handling
 * @param functionName - Name of the Edge Function to invoke
 * @param body - Request body to send
 * @returns Typed result with success/error state
 */
async function invokeEdgeFunction<TRequest, TResponse>(
  functionName: string,
  body: TRequest
): Promise<EdgeFunctionResult<TResponse>> {
  try {
    const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
      body,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Edge function call failed',
        fallback: true,
      };
    }

    // Check if the response itself indicates an error
    if (data && typeof data === 'object' && 'error' in data) {
      const errorResponse = data as unknown as EdgeFunctionError;
      return {
        success: false,
        error: errorResponse.error,
        fallback: errorResponse.fallback ?? true,
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'No data returned from Edge Function',
        fallback: true,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[EdgeFunctions] Error invoking ${functionName}:`, errorMessage);
    }

    return {
      success: false,
      error: errorMessage,
      fallback: true,
    };
  }
}

// ============================================
// OUTFIT ANALYSIS API
// ============================================

/**
 * Analyze an outfit image using Gemini Vision API via Edge Function
 * @param imageBase64 - Base64 encoded image data (without data:image prefix)
 * @returns Analysis result with style tags, colors, and feedback
 */
export async function analyzeOutfit(
  imageBase64: string
): Promise<EdgeFunctionResult<AnalyzeOutfitResponse>> {
  // Validate input
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return {
      success: false,
      error: 'Invalid image data provided',
      fallback: true,
    };
  }

  // Remove data URL prefix if present
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  // Check size (max 10MB encoded)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (cleanBase64.length > MAX_SIZE) {
    return {
      success: false,
      error: 'Image too large. Maximum size is 10MB.',
      fallback: true,
    };
  }

  return invokeEdgeFunction<AnalyzeOutfitRequest, AnalyzeOutfitResponse>(
    'analyze-outfit',
    { image: cleanBase64 }
  );
}

// ============================================
// AFFILIATE TRACKING API
// ============================================

/**
 * Track an affiliate click for analytics
 * @param shoeId - UUID of the shoe being clicked
 * @param source - Optional source identifier
 * @param metadata - Optional additional tracking data
 * @returns Tracking result with affiliate URL
 */
export async function trackAffiliateClick(
  shoeId: string,
  source?: string,
  metadata?: Record<string, unknown>
): Promise<EdgeFunctionResult<TrackAffiliateResponse>> {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(shoeId)) {
    return {
      success: false,
      error: 'Invalid shoe ID format',
      fallback: true,
    };
  }

  // Try Edge Function first, fallback to direct Supabase if not available
  try {
    const result = await invokeEdgeFunction<TrackAffiliateRequest, TrackAffiliateResponse>(
      'track-affiliate',
      { shoeId, source, metadata }
    );

    // If Edge Function doesn't exist, track directly via Supabase
    if (!result.success && result.error.includes('not found')) {
      return trackAffiliateClickDirect(shoeId);
    }

    return result;
  } catch {
    // Fallback to direct Supabase tracking
    return trackAffiliateClickDirect(shoeId);
  }
}

/**
 * Direct Supabase tracking fallback when Edge Function is not available
 */
async function trackAffiliateClickDirect(
  shoeId: string
): Promise<EdgeFunctionResult<TrackAffiliateResponse>> {
  try {
    // Record the click
    const { error: clickError } = await supabase.from('affiliate_clicks').insert({
      shoe_id: shoeId,
      clicked_at: new Date().toISOString(),
    });

    if (clickError) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[EdgeFunctions] Click tracking error:', clickError.message);
      }
      // Don't fail - tracking should be non-blocking
    }

    // Increment click count
    await supabase.rpc('increment_shoe_click', { shoe_id: shoeId });

    // Get the shoe's Amazon ASIN for affiliate URL
    const { data: shoeData } = await supabase
      .from('shoes')
      .select('amazon_asin, amazon_url')
      .eq('id', shoeId)
      .single();

    let affiliateUrl = shoeData?.amazon_url || '';
    if (shoeData?.amazon_asin) {
      affiliateUrl = `https://www.amazon.com/dp/${shoeData.amazon_asin}?tag=${AFFILIATE_TAG}`;
    } else if (affiliateUrl && !affiliateUrl.includes(`tag=${AFFILIATE_TAG}`)) {
      const separator = affiliateUrl.includes('?') ? '&' : '?';
      affiliateUrl = `${affiliateUrl}${separator}tag=${AFFILIATE_TAG}`;
    }

    return {
      success: true,
      data: {
        success: true,
        tracked: true,
        affiliateUrl,
        message: 'Click tracked successfully',
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Tracking failed';
    return {
      success: false,
      error: errorMessage,
      fallback: true,
    };
  }
}

// ============================================
// CHECKOUT API (Future Stripe Integration)
// ============================================

/**
 * Create a Stripe checkout session via Edge Function
 * Note: Requires Stripe integration to be configured
 * @param request - Checkout request with items and URLs
 * @returns Checkout session with redirect URL
 */
export async function createCheckoutSession(
  request: CreateCheckoutRequest
): Promise<EdgeFunctionResult<CreateCheckoutResponse>> {
  // Validate request
  if (!request.items || request.items.length === 0) {
    return {
      success: false,
      error: 'At least one item is required',
      fallback: true,
    };
  }

  if (!request.successUrl || !request.cancelUrl) {
    return {
      success: false,
      error: 'Success and cancel URLs are required',
      fallback: true,
    };
  }

  // URL validation
  try {
    new URL(request.successUrl);
    new URL(request.cancelUrl);
  } catch {
    return {
      success: false,
      error: 'Invalid success or cancel URL',
      fallback: true,
    };
  }

  return invokeEdgeFunction<CreateCheckoutRequest, CreateCheckoutResponse>(
    'create-checkout',
    request
  );
}

// ============================================
// SHOE MATCHING API
// ============================================

/**
 * Match shoes for an outfit using database function
 * @param styleTags - Style tags to match
 * @param colorTags - Color tags to match
 * @param limit - Maximum number of matches to return
 * @returns Array of matching shoes with scores
 */
export async function matchShoesForOutfit(
  styleTags: string[],
  colorTags: string[],
  limit: number = 5
): Promise<EdgeFunctionResult<Array<{
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  amazon_url: string;
  style_tags: string[];
  color_tags: string[];
  match_score: number;
}>>> {
  try {
    const { data, error } = await supabase.rpc('match_shoes_for_outfit', {
      p_style_tags: styleTags,
      p_color_tags: colorTags,
      p_limit: limit,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }

    // Ensure affiliate tags on returned URLs
    const taggedData = (data || []).map((shoe: {
      id: string;
      name: string;
      brand: string;
      price: number;
      image_url: string;
      amazon_url: string;
      style_tags: string[];
      color_tags: string[];
      match_score: number;
    }) => ({
      ...shoe,
      amazon_url: shoe.amazon_url.includes(AFFILIATE_TAG)
        ? shoe.amazon_url
        : `${shoe.amazon_url}${shoe.amazon_url.includes('?') ? '&' : '?'}tag=${AFFILIATE_TAG}`,
    }));

    return {
      success: true,
      data: taggedData,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Matching failed';
    return {
      success: false,
      error: errorMessage,
      fallback: true,
    };
  }
}

// ============================================
// ANALYTICS TRACKING API
// ============================================

/**
 * Track an analytics event
 * @param eventType - Type of event
 * @param eventData - Event data payload
 * @returns Success indicator
 */
export async function trackAnalyticsEvent(
  eventType: 'shoe_view' | 'shoe_click' | 'music_click' | 'panel_open' | 'share' | 'favorite' | 'swipe',
  eventData: Record<string, unknown>
): Promise<EdgeFunctionResult<{ tracked: boolean }>> {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Non-blocking - just log in dev mode
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[Analytics] Tracking error:', error.message);
      }
      return {
        success: true, // Don't fail the app for analytics
        data: { tracked: false },
      };
    }

    return {
      success: true,
      data: { tracked: true },
    };
  } catch {
    return {
      success: true, // Don't fail the app for analytics
      data: { tracked: false },
    };
  }
}

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const edgeFunctionsApi = {
  analyzeOutfit,
  trackAffiliateClick,
  createCheckoutSession,
  matchShoesForOutfit,
  trackAnalyticsEvent,
};
