-- ============================================
-- AMAZON PRODUCT CACHE & PRICE TRACKING
-- Migration: 007_amazon_products.sql
-- Description: Tables for caching Amazon PA-API data and tracking prices
-- ============================================

-- 1. Amazon Product Cache Table
-- Stores cached product data from Amazon PA-API to reduce API calls
CREATE TABLE IF NOT EXISTS amazon_product_cache (
    asin TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    price NUMERIC(10, 2),
    currency TEXT DEFAULT 'USD',
    image_url TEXT,
    amazon_url TEXT NOT NULL,
    availability TEXT CHECK (availability IN ('in_stock', 'low_stock', 'out_of_stock')) DEFAULT 'out_of_stock',
    features TEXT[] DEFAULT '{}',
    category TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Amazon Price History Table
-- Tracks price changes over time for analytics and alerts
CREATE TABLE IF NOT EXISTS amazon_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asin TEXT NOT NULL REFERENCES amazon_product_cache(asin) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. API Request Log Table
-- Tracks API usage for rate limiting and monitoring
CREATE TABLE IF NOT EXISTS amazon_api_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation TEXT NOT NULL,
    request_params JSONB,
    response_status INTEGER,
    items_returned INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Cache lookup indexes
CREATE INDEX IF NOT EXISTS idx_amazon_cache_brand ON amazon_product_cache (brand);
CREATE INDEX IF NOT EXISTS idx_amazon_cache_last_updated ON amazon_product_cache (last_updated);
CREATE INDEX IF NOT EXISTS idx_amazon_cache_availability ON amazon_product_cache (availability);
CREATE INDEX IF NOT EXISTS idx_amazon_cache_category ON amazon_product_cache (category);

-- Price history indexes
CREATE INDEX IF NOT EXISTS idx_amazon_price_history_asin ON amazon_price_history (asin);
CREATE INDEX IF NOT EXISTS idx_amazon_price_history_recorded_at ON amazon_price_history (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_price_history_asin_date ON amazon_price_history (asin, recorded_at DESC);

-- API log indexes
CREATE INDEX IF NOT EXISTS idx_amazon_api_log_created_at ON amazon_api_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_api_log_operation ON amazon_api_log (operation);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get cached product if fresh enough
CREATE OR REPLACE FUNCTION get_cached_amazon_product(
    p_asin TEXT,
    p_max_age_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    asin TEXT,
    name TEXT,
    brand TEXT,
    price NUMERIC,
    currency TEXT,
    image_url TEXT,
    amazon_url TEXT,
    availability TEXT,
    features TEXT[],
    category TEXT,
    is_stale BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.asin,
        c.name,
        c.brand,
        c.price,
        c.currency,
        c.image_url,
        c.amazon_url,
        c.availability,
        c.features,
        c.category,
        (c.last_updated < NOW() - (p_max_age_hours || ' hours')::INTERVAL) as is_stale
    FROM amazon_product_cache c
    WHERE c.asin = p_asin;
END;
$$ LANGUAGE plpgsql;

-- Function to get price history for a product
CREATE OR REPLACE FUNCTION get_amazon_price_history(
    p_asin TEXT,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    price NUMERIC,
    currency TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.price,
        ph.currency,
        ph.recorded_at
    FROM amazon_price_history ph
    WHERE ph.asin = p_asin
      AND ph.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
    ORDER BY ph.recorded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get lowest price in last N days
CREATE OR REPLACE FUNCTION get_amazon_lowest_price(
    p_asin TEXT,
    p_days INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
DECLARE
    lowest NUMERIC;
BEGIN
    SELECT MIN(price) INTO lowest
    FROM amazon_price_history
    WHERE asin = p_asin
      AND recorded_at >= NOW() - (p_days || ' days')::INTERVAL;
    
    RETURN lowest;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old cache entries
CREATE OR REPLACE FUNCTION cleanup_amazon_cache(
    p_max_age_days INTEGER DEFAULT 7
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM amazon_product_cache
    WHERE last_updated < NOW() - (p_max_age_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old price history
CREATE OR REPLACE FUNCTION cleanup_amazon_price_history(
    p_max_age_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM amazon_price_history
    WHERE recorded_at < NOW() - (p_max_age_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get API usage stats
CREATE OR REPLACE FUNCTION get_amazon_api_stats(
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_requests BIGINT,
    successful_requests BIGINT,
    failed_requests BIGINT,
    avg_items_returned NUMERIC,
    requests_by_operation JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_requests,
        COUNT(*) FILTER (WHERE response_status = 200)::BIGINT as successful_requests,
        COUNT(*) FILTER (WHERE response_status != 200)::BIGINT as failed_requests,
        AVG(items_returned)::NUMERIC as avg_items_returned,
        jsonb_object_agg(
            COALESCE(operation, 'unknown'), 
            op_count
        ) as requests_by_operation
    FROM amazon_api_log
    CROSS JOIN LATERAL (
        SELECT operation as op, COUNT(*) as op_count
        FROM amazon_api_log sub
        WHERE sub.created_at >= NOW() - (p_hours || ' hours')::INTERVAL
        GROUP BY operation
    ) ops
    WHERE created_at >= NOW() - (p_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on new tables
ALTER TABLE amazon_product_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE amazon_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE amazon_api_log ENABLE ROW LEVEL SECURITY;

-- Public read access to cache (products are public)
CREATE POLICY "Public can view cached products" 
    ON amazon_product_cache FOR SELECT USING (true);

-- Only service role can modify cache
CREATE POLICY "Service role can manage cache" 
    ON amazon_product_cache FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Public read access to price history
CREATE POLICY "Public can view price history" 
    ON amazon_price_history FOR SELECT USING (true);

-- Only service role can insert price history
CREATE POLICY "Service role can insert price history" 
    ON amazon_price_history FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

-- Only admin can view API logs
CREATE POLICY "Admin can view API logs" 
    ON amazon_api_log FOR SELECT USING (is_admin());

-- Service role can insert API logs
CREATE POLICY "Service role can insert API logs" 
    ON amazon_api_log FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update last_updated on cache changes
CREATE OR REPLACE FUNCTION update_amazon_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_amazon_cache_timestamp ON amazon_product_cache;
CREATE TRIGGER update_amazon_cache_timestamp
    BEFORE UPDATE ON amazon_product_cache
    FOR EACH ROW EXECUTE FUNCTION update_amazon_cache_timestamp();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE amazon_product_cache IS 'Cached product data from Amazon PA-API. Cache TTL is configurable, default 24 hours.';
COMMENT ON TABLE amazon_price_history IS 'Historical price tracking for Amazon products. Used for price drop alerts and analytics.';
COMMENT ON TABLE amazon_api_log IS 'API request logging for rate limit monitoring and debugging.';

COMMENT ON COLUMN amazon_product_cache.last_updated IS 'When this cache entry was last refreshed from Amazon API';
COMMENT ON COLUMN amazon_product_cache.availability IS 'Stock status: in_stock, low_stock, or out_of_stock';
COMMENT ON COLUMN amazon_price_history.recorded_at IS 'When this price was recorded from Amazon API';

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS update_amazon_cache_timestamp ON amazon_product_cache;
-- DROP FUNCTION IF EXISTS update_amazon_cache_timestamp();
-- DROP FUNCTION IF EXISTS get_amazon_api_stats(INTEGER);
-- DROP FUNCTION IF EXISTS cleanup_amazon_price_history(INTEGER);
-- DROP FUNCTION IF EXISTS cleanup_amazon_cache(INTEGER);
-- DROP FUNCTION IF EXISTS get_amazon_lowest_price(TEXT, INTEGER);
-- DROP FUNCTION IF EXISTS get_amazon_price_history(TEXT, INTEGER);
-- DROP FUNCTION IF EXISTS get_cached_amazon_product(TEXT, INTEGER);
-- DROP TABLE IF EXISTS amazon_api_log;
-- DROP TABLE IF EXISTS amazon_price_history;
-- DROP TABLE IF EXISTS amazon_product_cache;
