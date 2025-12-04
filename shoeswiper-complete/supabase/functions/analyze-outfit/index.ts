// Supabase Edge Function: supabase/functions/analyze-outfit/index.ts
// Deploy with: supabase functions deploy analyze-outfit
// Set secret: supabase secrets set GEMINI_API_KEY=your-key-here
//
// SECURITY NOTES:
// - Rate limiting is handled at multiple levels:
//   1. Supabase Edge Functions have built-in rate limiting
//   2. Gemini API has its own rate limits (returns 429)
//   3. This function has in-memory rate limiting as backup
// - Authentication: Consider requiring auth for production
// - Input validation: Base64 and size limits enforced
// - Output sanitization: XSS prevention on all AI responses

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// ============================================
// SECURITY: Rate Limiting
// ============================================
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) rateLimitMap.delete(k);
    }
  }

  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

// ============================================
// SECURITY: Input Validation
// ============================================
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max
const BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;

function validateImageInput(image: unknown): { valid: boolean; error?: string } {
  if (!image || typeof image !== "string") {
    return { valid: false, error: "Image is required and must be a string" };
  }

  if (!BASE64_REGEX.test(image)) {
    return { valid: false, error: "Invalid image format - must be base64 encoded" };
  }

  const estimatedBytes = (image.length * 3) / 4;
  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB` };
  }

  return { valid: true };
}

// ============================================
// SECURITY: Output Sanitization (XSS Prevention)
// ============================================
function sanitizeString(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function sanitizeAnalysisOutput(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  if (typeof data.rating === "number") {
    sanitized.rating = Math.min(10, Math.max(1, Math.round(data.rating)));
  }

  if (typeof data.feedback === "string") {
    sanitized.feedback = sanitizeString(data.feedback.slice(0, 1000));
  }

  if (Array.isArray(data.style_tags)) {
    sanitized.style_tags = data.style_tags
      .filter((t): t is string => typeof t === "string")
      .slice(0, 10)
      .map((t) => sanitizeString(t.slice(0, 50)));
  }

  if (Array.isArray(data.dominant_colors)) {
    sanitized.dominant_colors = data.dominant_colors
      .filter((c): c is string => typeof c === "string")
      .slice(0, 5)
      .map((c) => sanitizeString(c.slice(0, 30)));
  }

  if (data.detected_shoe !== undefined) {
    sanitized.detected_shoe = data.detected_shoe === null
      ? null
      : typeof data.detected_shoe === "string"
        ? sanitizeString(data.detected_shoe.slice(0, 200))
        : null;
  }

  return sanitized;
}

// ============================================
// MAIN HANDLER
// ============================================
serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Security headers
  const securityHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed", fallback: true }), {
      status: 405,
      headers: { ...securityHeaders, "Allow": "POST, OPTIONS" },
    });
  }

  // SECURITY: Rate limiting
  const rateLimitKey = getRateLimitKey(req);
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(rateLimit.resetIn / 1000),
        fallback: true,
      }),
      {
        status: 429,
        headers: {
          ...securityHeaders,
          "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    // Validate content type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Content-Type must be application/json", fallback: true }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    // Parse request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body", fallback: true }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    // Validate image input
    const imageValidation = validateImageInput(body.image);
    if (!imageValidation.valid) {
      return new Response(JSON.stringify({ error: imageValidation.error, fallback: true }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    const image = body.image as string;

    // Call Gemini Vision API
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable", fallback: true }),
        { status: 503, headers: securityHeaders }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
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
                Be encouraging but honest in feedback. Rate based on coordination, style cohesion, and overall aesthetic.`,
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    // Handle Gemini rate limits
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Service temporarily busy. Please try again.", fallback: true }),
        { status: 429, headers: { ...securityHeaders, "Retry-After": "60" } }
      );
    }

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: "Analysis service unavailable", fallback: true }),
        { status: 502, headers: securityHeaders }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No response from Gemini API");
      return new Response(
        JSON.stringify({ error: "No analysis result", fallback: true }),
        { status: 500, headers: securityHeaders }
      );
    }

    // Clean up markdown code blocks if Gemini adds them
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse Gemini response:", jsonStr.slice(0, 200));
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis", fallback: true }),
        { status: 500, headers: securityHeaders }
      );
    }

    // SECURITY: Sanitize output to prevent XSS
    const sanitizedAnalysis = sanitizeAnalysisOutput(analysis);

    return new Response(JSON.stringify(sanitizedAnalysis), {
      headers: {
        ...securityHeaders,
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error("Error analyzing outfit:", error);

    // Classify error for appropriate response
    let safeErrorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes("429") || errorMsg.includes("rate limit") || errorMsg.includes("quota")) {
        safeErrorMessage = "Service temporarily unavailable. Please try again later.";
        statusCode = 429;
      } else if (errorMsg.includes("api_key") || errorMsg.includes("unauthorized")) {
        safeErrorMessage = "AI service configuration error";
        statusCode = 503;
      }
    }

    return new Response(
      JSON.stringify({ error: safeErrorMessage, fallback: true }),
      {
        status: statusCode,
        headers: statusCode === 429 ? { ...securityHeaders, "Retry-After": "60" } : securityHeaders,
      }
    );
  }
});
