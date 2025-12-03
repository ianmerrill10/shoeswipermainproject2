/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  // Note: GEMINI_API_KEY is server-side only (Supabase Edge Function secret)
  // Never expose it with VITE_ prefix
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
