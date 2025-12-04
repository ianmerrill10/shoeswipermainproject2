// Supabase Edge Function: supabase/functions/analyze-outfit/index.ts
// Deploy with: supabase functions deploy analyze-outfit
// Set secrets:
//   supabase secrets set GEMINI_API_KEY=your-key-here
//   supabase secrets set SUPABASE_URL=https://<project>.supabase.co
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders } from "../_shared/cors.ts";

const DEFAULT_MONTHLY_LIMIT = 10;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase credentials are not configured for the analyze-outfit function");
}

interface UsageSummary {
  monthly_limit: number;
  remaining: number;
}

const getCurrentPeriodStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let supabaseClient;
  let usageReserved = false;
  let userId: string | null = null;

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({
        error: "Server misconfiguration",
        fallback: true
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Create a Supabase client scoped to the user's session for auth + admin writes
    supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization") ?? ""
          }
        }
      }
    );

    const { data: authData, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !authData?.user) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        fallback: true
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    userId = authData.user.id;

    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body",
        fallback: true
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { image } = body;

    // Input validation: image must be a non-empty base64 string
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({
        error: "Missing or invalid 'image' field. Expected base64-encoded image data.",
        fallback: true
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Basic base64 validation (should only contain valid base64 characters)
    // Allows 0-2 padding characters at the end
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(image)) {
      return new Response(JSON.stringify({
        error: "Invalid base64 encoding in 'image' field",
        fallback: true
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Limit base64 encoded image size (max 10MB encoded = ~7.5MB original image)
    const MAX_BASE64_SIZE = 10 * 1024 * 1024;
    if (image.length > MAX_BASE64_SIZE) {
      return new Response(JSON.stringify({
        error: "Image too large. Maximum size is 10MB.",
        fallback: true
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check AI usage limits
    const currentPeriod = getCurrentPeriodStart();
    const { data: usageRow, error: usageError } = await supabaseClient
      .from("ai_usage_limits")
      .select("monthly_limit, used_this_month, period_start")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (usageError) {
      console.error("Usage lookup failed", usageError);
      throw usageError;
    }

    const monthlyLimit = usageRow?.monthly_limit ?? DEFAULT_MONTHLY_LIMIT;
    const periodStart = usageRow?.period_start ? new Date(usageRow.period_start) : null;
    const usedThisMonth = periodStart &&
      periodStart.getUTCFullYear() === currentPeriod.getUTCFullYear() &&
      periodStart.getUTCMonth() === currentPeriod.getUTCMonth()
      ? usageRow?.used_this_month ?? 0
      : 0;

    if (monthlyLimit - usedThisMonth <= 0) {
      const usage: UsageSummary = {
        monthly_limit: monthlyLimit,
        remaining: 0
      };

      return new Response(JSON.stringify({
        error: "Monthly AI analysis limit reached",
        usage,
        fallback: true
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Reserve the usage before calling the AI model to avoid double spending
    const { error: usageUpdateError } = await supabaseClient
      .from("ai_usage_limits")
      .upsert({
        user_id: authData.user.id,
        monthly_limit: monthlyLimit,
        used_this_month: usedThisMonth + 1,
        period_start: currentPeriod.toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (usageUpdateError) {
      console.error("Usage update failed", usageUpdateError);
      throw usageUpdateError;
    }

    usageReserved = true;

    // Call Gemini Vision API
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this outfit photo. Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
                {
                  "rating": <number 1-10>,
                  "feedback": "<personalized style feedback>",
                  "style_tags": ["<style1>", "<style2>", ...],
                  "dominant_colors": ["<color1>", "<color2>", ...],
                  "detected_shoe": "<description of shoes if visible, or null>"
                }
                
                Style tags should include things like: streetwear, casual, athletic, formal, vintage, minimalist, bold, preppy, grunge, etc.
                Color tags should be the dominant colors in the outfit.
                Be encouraging but honest in feedback. Rate based on coordination, style cohesion, and overall aesthetic.`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: image // base64 without prefix
                }
              }
            ]
          }]
        })
      }
    );

    // Handle rate limits
    if (response.status === 429) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded. Please try again in a moment.",
        fallback: true
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from Gemini API");
    }

    // Clean up markdown code blocks if Gemini adds them
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    const usage: UsageSummary = {
      monthly_limit: monthlyLimit,
      remaining: Math.max(monthlyLimit - (usedThisMonth + 1), 0)
    };

    return new Response(JSON.stringify({ analysis, usage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error analyzing outfit:", error);

    if (usageReserved && supabaseClient && userId) {
      try {
        const currentPeriod = getCurrentPeriodStart();
        const { data: usageRow, error: rollbackFetchError } = await supabaseClient
          .from("ai_usage_limits")
          .select("used_this_month, period_start")
          .eq("user_id", userId)
          .maybeSingle();

        if (rollbackFetchError) {
          console.warn("Failed to load usage for rollback", rollbackFetchError);
        }

        if (usageRow) {
          const periodStart = usageRow.period_start ? new Date(usageRow.period_start) : null;
          const isCurrentPeriod = periodStart &&
            periodStart.getUTCFullYear() === currentPeriod.getUTCFullYear() &&
            periodStart.getUTCMonth() === currentPeriod.getUTCMonth();

          const usedThisMonth = isCurrentPeriod ? usageRow.used_this_month ?? 0 : 0;
          const newUsedValue = Math.max(usedThisMonth - 1, 0);

          const { error: rollbackError } = await supabaseClient
            .from("ai_usage_limits")
            .update({ used_this_month: newUsedValue, updated_at: new Date().toISOString() })
            .eq("user_id", userId);

          if (rollbackError) {
            console.warn("Failed to rollback AI usage after error", rollbackError);
          }
        }
      } catch (rollbackUnexpectedError) {
        console.warn("Unexpected error during usage rollback", rollbackUnexpectedError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    return new Response(JSON.stringify({
      error: errorMessage,
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
