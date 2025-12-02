// Supabase Edge Function: supabase/functions/analyze-outfit/index.ts
// Deploy with: supabase functions deploy analyze-outfit
// Set secret: supabase secrets set GEMINI_API_KEY=your-key-here

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image } = await req.json(); // base64 image

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

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error analyzing outfit:", error);
    return new Response(JSON.stringify({
      error: error.message,
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
