// ============================================
// APP CONFIGURATION
// ============================================

// DEMO MODE: Set to true for local testing without Supabase
// Set to false for production with Supabase backend
export const DEMO_MODE = true;

// Amazon Affiliate Configuration - NON-NEGOTIABLE
// This tag MUST be on ALL Amazon links for revenue generation
export const AFFILIATE_TAG = 'shoeswiper-20';

// Feature flags for pricing display
// Set to true once Amazon Product Advertising API is connected
// Can be overridden by environment variable VITE_SHOW_PRICES
export const SHOW_PRICES = import.meta.env.VITE_SHOW_PRICES === 'true' || false;

// Amazon PA-API configuration
// Credentials are stored server-side in Supabase Edge Function secrets
// Client only needs to know if the API is enabled
export const AMAZON_API_CONFIG = {
  // Set to true when PA-API credentials are configured in Edge Function
  enabled: import.meta.env.VITE_AMAZON_API_ENABLED === 'true' || false,
  // Affiliate tag - ALWAYS shoeswiper-20
  partnerTag: AFFILIATE_TAG,
  // Amazon marketplace
  marketplace: 'www.amazon.com',
  // Edge Function endpoint for secure PA-API calls
  edgeFunctionUrl: `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/amazon-prices`,
  // Cache duration in milliseconds (5 minutes)
  cacheDuration: 5 * 60 * 1000,
};

// Admin email for access control
export const ADMIN_EMAIL = 'dadsellsgadgets@gmail.com';

// Allowed emails for Google login protection (SINGLE SOURCE OF TRUTH)
// Add emails here to grant app access after Google OAuth login
export const ALLOWED_EMAILS = [
  'ianmerrill10@gmail.com',
  ADMIN_EMAIL,  // Admin always has access
];
