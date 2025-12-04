import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEMO_MODE, AFFILIATE_TAG, SHOW_PRICES, ADMIN_EMAIL } from './config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Only validate environment variables if NOT in demo mode
if (!DEMO_MODE && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  if (import.meta.env.DEV) console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client (will only be used in production mode)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Re-export configuration from config.ts for backwards compatibility
export { AFFILIATE_TAG, SHOW_PRICES, ADMIN_EMAIL };

// ============================================
// AFFILIATE URL HELPERS
// ============================================

// Build clean affiliate URL from ASIN
// ALWAYS uses shoeswiper-20 tag - this is non-negotiable
export const getAffiliateUrlFromAsin = (asin: string): string => {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
};

// Ensure affiliate tag is present on any Amazon URL
// CRITICAL: This function guarantees the shoeswiper-20 tag is present
export const getAffiliateUrl = (url: string): string => {
  if (!url) return url;

  // If already has our tag, return as-is
  if (url.includes(`tag=${AFFILIATE_TAG}`)) return url;

  // Remove any existing affiliate tags to ensure only our tag is used
  let cleanUrl = url.replace(/[?&]tag=[^&]*/gi, '');
  
  // Clean up any double ampersands or trailing question marks
  cleanUrl = cleanUrl.replace(/&&/g, '&').replace(/\?&/g, '?').replace(/\?$/, '');

  // Try to extract ASIN and build clean URL
  const asinMatch = cleanUrl.match(/\/dp\/([A-Z0-9]{10})/i) ||
                    cleanUrl.match(/\/gp\/product\/([A-Z0-9]{10})/i);

  if (asinMatch) {
    return getAffiliateUrlFromAsin(asinMatch[1]);
  }

  // Fallback: append tag to existing URL
  const separator = cleanUrl.includes('?') ? '&' : '?';
  return `${cleanUrl}${separator}tag=${AFFILIATE_TAG}`;
};

// Extract ASIN from Amazon URL
export const extractAsinFromUrl = (url: string): string | null => {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i) ||
                url.match(/\/gp\/product\/([A-Z0-9]{10})/i) ||
                url.match(/asin=([A-Z0-9]{10})/i);
  return match ? match[1] : null;
};

// ============================================
// AFFILIATE CLICK TRACKING
// ============================================

/**
 * Track affiliate link clicks for revenue attribution
 * Records click data in Supabase for analytics and revenue tracking
 * 
 * @param shoeId - The shoe ID being clicked
 * @param asin - Optional Amazon ASIN
 * @param source - Where the click originated (e.g., 'feed', 'panel', 'share')
 */
export const trackAffiliateClick = async (
  shoeId: string,
  asin?: string,
  source: string = 'unknown'
): Promise<void> => {
  const timestamp = new Date().toISOString();

  // DEMO MODE: Log only
  if (DEMO_MODE) {
    if (import.meta.env.DEV) {
      console.warn(`[Affiliate] Click tracked - Shoe: ${shoeId}, ASIN: ${asin || 'N/A'}, Source: ${source}`);
    }
    return;
  }

  // PRODUCTION MODE: Record in Supabase
  try {
    // Insert into affiliate_clicks table
    const { error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        shoe_id: shoeId,
        asin: asin,
        source: source,
        clicked_at: timestamp,
      });

    if (clickError) {
      if (import.meta.env.DEV) console.error('[Affiliate] Error tracking click:', clickError);
    }

    // Increment shoe click count (ignore errors as this RPC may not exist in all environments)
    try {
      await supabase.rpc('increment_shoe_click', { shoe_id: shoeId });
    } catch (rpcError) {
      if (import.meta.env.DEV) console.warn('[Affiliate] increment_shoe_click RPC not available:', rpcError);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('[Affiliate] Error tracking click:', err);
  }
};

// ============================================
// PRICE DISPLAY HELPERS
// ============================================

// Format price for display (returns null if prices are hidden)
export const formatPrice = (price: number | null | undefined): string | null => {
  if (!SHOW_PRICES || price === null || price === undefined) {
    return null;
  }
  return `$${price.toFixed(2)}`;
};

// Check if we should show price for a shoe
export const shouldShowPrice = (price: number | null | undefined): boolean => {
  return SHOW_PRICES && price !== null && price !== undefined;
};
