// Supabase Edge Function: supabase/functions/get-amazon-prices/index.ts
// Deploy with: supabase functions deploy get-amazon-prices
// Set secrets:
//   supabase secrets set AMAZON_ACCESS_KEY=your-access-key
//   supabase secrets set AMAZON_SECRET_KEY=your-secret-key
//   supabase secrets set AMAZON_PARTNER_TAG=shoeswiper-20

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Constants for Amazon PA-API
const AMAZON_HOST = "webservices.amazon.com";
const AMAZON_REGION = "us-east-1";
const AMAZON_SERVICE = "ProductAdvertisingAPI";
const AMAZON_ENDPOINT = `https://${AMAZON_HOST}/paapi5/getitems`;

// ASIN validation regex: 10 alphanumeric characters
const ASIN_REGEX = /^[A-Z0-9]{10}$/;

// Maximum ASINs per request (Amazon PA-API limit)
const MAX_ASINS_PER_REQUEST = 10;

// Note: AmazonPriceData is duplicated from src/lib/types.ts because Supabase Edge Functions
// run in Deno runtime and cannot import from the frontend TypeScript codebase.
// Keep these types in sync with the frontend type definitions.
interface AmazonPriceData {
  asin: string;
  price: number;
  currency: string;
  availability: "in_stock" | "low_stock" | "out_of_stock";
  lastUpdated: string;
}

interface RequestBody {
  asins: string[];
}

interface AmazonPriceResponse {
  success: boolean;
  data: AmazonPriceData[];
  errors?: { asin: string; message: string }[];
}

// Amazon PA-API Response Types
interface AmazonPriceInfo {
  Amount?: number;
  Currency?: string;
}

interface AmazonAvailability {
  Message?: string;
  Type?: string;
}

interface AmazonListing {
  Price?: AmazonPriceInfo;
  Availability?: AmazonAvailability;
}

interface AmazonOfferSummary {
  Condition?: {
    Value?: string;
  };
}

interface AmazonOffers {
  Listings?: AmazonListing[];
  Summaries?: AmazonOfferSummary[];
}

interface AmazonItem {
  ASIN: string;
  Offers?: AmazonOffers;
}

interface AmazonItemsResult {
  Items?: AmazonItem[];
}

interface AmazonAPIError {
  ASIN?: string;
  Message?: string;
}

interface AmazonGetItemsResponse {
  ItemsResult?: AmazonItemsResult;
  Errors?: AmazonAPIError[];
}

/**
 * Converts ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Creates HMAC-SHA256 signature
 */
async function hmacSha256(
  key: ArrayBuffer | Uint8Array,
  message: string
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(message)
  );
}

/**
 * Creates SHA-256 hash
 */
async function sha256(message: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(message)
  );
  return bufferToHex(hash);
}

/**
 * Gets the signing key for AWS Signature Version 4
 */
async function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(
    new TextEncoder().encode("AWS4" + secretKey),
    dateStamp
  );
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

/**
 * Signs a request using AWS Signature Version 4
 */
async function signRequest(
  method: string,
  host: string,
  path: string,
  payload: string,
  accessKey: string,
  secretKey: string,
  region: string,
  service: string
): Promise<Record<string, string>> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  // Create canonical request
  const contentType = "application/json; charset=UTF-8";
  const canonicalUri = path;
  const canonicalQuerystring = "";
  const payloadHash = await sha256(payload);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n`;

  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const canonicalRequest =
    method +
    "\n" +
    canonicalUri +
    "\n" +
    canonicalQuerystring +
    "\n" +
    canonicalHeaders +
    "\n" +
    signedHeaders +
    "\n" +
    payloadHash;

  // Create string to sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign =
    algorithm +
    "\n" +
    amzDate +
    "\n" +
    credentialScope +
    "\n" +
    (await sha256(canonicalRequest));

  // Calculate signature
  const signingKey = await getSignatureKey(
    secretKey,
    dateStamp,
    region,
    service
  );
  const signature = bufferToHex(await hmacSha256(signingKey, stringToSign));

  // Create authorization header
  const authorizationHeader =
    `${algorithm} ` +
    `Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;

  return {
    "Content-Type": contentType,
    "Content-Encoding": "amz-1.0",
    Host: host,
    "X-Amz-Date": amzDate,
    "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
    Authorization: authorizationHeader,
  };
}

/**
 * Validates ASIN format
 */
function isValidAsin(asin: string): boolean {
  return ASIN_REGEX.test(asin);
}

/**
 * Maps Amazon availability to our stock status
 */
function mapAvailability(
  availabilityMessage: string | undefined,
  availabilityType: string | undefined
): "in_stock" | "low_stock" | "out_of_stock" {
  if (!availabilityMessage && !availabilityType) {
    return "out_of_stock";
  }

  const message = (availabilityMessage || "").toLowerCase();
  const type = (availabilityType || "").toLowerCase();

  if (type === "now" || message.includes("in stock")) {
    return "in_stock";
  }
  if (
    message.includes("only") ||
    message.includes("few left") ||
    message.includes("limited")
  ) {
    return "low_stock";
  }
  if (
    message.includes("out of stock") ||
    message.includes("unavailable") ||
    type === "unavailable"
  ) {
    return "out_of_stock";
  }

  // Default to out_of_stock for safety if we can't determine
  return "out_of_stock";
}

