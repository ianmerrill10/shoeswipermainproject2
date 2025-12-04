// Supabase Edge Function: supabase/functions/shoe-detail/index.ts
// Deploy with: supabase functions deploy shoe-detail
// Handles: GET /shoe-detail?id=:shoeId

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createAnonClient, ensureAffiliateTag } from "../_shared/supabase.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const shoeId = url.searchParams.get("id");

    // Validate shoe ID
    if (!shoeId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: id" }),
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
        JSON.stringify({ error: "Invalid shoe ID format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createAnonClient();

    // Fetch the shoe
    const { data: shoe, error } = await supabase
      .from("shoes")
      .select("*")
      .eq("id", shoeId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(
          JSON.stringify({ error: "Shoe not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`Database error: ${error.message}`);
    }

    // Increment view count (fire and forget with proper error handling)
    // The increment_shoe_view function is defined in 001_schema.sql
    (async () => {
      try {
        const { error: rpcError } = await supabase.rpc("increment_shoe_view", { shoe_id: shoeId });
        if (rpcError) {
          console.error("RPC increment_shoe_view failed:", rpcError.message);
        }
      } catch (err) {
        console.error("Failed to increment view count:", err);
      }
    })();

    // Ensure Amazon URL has affiliate tag
    const processedShoe = {
      ...shoe,
      amazon_url: ensureAffiliateTag(shoe.amazon_url),
    };

    return new Response(
      JSON.stringify(processedShoe),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching shoe detail:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
