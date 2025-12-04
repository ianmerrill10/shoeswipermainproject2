// Supabase Edge Function: supabase/functions/price-alerts/index.ts
// Deploy with: supabase functions deploy price-alerts
// Handles: GET /price-alerts, POST /price-alerts, DELETE /price-alerts?id=:alertId

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
      // Get user's price alerts with shoe details
      const { data: alerts, error } = await client
        .from("price_alerts")
        .select(`
          id,
          user_id,
          shoe_id,
          shoe_name,
          shoe_brand,
          shoe_image,
          amazon_url,
          target_price,
          current_price,
          original_price,
          triggered,
          triggered_at,
          last_checked,
          created_at
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Process alerts - amazon_url already has affiliate tag from storage
      const processedAlerts = (alerts || []).map((alert) => ({
        id: alert.id,
        userId: alert.user_id,
        shoeId: alert.shoe_id,
        targetPrice: alert.target_price,
        currentPrice: alert.current_price,
        originalPrice: alert.original_price,
        isActive: !alert.triggered,
        createdAt: alert.created_at,
        triggeredAt: alert.triggered_at,
        lastChecked: alert.last_checked,
        shoe: {
          id: alert.shoe_id,
          name: alert.shoe_name,
          brand: alert.shoe_brand,
          image_url: alert.shoe_image,
          amazon_url: alert.amazon_url, // Already has affiliate tag from storage
        },
      }));

      return new Response(
        JSON.stringify(processedAlerts),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "POST") {
      // Create a price alert
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

      const { shoeId, targetPrice } = body;

      if (!shoeId) {
        return new Response(
          JSON.stringify({ error: "Missing required field: shoeId" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (targetPrice === undefined || targetPrice === null) {
        return new Response(
          JSON.stringify({ error: "Missing required field: targetPrice" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate targetPrice
      const price = parseFloat(targetPrice);
      if (isNaN(price) || price < 0) {
        return new Response(
          JSON.stringify({ error: "targetPrice must be a non-negative number" }),
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

      // Get shoe details
      const { data: shoe, error: shoeError } = await client
        .from("shoes")
        .select("id, name, brand, image_url, amazon_url, price")
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

      // Create price alert
      const { data: alert, error } = await client
        .from("price_alerts")
        .insert({
          user_id: userId,
          shoe_id: shoeId,
          shoe_name: shoe.name,
          shoe_brand: shoe.brand,
          shoe_image: shoe.image_url,
          amazon_url: ensureAffiliateTag(shoe.amazon_url),
          target_price: price,
          current_price: shoe.price,
          original_price: shoe.price,
          triggered: false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique violation - already have alert for this shoe
          return new Response(
            JSON.stringify({ error: "Price alert already exists for this shoe" }),
            {
              status: 409,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return new Response(
        JSON.stringify({
          id: alert.id,
          userId: alert.user_id,
          shoeId: alert.shoe_id,
          targetPrice: alert.target_price,
          currentPrice: alert.current_price,
          isActive: !alert.triggered,
          createdAt: alert.created_at,
          shoe: {
            id: shoe.id,
            name: shoe.name,
            brand: shoe.brand,
            image_url: shoe.image_url,
            amazon_url: ensureAffiliateTag(shoe.amazon_url),
          },
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "DELETE") {
      const alertId = url.searchParams.get("id");

      if (!alertId) {
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
      if (!uuidRegex.test(alertId)) {
        return new Response(
          JSON.stringify({ error: "Invalid alert id format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Delete the alert (RLS ensures user can only delete their own)
      const { error } = await client
        .from("price_alerts")
        .delete()
        .eq("id", alertId)
        .eq("user_id", userId);

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
    console.error("Error handling price alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
