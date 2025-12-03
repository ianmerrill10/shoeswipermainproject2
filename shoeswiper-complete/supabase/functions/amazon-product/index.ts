// Supabase Edge Function: supabase/functions/amazon-product/index.ts
// Deploy with: supabase functions deploy amazon-product
// Set secrets:
//   supabase secrets set AMAZON_ACCESS_KEY=your-access-key
//   supabase secrets set AMAZON_SECRET_KEY=your-secret-key
//   supabase secrets set AMAZON_PARTNER_TAG=shoeswiper-20

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  checkRateLimit,
  getUserIdFromToken,
  getClientIp,
  rateLimitHeaders,
} from "../_shared/rateLimit.ts";

// Rate limit configuration - Amazon PA-API allows 1 req/sec
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,          // 10 requests
  windowMs: 60 * 1000,      // per minute (conservative)
  keyPrefix: 'amazon-product'
};

// Amazon PA-API endpoints by region
const AMAZON_ENDPOINTS: Record<string, string> = {
  'us': 'webservices.amazon.com',
  'uk': 'webservices.amazon.co.uk',
  'de': 'webservices.amazon.de',
  'fr': 'webservices.amazon.fr',
  'jp': 'webservices.amazon.co.jp',
  'ca': 'webservices.amazon.ca',
};

// AWS Signature V4 signing
async function signRequest(
  method: string,
  host: string,
  path: string,
  payload: string,
  accessKey: string,
  secretKey: string,
  region: string = 'us-east-1'
): Promise<Record<string, string>> {
  const service = 'ProductAdvertisingAPI';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  // Create canonical request
  const canonicalUri = path;
  const canonicalQuerystring = '';
  const contentType = 'application/json; charset=UTF-8';

  // Hash payload
  const encoder = new TextEncoder();
  const payloadHash = await crypto.subtle.digest('SHA-256', encoder.encode(payload));
  const payloadHashHex = Array.from(new Uint8Array(payloadHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n`;

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest =
    `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHashHex}`;

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;

  // Calculate signature
  const getSignatureKey = async (key: string, dateStamp: string, region: string, service: string) => {
    const kDate = await hmacSha256(`AWS4${key}`, dateStamp);
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    const kSigning = await hmacSha256(kService, 'aws4_request');
    return kSigning;
  };

  const hmacSha256 = async (key: string | ArrayBuffer, data: string): Promise<ArrayBuffer> => {
    const keyData = typeof key === 'string' ? encoder.encode(key) : key;
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  };

  const signingKey = await getSignatureKey(secretKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const authorizationHeader =
    `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Authorization': authorizationHeader,
    'Content-Encoding': 'amz-1.0',
    'Content-Type': contentType,
    'Host': host,
    'X-Amz-Date': amzDate,
    'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
  };
}

