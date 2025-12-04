// Supabase Edge Function: supabase/functions/affiliate-track/index.ts
// Deploy with: supabase functions deploy affiliate-track
// Handles: POST /affiliate-track

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createAnonClient, createAuthenticatedClient } from "../_shared/supabase.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
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

    const { shoeId, source, metadata } = body;

    // Validate shoeId
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

    // Try to get user ID from auth header (optional - anonymous clicks are allowed)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader) {
      try {
        const authResult = await createAuthenticatedClient(authHeader);
        userId = authResult.userId;
      } catch {
        // Ignore auth errors - anonymous tracking is fine
      }
    }

    const supabase = createAnonClient();

    // Record the affiliate click
    const { error: clickError } = await supabase
      .from("affiliate_clicks")
      .insert({
        shoe_id: shoeId,
        user_id: userId,
        clicked_at: new Date().toISOString(),
      });

    if (clickError) {
      // Log but don't fail - click tracking should be fire-and-forget
      console.error("Failed to record affiliate click:", clickError);
    }

    // Increment click count on shoe using RPC (with fallback)
    // The increment_shoe_click function is defined in 001_schema.sql
    try {
      const { error: incrementError } = await supabase.rpc("increment_shoe_click", {
        shoe_id: shoeId,
      });

      if (incrementError) {
        // Log the error - this is non-critical
        console.error("RPC increment_shoe_click failed:", incrementError.message);
      }
    } catch (rpcError) {
      // RPC might not exist - this is non-critical
      console.error("Failed to call increment_shoe_click:", rpcError);
    }

    // Optionally log analytics event with source and metadata
    if (source || metadata) {
      const { error: analyticsError } = await supabase
        .from("analytics_events")
        .insert({
          event_type: "shoe_click",
          event_data: {
            shoe_id: shoeId,
            user_id: userId,
            source: source || "unknown",
            metadata: metadata || {},
            timestamp: new Date().toISOString(),
          },
        });

      if (analyticsError) {
        console.error("Failed to record analytics event:", analyticsError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error tracking affiliate click:", error);
    // Return success anyway - tracking should not block user experience
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
