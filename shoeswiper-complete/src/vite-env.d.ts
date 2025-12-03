/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  // Note: GEMINI_API_KEY is server-side only (in Supabase Edge Functions).
  // Never expose API keys with VITE_ prefix as they get bundled into client code.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
