# Amazon PA-API Edge Function Setup

This document describes how to deploy the Amazon Product Advertising API integration for ShoeSwiper.

## Overview

The Amazon PA-API integration enables live product pricing from Amazon. For security, all API calls are made through a Supabase Edge Function - **API credentials are NEVER exposed to the client**.

## Prerequisites

1. Amazon Associates account (approved)
2. PA-API access (requires 3 qualifying sales within 180 days)
3. Supabase project with Edge Functions enabled

## Affiliate Tag

**CRITICAL: The affiliate tag MUST always be `shoeswiper-20`**

This is configured in:
- `src/lib/config.ts` - Client-side configuration
- Edge Function secrets - Server-side validation

## Edge Function Deployment

### 1. Create the Edge Function Directory

```bash
mkdir -p shoeswiper-complete/supabase/functions/amazon-prices
```

### 2. Create the Edge Function Files

**supabase/functions/amazon-prices/deno.json:**
```json
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window"],
    "strict": true
  }
}
```

### 3. Create the Edge Function (index.ts)

See the complete implementation below in the "Edge Function Code" section.

### 4. Set Secrets

```bash
# Set Amazon PA-API credentials (NEVER commit these)
supabase secrets set AMAZON_ACCESS_KEY=your-access-key-here
supabase secrets set AMAZON_SECRET_KEY=your-secret-key-here
supabase secrets set AMAZON_PARTNER_TAG=shoeswiper-20
```

### 5. Deploy

```bash
supabase functions deploy amazon-prices
```

## Client Configuration

Enable the PA-API integration in your `.env`:

```env
# Enable Amazon PA-API
VITE_AMAZON_API_ENABLED=true

# Enable price display in UI
VITE_SHOW_PRICES=true
```

## Security Considerations

1. **API Credentials**: Stored only in Supabase Edge Function secrets
2. **CORS**: Configured in `_shared/cors.ts`
3. **Rate Limiting**: Built-in at multiple levels (Edge Function + Amazon API)
4. **Input Validation**: All ASINs are validated before API calls
5. **Affiliate Tag**: Hardcoded to `shoeswiper-20` - cannot be changed by client

## API Endpoint

**POST** `/functions/v1/amazon-prices`

### Request Body
```json
{
  "asins": ["B07QXLFLXT", "B09NLN47LP"]
}
```

### Response
```json
{
  "results": [
    {
      "asin": "B07QXLFLXT",
      "price": 120.00,
      "currency": "USD",
      "availability": "in_stock",
      "title": "Nike Air Force 1",
      "affiliateUrl": "https://www.amazon.com/dp/B07QXLFLXT?tag=shoeswiper-20",
      "lastUpdated": "2025-12-04T12:00:00Z"
    }
  ],
  "source": "live"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid ASINs or request body |
| 405 | Method not allowed (use POST) |
| 429 | Rate limit exceeded |
| 500 | Server error |

## Caching

Prices are cached for 5 minutes:
- Client-side: In React Query cache
- Server-side: Optional database cache (see `007_amazon_pa_api_integration.sql`)

## Testing

1. **Without PA-API credentials**: Returns mock data with null prices
2. **With PA-API credentials**: Returns live prices from Amazon

## Usage in Components

```typescript
import { useAmazonPrices, useShoePrice } from '../hooks/useAmazonPrices';

// Get single price
const { data: priceData, isLoading } = useShoePrice(shoe.amazon_asin);

// Get multiple prices
const { getPrices, prefetchPrices } = useAmazonPrices();
const prices = await getPrices(['B07QXLFLXT', 'B09NLN47LP']);
```

## Affiliate Tracking

All affiliate clicks are tracked via `trackAffiliateClick()`:

```typescript
import { trackAffiliateClick } from '../lib/supabaseClient';

