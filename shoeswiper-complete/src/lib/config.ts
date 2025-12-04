// ============================================
// APP CONFIGURATION
// ============================================

// DEMO MODE: Set to true for local testing without Supabase
// Set to false for production with Supabase backend
export const DEMO_MODE = true;

// Amazon Affiliate Configuration
export const AFFILIATE_TAG = 'shoeswiper-20';

// Feature flags for pricing display
// Set to true once Amazon Product Advertising API is connected
export const SHOW_PRICES = false;

// Amazon API configuration
// SECURITY NOTE: Amazon API credentials are stored server-side ONLY
// They are accessed via Supabase Edge Functions, never exposed to client
export const AMAZON_API_CONFIG = {
  enabled: false, // Set to true when API access is granted
  partnerTag: AFFILIATE_TAG,
  marketplace: 'www.amazon.com',
  // Cache settings
  cacheTTLMinutes: 30, // How long to cache product data in memory
  maxCacheAgeHours: 24, // When to consider Supabase cache stale
  // Rate limiting
  minRequestIntervalMs: 1000, // Min 1 second between Amazon API calls
  // Search defaults
  defaultSearchIndex: 'Fashion',
  defaultItemCount: 10,
  maxItemsPerRequest: 10,
};

// Admin email for access control
export const ADMIN_EMAIL = 'dadsellsgadgets@gmail.com';

// Allowed emails for Google login protection (SINGLE SOURCE OF TRUTH)
// Add emails here to grant app access after Google OAuth login
export const ALLOWED_EMAILS = [
  'ianmerrill10@gmail.com',
  ADMIN_EMAIL,  // Admin always has access
];
