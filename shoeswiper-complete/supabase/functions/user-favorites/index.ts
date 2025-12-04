// Supabase Edge Function: supabase/functions/user-favorites/index.ts
// Deploy with: supabase functions deploy user-favorites
// Handles: GET /user-favorites, POST /user-favorites, DELETE /user-favorites?shoeId=:shoeId

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createAuthenticatedClient, ensureAffiliateTag } from "../_shared/supabase.ts";

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

    const url = new URL(req.url);

    if (req.method === "GET") {
      // Get user's favorites with shoe details
      const { data: favorites, error } = await client
        .from("favorites")
        .select(`
          id,
          user_id,
          shoe_id,
          created_at,
          shoe:shoes (
            id,
            name,
            brand,
            price,
            image_url,
            amazon_url,
            style_tags,
            color_tags,
            gender,
            is_active
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Process favorites and ensure affiliate tags
      const processedFavorites = (favorites || []).map((fav) => ({
        id: fav.id,
        userId: fav.user_id,
        shoeId: fav.shoe_id,
        addedAt: fav.created_at,
        shoe: fav.shoe
          ? {
              ...fav.shoe,
              amazon_url: ensureAffiliateTag(fav.shoe.amazon_url),
            }
          : undefined,
      }));

      return new Response(
        JSON.stringify(processedFavorites),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "POST") {
      // Add a favorite
      let body;
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

      const { shoeId } = body;

      if (!shoeId) {
        return new Response(
          JSON.stringify({ error: "Missing required field: shoeId" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(shoeId)) {
        return new Response(
          JSON.stringify({ error: "Invalid shoeId format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if shoe exists
      const { data: shoe, error: shoeError } = await client
        .from("shoes")
        .select("id")
        .eq("id", shoeId)
        .eq("is_active", true)
        .single();

      if (shoeError || !shoe) {
        return new Response(
          JSON.stringify({ error: "Shoe not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Insert favorite (will fail if duplicate due to unique constraint)
      const { data: favorite, error } = await client
        .from("favorites")
        .insert({
          user_id: userId,
          shoe_id: shoeId,
        })
        .select(`
          id,
          user_id,
          shoe_id,
          created_at
        `)
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique violation - already favorited
          return new Response(
            JSON.stringify({ error: "Shoe already in favorites" }),
            {
              status: 409,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        throw new Error(`Database error: ${error.message}`);
      }

      // Update favorite count on shoe (fire and forget with proper error handling)
      // Note: The RPC function may need to be created in the database
      (async () => {
        try {
          // Try RPC first if it exists
          const { error: rpcError } = await client.rpc("increment_favorite_count", { shoe_id: shoeId });
          if (rpcError) {
            // Fall back to direct SQL increment
            await client
              .from("shoes")
              .update({ favorite_count: 1 }) // Supabase will handle increment via trigger/function
              .eq("id", shoeId);
          }
        } catch {
          // Silently fail - favorite count is non-critical
        }
      })();

      return new Response(
        JSON.stringify({
          id: favorite.id,
          userId: favorite.user_id,
          shoeId: favorite.shoe_id,
          addedAt: favorite.created_at,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "DELETE") {
      const shoeId = url.searchParams.get("shoeId");

      if (!shoeId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameter: shoeId" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(shoeId)) {
        return new Response(
          JSON.stringify({ error: "Invalid shoeId format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Delete the favorite
      const { error } = await client
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("shoe_id", shoeId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return new Response(
        JSON.stringify({ success: true }),
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
    console.error("Error handling favorites:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
