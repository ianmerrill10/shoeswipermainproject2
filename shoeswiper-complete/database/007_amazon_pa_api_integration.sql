-- ============================================
-- MIGRATION 007: AMAZON PA-API INTEGRATION
-- Adds support for enhanced affiliate tracking and live price data
-- ============================================

-- Add new columns to affiliate_clicks table for better tracking
ALTER TABLE affiliate_clicks
ADD COLUMN IF NOT EXISTS asin VARCHAR(10),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'unknown';

-- Create index for ASIN lookups (for price data retrieval)
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_asin ON affiliate_clicks (asin);

-- Create index for source analysis
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_source ON affiliate_clicks (source);

-- Add comment for documentation
COMMENT ON COLUMN affiliate_clicks.asin IS 'Amazon Standard Identification Number for the clicked product';
COMMENT ON COLUMN affiliate_clicks.source IS 'Where the click originated (e.g., feed, shoe_panel, buy_button, sneaker_card)';

-- ============================================
-- PRICE CACHE TABLE
-- Stores cached Amazon prices to reduce API calls
-- ============================================

CREATE TABLE IF NOT EXISTS amazon_price_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asin VARCHAR(10) NOT NULL UNIQUE,
    price NUMERIC(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    availability VARCHAR(20) DEFAULT 'unknown',
    title TEXT,
    image_url TEXT,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '5 minutes',
    
    CONSTRAINT valid_asin CHECK (asin ~ '^[A-Z0-9]{10}$'),
    CONSTRAINT valid_availability CHECK (availability IN ('in_stock', 'low_stock', 'out_of_stock', 'unknown'))
);

-- Create index for expiration checks
CREATE INDEX IF NOT EXISTS idx_amazon_price_cache_expires ON amazon_price_cache (expires_at);

-- Create index for ASIN lookups
CREATE INDEX IF NOT EXISTS idx_amazon_price_cache_asin ON amazon_price_cache (asin);

-- Add comment for documentation
COMMENT ON TABLE amazon_price_cache IS 'Cache for Amazon PA-API price data to reduce API calls and improve performance';

-- ============================================
-- FUNCTION: Get or Refresh Price Data
-- ============================================

CREATE OR REPLACE FUNCTION get_cached_price(p_asin VARCHAR(10))
RETURNS TABLE (
    asin VARCHAR(10),
    price NUMERIC(10, 2),
    currency VARCHAR(3),
    availability VARCHAR(20),
    is_stale BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.asin,
        pc.price,
        pc.currency,
        pc.availability,
        pc.expires_at < NOW() AS is_stale
    FROM amazon_price_cache pc
    WHERE pc.asin = p_asin;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update Price Cache
-- ============================================

CREATE OR REPLACE FUNCTION update_price_cache(
    p_asin VARCHAR(10),
    p_price NUMERIC(10, 2),
    p_currency VARCHAR(3),
    p_availability VARCHAR(20),
    p_title TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO amazon_price_cache (asin, price, currency, availability, title, image_url, fetched_at, expires_at)
    VALUES (p_asin, p_price, p_currency, p_availability, p_title, p_image_url, NOW(), NOW() + INTERVAL '5 minutes')
    ON CONFLICT (asin) DO UPDATE
    SET 
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        availability = EXCLUDED.availability,
        title = COALESCE(EXCLUDED.title, amazon_price_cache.title),
        image_url = COALESCE(EXCLUDED.image_url, amazon_price_cache.image_url),
        fetched_at = NOW(),
        expires_at = NOW() + INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES FOR amazon_price_cache
-- ============================================

ALTER TABLE amazon_price_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached prices (public data)
CREATE POLICY "Anyone can read price cache" 
ON amazon_price_cache FOR SELECT 
USING (true);

-- Only service role can update prices (Edge Function)
CREATE POLICY "Service role can update price cache" 
ON amazon_price_cache FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- CLEANUP FUNCTION: Remove expired cache entries
-- Run this periodically via Supabase CRON or Edge Function
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_price_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM amazon_price_cache
        WHERE expires_at < NOW() - INTERVAL '1 hour'
        RETURNING *
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ANALYTICS: Affiliate Revenue Tracking View
-- ============================================

CREATE OR REPLACE VIEW affiliate_click_analytics AS
SELECT 
    DATE_TRUNC('day', clicked_at) AS click_date,
    source,
    COUNT(*) AS click_count,
    COUNT(DISTINCT asin) AS unique_products,
    COUNT(DISTINCT shoe_id) AS unique_shoes,
    COUNT(DISTINCT user_id) AS unique_users
FROM affiliate_clicks
WHERE clicked_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', clicked_at), source
ORDER BY click_date DESC, click_count DESC;

COMMENT ON VIEW affiliate_click_analytics IS 'Daily affiliate click analytics grouped by source for revenue optimization';
