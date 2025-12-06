/**
 * SHOESWIPER API SERVICE
 * Centralized API layer with security integrations
 *
 * Features:
 * - Rate limiting for all endpoints
 * - Input validation with Zod schemas
 * - Secure storage for sensitive data
 * - Unified error handling
 */

import { checkSlidingWindowRateLimit, RATE_LIMITS } from './rateLimiting';
import {
  emailCaptureSchema,
  priceAlertSchema,
  searchFiltersSchema,
  safeValidateInput,
} from './validationSchemas';
import { getDeviceFingerprint, SecureStorage, AppStorage, StorageKeys } from './secureStorage';
import { DEMO_MODE } from './config';

// ============================================
// RATE LIMIT WRAPPER
// ============================================

let deviceFingerprint: string | null = null;

/**
 * Get or create device fingerprint for rate limiting
 */
async function getIdentifier(): Promise<string> {
  if (!deviceFingerprint) {
    deviceFingerprint = await getDeviceFingerprint();
  }
  return deviceFingerprint;
}

/**
 * Check if request is allowed by rate limiter
 */
export async function checkRateLimit(endpoint: string): Promise<{
  allowed: boolean;
  remaining: number;
  message?: string;
}> {
  const identifier = await getIdentifier();
  const result = checkSlidingWindowRateLimit(identifier, endpoint);

  if (!result.allowed) {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.api;
    return {
      allowed: false,
      remaining: 0,
      message: config.message,
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
  };
}

/**
 * Rate-limited API call wrapper
 */
export async function rateLimitedCall<T>(
  endpoint: string,
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string; rateLimited?: boolean }> {
  const rateCheck = await checkRateLimit(endpoint);

  if (!rateCheck.allowed) {
    return {
      success: false,
      error: rateCheck.message || 'Rate limit exceeded',
      rateLimited: true,
    };
  }

  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'An error occurred';
    return { success: false, error };
  }
}

// ============================================
// VALIDATED API CALLS
// ============================================

/**
 * Capture email with validation and rate limiting
 */
export async function captureEmailSecure(data: {
  email: string;
  source: string;
  shoeId?: string;
  shoeName?: string;
  preferences?: {
    priceAlerts?: boolean;
    newReleases?: boolean;
    weeklyDigest?: boolean;
    promotions?: boolean;
  };
}): Promise<{ success: boolean; error?: string; errors?: Array<{ field: string; message: string }> }> {
  // Validate input
  const validation = safeValidateInput(emailCaptureSchema, data);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  // Check rate limit
  const rateCheck = await checkRateLimit('email');
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.message };
  }

  // Process the validated data
  const validData = validation.data;

  if (DEMO_MODE) {
    // Store in localStorage for demo
    const existingList = JSON.parse(localStorage.getItem('shoeswiper_email_list') || '[]');
    const newEntry = {
      ...validData,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('shoeswiper_email_list', JSON.stringify([newEntry, ...existingList]));
    localStorage.setItem('shoeswiper_email_capture', JSON.stringify({
      email: validData.email,
      preferences: validData.preferences,
    }));
    return { success: true };
  }

  // Production: Use Supabase
  try {
    const { supabase } = await import('./supabaseClient');
    const { error } = await supabase.from('email_subscriptions').upsert({
      email: validData.email,
      source: validData.source,
      shoe_id: validData.shoeId,
      shoe_name: validData.shoeName,
      preferences: validData.preferences,
      is_subscribed: true,
      created_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[API] Email capture failed:', err);
    return { success: false, error: 'Failed to save email. Please try again.' };
  }
}

/**
 * Create price alert with validation and rate limiting
 */
export async function createPriceAlertSecure(data: {
  shoeId: string;
  shoeName: string;
  shoeBrand: string;
  shoeImage?: string;
  amazonUrl: string;
  targetPrice: number;
  originalPrice?: number;
}): Promise<{ success: boolean; error?: string; errors?: Array<{ field: string; message: string }> }> {
  // Validate input
  const validation = safeValidateInput(priceAlertSchema, data);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  // Check rate limit
  const rateCheck = await checkRateLimit('alerts');
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.message };
  }

  const validData = validation.data;

  if (DEMO_MODE) {
    // Store in localStorage
    const alerts = AppStorage.getItem<any[]>(StorageKeys.APP.PRICE_ALERTS, []) || [];
    const newAlert = {
      id: `alert_${Date.now()}`,
      ...validData,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    alerts.push(newAlert);
    AppStorage.setItem(StorageKeys.APP.PRICE_ALERTS, alerts);
    return { success: true };
  }

  // Production: Use Supabase
  try {
    const { supabase } = await import('./supabaseClient');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Please sign in to create price alerts' };
    }

    const { error } = await supabase.from('price_alerts').insert({
      user_id: user.id,
      shoe_id: validData.shoeId,
      target_price: validData.targetPrice,
      original_price: validData.originalPrice,
      is_active: true,
    });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[API] Price alert creation failed:', err);
    return { success: false, error: 'Failed to create price alert. Please try again.' };
  }
}

