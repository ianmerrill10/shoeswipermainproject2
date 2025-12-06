-- ============================================
-- SHOESWIPER SECURITY HARDENING - PHASE 1
-- Missing Database Tables Migration
-- Generated: 2024-12-06
-- ============================================
-- This migration adds the 7 missing tables referenced in code:
-- 1. price_alerts
-- 2. price_notifications
-- 3. push_subscriptions
-- 4. user_referrals
-- 5. email_subscriptions
-- 6. analytics_events
-- 7. music_clicks
-- ============================================

-- ============================================
-- 1. PRICE ALERTS TABLE
-- Stores user price alert subscriptions for shoes
-- ============================================
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shoe_id UUID NOT NULL REFERENCES public.shoes(id) ON DELETE CASCADE,
  shoe_name TEXT NOT NULL,
  shoe_brand TEXT NOT NULL,
  shoe_image TEXT,
  amazon_url TEXT,
  target_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one alert per user per shoe
  UNIQUE(user_id, shoe_id)
);

-- Index for efficient querying
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_shoe_id ON public.price_alerts(shoe_id);
CREATE INDEX idx_price_alerts_triggered ON public.price_alerts(triggered) WHERE triggered = FALSE;

-- RLS Policies for price_alerts
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own price alerts"
  ON public.price_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts"
  ON public.price_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts"
  ON public.price_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts"
  ON public.price_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. PRICE NOTIFICATIONS TABLE
-- Stores triggered price drop notifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.price_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shoe_id UUID NOT NULL REFERENCES public.shoes(id) ON DELETE CASCADE,
  shoe_name TEXT NOT NULL,
  shoe_brand TEXT NOT NULL,
  shoe_image TEXT,
  amazon_url TEXT,
  old_price DECIMAL(10,2) NOT NULL,
  new_price DECIMAL(10,2) NOT NULL,
  saved_amount DECIMAL(10,2) NOT NULL,
  percent_off INTEGER NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_price_notifications_user_id ON public.price_notifications(user_id);
CREATE INDEX idx_price_notifications_created_at ON public.price_notifications(created_at DESC);
CREATE INDEX idx_price_notifications_unread ON public.price_notifications(user_id, read) WHERE read = FALSE;

-- RLS Policies for price_notifications
ALTER TABLE public.price_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.price_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users"
  ON public.price_notifications FOR INSERT
  WITH CHECK (true); -- Service role will insert these

CREATE POLICY "Users can update their own notifications"
  ON public.price_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. PUSH SUBSCRIPTIONS TABLE
-- Stores web push notification subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one subscription per endpoint per user
  UNIQUE(user_id, endpoint)
);

-- Index for efficient querying
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = TRUE;

-- RLS Policies for push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. USER REFERRALS TABLE
-- Stores user referral codes and statistics
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES auth.users(id),
  total_shares INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  earned_rewards INTEGER DEFAULT 0,
  pending_rewards INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'bronze', 'silver', 'gold', 'platinum', 'diamond')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_user_referrals_code ON public.user_referrals(code);
CREATE INDEX idx_user_referrals_user_id ON public.user_referrals(user_id);
CREATE INDEX idx_user_referrals_referred_by ON public.user_referrals(referred_by);

-- RLS Policies for user_referrals
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral data"
  ON public.user_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
  ON public.user_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral data"
  ON public.user_referrals FOR UPDATE
  USING (auth.uid() = user_id);

-- Public read access for referral code lookup (for tracking clicks)
CREATE POLICY "Anyone can lookup referral codes"
  ON public.user_referrals FOR SELECT
  USING (true);

-- ============================================
-- 5. EMAIL SUBSCRIPTIONS TABLE
-- Stores email capture and preferences
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('price_alert', 'newsletter', 'exit_intent', 'referral', 'checkout', 'waitlist')),
  shoe_id UUID REFERENCES public.shoes(id) ON DELETE SET NULL,
  shoe_name TEXT,
  preferences JSONB DEFAULT '{"priceAlerts": true, "newReleases": true, "weeklyDigest": false, "promotions": false}'::jsonb,
  is_subscribed BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  unsubscribe_token TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_email_subscriptions_email ON public.email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_user_id ON public.email_subscriptions(user_id);
CREATE INDEX idx_email_subscriptions_source ON public.email_subscriptions(source);
CREATE INDEX idx_email_subscriptions_active ON public.email_subscriptions(is_subscribed) WHERE is_subscribed = TRUE;

