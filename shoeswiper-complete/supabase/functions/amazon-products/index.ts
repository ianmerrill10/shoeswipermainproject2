// Supabase Edge Function: supabase/functions/amazon-products/index.ts
// Deploy with: supabase functions deploy amazon-products
// Set secrets:
//   supabase secrets set AMAZON_ACCESS_KEY=your-access-key
//   supabase secrets set AMAZON_SECRET_KEY=your-secret-key
//   supabase secrets set AMAZON_PARTNER_TAG=shoeswiper-20

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// AWS Signature V4 signing utilities
const encoder = new TextEncoder();

async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
}

async function sha256(message: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(message));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(encoder.encode("AWS4" + key).buffer as ArrayBuffer, dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

interface AmazonRequestParams {
  operation: "SearchItems" | "GetItems" | "GetBrowseNodes";
  searchIndex?: string;
  keywords?: string;
  itemIds?: string[];
  browseNodeIds?: string[];
  itemCount?: number;
}

interface AmazonProductItem {
  ASIN: string;
  DetailPageURL: string;
  ItemInfo?: {
    Title?: { DisplayValue: string };
    ByLineInfo?: { Brand?: { DisplayValue: string } };
    Classifications?: { ProductGroup?: { DisplayValue: string } };
    Features?: { DisplayValues: string[] };
  };
  Images?: {
    Primary?: {
      Large?: { URL: string; Width: number; Height: number };
      Medium?: { URL: string; Width: number; Height: number };
    };
  };
  Offers?: {
    Listings?: Array<{
      Price?: {
        Amount: number;
        Currency: string;
        DisplayAmount: string;
      };
      Availability?: {
        Message: string;
        Type: string;
      };
    }>;
  };
}

interface TransformedProduct {
  asin: string;
  name: string;
  brand: string;
  price: number | null;
  currency: string;
  image_url: string;
  amazon_url: string;
  availability: "in_stock" | "low_stock" | "out_of_stock";
  features: string[];
  category: string | null;
}

async function signRequest(
  accessKey: string,
  secretKey: string,
  partnerTag: string,
  params: AmazonRequestParams
): Promise<{ headers: Record<string, string>; body: string }> {
  const host = "webservices.amazon.com";
  const region = "us-east-1";
  const service = "ProductAdvertisingAPI";
  const endpoint = `https://${host}/paapi5/${params.operation.toLowerCase()}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  // Build request payload based on operation
  let payload: Record<string, unknown>;

  switch (params.operation) {
    case "SearchItems":
      payload = {
        PartnerTag: partnerTag,
        PartnerType: "Associates",
        Keywords: params.keywords,
        SearchIndex: params.searchIndex || "Fashion",
        ItemCount: params.itemCount || 10,
        Resources: [
          "ItemInfo.Title",
          "ItemInfo.ByLineInfo",
          "ItemInfo.Classifications",
          "ItemInfo.Features",
          "Images.Primary.Large",
          "Images.Primary.Medium",
          "Offers.Listings.Price",
          "Offers.Listings.Availability.Message",
          "Offers.Listings.Availability.Type",
        ],
      };
      break;

    case "GetItems":
      payload = {
        PartnerTag: partnerTag,
        PartnerType: "Associates",
        ItemIds: params.itemIds,
        Resources: [
          "ItemInfo.Title",
          "ItemInfo.ByLineInfo",
          "ItemInfo.Classifications",
          "ItemInfo.Features",
          "Images.Primary.Large",
          "Images.Primary.Medium",
          "Offers.Listings.Price",
          "Offers.Listings.Availability.Message",
          "Offers.Listings.Availability.Type",
        ],
      };
      break;

    case "GetBrowseNodes":
      payload = {
        PartnerTag: partnerTag,
        PartnerType: "Associates",
        BrowseNodeIds: params.browseNodeIds,
        Resources: ["BrowseNodes.Ancestor", "BrowseNodes.Children"],
      };
      break;
  }

  const requestBody = JSON.stringify(payload);

  // Create canonical request
  const method = "POST";
  const canonicalUri = `/paapi5/${params.operation.toLowerCase()}`;
  const canonicalQueryString = "";

  const payloadHash = await sha256(requestBody);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${params.operation}\n`;

  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  // Create string to sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256(canonicalRequest),
  ].join("\n");

  // Calculate signature
  const signingKey = await getSignatureKey(secretKey, dateStamp, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  // Build authorization header
  const authorization = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Encoding": "amz-1.0",
      "X-Amz-Date": amzDate,
      "X-Amz-Target": `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${params.operation}`,
      Authorization: authorization,
      Host: host,
    },
    body: requestBody,
  };
}

