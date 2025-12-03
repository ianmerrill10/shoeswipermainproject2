// Supabase Edge Function: supabase/functions/analyze-outfit/index.ts
// Deploy with: supabase functions deploy analyze-outfit
// Set secret: supabase secrets set GEMINI_API_KEY=your-key-here

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Maximum allowed image size (5MB in base64 is roughly 6.67MB)
const MAX_IMAGE_SIZE = 7 * 1024 * 1024; // 7MB to account for base64 overhead

// Rate limiting (simple in-memory store - resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  entry.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // Get client identifier for rate limiting (IP or Authorization header hash)
    const clientId = req.headers.get("authorization")?.slice(0, 20) || 
                     req.headers.get("x-forwarded-for") || 
                     "anonymous";
    
    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded. Please try again later.",
        fallback: true
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse request body with size limit
    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > MAX_IMAGE_SIZE) {
      return new Response(JSON.stringify({
        error: "Image too large. Maximum size is 5MB.",
        fallback: true
      }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const body = await req.json();
    const { image } = body;

    // Validate image input
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({
        error: "Invalid image data",
        fallback: true
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Validate base64 format (basic check)
    if (!/^[A-Za-z0-9+/=]+$/.test(image)) {
      return new Response(JSON.stringify({
        error: "Invalid image encoding",
        fallback: true
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Call Gemini Vision API
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(JSON.stringify({
        error: "AI service not configured",
        fallback: true
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
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

    // Handle rate limits from Gemini
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
      console.error(`Gemini API error: ${response.status}`);
      return new Response(JSON.stringify({
        error: "AI analysis failed. Please try again.",
        fallback: true
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({
        error: "No response from AI service",
        fallback: true
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Clean up markdown code blocks if Gemini adds them
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Validate JSON structure before returning
    let analysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse Gemini response:", jsonStr);
      return new Response(JSON.stringify({
        error: "Invalid AI response format",
        fallback: true
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Validate required fields
    if (typeof analysis.rating !== 'number' || 
        !Array.isArray(analysis.style_tags) ||
        !Array.isArray(analysis.dominant_colors)) {
      return new Response(JSON.stringify({
        error: "Incomplete AI response",
        fallback: true
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    // Don't expose internal error details to clients
    console.error("Error analyzing outfit:", error);
    return new Response(JSON.stringify({
      error: "An unexpected error occurred",
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