-- RLS Policies for email_subscriptions
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email subscriptions"
  ON public.email_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can subscribe (insert)"
  ON public.email_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own subscriptions"
  ON public.email_subscriptions FOR UPDATE
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admin can view all emails
CREATE POLICY "Admin can view all email subscriptions"
  ON public.email_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'dadsellsgadgets@gmail.com'
    )
  );

-- ============================================
-- 6. ANALYTICS EVENTS TABLE
-- Stores all analytics events for tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- Hashed for privacy
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioning by month for better performance (optional, add later)
-- CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Indexes for efficient querying
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);

-- Composite index for common queries
CREATE INDEX idx_analytics_events_type_date ON public.analytics_events(event_type, created_at DESC);

-- RLS Policies for analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (including anonymous users)
CREATE POLICY "Anyone can log analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view all analytics
CREATE POLICY "Admin can view all analytics"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'dadsellsgadgets@gmail.com'
    )
  );

-- ============================================
-- 7. MUSIC CLICKS TABLE
-- Tracks music platform clicks for analytics
-- ============================================
CREATE TABLE IF NOT EXISTS public.music_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shoe_id UUID REFERENCES public.shoes(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'apple_music', 'amazon_music')),
  song TEXT,
  artist TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_music_clicks_user_id ON public.music_clicks(user_id);
CREATE INDEX idx_music_clicks_shoe_id ON public.music_clicks(shoe_id);
CREATE INDEX idx_music_clicks_platform ON public.music_clicks(platform);
CREATE INDEX idx_music_clicks_clicked_at ON public.music_clicks(clicked_at DESC);

-- RLS Policies for music_clicks
ALTER TABLE public.music_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can log music clicks
CREATE POLICY "Anyone can log music clicks"
  ON public.music_clicks FOR INSERT
  WITH CHECK (true);

-- Users can view their own clicks
CREATE POLICY "Users can view their own music clicks"
  ON public.music_clicks FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view all music clicks
CREATE POLICY "Admin can view all music clicks"
  ON public.music_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'dadsellsgadgets@gmail.com'
    )
  );

-- ============================================
-- RPC FUNCTIONS FOR REFERRAL SYSTEM
-- ============================================

-- Function to increment referral shares
CREATE OR REPLACE FUNCTION increment_referral_shares(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_referrals
  SET 
    total_shares = total_shares + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- Function to track referral click
CREATE OR REPLACE FUNCTION track_referral_click(referrer_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_referrals
  SET 
    total_clicks = total_clicks + 1,
    updated_at = NOW()
  WHERE code = referrer_code;
END;
$$;

-- Function to process referral signup
CREATE OR REPLACE FUNCTION process_referral_signup(
  referrer_code TEXT,
  new_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Get referrer user_id
  SELECT user_id INTO referrer_id
  FROM public.user_referrals
  WHERE code = referrer_code;
  
  IF referrer_id IS NOT NULL THEN
    -- Update referrer stats
    UPDATE public.user_referrals
    SET 
      total_signups = total_signups + 1,
      pending_rewards = pending_rewards + 100, -- 100 points per referral
      updated_at = NOW()
    WHERE user_id = referrer_id;
    
    -- Set referred_by for new user
    UPDATE public.user_referrals
    SET referred_by = referrer_id
    WHERE user_id = new_user_id;
  END IF;
END;
$$;

-- Function to increment shoe click count
CREATE OR REPLACE FUNCTION increment_shoe_click(shoe_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.shoes
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = shoe_id;
END;
$$;

-- ============================================
-- AUDIT LOG TABLE (for admin actions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin ON public.audit_logs(admin_email);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- RLS for audit logs - only admin can view
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'dadsellsgadgets@gmail.com'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RATE LIMITING TABLE
-- For server-side rate limit tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP hash or user_id
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier, endpoint);
CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);

-- Auto-cleanup old rate limit records (run via cron)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- ============================================
-- GRANTS FOR SERVICE ROLE
-- ============================================
GRANT ALL ON public.price_alerts TO service_role;
GRANT ALL ON public.price_notifications TO service_role;
GRANT ALL ON public.push_subscriptions TO service_role;
GRANT ALL ON public.user_referrals TO service_role;
GRANT ALL ON public.email_subscriptions TO service_role;
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.music_clicks TO service_role;
GRANT ALL ON public.audit_logs TO service_role;
GRANT ALL ON public.rate_limits TO service_role;

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_price_alerts_updated_at
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_referrals_updated_at
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_subscriptions_updated_at
  BEFORE UPDATE ON public.email_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
-- Run this to verify all tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