/**
 * Parses Amazon PA-API response into our price data format
 */
function parseAmazonResponse(
  responseData: AmazonGetItemsResponse,
  requestedAsins: string[]
): { data: AmazonPriceData[]; errors: { asin: string; message: string }[] } {
  const priceData: AmazonPriceData[] = [];
  const errors: { asin: string; message: string }[] = [];
  const foundAsins = new Set<string>();

  // Process successful items
  if (responseData.ItemsResult?.Items) {
    for (const item of responseData.ItemsResult.Items) {
      const asin = item.ASIN;
      foundAsins.add(asin);

      const offers = item.Offers?.Listings?.[0];
      const price = offers?.Price?.Amount;
      const currency = offers?.Price?.Currency || "USD";
      const availabilityMessage =
        offers?.Availability?.Message ||
        item.Offers?.Summaries?.[0]?.Condition?.Value;
      const availabilityType = offers?.Availability?.Type;

      if (price !== undefined) {
        const numericPrice = Number(price);
        if (!isNaN(numericPrice) && numericPrice >= 0) {
          priceData.push({
            asin,
            price: numericPrice,
            currency,
            availability: mapAvailability(availabilityMessage, availabilityType),
            lastUpdated: new Date().toISOString(),
          });
        } else {
          // Invalid price value
          errors.push({
            asin,
            message: "Invalid price data for this item",
          });
        }
      } else {
        // Item found but no price available
        errors.push({
          asin,
          message: "Price not available for this item",
        });
      }
    }
  }

  // Process items with errors
  if (responseData.Errors) {
    for (const error of responseData.Errors) {
      const errorAsin = error.ASIN || error.Message?.match(/ASIN\s+([A-Z0-9]{10})/)?.[1];
      if (errorAsin) {
        foundAsins.add(errorAsin);
        errors.push({
          asin: errorAsin,
          message: error.Message || "Unknown error",
        });
      }
    }
  }

  // Add errors for ASINs not found in response
  for (const asin of requestedAsins) {
    if (!foundAsins.has(asin)) {
      errors.push({
        asin,
        message: "Item not found",
      });
    }
  }

  return { data: priceData, errors };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method not allowed. Use POST.",
        }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate asins field
    if (!body.asins || !Array.isArray(body.asins)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing or invalid 'asins' field. Expected array of ASINs.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (body.asins.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ASINs array cannot be empty.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (body.asins.length > MAX_ASINS_PER_REQUEST) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Too many ASINs. Maximum ${MAX_ASINS_PER_REQUEST} per request.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate and sanitize each ASIN
    const invalidAsins: string[] = [];
    const sanitizedAsins: string[] = [];

    for (const asin of body.asins) {
      if (typeof asin !== "string") {
        invalidAsins.push(String(asin));
        continue;
      }

      const trimmedAsin = asin.trim().toUpperCase();
      if (!isValidAsin(trimmedAsin)) {
        invalidAsins.push(asin);
      } else {
        sanitizedAsins.push(trimmedAsin);
      }
    }

    if (invalidAsins.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid ASIN format. ASINs must be 10 alphanumeric characters.`,
          invalidAsins,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const accessKey = Deno.env.get("AMAZON_ACCESS_KEY");
    const secretKey = Deno.env.get("AMAZON_SECRET_KEY");
    const partnerTag =
      Deno.env.get("AMAZON_PARTNER_TAG") || "shoeswiper-20";

    if (!accessKey || !secretKey) {
      console.error("Amazon PA-API credentials not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Amazon API not configured. Please contact support.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build Amazon PA-API request payload
    const payload = JSON.stringify({
      ItemIds: sanitizedAsins,
      PartnerTag: partnerTag,
      PartnerType: "Associates",
      Marketplace: "www.amazon.com",
      Resources: [
        "ItemInfo.ByLineInfo",
        "ItemInfo.Title",
        "Offers.Listings.Price",
        "Offers.Listings.Availability",
        "Offers.Summaries.Condition",
      ],
    });

    // Sign the request
    const headers = await signRequest(
      "POST",
      AMAZON_HOST,
      "/paapi5/getitems",
      payload,
      accessKey,
      secretKey,
      AMAZON_REGION,
      AMAZON_SERVICE
    );

    // Make the API request
    const response = await fetch(AMAZON_ENDPOINT, {
      method: "POST",
      headers,
      body: payload,
    });

    // Handle rate limiting
    if (response.status === 429) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Rate limit exceeded. Amazon PA-API allows 1 request per second. Please try again.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Amazon PA-API error: ${response.status} - ${errorText}`);

      // Return generic error without exposing internal details
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to fetch prices from Amazon. Please try again later.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse response
    const responseData: AmazonGetItemsResponse = await response.json();
    const { data, errors } = parseAmazonResponse(responseData, sanitizedAsins);

    // Build response
    const result: AmazonPriceResponse = {
      success: data.length > 0,
      data,
    };

    if (errors.length > 0) {
      result.errors = errors;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-amazon-prices:", error);

    // Return generic error without exposing internal details
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
