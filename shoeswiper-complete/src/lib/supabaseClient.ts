import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin email for access control
export const ADMIN_EMAIL = 'dadsellsgadgets@gmail.com';

// Amazon affiliate tag - MUST be on all Amazon URLs
export const AFFILIATE_TAG = 'shoeswiper-20';

// Helper to ensure affiliate tag is present
export const getAffiliateUrl = (url: string): string => {
  if (!url) return url;
  if (url.includes(`tag=${AFFILIATE_TAG}`)) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tag=${AFFILIATE_TAG}`;
};
