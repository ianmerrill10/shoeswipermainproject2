-- ============================================
-- SHOESWIPER PRICE MONITORING MIGRATION
-- Migration 007: Add price monitoring enhancements
-- Run this in Supabase SQL Editor after 006_rls_security_audit_fixes.sql
-- ============================================

-- ============================================
-- PRICE ALERTS TABLE ENHANCEMENTS
-- ============================================

-- Note: The price_alerts table already has a 'last_checked' column (from 003_missing_tables.sql)
-- We use that existing column for tracking price check timestamps.
-- Creating an index for efficient querying of alerts that need checking:
CREATE INDEX IF NOT EXISTS idx_price_alerts_last_checked_active 
ON price_alerts (last_checked) 
WHERE triggered = false;

-- ============================================
-- PRICE NOTIFICATIONS TABLE ENHANCEMENTS
-- ============================================

-- Add notification_sent boolean to track email delivery status
ALTER TABLE price_notifications 
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- Create index for finding unsent notifications
CREATE INDEX IF NOT EXISTS idx_price_notifications_unsent 
ON price_notifications (notification_sent) 
WHERE notification_sent = false;

-- ============================================
-- PRICE HISTORY TABLE
-- ============================================

-- Create price_history table to track all price changes over time
-- The 'source' field indicates how the price was obtained:
--   - 'amazon_api': From Amazon Product Advertising API (production)
--   - 'demo_simulation': Randomly generated for demo mode
--   - 'manual': Manually entered by admin
--   - 'scraper': From web scraper (future implementation for backup price source)
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('amazon_api', 'demo_simulation', 'manual', 'scraper')),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for price history queries
CREATE INDEX IF NOT EXISTS idx_price_history_shoe ON price_history (shoe_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded ON price_history (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_shoe_recorded ON price_history (shoe_id, recorded_at DESC);

-- Enable RLS on price_history
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Price history is readable by everyone but only writable by service role (edge functions)
CREATE POLICY "Anyone can read price history" 
ON price_history FOR SELECT 
USING (true);

-- Service role will insert via edge functions (bypasses RLS)
-- No INSERT policy needed for regular users

-- ============================================
-- PRICE MONITORING LOGS TABLE
-- ============================================

-- Create price_monitoring_logs table to track system health
CREATE TABLE IF NOT EXISTS price_monitoring_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_type TEXT NOT NULL CHECK (check_type IN ('scheduled', 'manual', 'email_send', 'api_health')),
    alerts_processed INTEGER NOT NULL DEFAULT 0,
    alerts_triggered INTEGER NOT NULL DEFAULT 0,
    errors INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for monitoring logs
CREATE INDEX IF NOT EXISTS idx_price_monitoring_logs_type ON price_monitoring_logs (check_type);
CREATE INDEX IF NOT EXISTS idx_price_monitoring_logs_created ON price_monitoring_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_monitoring_logs_errors ON price_monitoring_logs (errors) WHERE errors > 0;

-- Enable RLS on price_monitoring_logs
ALTER TABLE price_monitoring_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view monitoring logs
CREATE POLICY "Admins can view monitoring logs" 
ON price_monitoring_logs FOR SELECT 
USING (is_admin());

-- Service role will insert via edge functions (bypasses RLS)
-- No INSERT policy needed for regular users

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get price trend for a shoe
CREATE OR REPLACE FUNCTION get_price_trend(
    p_shoe_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    min_price NUMERIC(10, 2),
    max_price NUMERIC(10, 2),
    avg_price NUMERIC(10, 2),
    current_price NUMERIC(10, 2),
    price_change_percent NUMERIC(5, 2),
    data_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_prices AS (
        SELECT 
            price,
            recorded_at,
            ROW_NUMBER() OVER (ORDER BY recorded_at DESC) as rn
        FROM price_history
        WHERE shoe_id = p_shoe_id
          AND recorded_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    stats AS (
        SELECT
            MIN(price) as min_p,
            MAX(price) as max_p,
            AVG(price) as avg_p,
            COUNT(*) as cnt
        FROM recent_prices
    ),
    latest AS (
        SELECT price as current_p
        FROM recent_prices
        WHERE rn = 1
    ),
    oldest AS (
        SELECT price as oldest_p
        FROM recent_prices
        ORDER BY recorded_at ASC
        LIMIT 1
    )
    SELECT 
        stats.min_p,
        stats.max_p,
        ROUND(stats.avg_p, 2),
        latest.current_p,
        CASE 
            WHEN oldest.oldest_p > 0 THEN 
                ROUND(((latest.current_p - oldest.oldest_p) / oldest.oldest_p * 100)::NUMERIC, 2)
            ELSE 0
        END,
        stats.cnt::INTEGER
    FROM stats
    CROSS JOIN latest
    CROSS JOIN oldest;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monitoring system health status
CREATE OR REPLACE FUNCTION get_monitoring_health(
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_checks INTEGER,
    total_processed INTEGER,
    total_triggered INTEGER,
    total_errors INTEGER,
    avg_duration_ms INTEGER,
    last_check_at TIMESTAMP WITH TIME ZONE,
    health_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_logs AS (
        SELECT *
        FROM price_monitoring_logs
        WHERE created_at >= NOW() - (p_hours || ' hours')::INTERVAL
          AND check_type = 'scheduled'
    ),
    stats AS (
        SELECT
            COUNT(*) as checks,
            COALESCE(SUM(alerts_processed), 0) as processed,
            COALESCE(SUM(alerts_triggered), 0) as triggered,
            COALESCE(SUM(errors), 0) as errs,
            COALESCE(AVG(duration_ms), 0) as avg_dur,
            MAX(created_at) as last_check
        FROM recent_logs
    )
    SELECT 
        stats.checks::INTEGER,
        stats.processed::INTEGER,
        stats.triggered::INTEGER,
        stats.errs::INTEGER,
        stats.avg_dur::INTEGER,
        stats.last_check,
        CASE 
            WHEN stats.checks = 0 THEN 'no_data'
            WHEN stats.errs > stats.processed * 0.1 THEN 'degraded'
            WHEN stats.last_check < NOW() - INTERVAL '2 hours' THEN 'stale'
            ELSE 'healthy'
        END
    FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_price_trend(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_monitoring_health(INTEGER) TO authenticated;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE price_history IS 'Historical price records for shoes, populated by price monitoring edge functions';
COMMENT ON TABLE price_monitoring_logs IS 'System health logs for price monitoring, tracks edge function executions';
-- Note: The existing 'last_checked' column in price_alerts is used by the check-prices edge function
COMMENT ON COLUMN price_notifications.notification_sent IS 'Whether an email notification has been sent for this price drop';
COMMENT ON FUNCTION get_price_trend IS 'Returns price statistics for a shoe over the specified number of days';
COMMENT ON FUNCTION get_monitoring_health IS 'Returns system health status for price monitoring over the specified hours';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
