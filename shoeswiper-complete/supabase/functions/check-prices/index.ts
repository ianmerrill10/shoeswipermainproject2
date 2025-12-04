// Supabase Edge Function: supabase/functions/check-prices/index.ts
// Deploy with: supabase functions deploy check-prices
// Schedule with: Create a cron job in Supabase Dashboard or use external scheduler
//
// Purpose: Checks all active price alerts and triggers notifications when prices drop
// In DEMO_MODE: Simulates random price fluctuations (5-15%)
// In production: Hooks for future Amazon PA-API integration

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Configuration
const DEMO_MODE = Deno.env.get("DEMO_MODE") === "true";
const PRICE_FLUCTUATION_MIN = 0.05; // 5% minimum fluctuation
const PRICE_FLUCTUATION_MAX = 0.15; // 15% maximum fluctuation

interface PriceAlert {
  id: string;
  user_id: string;
  shoe_id: string;
  shoe_name: string;
  shoe_brand: string;
  shoe_image: string;
  amazon_url: string;
  target_price: number;
  current_price: number | null;
  original_price: number | null;
  triggered: boolean;
}

interface PriceCheckResult {
  alertId: string;
  shoeId: string;
  oldPrice: number;
  newPrice: number;
  triggered: boolean;
}

/**
 * Simulates price changes for DEMO_MODE
 * Randomly fluctuates prices by 5-15% up or down
 */
function simulatePriceChange(currentPrice: number | null, originalPrice: number | null): number {
  const basePrice = currentPrice ?? originalPrice ?? 100;
  const fluctuationPercent = PRICE_FLUCTUATION_MIN + 
    Math.random() * (PRICE_FLUCTUATION_MAX - PRICE_FLUCTUATION_MIN);
  
  // 60% chance of price decrease (to trigger more alerts for demo)
  const direction = Math.random() < 0.6 ? -1 : 1;
  const newPrice = basePrice * (1 + direction * fluctuationPercent);
  
  // Round to 2 decimal places and ensure minimum price of $10
  return Math.max(10, Math.round(newPrice * 100) / 100);
}

/**
 * Fetches current price from Amazon PA-API (production mode)
 * Currently returns null as a placeholder - implementation pending Amazon PA-API approval.
 * 
 * When PA-API access is granted, this function will:
 * 1. Use AWS Signature Version 4 for request signing
 * 2. Call the GetItems operation with ItemIds and Offers.Listings.Price resources
 * 3. Return the price from the response
 * 
 * Until then, the check-prices function falls back to using the current_price from the database.
 */
async function fetchAmazonPrice(_asin: string): Promise<number | null> {
  // TODO: Implement Amazon Product Advertising API integration
  // This will require:
  // 1. Amazon PA-API credentials (Access Key, Secret Key, Partner Tag)
  // 2. Request signing with AWS Signature Version 4
  // 3. Rate limiting (1 request per second per partner tag)
  //
  // Example implementation:
  // const response = await signAndFetch('GetItems', {
  //   ItemIds: [asin],
  //   Resources: ['Offers.Listings.Price']
  // });
  // return response.Items?.[0]?.Offers?.Listings?.[0]?.Price?.Amount;
  
  return null;
}

/**
 * Extracts ASIN from Amazon URL
 */
function extractAsinFromUrl(amazonUrl: string): string | null {
  // Match various Amazon URL patterns
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/ASIN\/([A-Z0-9]{10})/i,
  ];
  
  for (const pattern of patterns) {
    const match = amazonUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results: PriceCheckResult[] = [];
  let processedCount = 0;
  let triggeredCount = 0;
  let errorCount = 0;

  try {
    // Validate environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active (non-triggered) price alerts
    const { data: alerts, error: fetchError } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("triggered", false);

    if (fetchError) {
      throw new Error(`Failed to fetch alerts: ${fetchError.message}`);
    }

    if (!alerts || alerts.length === 0) {
      // Log monitoring activity even when no alerts
      await supabase.from("price_monitoring_logs").insert({
        check_type: "scheduled",
        alerts_processed: 0,
        alerts_triggered: 0,
        errors: 0,
        duration_ms: Date.now() - startTime,
        metadata: { message: "No active alerts to process" },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "No active alerts to process",
          processed: 0,
          triggered: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process each alert
    for (const alert of alerts as PriceAlert[]) {
      try {
        let newPrice: number;

        if (DEMO_MODE) {
          // Simulate price change in demo mode
          newPrice = simulatePriceChange(alert.current_price, alert.original_price);
        } else {
          // Production mode: fetch from Amazon PA-API
          const asin = extractAsinFromUrl(alert.amazon_url);
          if (!asin) {
            console.error(`Invalid Amazon URL for alert ${alert.id}`);
            errorCount++;
            continue;
          }

          const fetchedPrice = await fetchAmazonPrice(asin);
          if (fetchedPrice === null) {
            // If we can't fetch price, keep the current price
            newPrice = alert.current_price ?? alert.original_price ?? 0;
          } else {
            newPrice = fetchedPrice;
          }
        }

        const oldPrice = alert.current_price ?? alert.original_price ?? 0;
        const priceDropped = newPrice <= alert.target_price;

        // Record price in history
        await supabase.from("price_history").insert({
          shoe_id: alert.shoe_id,
          price: newPrice,
          source: DEMO_MODE ? "demo_simulation" : "amazon_api",
        });

        // Update alert with new price and last check time
        const updateData: Record<string, unknown> = {
          current_price: newPrice,
          last_checked: new Date().toISOString(),
        };

        if (priceDropped) {
          updateData.triggered = true;
          updateData.triggered_at = new Date().toISOString();
          triggeredCount++;

          // Create price notification
          const savedAmount = oldPrice - newPrice;
          const percentOff = oldPrice > 0 ? Math.round((savedAmount / oldPrice) * 100) : 0;

          await supabase.from("price_notifications").insert({
            user_id: alert.user_id,
            shoe_id: alert.shoe_id,
            shoe_name: alert.shoe_name,
            shoe_brand: alert.shoe_brand,
            shoe_image: alert.shoe_image,
            amazon_url: alert.amazon_url,
            old_price: oldPrice,
            new_price: newPrice,
            saved_amount: savedAmount,
            percent_off: percentOff,
            read: false,
            notification_sent: false,
          });
        }

        await supabase
          .from("price_alerts")
          .update(updateData)
          .eq("id", alert.id);

        results.push({
          alertId: alert.id,
          shoeId: alert.shoe_id,
          oldPrice,
          newPrice,
          triggered: priceDropped,
        });

        processedCount++;
      } catch (alertError) {
        console.error(`Error processing alert ${alert.id}:`, alertError);
        errorCount++;
      }
    }

    // Log monitoring results
    await supabase.from("price_monitoring_logs").insert({
      check_type: "scheduled",
      alerts_processed: processedCount,
      alerts_triggered: triggeredCount,
      errors: errorCount,
      duration_ms: Date.now() - startTime,
      metadata: {
        demo_mode: DEMO_MODE,
        results_summary: results.map((r) => ({
          shoe_id: r.shoeId,
          triggered: r.triggered,
        })),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        triggered: triggeredCount,
        errors: errorCount,
        durationMs: Date.now() - startTime,
        demoMode: DEMO_MODE,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in check-prices function:", error);

    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("price_monitoring_logs").insert({
          check_type: "scheduled",
          alerts_processed: processedCount,
          alerts_triggered: triggeredCount,
          errors: errorCount + 1,
          duration_ms: Date.now() - startTime,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    } catch {
      // Ignore logging errors
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
