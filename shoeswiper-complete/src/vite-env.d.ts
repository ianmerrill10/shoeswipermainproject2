/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  // NOTE: GEMINI_API_KEY is intentionally NOT included here.
  // It must ONLY be used server-side in Supabase Edge Functions.
  // See: supabase/functions/analyze-outfit/index.ts
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
