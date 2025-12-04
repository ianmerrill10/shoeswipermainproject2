import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEMO_MODE } from './config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Only validate environment variables if NOT in demo mode
if (!DEMO_MODE && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  if (import.meta.env.DEV) console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client (will only be used in production mode)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin email for access control
export const ADMIN_EMAIL = 'dadsellsgadgets@gmail.com';

// ============================================
// AMAZON AFFILIATE CONFIGURATION
// ============================================

// Amazon affiliate tag - MUST be on all Amazon URLs
export const AFFILIATE_TAG = 'shoeswiper-20';

// Feature flags for pricing display
// Set to true once Amazon Product Advertising API is connected
export const SHOW_PRICES = false;

// Amazon API configuration (for future use)
export const AMAZON_API_CONFIG = {
  enabled: false, // Set to true when API access is granted
  partnerTag: AFFILIATE_TAG,
  marketplace: 'www.amazon.com',
  // API credentials will be stored in environment variables:
  // VITE_AMAZON_ACCESS_KEY, VITE_AMAZON_SECRET_KEY
};

// ============================================
// AFFILIATE URL HELPERS
// ============================================

// Build clean affiliate URL from ASIN
export const getAffiliateUrlFromAsin = (asin: string): string => {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
};

// Ensure affiliate tag is present on any Amazon URL
export const getAffiliateUrl = (url: string): string => {
  if (!url) return url;

  // If already has our tag, return as-is
  if (url.includes(`tag=${AFFILIATE_TAG}`)) return url;

  // Try to extract ASIN and build clean URL
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) ||
                    url.match(/\/gp\/product\/([A-Z0-9]{10})/i);

  if (asinMatch) {
    return getAffiliateUrlFromAsin(asinMatch[1]);
  }

  // Fallback: append tag to existing URL
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tag=${AFFILIATE_TAG}`;
};

// Extract ASIN from Amazon URL
export const extractAsinFromUrl = (url: string): string | null => {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i) ||
                url.match(/\/gp\/product\/([A-Z0-9]{10})/i) ||
                url.match(/asin=([A-Z0-9]{10})/i);
  return match ? match[1] : null;
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
