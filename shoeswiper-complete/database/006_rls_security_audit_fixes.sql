-- ============================================
-- SHOESWIPER RLS SECURITY AUDIT FIXES
-- Migration 006: Fix all RLS policy vulnerabilities
-- 
-- Security Audit Date: 2025-12-04
-- Admin Email: dadsellsgadgets@gmail.com
-- 
-- Run this in Supabase SQL Editor after previous migrations
-- ============================================

-- ============================================
-- SECTION 1: FIX CRITICAL VULNERABILITIES
-- ============================================

-- 1.1 FIX: nft_ownership_history - overly permissive INSERT
-- Current: Anyone can insert history records (security risk)
-- Fix: Only allow system/admin inserts, or inserts where the user is the from_user or to_user
DROP POLICY IF EXISTS "Insert history on transfer" ON nft_ownership_history;

-- Only allow inserts when the authenticated user is part of the transaction
-- This prevents arbitrary history injection
CREATE POLICY "Insert history on legitimate transfer" ON nft_ownership_history 
    FOR INSERT WITH CHECK (
        -- Admin can insert any history
        is_admin() 
        OR 
        -- User must be part of the transfer (either sender or receiver)
        (auth.uid() = from_user OR auth.uid() = to_user)
    );

-- 1.2 FIX: email_subscriptions - overly permissive UPDATE/DELETE
-- Current: Anyone can update/delete any email subscription (CRITICAL VULNERABILITY)
-- Fix: Only the subscriber or admin can modify subscriptions
DROP POLICY IF EXISTS "Subscribers can update own subscription" ON email_subscriptions;
DROP POLICY IF EXISTS "Subscribers can delete own subscription" ON email_subscriptions;

