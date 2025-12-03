// CORS Headers for Supabase Edge Functions
// Security Note: In production, replace '*' with your actual domain
// Example: 'https://shoeswiper.com' or 'https://your-app.vercel.app'

// For development, we allow all origins
// For production, this should be restricted to your domain
const getAllowedOrigin = (): string => {
  // In production, you should set ALLOWED_ORIGIN in Supabase secrets
  // supabase secrets set ALLOWED_ORIGIN=https://shoeswiper.com
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN");
  return allowedOrigin || "*";
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-csrf-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