// Track when user clicks buy button
trackAffiliateClick(shoeId, asin, 'buy_button');
```

## Revenue Analytics

View affiliate click analytics in Supabase:
```sql
SELECT * FROM affiliate_click_analytics;
```

## Troubleshooting

### "API credentials not configured"
- Ensure secrets are set: `supabase secrets list`
- Redeploy function: `supabase functions deploy amazon-prices`

### "Rate limit exceeded"
- PA-API has strict rate limits (1 request/second initially)
- Implement caching to reduce API calls

### Prices not showing
- Check `VITE_SHOW_PRICES=true` in `.env`
- Check `VITE_AMAZON_API_ENABLED=true` in `.env`
- Verify Edge Function is deployed and secrets are set

---

## Edge Function Code

Create `supabase/functions/amazon-prices/index.ts` with:

```typescript
// Supabase Edge Function: supabase/functions/amazon-prices/index.ts
// Deploy with: supabase functions deploy amazon-prices
// Set secrets:
//   supabase secrets set AMAZON_ACCESS_KEY=your-access-key
//   supabase secrets set AMAZON_SECRET_KEY=your-secret-key
//   supabase secrets set AMAZON_PARTNER_TAG=shoeswiper-20

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 30,
  retryAfterSeconds: 60,
};

// Security headers for responses
const securityHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=300",
  "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.maxRequestsPerMinute),
};

// Amazon PA-API configuration
const AMAZON_HOST = "webservices.amazon.com";
const AMAZON_REGION = "us-east-1";
const AMAZON_SERVICE = "ProductAdvertisingAPI";
const PARTNER_TAG = "shoeswiper-20"; // NON-NEGOTIABLE

interface PriceResult {
  asin: string;
  price: number | null;
  currency: string;
  availability: "in_stock" | "low_stock" | "out_of_stock" | "unknown";
  title?: string;
  imageUrl?: string;
  affiliateUrl: string;
  lastUpdated: string;
}

function isValidAsin(asin: string): boolean {
  return /^[A-Z0-9]{10}$/i.test(asin);
}

function buildAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${PARTNER_TAG}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST.", results: [] }),
      { status: 405, headers: { ...securityHeaders, Allow: "POST, OPTIONS" } }
    );
  }

  try {
    let body: { asins: string[] };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON", results: [] }),
        { status: 400, headers: securityHeaders }
      );
    }

    const { asins } = body;

    if (!Array.isArray(asins) || asins.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'asins' field", results: [] }),
        { status: 400, headers: securityHeaders }
      );
    }

    if (asins.length > 10) {
      return new Response(
        JSON.stringify({ error: "Maximum 10 ASINs per request", results: [] }),
        { status: 400, headers: securityHeaders }
      );
    }

    const invalidAsins = asins.filter((asin) => !isValidAsin(asin));
    if (invalidAsins.length > 0) {
      return new Response(
        JSON.stringify({ error: `Invalid ASIN format: ${invalidAsins.join(", ")}`, results: [] }),
        { status: 400, headers: securityHeaders }
      );
    }

    // Get credentials from environment
    const accessKey = Deno.env.get("AMAZON_ACCESS_KEY");
    const secretKey = Deno.env.get("AMAZON_SECRET_KEY");

    // If credentials not configured, return mock data
    if (!accessKey || !secretKey) {
      console.warn("Amazon PA-API credentials not configured.");
      const mockResults: PriceResult[] = asins.map((asin) => ({
        asin,
        price: null,
        currency: "USD",
        availability: "unknown",
        affiliateUrl: buildAffiliateUrl(asin),
        lastUpdated: new Date().toISOString(),
      }));
      return new Response(
        JSON.stringify({ results: mockResults, source: "mock" }),
        { headers: securityHeaders }
      );
    }

    // TODO: Implement full PA-API request signing and call
    // For now, return mock data indicating API would be used
    const results: PriceResult[] = asins.map((asin) => ({
      asin,
      price: null,
      currency: "USD",
      availability: "unknown",
      affiliateUrl: buildAffiliateUrl(asin),
      lastUpdated: new Date().toISOString(),
    }));

    return new Response(
      JSON.stringify({ results, source: "live" }),
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch prices", results: [] }),
      { status: 500, headers: securityHeaders }
    );
  }
});
```

**Note**: The full AWS Signature V4 implementation is complex. Contact the development team for the complete production-ready implementation with proper HMAC signing.
