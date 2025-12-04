// Supabase Edge Function: supabase/functions/shoes/index.ts
// Deploy with: supabase functions deploy shoes
// Handles: GET /shoes with various query parameters

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createAnonClient, ensureAffiliateTag } from "../_shared/supabase.ts";

interface ShoeFilters {
  brand?: string;
  gender?: string;
  styleTags?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  featured?: boolean;
  trending?: boolean;
  search?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const params = url.searchParams;

    // Parse query parameters
    const filters: ShoeFilters = {
      brand: params.get("brand") || undefined,
      gender: params.get("gender") || undefined,
      styleTags: params.get("styleTags")?.split(",").filter(Boolean) || undefined,
      minPrice: params.get("minPrice") ? parseFloat(params.get("minPrice")!) : undefined,
      maxPrice: params.get("maxPrice") ? parseFloat(params.get("maxPrice")!) : undefined,
      page: params.get("page") ? parseInt(params.get("page")!, 10) : 1,
      pageSize: params.get("pageSize") ? parseInt(params.get("pageSize")!, 10) : 20,
      featured: params.get("featured") === "true",
      trending: params.get("trending") === "true",
      search: params.get("search") || params.get("q") || undefined,
    };

    // Validate pagination parameters
    if (filters.page && filters.page < 1) filters.page = 1;
    if (filters.pageSize && (filters.pageSize < 1 || filters.pageSize > 100)) {
      filters.pageSize = 20;
    }

    // Validate gender
    const validGenders = ["men", "women", "unisex", "kids"];
    if (filters.gender && !validGenders.includes(filters.gender)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid gender. Must be one of: ${validGenders.join(", ")}` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate price range
    if (filters.minPrice !== undefined && filters.minPrice < 0) {
      return new Response(
        JSON.stringify({ error: "minPrice must be non-negative" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    if (filters.maxPrice !== undefined && filters.maxPrice < 0) {
      return new Response(
        JSON.stringify({ error: "maxPrice must be non-negative" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    if (
      filters.minPrice !== undefined &&
      filters.maxPrice !== undefined &&
      filters.minPrice > filters.maxPrice
    ) {
      return new Response(
        JSON.stringify({ error: "minPrice cannot be greater than maxPrice" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createAnonClient();

    // Build query
    let query = supabase
      .from("shoes")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Handle featured shoes
    if (filters.featured) {
      query = query.eq("is_featured", true);
    }

    // Handle trending shoes (ordered by view_count and click_count)
    if (filters.trending) {
      query = query.order("view_count", { ascending: false })
                   .order("click_count", { ascending: false });
    }

    // Handle search
    if (filters.search) {
      // Use full-text search for better matching
      const searchTerm = filters.search.trim();
      query = query.or(
        `name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }

    // Apply filters
    if (filters.brand) {
      query = query.ilike("brand", filters.brand);
    }

    if (filters.gender) {
      query = query.eq("gender", filters.gender);
    }

    if (filters.styleTags && filters.styleTags.length > 0) {
      // Match any of the style tags
      query = query.overlaps("style_tags", filters.styleTags);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    // Apply pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    query = query.range(offset, offset + pageSize - 1);

    // Default ordering (unless trending already set the order)
    if (!filters.trending) {
      query = query.order("created_at", { ascending: false });
    }

    const { data: shoes, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Ensure all Amazon URLs have affiliate tag
    const processedShoes = (shoes || []).map((shoe) => ({
      ...shoe,
      amazon_url: ensureAffiliateTag(shoe.amazon_url),
    }));

    // Return paginated response
    const totalPages = Math.ceil((count || 0) / pageSize);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        data: processedShoes,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages,
          hasMore,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching shoes:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