/**
 * Search with validation and rate limiting
 */
export async function searchSneakersSecure(filters: {
  query?: string;
  brands?: string[];
  styleTags?: string[];
  gender?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data?: any[]; error?: string }> {
  // Validate input
  const validation = safeValidateInput(searchFiltersSchema, filters);
  if (!validation.success) {
    return { success: false, error: validation.errors[0]?.message || 'Invalid search parameters' };
  }

  // Check rate limit
  const rateCheck = await checkRateLimit('search');
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.message };
  }

  // Search is handled by the useSneakerSearch hook
  // This wrapper just ensures rate limiting and validation
  return { success: true, data: [] };
}

/**
 * AI analysis with rate limiting (expensive operation)
 */
export async function analyzeOutfitSecure(imageBase64: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  // Check rate limit (AI endpoints have strict limits)
  const rateCheck = await checkRateLimit('ai');
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.message };
  }

  if (DEMO_MODE) {
    return {
      success: true,
      data: {
        rating: 8,
        style_tags: ['streetwear', 'casual'],
        dominant_colors: ['black', 'white'],
        detected_shoe: 'Demo Analysis',
        feedback: 'Great style! Here are some sneakers that would match perfectly.',
      },
    };
  }

  try {
    const { supabase } = await import('./supabaseClient');
    const { data, error } = await supabase.functions.invoke('analyze-outfit', {
      body: { image: imageBase64 },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[API] Outfit analysis failed:', err);
    return { success: false, error: 'AI analysis unavailable. Please try manual selection.' };
  }
}

/**
 * Track affiliate click with rate limiting
 */
export async function trackAffiliateClick(data: {
  shoeId: string;
  shoeName: string;
  amazonUrl: string;
  source: string;
}): Promise<void> {
  // Check rate limit (generous for affiliate tracking)
  const rateCheck = await checkRateLimit('affiliate');
  if (!rateCheck.allowed) {
    console.warn('[API] Affiliate tracking rate limited');
    return;
  }

  if (DEMO_MODE) {
    // Just log in demo mode
    console.log('[Demo] Affiliate click:', data.shoeName);
    return;
  }

  try {
    const { supabase } = await import('./supabaseClient');
    await supabase.from('affiliate_clicks').insert({
      shoe_id: data.shoeId,
      shoe_name: data.shoeName,
      amazon_url: data.amazonUrl,
      source: data.source,
      clicked_at: new Date().toISOString(),
    });
  } catch (err) {
    // Silent fail for analytics
    console.error('[API] Affiliate tracking failed:', err);
  }
}

// ============================================
// SECURE AUTH HELPERS
// ============================================

const secureStorage = SecureStorage.getInstance();

/**
 * Store auth token securely
 */
export async function storeAuthToken(token: string): Promise<void> {
  await secureStorage.setItem(StorageKeys.SECURE.AUTH_TOKEN, token);
}

/**
 * Get auth token securely
 */
export async function getAuthToken(): Promise<string | null> {
  return secureStorage.getItem<string>(StorageKeys.SECURE.AUTH_TOKEN);
}

/**
 * Clear auth data on logout
 */
export async function clearAuthData(): Promise<void> {
  secureStorage.removeItem(StorageKeys.SECURE.AUTH_TOKEN);
  secureStorage.removeItem(StorageKeys.SECURE.REFRESH_TOKEN);
  secureStorage.removeItem(StorageKeys.SECURE.USER_EMAIL);
}

// ============================================
// EXPORT
// ============================================

export default {
  checkRateLimit,
  rateLimitedCall,
  captureEmailSecure,
  createPriceAlertSecure,
  searchSneakersSecure,
  analyzeOutfitSecure,
  trackAffiliateClick,
  storeAuthToken,
  getAuthToken,
  clearAuthData,
};
