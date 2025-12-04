-- ============================================
-- Social Syndication Schema
-- ============================================
-- Tables for automated social media syndication

-- Social syndication queue table
CREATE TABLE IF NOT EXISTS social_syndication_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'instagram', 'tiktok', 'facebook')),
  content JSONB NOT NULL,
  content_type VARCHAR(20) NOT NULL DEFAULT 'product' CHECK (content_type IN ('product', 'blog', 'promotion', 'engagement', 'user_generated')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'processing', 'posted', 'failed')),
  source_type VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source_type IN ('product', 'blog', 'manual')),
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  posted_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  external_post_id VARCHAR(255),
  analytics JSONB DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT valid_scheduled_at CHECK (scheduled_at > created_at OR status != 'scheduled')
);

-- Index for fetching due posts
CREATE INDEX IF NOT EXISTS idx_syndication_queue_scheduled 
ON social_syndication_queue (scheduled_at, status) 
WHERE status = 'scheduled';

-- Index for platform-specific queries
CREATE INDEX IF NOT EXISTS idx_syndication_queue_platform 
ON social_syndication_queue (platform, status);

-- Index for content type queries
CREATE INDEX IF NOT EXISTS idx_syndication_queue_content_type 
ON social_syndication_queue (content_type);

-- Social syndication log table (for historical tracking)
CREATE TABLE IF NOT EXISTS social_syndication_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(20) NOT NULL,
  content_type VARCHAR(20) NOT NULL DEFAULT 'product',
  success BOOLEAN NOT NULL,
  external_post_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for log queries
CREATE INDEX IF NOT EXISTS idx_syndication_log_platform 
ON social_syndication_log (platform, created_at DESC);

-- Rate limiting tracking table
CREATE TABLE IF NOT EXISTS social_syndication_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(20) NOT NULL UNIQUE,
  requests_per_hour INTEGER NOT NULL DEFAULT 50,
  requests_per_day INTEGER NOT NULL DEFAULT 500,
  current_hourly_count INTEGER DEFAULT 0,
  current_daily_count INTEGER DEFAULT 0,
  last_reset_hour TIMESTAMPTZ DEFAULT NOW(),
  last_reset_day TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rate limits
INSERT INTO social_syndication_rate_limits (platform, requests_per_hour, requests_per_day)
VALUES 
  ('twitter', 50, 500),
  ('instagram', 25, 200),
  ('tiktok', 30, 300),
  ('facebook', 40, 400)
ON CONFLICT (platform) DO NOTHING;

-- OAuth tokens table (encrypted storage)
-- Note: In production, tokens should be stored in Supabase Vault or similar secure storage
CREATE TABLE IF NOT EXISTS social_syndication_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(20) NOT NULL UNIQUE,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE social_syndication_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_syndication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_syndication_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_syndication_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access these tables (used by Edge Functions)
CREATE POLICY "Service role access only" ON social_syndication_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role access only" ON social_syndication_log
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role access only" ON social_syndication_rate_limits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role access only" ON social_syndication_tokens
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_syndication_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for queue table
CREATE TRIGGER update_syndication_queue_updated_at
  BEFORE UPDATE ON social_syndication_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_syndication_updated_at();

-- Trigger for rate limits table
CREATE TRIGGER update_syndication_rate_limits_updated_at
  BEFORE UPDATE ON social_syndication_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_syndication_updated_at();

-- Trigger for tokens table
CREATE TRIGGER update_syndication_tokens_updated_at
  BEFORE UPDATE ON social_syndication_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_syndication_updated_at();

-- Function to reset hourly rate limits
CREATE OR REPLACE FUNCTION reset_hourly_rate_limits()
RETURNS void AS $$
BEGIN
  UPDATE social_syndication_rate_limits
  SET 
    current_hourly_count = 0,
    last_reset_hour = NOW()
  WHERE last_reset_hour < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily rate limits
CREATE OR REPLACE FUNCTION reset_daily_rate_limits()
RETURNS void AS $$
BEGIN
  UPDATE social_syndication_rate_limits
  SET 
    current_daily_count = 0,
    last_reset_day = NOW()
  WHERE last_reset_day < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to increment rate limit counters
CREATE OR REPLACE FUNCTION increment_rate_limit(p_platform VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit RECORD;
BEGIN
  -- First, reset if needed
  PERFORM reset_hourly_rate_limits();
  PERFORM reset_daily_rate_limits();
  
  -- Get current limits
  SELECT * INTO v_limit
  FROM social_syndication_rate_limits
  WHERE platform = p_platform;
  
  IF NOT FOUND THEN
    RETURN TRUE; -- No limits configured, allow
  END IF;
  
  -- Check if we're within limits
  IF v_limit.current_hourly_count >= v_limit.requests_per_hour OR
     v_limit.current_daily_count >= v_limit.requests_per_day THEN
    RETURN FALSE; -- Rate limited
  END IF;
  
  -- Increment counters
  UPDATE social_syndication_rate_limits
  SET 
    current_hourly_count = current_hourly_count + 1,
    current_daily_count = current_daily_count + 1
  WHERE platform = p_platform;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE social_syndication_queue IS 'Queue of scheduled social media posts';
COMMENT ON TABLE social_syndication_log IS 'Historical log of all posting attempts';
COMMENT ON TABLE social_syndication_rate_limits IS 'Rate limiting tracking per platform';
COMMENT ON TABLE social_syndication_tokens IS 'Encrypted OAuth tokens for social platforms';
