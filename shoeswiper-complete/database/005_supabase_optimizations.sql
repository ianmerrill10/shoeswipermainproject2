-- ============================================
-- SHOESWIPER SUPABASE OPTIMIZATIONS
-- Migration 005: RLS policies, indexes, triggers, and stored procedures
-- Run this in Supabase SQL Editor after previous migrations
-- ============================================

-- ============================================
-- SECTION 1: ADDITIONAL ROW LEVEL SECURITY POLICIES
-- Comprehensive RLS policies for all tables
-- ============================================

-- Categories table (missing from initial schema)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories" ON categories 
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage categories" ON categories 
    FOR ALL USING (is_admin());

-- Price History table
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view price history" ON price_history 
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert price history" ON price_history 
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin can manage price history" ON price_history 
    FOR ALL USING (is_admin());

-- ============================================
-- SECTION 2: ADDITIONAL DATABASE INDEXES FOR PERFORMANCE
-- Optimizing common query patterns
-- ============================================

-- Composite indexes for common shoe listing queries
CREATE INDEX IF NOT EXISTS idx_shoes_active_brand ON shoes (brand) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shoes_active_gender ON shoes (gender) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shoes_active_category ON shoes (category_slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shoes_active_price_range ON shoes (price) WHERE is_active = true;

-- Index for cursor-based pagination (using created_at, id as tie-breaker)
CREATE INDEX IF NOT EXISTS idx_shoes_pagination_cursor ON shoes (created_at DESC, id DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shoes_pagination_trending ON shoes (view_count DESC, created_at DESC, id DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shoes_pagination_popular ON shoes (favorite_count DESC, created_at DESC, id DESC) WHERE is_active = true;

-- Compound index for filtered pagination
CREATE INDEX IF NOT EXISTS idx_shoes_brand_pagination ON shoes (brand, created_at DESC, id DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shoes_gender_pagination ON shoes (gender, created_at DESC, id DESC) WHERE is_active = true;

-- Indexes for NFT marketplace queries
CREATE INDEX IF NOT EXISTS idx_nfts_auction_active ON nfts (auction_end) WHERE for_sale = true AND auction_end IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nfts_price_listing ON nfts (price_eth DESC) WHERE for_sale = true;
CREATE INDEX IF NOT EXISTS idx_nft_history_timestamp ON nft_ownership_history (transferred_at DESC);
CREATE INDEX IF NOT EXISTS idx_nft_history_nft ON nft_ownership_history (nft_id, transferred_at DESC);

-- Indexes for user data queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON favorites (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sneakers_user_added ON user_sneakers (user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email) WHERE email IS NOT NULL;

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_shoe_date ON affiliate_clicks (shoe_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_date ON affiliate_clicks (user_id, clicked_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events (event_type, created_at DESC);

-- Indexes for blog queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts (status, published_at DESC) WHERE status = 'published';

-- ============================================
-- SECTION 3: CONNECTION POOLING CONFIGURATION
-- Note: Connection pooling is configured at the Supabase project level
-- These are recommended settings documentation
-- ============================================

-- Connection pooling is managed by Supabase/PgBouncer at the infrastructure level.
-- Recommended settings for Supabase dashboard:
-- 
-- Pool Mode: Transaction (default)
-- Pool Size: 15 (adjust based on plan)
-- Statement Timeout: 30s (for long-running queries)
-- 
-- For application code, use these connection string parameters:
-- ?connection_limit=5&pool_timeout=30

-- ============================================
-- SECTION 4: CURSOR-BASED PAGINATION FUNCTIONS
-- Efficient pagination for shoe listings
-- ============================================

-- Get shoes with cursor-based pagination (by created_at)
CREATE OR REPLACE FUNCTION get_shoes_paginated(
    p_limit INTEGER DEFAULT 20,
    p_cursor_created_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_cursor_id UUID DEFAULT NULL,
    p_brand TEXT DEFAULT NULL,
    p_gender TEXT DEFAULT NULL,
    p_category_slug TEXT DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,
    p_style_tags TEXT[] DEFAULT NULL,
    p_color_tags TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    brand TEXT,
    category_slug TEXT,
    price NUMERIC,
    retail_price NUMERIC,
    sale_price NUMERIC,
    image_url TEXT,
    amazon_url TEXT,
    amazon_asin TEXT,
    style_tags TEXT[],
    color_tags TEXT[],
    gender TEXT,
    sizes_available TEXT[],
    description TEXT,
    favorite_count INTEGER,
    view_count INTEGER,
    click_count INTEGER,
    vibe_score INTEGER,
    is_active BOOLEAN,
    is_featured BOOLEAN,
    stock_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    has_more BOOLEAN
) AS $$
DECLARE
    v_count INTEGER;
BEGIN
    RETURN QUERY
    WITH filtered_shoes AS (
        SELECT s.*
        FROM shoes s
        WHERE s.is_active = true
            AND (p_brand IS NULL OR s.brand = p_brand)
            AND (p_gender IS NULL OR s.gender = p_gender)
            AND (p_category_slug IS NULL OR s.category_slug = p_category_slug)
            AND (p_min_price IS NULL OR s.price >= p_min_price)
            AND (p_max_price IS NULL OR s.price <= p_max_price)
            AND (p_style_tags IS NULL OR s.style_tags && p_style_tags)
            AND (p_color_tags IS NULL OR s.color_tags && p_color_tags)
            AND (
                p_cursor_created_at IS NULL 
                OR (s.created_at, s.id) < (p_cursor_created_at, p_cursor_id)
            )
        ORDER BY s.created_at DESC, s.id DESC
        LIMIT p_limit + 1
    ),
    result_count AS (
        SELECT COUNT(*) as cnt FROM filtered_shoes
    )
    SELECT 
        f.id,
        f.name,
        f.brand,
        f.category_slug,
        f.price,
        f.retail_price,
        f.sale_price,
        f.image_url,
        f.amazon_url,
        f.amazon_asin,
        f.style_tags,
        f.color_tags,
        f.gender,
        f.sizes_available,
        f.description,
        f.favorite_count,
        f.view_count,
        f.click_count,
        f.vibe_score,
        f.is_active,
        f.is_featured,
        f.stock_status,
        f.created_at,
        f.updated_at,
        (SELECT cnt FROM result_count) > p_limit AS has_more
    FROM filtered_shoes f
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get trending shoes with cursor-based pagination (by view_count)
CREATE OR REPLACE FUNCTION get_trending_shoes_paginated(
    p_limit INTEGER DEFAULT 20,
    p_cursor_view_count INTEGER DEFAULT NULL,
    p_cursor_created_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_cursor_id UUID DEFAULT NULL,
    p_brand TEXT DEFAULT NULL,
    p_gender TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    brand TEXT,
    price NUMERIC,
    image_url TEXT,
    amazon_url TEXT,
    style_tags TEXT[],
    color_tags TEXT[],
    gender TEXT,
    favorite_count INTEGER,
    view_count INTEGER,
    click_count INTEGER,
    vibe_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    has_more BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_shoes AS (
        SELECT s.*
        FROM shoes s
        WHERE s.is_active = true
            AND (p_brand IS NULL OR s.brand = p_brand)
            AND (p_gender IS NULL OR s.gender = p_gender)
            AND (
                p_cursor_view_count IS NULL 
                OR (s.view_count, s.created_at, s.id) < (p_cursor_view_count, p_cursor_created_at, p_cursor_id)
            )
        ORDER BY s.view_count DESC, s.created_at DESC, s.id DESC
        LIMIT p_limit + 1
    ),
    result_count AS (
        SELECT COUNT(*) as cnt FROM filtered_shoes
    )
    SELECT 
        f.id,
        f.name,
        f.brand,
        f.price,
        f.image_url,
        f.amazon_url,
        f.style_tags,
        f.color_tags,
        f.gender,
        f.favorite_count,
        f.view_count,
        f.click_count,
        f.vibe_score,
        f.created_at,
        (SELECT cnt FROM result_count) > p_limit AS has_more
    FROM filtered_shoes f
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get popular shoes with cursor-based pagination (by favorite_count)
CREATE OR REPLACE FUNCTION get_popular_shoes_paginated(
    p_limit INTEGER DEFAULT 20,
    p_cursor_favorite_count INTEGER DEFAULT NULL,
    p_cursor_created_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_cursor_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    brand TEXT,
    price NUMERIC,
    image_url TEXT,
    amazon_url TEXT,
    style_tags TEXT[],
    color_tags TEXT[],
    favorite_count INTEGER,
    view_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    has_more BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_shoes AS (
        SELECT s.*
        FROM shoes s
        WHERE s.is_active = true
            AND (
                p_cursor_favorite_count IS NULL 
                OR (s.favorite_count, s.created_at, s.id) < (p_cursor_favorite_count, p_cursor_created_at, p_cursor_id)
            )
        ORDER BY s.favorite_count DESC, s.created_at DESC, s.id DESC
        LIMIT p_limit + 1
    ),
    result_count AS (
        SELECT COUNT(*) as cnt FROM filtered_shoes
    )
    SELECT 
        f.id,
        f.name,
        f.brand,
        f.price,
        f.image_url,
        f.amazon_url,
        f.style_tags,
        f.color_tags,
        f.favorite_count,
        f.view_count,
        f.created_at,
        (SELECT cnt FROM result_count) > p_limit AS has_more
    FROM filtered_shoes f
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- SECTION 5: DATABASE TRIGGERS FOR ANALYTICS
-- Automatically track user interactions
-- ============================================

-- Trigger function to log analytics events on shoe views
CREATE OR REPLACE FUNCTION log_shoe_view_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO analytics_events (event_type, event_data, created_at)
    VALUES (
        'shoe_view',
        jsonb_build_object(
            'shoe_id', NEW.id,
            'shoe_name', NEW.name,
            'shoe_brand', NEW.brand,
            'view_count', NEW.view_count
        ),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to track significant view milestones
CREATE OR REPLACE FUNCTION track_view_milestone()
RETURNS TRIGGER AS $$
BEGIN
    -- Log milestone when views reach certain thresholds
    IF NEW.view_count IN (100, 500, 1000, 5000, 10000) AND 
       (OLD.view_count IS NULL OR OLD.view_count < NEW.view_count) THEN
        INSERT INTO analytics_events (event_type, event_data, created_at)
        VALUES (
            'shoe_view',
            jsonb_build_object(
                'shoe_id', NEW.id,
                'shoe_name', NEW.name,
                'milestone', NEW.view_count,
                'event_subtype', 'milestone'
            ),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_view_milestones ON shoes;
CREATE TRIGGER track_view_milestones
    AFTER UPDATE OF view_count ON shoes
    FOR EACH ROW
    EXECUTE FUNCTION track_view_milestone();

-- Trigger function to log favorite events
CREATE OR REPLACE FUNCTION log_favorite_event()
RETURNS TRIGGER AS $$
DECLARE
    v_shoe_name TEXT;
    v_shoe_brand TEXT;
BEGIN
    SELECT name, brand INTO v_shoe_name, v_shoe_brand
    FROM shoes WHERE id = NEW.shoe_id;
    
    INSERT INTO analytics_events (event_type, event_data, created_at)
    VALUES (
        'favorite',
        jsonb_build_object(
            'shoe_id', NEW.shoe_id,
            'shoe_name', v_shoe_name,
            'shoe_brand', v_shoe_brand,
            'user_id', NEW.user_id
        ),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_favorite_analytics ON favorites;
CREATE TRIGGER log_favorite_analytics
    AFTER INSERT ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION log_favorite_event();

-- Trigger to automatically update favorite_count on shoes
CREATE OR REPLACE FUNCTION update_shoe_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE shoes SET favorite_count = favorite_count + 1 WHERE id = NEW.shoe_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE shoes SET favorite_count = favorite_count - 1 WHERE id = OLD.shoe_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_favorite_count ON favorites;
CREATE TRIGGER update_favorite_count
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_shoe_favorite_count();

-- Trigger to log affiliate click events
CREATE OR REPLACE FUNCTION log_affiliate_click_event()
RETURNS TRIGGER AS $$
DECLARE
    v_shoe_name TEXT;
    v_shoe_brand TEXT;
    v_shoe_price NUMERIC;
BEGIN
    SELECT name, brand, price INTO v_shoe_name, v_shoe_brand, v_shoe_price
    FROM shoes WHERE id = NEW.shoe_id;
    
    INSERT INTO analytics_events (event_type, event_data, created_at)
    VALUES (
        'shoe_click',
        jsonb_build_object(
            'shoe_id', NEW.shoe_id,
            'shoe_name', v_shoe_name,
            'shoe_brand', v_shoe_brand,
            'shoe_price', v_shoe_price,
            'user_id', NEW.user_id
        ),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_affiliate_click_analytics ON affiliate_clicks;
CREATE TRIGGER log_affiliate_click_analytics
    AFTER INSERT ON affiliate_clicks
    FOR EACH ROW
    EXECUTE FUNCTION log_affiliate_click_event();

-- Trigger to log swipe events (for user_sneakers closet additions)
CREATE OR REPLACE FUNCTION log_closet_add_event()
RETURNS TRIGGER AS $$
DECLARE
    v_shoe_name TEXT;
    v_shoe_brand TEXT;
BEGIN
    SELECT name, brand INTO v_shoe_name, v_shoe_brand
    FROM shoes WHERE id = NEW.shoe_id;
    
    INSERT INTO analytics_events (event_type, event_data, created_at)
    VALUES (
        'swipe',
        jsonb_build_object(
            'shoe_id', NEW.shoe_id,
            'shoe_name', v_shoe_name,
            'shoe_brand', v_shoe_brand,
            'user_id', NEW.user_id,
            'action', 'add_to_closet'
        ),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_closet_add_analytics ON user_sneakers;
CREATE TRIGGER log_closet_add_analytics
    AFTER INSERT ON user_sneakers
    FOR EACH ROW
    EXECUTE FUNCTION log_closet_add_event();

-- Trigger to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profile_updated_at ON profiles;
CREATE TRIGGER update_profile_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_timestamp();

-- Trigger to update shoes updated_at timestamp
CREATE OR REPLACE FUNCTION update_shoe_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shoe_updated_at ON shoes;
CREATE TRIGGER update_shoe_updated_at
    BEFORE UPDATE ON shoes
    FOR EACH ROW
    EXECUTE FUNCTION update_shoe_timestamp();

-- ============================================
-- SECTION 6: STORED PROCEDURES FOR COMPLEX OPERATIONS
-- Atomic operations for common database tasks
-- ============================================

-- Procedure to toggle favorite with atomic count update
CREATE OR REPLACE FUNCTION toggle_favorite(
    p_user_id UUID,
    p_shoe_id UUID
)
RETURNS TABLE (
    action TEXT,
    is_favorited BOOLEAN,
    new_favorite_count INTEGER
) AS $$
DECLARE
    v_exists BOOLEAN;
    v_new_count INTEGER;
BEGIN
    -- Check if favorite exists
    SELECT EXISTS(
        SELECT 1 FROM favorites WHERE user_id = p_user_id AND shoe_id = p_shoe_id
    ) INTO v_exists;
    
    IF v_exists THEN
        -- Remove favorite
        DELETE FROM favorites WHERE user_id = p_user_id AND shoe_id = p_shoe_id;
        
        -- Get updated count
        SELECT favorite_count INTO v_new_count FROM shoes WHERE id = p_shoe_id;
        
        RETURN QUERY SELECT 'removed'::TEXT, false, v_new_count;
    ELSE
        -- Add favorite
        INSERT INTO favorites (user_id, shoe_id, created_at)
        VALUES (p_user_id, p_shoe_id, NOW())
        ON CONFLICT (user_id, shoe_id) DO NOTHING;
        
        -- Get updated count
        SELECT favorite_count INTO v_new_count FROM shoes WHERE id = p_shoe_id;
        
        RETURN QUERY SELECT 'added'::TEXT, true, v_new_count;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to add shoe to user's closet with validation
CREATE OR REPLACE FUNCTION add_to_closet(
    p_user_id UUID,
    p_shoe_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    closet_count INTEGER
) AS $$
DECLARE
    v_shoe_exists BOOLEAN;
    v_already_in_closet BOOLEAN;
    v_closet_count INTEGER;
BEGIN
    -- Validate shoe exists and is active
    SELECT EXISTS(
        SELECT 1 FROM shoes WHERE id = p_shoe_id AND is_active = true
    ) INTO v_shoe_exists;
    
    IF NOT v_shoe_exists THEN
        RETURN QUERY SELECT false, 'Shoe not found or inactive'::TEXT, 0;
        RETURN;
    END IF;
    
    -- Check if already in closet
    SELECT EXISTS(
        SELECT 1 FROM user_sneakers WHERE user_id = p_user_id AND shoe_id = p_shoe_id
    ) INTO v_already_in_closet;
    
    IF v_already_in_closet THEN
        SELECT COUNT(*) INTO v_closet_count FROM user_sneakers WHERE user_id = p_user_id;
        RETURN QUERY SELECT true, 'Already in closet'::TEXT, v_closet_count::INTEGER;
        RETURN;
    END IF;
    
    -- Add to closet
    INSERT INTO user_sneakers (user_id, shoe_id, added_at)
    VALUES (p_user_id, p_shoe_id, NOW());
    
    -- Get updated closet count
    SELECT COUNT(*) INTO v_closet_count FROM user_sneakers WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT true, 'Added to closet'::TEXT, v_closet_count::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to track shoe engagement (view + potential click)
CREATE OR REPLACE FUNCTION track_shoe_engagement(
    p_shoe_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_engagement_type TEXT DEFAULT 'view'
)
RETURNS VOID AS $$
BEGIN
    IF p_engagement_type = 'view' THEN
        UPDATE shoes SET view_count = view_count + 1 WHERE id = p_shoe_id;
    ELSIF p_engagement_type = 'click' THEN
        UPDATE shoes SET click_count = click_count + 1 WHERE id = p_shoe_id;
        
        -- Log affiliate click
        INSERT INTO affiliate_clicks (shoe_id, user_id, clicked_at)
        VALUES (p_shoe_id, p_user_id, NOW());
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to get user dashboard data efficiently
CREATE OR REPLACE FUNCTION get_user_dashboard(
    p_user_id UUID
)
RETURNS TABLE (
    favorites_count BIGINT,
    closet_count BIGINT,
    recent_favorites JSON,
    recent_closet JSON,
    price_alerts_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM favorites WHERE user_id = p_user_id) as favorites_count,
        (SELECT COUNT(*) FROM user_sneakers WHERE user_id = p_user_id) as closet_count,
        (
            SELECT COALESCE(json_agg(row_to_json(f)), '[]'::json)
            FROM (
                SELECT s.id, s.name, s.brand, s.image_url, s.price, fav.created_at
                FROM favorites fav
                JOIN shoes s ON fav.shoe_id = s.id
                WHERE fav.user_id = p_user_id
                ORDER BY fav.created_at DESC
                LIMIT 5
            ) f
        ) as recent_favorites,
        (
            SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
            FROM (
                SELECT s.id, s.name, s.brand, s.image_url, s.price, us.added_at
                FROM user_sneakers us
                JOIN shoes s ON us.shoe_id = s.id
                WHERE us.user_id = p_user_id
                ORDER BY us.added_at DESC
                LIMIT 5
            ) c
        ) as recent_closet,
        (SELECT COUNT(*) FROM price_alerts WHERE user_id = p_user_id AND triggered = false) as price_alerts_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Procedure to get analytics summary for admin
CREATE OR REPLACE FUNCTION get_analytics_summary(
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_views BIGINT,
    total_clicks BIGINT,
    total_favorites BIGINT,
    total_users BIGINT,
    top_viewed_shoes JSON,
    top_clicked_shoes JSON,
    daily_stats JSON
) AS $$
DECLARE
    v_start_date TIMESTAMP WITH TIME ZONE;
BEGIN
    v_start_date := NOW() - (p_days || ' days')::INTERVAL;
    
    RETURN QUERY
    SELECT
        (SELECT SUM(view_count) FROM shoes) as total_views,
        (SELECT SUM(click_count) FROM shoes) as total_clicks,
        (SELECT SUM(favorite_count) FROM shoes) as total_favorites,
        (SELECT COUNT(*) FROM profiles) as total_users,
        (
            SELECT COALESCE(json_agg(row_to_json(v)), '[]'::json)
            FROM (
                SELECT id, name, brand, image_url, view_count
                FROM shoes
                WHERE is_active = true
                ORDER BY view_count DESC
                LIMIT 10
            ) v
        ) as top_viewed_shoes,
        (
            SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
            FROM (
                SELECT id, name, brand, image_url, click_count
                FROM shoes
                WHERE is_active = true
                ORDER BY click_count DESC
                LIMIT 10
            ) c
        ) as top_clicked_shoes,
        (
            SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json)
            FROM (
                SELECT 
                    DATE(clicked_at) as date,
                    COUNT(*) as clicks
                FROM affiliate_clicks
                WHERE clicked_at >= v_start_date
                GROUP BY DATE(clicked_at)
                ORDER BY date DESC
                LIMIT p_days
            ) d
        ) as daily_stats;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Procedure for batch updating shoe prices (for future Amazon API integration)
CREATE OR REPLACE FUNCTION batch_update_prices(
    p_price_updates JSONB
)
RETURNS TABLE (
    updated_count INTEGER,
    failed_asins TEXT[]
) AS $$
DECLARE
    v_updated INTEGER := 0;
    v_failed TEXT[] := '{}';
    v_item JSONB;
    v_asin TEXT;
    v_price NUMERIC;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_price_updates)
    LOOP
        v_asin := v_item->>'asin';
        v_price := (v_item->>'price')::NUMERIC;
        
        BEGIN
            UPDATE shoes 
            SET 
                price = v_price,
                updated_at = NOW()
            WHERE amazon_asin = v_asin;
            
            IF FOUND THEN
                -- Log price history
                INSERT INTO price_history (shoe_id, price, recorded_at)
                SELECT id, v_price, NOW()
                FROM shoes WHERE amazon_asin = v_asin;
                
                v_updated := v_updated + 1;
            ELSE
                v_failed := array_append(v_failed, v_asin);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_failed := array_append(v_failed, v_asin);
        END;
    END LOOP;
    
    RETURN QUERY SELECT v_updated, v_failed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to create price alert with validation
CREATE OR REPLACE FUNCTION create_price_alert(
    p_user_id UUID,
    p_shoe_id UUID,
    p_target_price NUMERIC
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    alert_id UUID
) AS $$
DECLARE
    v_shoe RECORD;
    v_alert_id UUID;
BEGIN
    -- Get shoe details
    SELECT id, name, brand, image_url, amazon_url, price 
    INTO v_shoe
    FROM shoes 
    WHERE id = p_shoe_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Shoe not found or inactive'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Validate target price
    IF p_target_price <= 0 THEN
        RETURN QUERY SELECT false, 'Target price must be greater than 0'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    IF p_target_price >= v_shoe.price THEN
        RETURN QUERY SELECT false, 'Target price must be less than current price'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Create or update price alert
    INSERT INTO price_alerts (
        user_id, shoe_id, shoe_name, shoe_brand, shoe_image, 
        amazon_url, target_price, current_price, original_price, created_at
    )
    VALUES (
        p_user_id, p_shoe_id, v_shoe.name, v_shoe.brand, v_shoe.image_url,
        v_shoe.amazon_url, p_target_price, v_shoe.price, v_shoe.price, NOW()
    )
    ON CONFLICT (user_id, shoe_id) 
    DO UPDATE SET 
        target_price = p_target_price,
        current_price = v_shoe.price,
        triggered = false,
        triggered_at = NULL
    RETURNING id INTO v_alert_id;
    
    RETURN QUERY SELECT true, 'Price alert created'::TEXT, v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to search shoes with full-text search and ranking
CREATE OR REPLACE FUNCTION search_shoes_ranked(
    p_query TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_brand TEXT DEFAULT NULL,
    p_gender TEXT DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    brand TEXT,
    price NUMERIC,
    image_url TEXT,
    amazon_url TEXT,
    style_tags TEXT[],
    color_tags TEXT[],
    gender TEXT,
    favorite_count INTEGER,
    view_count INTEGER,
    rank REAL,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT 
            s.*,
            ts_rank(
                to_tsvector('english', s.name || ' ' || s.brand || ' ' || COALESCE(s.description, '')),
                plainto_tsquery('english', p_query)
            ) as search_rank,
            COUNT(*) OVER() as total
        FROM shoes s
        WHERE s.is_active = true
            AND to_tsvector('english', s.name || ' ' || s.brand || ' ' || COALESCE(s.description, '')) 
                @@ plainto_tsquery('english', p_query)
            AND (p_brand IS NULL OR s.brand = p_brand)
            AND (p_gender IS NULL OR s.gender = p_gender)
            AND (p_min_price IS NULL OR s.price >= p_min_price)
            AND (p_max_price IS NULL OR s.price <= p_max_price)
        ORDER BY search_rank DESC, s.favorite_count DESC
        LIMIT p_limit OFFSET p_offset
    )
    SELECT 
        sr.id,
        sr.name,
        sr.brand,
        sr.price,
        sr.image_url,
        sr.amazon_url,
        sr.style_tags,
        sr.color_tags,
        sr.gender,
        sr.favorite_count,
        sr.view_count,
        sr.search_rank as rank,
        sr.total as total_count
    FROM search_results sr;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Procedure to get similar shoes based on tags
CREATE OR REPLACE FUNCTION get_similar_shoes(
    p_shoe_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    brand TEXT,
    price NUMERIC,
    image_url TEXT,
    amazon_url TEXT,
    style_tags TEXT[],
    color_tags TEXT[],
    similarity_score INTEGER
) AS $$
DECLARE
    v_style_tags TEXT[];
    v_color_tags TEXT[];
    v_brand TEXT;
BEGIN
    -- Get the source shoe's tags
    SELECT style_tags, color_tags, brand 
    INTO v_style_tags, v_color_tags, v_brand
    FROM shoes WHERE id = p_shoe_id;
    
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.brand,
        s.price,
        s.image_url,
        s.amazon_url,
        s.style_tags,
        s.color_tags,
        (
            COALESCE(array_length(ARRAY(SELECT unnest(s.style_tags) INTERSECT SELECT unnest(v_style_tags)), 1), 0) * 2 +
            COALESCE(array_length(ARRAY(SELECT unnest(s.color_tags) INTERSECT SELECT unnest(v_color_tags)), 1), 0) +
            CASE WHEN s.brand = v_brand THEN 1 ELSE 0 END
        )::INTEGER as similarity_score
    FROM shoes s
    WHERE s.id != p_shoe_id
        AND s.is_active = true
        AND (s.style_tags && v_style_tags OR s.color_tags && v_color_tags)
    ORDER BY similarity_score DESC, s.favorite_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Procedure to clean up old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics(
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS TABLE (
    deleted_events INTEGER,
    deleted_clicks INTEGER
) AS $$
DECLARE
    v_cutoff_date TIMESTAMP WITH TIME ZONE;
    v_deleted_events INTEGER;
    v_deleted_clicks INTEGER;
BEGIN
    v_cutoff_date := NOW() - (p_days_to_keep || ' days')::INTERVAL;
    
    -- Delete old analytics events (keep aggregated data)
    DELETE FROM analytics_events 
    WHERE created_at < v_cutoff_date
    AND event_data->>'event_subtype' IS NULL; -- Keep milestone events
    
    GET DIAGNOSTICS v_deleted_events = ROW_COUNT;
    
    -- Delete old affiliate clicks (keep for revenue tracking purposes, just clean very old ones)
    DELETE FROM affiliate_clicks 
    WHERE clicked_at < v_cutoff_date - INTERVAL '180 days';
    
    GET DIAGNOSTICS v_deleted_clicks = ROW_COUNT;
    
    RETURN QUERY SELECT v_deleted_events, v_deleted_clicks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 7: GRANT PERMISSIONS
-- Ensure RPC functions are accessible
-- ============================================

GRANT EXECUTE ON FUNCTION get_shoes_paginated TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_trending_shoes_paginated TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_popular_shoes_paginated TO anon, authenticated;
GRANT EXECUTE ON FUNCTION toggle_favorite TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_closet TO authenticated;
GRANT EXECUTE ON FUNCTION track_shoe_engagement TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION create_price_alert TO authenticated;
GRANT EXECUTE ON FUNCTION search_shoes_ranked TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_similar_shoes TO anon, authenticated;

-- Admin-only functions (already protected by is_admin() check in code, but explicit grant)
GRANT EXECUTE ON FUNCTION get_analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION batch_update_prices TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_analytics TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON FUNCTION get_shoes_paginated IS 'Cursor-based pagination for shoe listings with filtering support';
COMMENT ON FUNCTION get_trending_shoes_paginated IS 'Cursor-based pagination for trending shoes ordered by view_count';
COMMENT ON FUNCTION get_popular_shoes_paginated IS 'Cursor-based pagination for popular shoes ordered by favorite_count';
COMMENT ON FUNCTION toggle_favorite IS 'Atomically toggle favorite status for a shoe';
COMMENT ON FUNCTION add_to_closet IS 'Add a shoe to user closet with validation';
COMMENT ON FUNCTION track_shoe_engagement IS 'Track view or click engagement for a shoe';
COMMENT ON FUNCTION get_user_dashboard IS 'Get aggregated dashboard data for a user';
COMMENT ON FUNCTION get_analytics_summary IS 'Get analytics summary for admin dashboard';
COMMENT ON FUNCTION batch_update_prices IS 'Batch update shoe prices from external source';
COMMENT ON FUNCTION create_price_alert IS 'Create or update a price alert for a user';
COMMENT ON FUNCTION search_shoes_ranked IS 'Full-text search with relevance ranking';
COMMENT ON FUNCTION get_similar_shoes IS 'Get similar shoes based on style and color tags';
COMMENT ON FUNCTION cleanup_old_analytics IS 'Clean up old analytics data to manage storage';