function transformAmazonProduct(
  item: AmazonProductItem,
  partnerTag: string
): TransformedProduct {
  const listing = item.Offers?.Listings?.[0];
  const price = listing?.Price?.Amount || null;
  const currency = listing?.Price?.Currency || "USD";

  // Determine availability
  let availability: "in_stock" | "low_stock" | "out_of_stock" = "out_of_stock";
  const availType = listing?.Availability?.Type?.toLowerCase() || "";
  const availMsg = listing?.Availability?.Message?.toLowerCase() || "";

  if (availType.includes("instock") || availMsg.includes("in stock")) {
    availability = "in_stock";
  } else if (availType.includes("limited") || availMsg.includes("only")) {
    availability = "low_stock";
  }

  // Build URL with affiliate tag
  let amazonUrl = item.DetailPageURL || `https://www.amazon.com/dp/${item.ASIN}`;
  if (!amazonUrl.includes("tag=")) {
    amazonUrl += amazonUrl.includes("?") ? `&tag=${partnerTag}` : `?tag=${partnerTag}`;
  }

  return {
    asin: item.ASIN,
    name: item.ItemInfo?.Title?.DisplayValue || "Unknown Product",
    brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || "Unknown Brand",
    price,
    currency,
    image_url:
      item.Images?.Primary?.Large?.URL ||
      item.Images?.Primary?.Medium?.URL ||
      "",
    amazon_url: amazonUrl,
    availability,
    features: item.ItemInfo?.Features?.DisplayValues || [],
    category: item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue || null,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const accessKey = Deno.env.get("AMAZON_ACCESS_KEY");
    const secretKey = Deno.env.get("AMAZON_SECRET_KEY");
    const partnerTag = Deno.env.get("AMAZON_PARTNER_TAG") || "shoeswiper-20";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!accessKey || !secretKey) {
      return new Response(
        JSON.stringify({
          error: "Amazon PA-API credentials not configured",
          code: "CREDENTIALS_NOT_CONFIGURED",
        }),
        {
          status: 503,
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

    const { operation, keywords, itemIds, browseNodeIds, searchIndex, itemCount } = body;

    // Validate operation
    const validOperations = ["SearchItems", "GetItems", "GetBrowseNodes"];
    if (!operation || !validOperations.includes(operation)) {
      return new Response(
        JSON.stringify({
          error: `Invalid operation. Must be one of: ${validOperations.join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate operation-specific params
    if (operation === "SearchItems" && !keywords) {
      return new Response(
        JSON.stringify({ error: "SearchItems requires 'keywords' parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (operation === "GetItems" && (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0)) {
      return new Response(
        JSON.stringify({ error: "GetItems requires 'itemIds' array parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (operation === "GetBrowseNodes" && (!browseNodeIds || !Array.isArray(browseNodeIds))) {
      return new Response(
        JSON.stringify({ error: "GetBrowseNodes requires 'browseNodeIds' array parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Input sanitization for itemIds (ASINs should be alphanumeric, 10 chars)
    if (itemIds) {
      const asinRegex = /^[A-Z0-9]{10}$/;
      for (const id of itemIds) {
        if (!asinRegex.test(id)) {
          return new Response(
            JSON.stringify({ error: `Invalid ASIN format: ${id}` }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    // Sign and make the request
    const params: AmazonRequestParams = {
      operation,
      keywords,
      itemIds,
      browseNodeIds,
      searchIndex: searchIndex || "Fashion",
      itemCount: Math.min(itemCount || 10, 10), // Max 10 per request
    };

    const { headers, body: requestBody } = await signRequest(
      accessKey,
      secretKey,
      partnerTag,
      params
    );

    const endpoint = `https://webservices.amazon.com/paapi5/${operation.toLowerCase()}`;

    const amazonResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      body: requestBody,
    });

    // Handle rate limiting
    if (amazonResponse.status === 429) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMITED",
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }

    if (!amazonResponse.ok) {
      const errorText = await amazonResponse.text();
      console.error("Amazon API Error:", amazonResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Amazon API request failed",
          status: amazonResponse.status,
        }),
        {
          status: amazonResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await amazonResponse.json();

    // Transform response based on operation
    let transformedData;

    if (operation === "SearchItems" || operation === "GetItems") {
      const items = data.SearchResult?.Items || data.ItemsResult?.Items || [];
      transformedData = {
        products: items.map((item: AmazonProductItem) =>
          transformAmazonProduct(item, partnerTag)
        ),
        totalResults: data.SearchResult?.TotalResultCount || items.length,
      };

      // Cache products in Supabase if available
      if (supabaseUrl && supabaseServiceKey && transformedData.products.length > 0) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          for (const product of transformedData.products) {
            // Upsert product cache
            await supabase.from("amazon_product_cache").upsert(
              {
                asin: product.asin,
                name: product.name,
                brand: product.brand,
                price: product.price,
                currency: product.currency,
                image_url: product.image_url,
                amazon_url: product.amazon_url,
                availability: product.availability,
                features: product.features,
                category: product.category,
                last_updated: new Date().toISOString(),
              },
              { onConflict: "asin" }
            );

            // Record price history if price exists
            if (product.price !== null) {
              await supabase.from("amazon_price_history").insert({
                asin: product.asin,
                price: product.price,
                currency: product.currency,
                recorded_at: new Date().toISOString(),
              });
            }
          }
        } catch (cacheError) {
          console.error("Cache update failed:", cacheError);
          // Don't fail the request if caching fails
        }
      }
    } else if (operation === "GetBrowseNodes") {
      transformedData = {
        browseNodes: data.BrowseNodesResult?.BrowseNodes || [],
      };
    }

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in amazon-products function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
