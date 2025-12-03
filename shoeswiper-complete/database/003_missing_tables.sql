-- ============================================
-- SHOESWIPER MISSING TABLES MIGRATION
-- Migration 003: Add missing tables identified in audit
-- Run this in Supabase SQL Editor after 001_schema.sql
-- ============================================

-- ============================================
-- PRICE TRACKING TABLES
-- ============================================

-- 1. PRICE ALERTS TABLE
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE,
    shoe_name TEXT NOT NULL,
    shoe_brand TEXT NOT NULL,
    shoe_image TEXT NOT NULL,
    amazon_url TEXT NOT NULL,
    target_price NUMERIC(10, 2) NOT NULL,
    current_price NUMERIC(10, 2),
    original_price NUMERIC(10, 2),
    triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMP WITH TIME ZONE,
    last_checked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, shoe_id)
);

-- 2. PRICE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS price_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE,
    shoe_name TEXT NOT NULL,
    shoe_brand TEXT NOT NULL,
    shoe_image TEXT NOT NULL,
    amazon_url TEXT NOT NULL,
    old_price NUMERIC(10, 2) NOT NULL,
    new_price NUMERIC(10, 2) NOT NULL,
    saved_amount NUMERIC(10, 2) NOT NULL,
    percent_off INTEGER NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PUSH NOTIFICATIONS TABLE
-- ============================================

-- 3. PUSH SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    subscription JSONB NOT NULL,
    settings JSONB DEFAULT '{"enabled": true, "priceDrops": true, "newReleases": true, "restocks": true, "promotions": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REFERRAL SYSTEM TABLE
-- ============================================

-- 4. USER REFERRALS TABLE
CREATE TABLE IF NOT EXISTS user_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    code TEXT NOT NULL UNIQUE,
    referred_by TEXT,
    total_shares INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_signups INTEGER DEFAULT 0,
    earned_rewards INTEGER DEFAULT 0,
    pending_rewards INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EMAIL MARKETING TABLE
-- ============================================

-- 5. EMAIL SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    source TEXT CHECK (source IN ('price_alert', 'newsletter', 'exit_intent', 'referral')),
    shoe_id UUID REFERENCES shoes(id) ON DELETE SET NULL,
    shoe_name TEXT,
    preferences JSONB DEFAULT '{"priceAlerts": true, "newReleases": true, "weeklyDigest": false, "promotions": false}'::jsonb,
    is_subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- 6. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL CHECK (event_type IN ('shoe_view', 'shoe_click', 'music_click', 'panel_open', 'share', 'favorite', 'swipe')),
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MUSIC CLICKS TABLE
CREATE TABLE IF NOT EXISTS music_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('spotify', 'apple_music', 'amazon_music')),
    song TEXT,
    artist TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Price Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_shoe ON price_alerts (shoe_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_triggered ON price_alerts (triggered) WHERE triggered = false;

-- Price Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_price_notifications_user ON price_notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_price_notifications_created ON price_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_notifications_read ON price_notifications (read) WHERE read = false;

-- Push Subscriptions Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions (user_id);

-- User Referrals Indexes
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals (code);
CREATE INDEX IF NOT EXISTS idx_user_referrals_user ON user_referrals (user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred_by ON user_referrals (referred_by);

-- Email Subscriptions Indexes
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions (email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed ON email_subscriptions (is_subscribed) WHERE is_subscribed = true;
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_source ON email_subscriptions (source);

-- Analytics Events Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at DESC);

-- Music Clicks Indexes
CREATE INDEX IF NOT EXISTS idx_music_clicks_shoe ON music_clicks (shoe_id);
CREATE INDEX IF NOT EXISTS idx_music_clicks_platform ON music_clicks (platform);
CREATE INDEX IF NOT EXISTS idx_music_clicks_date ON music_clicks (clicked_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Increment referral shares counter
CREATE OR REPLACE FUNCTION increment_referral_shares(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_referrals
  SET total_shares = total_shares + 1,
      updated_at = NOW()
  WHERE user_referrals.user_id = increment_referral_shares.user_id;
END;
$$ LANGUAGE plpgsql;

-- Track referral click
CREATE OR REPLACE FUNCTION track_referral_click(referrer_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_referrals
  SET total_clicks = total_clicks + 1,
      updated_at = NOW()
  WHERE code = referrer_code;
END;
$$ LANGUAGE plpgsql;

-- Process referral signup
CREATE OR REPLACE FUNCTION process_referral_signup(referrer_code TEXT, new_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update referrer's stats
  UPDATE user_referrals
  SET total_signups = total_signups + 1,
      pending_rewards = pending_rewards + 100,
      updated_at = NOW()
  WHERE code = referrer_code;

  -- Update new user's referred_by field
  UPDATE user_referrals
  SET referred_by = referrer_code,
      updated_at = NOW()
  WHERE user_id = new_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_clicks ENABLE ROW LEVEL SECURITY;

-- PRICE ALERTS POLICIES
CREATE POLICY "Users can view own price alerts" ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own price alerts" ON price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own price alerts" ON price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own price alerts" ON price_alerts FOR DELETE USING (auth.uid() = user_id);

-- PRICE NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own price notifications" ON price_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own price notifications" ON price_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own price notifications" ON price_notifications FOR DELETE USING (auth.uid() = user_id);

-- PUSH SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view own push subscriptions" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own push subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own push subscriptions" ON push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own push subscriptions" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- USER REFERRALS POLICIES
CREATE POLICY "Users can view own referral data" ON user_referrals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own referral data" ON user_referrals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own referral data" ON user_referrals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view referral codes" ON user_referrals FOR SELECT USING (true);

-- EMAIL SUBSCRIPTIONS POLICIES
CREATE POLICY "Anyone can create email subscriptions" ON email_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view all email subscriptions" ON email_subscriptions FOR SELECT USING (is_admin());
CREATE POLICY "Subscribers can update own subscription" ON email_subscriptions FOR UPDATE USING (true);
CREATE POLICY "Subscribers can delete own subscription" ON email_subscriptions FOR DELETE USING (true);

-- ANALYTICS EVENTS POLICIES
CREATE POLICY "Anyone can insert analytics events" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view analytics events" ON analytics_events FOR SELECT USING (is_admin());

-- MUSIC CLICKS POLICIES
CREATE POLICY "Anyone can insert music clicks" ON music_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view music clicks" ON music_clicks FOR SELECT USING (is_admin());

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
