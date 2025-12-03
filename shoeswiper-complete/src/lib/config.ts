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

// Push Notification / VAPID Configuration
// Generate VAPID keys using: npx web-push generate-vapid-keys
export const PUSH_NOTIFICATION_CONFIG = {
  enabled: false, // Set to true when VAPID keys are configured
  // VAPID public key - safe to expose in client code
  // Set via environment variable: VITE_VAPID_PUBLIC_KEY
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
  // VAPID private key should ONLY be used server-side (Edge Functions)
  // Never expose in client code - use VAPID_PRIVATE_KEY env var
};

// Admin email for access control
export const ADMIN_EMAIL = 'dadsellsgadgets@gmail.com';

// Allowed emails for Google login protection (SINGLE SOURCE OF TRUTH)
// Add emails here to grant app access after Google OAuth login
export const ALLOWED_EMAILS = [
  'ianmerrill10@gmail.com',
  ADMIN_EMAIL,  // Admin always has access
];