-- For email subscriptions, we need to verify by email match (since no user_id column)
-- Add a more restrictive policy - admin only for now, or match by authenticated email
CREATE POLICY "Users can update own email subscription" ON email_subscriptions 
    FOR UPDATE USING (
        is_admin() 
        OR 
        -- Allow update if the authenticated user's email matches
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete own email subscription" ON email_subscriptions 
    FOR DELETE USING (
        is_admin() 
        OR 
        -- Allow delete if the authenticated user's email matches  
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- 1.3 FIX: blog_generation_queue - NO POLICIES (Table is inaccessible)
-- This table should be admin-only for all operations
CREATE POLICY "Admin can manage generation queue" ON blog_generation_queue 
    FOR ALL USING (is_admin());

-- ============================================
-- SECTION 2: FIX HIGH PRIORITY VULNERABILITIES
-- ============================================

-- 2.1 FIX: nfts - Missing DELETE policy
-- NFT owners should be able to delete their NFTs (burn functionality)
CREATE POLICY "Owners can delete NFTs" ON nfts 
    FOR DELETE USING (auth.uid() = owner_id OR is_admin());

-- 2.2 FIX: price_notifications - Missing INSERT policy
-- System needs to be able to create price notifications
-- Only admin/system should create notifications (not users directly)
CREATE POLICY "System can insert price notifications" ON price_notifications 
    FOR INSERT WITH CHECK (is_admin());

-- Note: For actual system inserts, use service role key which bypasses RLS

-- 2.3 FIX: brands table - Missing admin write policies
DROP POLICY IF EXISTS "Admin can manage brands" ON brands;
CREATE POLICY "Admin can insert brands" ON brands 
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update brands" ON brands 
    FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete brands" ON brands 
    FOR DELETE USING (is_admin());

-- 2.4 FIX: Blog tables - Missing admin write policies

-- blog_categories
CREATE POLICY "Admin can insert categories" ON blog_categories 
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update categories" ON blog_categories 
    FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete categories" ON blog_categories 
    FOR DELETE USING (is_admin());

-- blog_authors  
CREATE POLICY "Admin can insert authors" ON blog_authors 
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update authors" ON blog_authors 
    FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete authors" ON blog_authors 
    FOR DELETE USING (is_admin());

-- blog_posts
CREATE POLICY "Admin can insert posts" ON blog_posts 
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update posts" ON blog_posts 
    FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete posts" ON blog_posts 
    FOR DELETE USING (is_admin());
-- Also allow admin to view all posts (including drafts)
CREATE POLICY "Admin can view all posts" ON blog_posts 
    FOR SELECT USING (is_admin());

-- blog_tags
CREATE POLICY "Admin can insert tags" ON blog_tags 
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update tags" ON blog_tags 
    FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete tags" ON blog_tags 
    FOR DELETE USING (is_admin());

-- blog_post_tags
CREATE POLICY "Admin can insert post tags" ON blog_post_tags 
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can delete post tags" ON blog_post_tags 
    FOR DELETE USING (is_admin());

-- blog_affiliate_products
CREATE POLICY "Admin can insert affiliate products" ON blog_affiliate_products 
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update affiliate products" ON blog_affiliate_products 
    FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete affiliate products" ON blog_affiliate_products 
    FOR DELETE USING (is_admin());

-- blog_post_products
CREATE POLICY "Admin can insert post products" ON blog_post_products 
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can delete post products" ON blog_post_products 
    FOR DELETE USING (is_admin());

-- blog_affiliate_clicks - add SELECT for admin
CREATE POLICY "Admin can view affiliate clicks" ON blog_affiliate_clicks 
    FOR SELECT USING (is_admin());

-- blog_post_views - add SELECT for admin
CREATE POLICY "Admin can view post views" ON blog_post_views 
    FOR SELECT USING (is_admin());

-- blog_newsletter_subscribers - add SELECT and UPDATE/DELETE policies
CREATE POLICY "Admin can view all newsletter subscribers" ON blog_newsletter_subscribers 
    FOR SELECT USING (is_admin());
CREATE POLICY "Subscribers can update own subscription by email" ON blog_newsletter_subscribers 
    FOR UPDATE USING (
        is_admin() 
        OR 
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );
CREATE POLICY "Subscribers can delete own subscription by email" ON blog_newsletter_subscribers 
    FOR DELETE USING (
        is_admin() 
        OR 
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- blog_comments - add UPDATE/DELETE policies
CREATE POLICY "Users can update own comments" ON blog_comments 
    FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can delete own comments" ON blog_comments 
    FOR DELETE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admin can view all comments" ON blog_comments 
    FOR SELECT USING (is_admin());

-- ============================================
-- SECTION 3: FIX MEDIUM PRIORITY ISSUES
-- ============================================

-- 3.1 FIX: user_referrals - duplicate SELECT policies
-- Remove the overly permissive "Public can view referral codes" policy
-- This could leak user data (user_id, earnings, signup counts, etc.)
DROP POLICY IF EXISTS "Public can view referral codes" ON user_referrals;

-- Only allow users to view their own referral data
-- The existing "Users can view own referral data" policy in 003 handles this
-- For public referral code validation, use the secure function below

-- Create a secure function for public referral code validation
-- This function only returns whether the code exists, not any user data
CREATE OR REPLACE FUNCTION validate_referral_code(referral_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Input validation: return false for null, empty, or overly long codes
    IF referral_code IS NULL OR LENGTH(TRIM(referral_code)) = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Limit code length to prevent abuse (referral codes should be reasonable length)
    IF LENGTH(referral_code) > 50 THEN
        RETURN FALSE;
    END IF;
    
    -- Only return whether the code exists, no user data exposed
    -- PostgreSQL parameterized queries handle SQL injection protection
    RETURN EXISTS (SELECT 1 FROM user_referrals WHERE code = TRIM(referral_code));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public for code validation during signup
GRANT EXECUTE ON FUNCTION validate_referral_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION validate_referral_code(TEXT) TO authenticated;

-- 3.2: No UPDATE needed for favorites (users just add/remove, not update)
-- 3.3: No UPDATE needed for user_sneakers (users just add/remove, not update)

-- ============================================
-- SECTION 4: ADD SERVICE ROLE BYPASS DOCUMENTATION
-- ============================================

-- IMPORTANT: For system operations that need to bypass RLS
-- (like creating price notifications, updating analytics, etc.)
-- use the service_role key which automatically bypasses RLS.
-- 
-- Example in Edge Functions:
-- const supabase = createClient(
--   Deno.env.get('SUPABASE_URL')!,
--   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
-- );

-- ============================================
-- SECTION 5: ADD AUDIT LOG ENTRIES FOR SENSITIVE OPERATIONS
-- ============================================

-- Create a function to log RLS policy changes
CREATE OR REPLACE FUNCTION log_security_audit()
RETURNS void AS $$
BEGIN
    INSERT INTO audit_logs (admin_email, action, target_table, details, created_at)
    VALUES (
        'dadsellsgadgets@gmail.com',
        'RLS_SECURITY_AUDIT',
        'multiple',
        jsonb_build_object(
            'migration', '006_rls_security_audit_fixes.sql',
            'audit_date', NOW(),
            'fixes_applied', ARRAY[
                'nft_ownership_history: Fixed overly permissive INSERT',
                'email_subscriptions: Fixed overly permissive UPDATE/DELETE',
                'blog_generation_queue: Added missing policies',
                'nfts: Added missing DELETE policy',
                'price_notifications: Added INSERT policy',
                'brands: Added admin write policies',
                'blog_*: Added admin write policies',
                'user_referrals: Fixed duplicate SELECT policies'
            ],
            'security_level', 'CRITICAL_FIXES_APPLIED'
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the audit log
SELECT log_security_audit();

-- Clean up the function
DROP FUNCTION IF EXISTS log_security_audit();

-- ============================================
-- SECTION 6: VERIFY ALL TABLES HAVE RLS ENABLED
-- ============================================

-- This query can be run to verify RLS status (informational)
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE nft_ownership_history IS 'NFT ownership transfers - RLS requires user to be part of transaction';
COMMENT ON TABLE email_subscriptions IS 'Email subscriptions - RLS restricts updates/deletes to own email or admin';
COMMENT ON TABLE blog_generation_queue IS 'AI blog generation queue - Admin only access';
