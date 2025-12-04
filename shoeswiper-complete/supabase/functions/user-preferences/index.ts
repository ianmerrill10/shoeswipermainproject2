// Supabase Edge Function: supabase/functions/user-preferences/index.ts
// Deploy with: supabase functions deploy user-preferences
// Handles: GET /user-preferences, PUT /user-preferences
//
// Note: This endpoint returns user preferences. The profiles table stores
// basic profile info (username, avatar_url, bio). Preferences like
// preferredBrands, preferredStyles are stored as defaults until a
// dedicated user_preferences table is created.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createAuthenticatedClient } from "../_shared/supabase.ts";

// Response interface matching frontend expectations
interface UserPreferencesResponse {
  userId: string;
  preferredBrands: string[];
  preferredStyles: string[];
  preferredColors: string[];
  gender: string | null;
  priceRange: {
    min: number;
    max: number;
  };
  // Profile fields
  username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  email?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    // Authenticate user
    let client;
    let userId: string;
    try {
      const authResult = await createAuthenticatedClient(authHeader);
      client = authResult.client;
      userId = authResult.userId;
    } catch (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "GET") {
      // Get user profile
      const { data: profile, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new Error(`Database error: ${error.message}`);
      }

      // Return preferences with defaults for fields not stored in profiles table
      const response: UserPreferencesResponse = {
        userId,
        preferredBrands: [],
        preferredStyles: [],
        preferredColors: [],
        gender: null,
        priceRange: {
          min: 0,
          max: 500,
        },
        // Include actual profile fields if available
        username: profile?.username || null,
        avatar_url: profile?.avatar_url || null,
        bio: profile?.bio || null,
        email: profile?.email || null,
      };

      return new Response(
        JSON.stringify(response),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "PUT") {
      // Validate request body
      let body: Partial<UserPreferencesResponse>;
      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid JSON in request body" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate gender if provided
      const validGenders = ["men", "women", "unisex", "kids"];
      if (body.gender && !validGenders.includes(body.gender)) {
        return new Response(
          JSON.stringify({
            error: `Invalid gender. Must be one of: ${validGenders.join(", ")}`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate price range if provided
      if (body.priceRange) {
        if (body.priceRange.min !== undefined && body.priceRange.min < 0) {
          return new Response(
            JSON.stringify({ error: "priceRange.min must be non-negative" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (body.priceRange.max !== undefined && body.priceRange.max < 0) {
          return new Response(
            JSON.stringify({ error: "priceRange.max must be non-negative" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (
          body.priceRange.min !== undefined &&
          body.priceRange.max !== undefined &&
          body.priceRange.min > body.priceRange.max
        ) {
          return new Response(
            JSON.stringify({
              error: "priceRange.min cannot be greater than priceRange.max",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // Build update data for profile table fields only
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Only update profile fields that exist in the profiles table
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.username !== undefined) updateData.username = body.username;
      if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;

      // Update profile if there's data to update
      if (Object.keys(updateData).length > 1) {
        const { error } = await client
          .from("profiles")
          .update(updateData)
          .eq("id", userId);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      // Get updated profile
      const { data: profile, error: fetchError } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // Build response with updated profile data
      // Note: Profile fields (username, avatar_url, bio) are persisted to the database.
      // Preference fields (preferredBrands, preferredStyles, etc.) are NOT persisted
      // as the database currently lacks a user_preferences table.
      // TODO: Create user_preferences table to persist preference data.
      const response: UserPreferencesResponse = {
        userId,
        // Preference fields - echoed back but NOT persisted (requires user_preferences table)
        preferredBrands: body.preferredBrands || [],
        preferredStyles: body.preferredStyles || [],
        preferredColors: body.preferredColors || [],
        gender: body.gender || null,
        priceRange: body.priceRange || { min: 0, max: 500 },
        // Profile fields - persisted to profiles table
        username: profile?.username || null,
        avatar_url: profile?.avatar_url || null,
        bio: profile?.bio || null,
        email: profile?.email || null,
      };

      return new Response(
        JSON.stringify(response),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error handling user preferences:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
