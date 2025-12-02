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

// Amazon API configuration (for future use)
export const AMAZON_API_CONFIG = {
  enabled: false, // Set to true when API access is granted
  partnerTag: AFFILIATE_TAG,
  marketplace: 'www.amazon.com',
  // API credentials will be stored in environment variables:
  // VITE_AMAZON_ACCESS_KEY, VITE_AMAZON_SECRET_KEY
};

// Admin email for access control
export const ADMIN_EMAIL = 'dadsellsgadgets@gmail.com';

// Allowed emails for Google login protection
export const ALLOWED_EMAILS = ['ianmerrill10@gmail.com'];
