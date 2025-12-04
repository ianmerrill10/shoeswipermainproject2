import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * Creates a Supabase client with the user's JWT for authenticated requests.
 * Returns the client and the authenticated user.
 */
export async function createAuthenticatedClient(
  authHeader: string | null
): Promise<{ client: SupabaseClient; userId: string }> {
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const { data: { user }, error } = await client.auth.getUser(token);
  
  if (error || !user) {
    throw new Error("Invalid or expired token");
  }

  return { client, userId: user.id };
}

/**
 * Creates an anonymous Supabase client for public endpoints.
 */
export function createAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Creates a service role client for admin operations.
 * Use sparingly and only when RLS bypass is needed.
 */
export function createServiceClient(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Affiliate tag constant - MUST be included in all Amazon URLs
 */
export const AFFILIATE_TAG = "shoeswiper-20";

/**
 * Ensures an Amazon URL includes the affiliate tag.
 */
export function ensureAffiliateTag(url: string): string {
  if (!url) return url;
  
  const urlObj = new URL(url);
  // Remove any existing tag parameter
  urlObj.searchParams.delete("tag");
  // Add our affiliate tag
  urlObj.searchParams.set("tag", AFFILIATE_TAG);
  return urlObj.toString();
}