interface ProductResult {
  asin: string;
  title: string;
  imageUrl: string | null;
  imageLarge: string | null;
  price: number | null;
  currency: string;
  availability: string;
  url: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limiting
  const authHeader = req.headers.get('authorization');
  const userId = getUserIdFromToken(authHeader);
  const identifier = userId || getClientIp(req);
  const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({
      error: "Rate limit exceeded. Please wait before trying again.",
      retryAfterSeconds: Math.ceil((rateLimitResult.retryAfterMs || 0) / 1000)
    }), {
      status: 429,
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders(rateLimitResult),
        "Content-Type": "application/json"
      }
    });
  }

  try {
    const { asins, region = 'us' } = await req.json();

    if (!asins || !Array.isArray(asins) || asins.length === 0) {
      return new Response(JSON.stringify({
        error: "No ASINs provided. Expected { asins: ['ASIN1', 'ASIN2', ...] }"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Limit to 10 ASINs per request (PA-API limit)
    const limitedAsins = asins.slice(0, 10);

    // Get credentials from environment
    const accessKey = Deno.env.get("AMAZON_ACCESS_KEY");
    const secretKey = Deno.env.get("AMAZON_SECRET_KEY");
    const partnerTag = Deno.env.get("AMAZON_PARTNER_TAG") || "shoeswiper-20";

    if (!accessKey || !secretKey) {
      // Return fallback response when API not configured
      console.warn("Amazon PA-API credentials not configured");
      return new Response(JSON.stringify({
        products: limitedAsins.map(asin => ({
          asin,
          title: null,
          imageUrl: null,
          imageLarge: null,
          price: null,
          currency: 'USD',
          availability: 'unknown',
          url: `https://www.amazon.com/dp/${asin}?tag=${partnerTag}`,
          error: 'API not configured'
        })),
        source: 'fallback',
        message: 'Amazon PA-API not configured. Using fallback URLs.'
      }), {
        headers: {
          ...corsHeaders,
          ...rateLimitHeaders(rateLimitResult),
          "Content-Type": "application/json"
        }
      });
    }

    // Build PA-API request
    const host = AMAZON_ENDPOINTS[region] || AMAZON_ENDPOINTS['us'];
    const path = '/paapi5/getitems';

    const payload = JSON.stringify({
      ItemIds: limitedAsins,
      ItemIdType: "ASIN",
      PartnerTag: partnerTag,
      PartnerType: "Associates",
      Resources: [
        "Images.Primary.Large",
        "Images.Primary.Medium",
        "ItemInfo.Title",
        "Offers.Listings.Price",
        "Offers.Listings.Availability.Type",
      ]
    });

    // Sign the request
    const headers = await signRequest('POST', host, path, payload, accessKey, secretKey);

    // Make the request to Amazon
    const response = await fetch(`https://${host}${path}`, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Amazon PA-API error: ${response.status}`, errorText);

      // Return fallback on error
      return new Response(JSON.stringify({
        products: limitedAsins.map(asin => ({
          asin,
          title: null,
          imageUrl: null,
          imageLarge: null,
          price: null,
          currency: 'USD',
          availability: 'unknown',
          url: `https://www.amazon.com/dp/${asin}?tag=${partnerTag}`,
          error: `API error: ${response.status}`
        })),
        source: 'fallback',
        error: `Amazon API returned ${response.status}`
      }), {
        status: response.status === 429 ? 429 : 200, // Pass through rate limits
        headers: {
          ...corsHeaders,
          ...rateLimitHeaders(rateLimitResult),
          "Content-Type": "application/json"
        }
      });
    }

    const data = await response.json();

    // Parse the response
    const products: ProductResult[] = [];

    // Handle successful items
    if (data.ItemsResult?.Items) {
      for (const item of data.ItemsResult.Items) {
        const price = item.Offers?.Listings?.[0]?.Price?.Amount;
        const currency = item.Offers?.Listings?.[0]?.Price?.Currency || 'USD';

        products.push({
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue || null,
          imageUrl: item.Images?.Primary?.Medium?.URL || null,
          imageLarge: item.Images?.Primary?.Large?.URL || null,
          price: price ? Math.round(price * 100) : null, // Convert to cents
          currency,
          availability: item.Offers?.Listings?.[0]?.Availability?.Type || 'unknown',
          url: `https://www.amazon.com/dp/${item.ASIN}?tag=${partnerTag}`,
        });
      }
    }

    // Handle errors for specific items
    if (data.Errors) {
      for (const error of data.Errors) {
        if (error.Code === 'ItemNotAccessible' && error.Message) {
          // Extract ASIN from error message if possible
          const asinMatch = error.Message.match(/ItemId ([A-Z0-9]+)/);
          if (asinMatch) {
            products.push({
              asin: asinMatch[1],
              title: null,
              imageUrl: null,
              imageLarge: null,
              price: null,
              currency: 'USD',
              availability: 'unavailable',
              url: `https://www.amazon.com/dp/${asinMatch[1]}?tag=${partnerTag}`,
              error: 'Item not accessible'
            });
          }
        }
      }
    }

    // Add fallback for any ASINs not in response
    const returnedAsins = new Set(products.map(p => p.asin));
    for (const asin of limitedAsins) {
      if (!returnedAsins.has(asin)) {
        products.push({
          asin,
          title: null,
          imageUrl: null,
          imageLarge: null,
          price: null,
          currency: 'USD',
          availability: 'unknown',
          url: `https://www.amazon.com/dp/${asin}?tag=${partnerTag}`,
          error: 'Not found in response'
        });
      }
    }

    return new Response(JSON.stringify({
      products,
      source: 'amazon-pa-api',
      requestedCount: limitedAsins.length,
      successCount: products.filter(p => !p.error).length,
    }), {
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders(rateLimitResult),
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error fetching from Amazon:", error);
    return new Response(JSON.stringify({
      error: error.message,
      products: []
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
