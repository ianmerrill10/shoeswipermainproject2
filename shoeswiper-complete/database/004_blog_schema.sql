-- Blog Schema for ShoeSwiper
-- Migration: 004_blog_schema.sql
-- Description: Creates blog tables for 4 automated AI blogs

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Blog Categories Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(7),
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default blog categories
INSERT INTO blog_categories (slug, name, description, icon, color, meta_title, meta_description) VALUES
    ('sneaker', 'Sneaker Blog', 'Latest sneaker news, releases, reviews, and culture', '👟', '#FF6B35', 'Sneaker Blog | ShoeSwiper', 'Your source for the latest sneaker news, release dates, reviews, and streetwear culture.'),
    ('shoes', 'Shoe Blog', 'Comprehensive guides to shoes, fashion tips, and style advice', '👞', '#4A90D9', 'Shoe Blog | ShoeSwiper', 'Expert shoe guides, fashion tips, styling advice, and footwear reviews for every occasion.'),
    ('workwear', 'Workwear & Boots Blog', 'Work boots, safety gear, and professional workwear reviews', '🥾', '#8B4513', 'Workwear & Boots Blog | ShoeSwiper', 'In-depth reviews of work boots, safety footwear, and professional workwear. Find the best gear for your job.'),
    ('music', 'Music & Artists Blog', 'Music fashion, artist style breakdowns, and culture', '🎵', '#9B59B6', 'Music & Artists Blog | ShoeSwiper', 'Explore the intersection of music and fashion. Artist style breakdowns, tour merch, and music culture.')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;

-- ===========================================
-- Blog Authors Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    social_twitter VARCHAR(100),
    social_instagram VARCHAR(100),
    social_linkedin VARCHAR(100),
    is_ai_generated BOOLEAN DEFAULT false,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default AI authors
INSERT INTO blog_authors (name, slug, bio, is_ai_generated, avatar_url) VALUES
    ('ShoeSwiper Team', 'shoeswiper-team', 'The official ShoeSwiper editorial team bringing you the latest in footwear news and reviews.', true, 'https://shoeswiper.com/avatars/team.png'),
    ('Alex Kicks', 'alex-kicks', 'Sneaker enthusiast and streetwear expert with over 10 years of experience in the sneaker industry.', true, 'https://shoeswiper.com/avatars/alex.png'),
    ('Jordan Style', 'jordan-style', 'Fashion editor specializing in footwear trends and style guides.', true, 'https://shoeswiper.com/avatars/jordan.png'),
    ('Max Builder', 'max-builder', 'Construction industry veteran reviewing work boots and safety footwear.', true, 'https://shoeswiper.com/avatars/max.png'),
    ('Melody Threads', 'melody-threads', 'Music journalist covering artist fashion and tour style.', true, 'https://shoeswiper.com/avatars/melody.png')
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- Blog Posts Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES blog_authors(id) ON DELETE SET NULL,
    
    -- Content
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    
    -- Media
    featured_image TEXT,
    featured_image_alt VARCHAR(255),
    featured_image_caption TEXT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    keywords TEXT[], -- Array of keywords
    canonical_url TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    
    -- AI Generation metadata
    is_ai_generated BOOLEAN DEFAULT false,
    ai_model VARCHAR(100),
    ai_prompt_id VARCHAR(100),
    generation_metadata JSONB,
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint on category + slug
    CONSTRAINT unique_category_slug UNIQUE (category_id, slug)
);

-- Create indexes for blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_published ON blog_posts(category_id, published_at DESC) WHERE status = 'published';

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

-- ===========================================
-- Blog Tags Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on tag slug
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- ===========================================
-- Post Tags Junction Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_post_tags (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- ===========================================
-- Affiliate Products Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_affiliate_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asin VARCHAR(20) UNIQUE,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Pricing
    current_price DECIMAL(10, 2),
    original_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Amazon data
    affiliate_link TEXT,
    rating DECIMAL(2, 1),
    review_count INTEGER,
    
    -- Tracking
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    
    -- Status
    is_available BOOLEAN DEFAULT true,
    last_price_check TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for affiliate products
CREATE INDEX IF NOT EXISTS idx_affiliate_products_asin ON blog_affiliate_products(asin);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_available ON blog_affiliate_products(is_available) WHERE is_available = true;

-- ===========================================
-- Post Products Junction Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_post_products (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES blog_affiliate_products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    context_text TEXT, -- Optional text explaining why this product is relevant
    PRIMARY KEY (post_id, product_id)
);

-- ===========================================
-- Affiliate Clicks Tracking Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES blog_affiliate_products(id) ON DELETE SET NULL,
    post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
    
    -- Session info
    session_id VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Click context
    source VARCHAR(50), -- 'blog', 'app', 'email'
    referrer TEXT,
    user_agent TEXT,
    ip_hash VARCHAR(64), -- Hashed IP for privacy
    
    -- Location (optional, derived from IP)
    country VARCHAR(2),
    region VARCHAR(100),
    
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for click tracking
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON blog_affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_post ON blog_affiliate_clicks(post_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON blog_affiliate_clicks(clicked_at DESC);

-- ===========================================
-- Newsletter Subscribers Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    
    -- Subscription preferences
    categories TEXT[], -- Which blog categories they're subscribed to
    frequency VARCHAR(20) DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed', 'bounced')),
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    
    -- Source tracking
    source VARCHAR(50), -- 'blog', 'app', 'landing_page'
    referrer TEXT,
    
    -- Email metrics
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON blog_newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON blog_newsletter_subscribers(status) WHERE status = 'confirmed';

-- ===========================================
-- Blog Comments Table (optional, for future use)
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    
    author_name VARCHAR(100),
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
    is_featured BOOLEAN DEFAULT false,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON blog_comments(parent_id);

-- ===========================================
-- View Count Tracking (for deduplication)
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_post_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_hash VARCHAR(64),
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for view tracking
CREATE INDEX IF NOT EXISTS idx_post_views_post ON blog_post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_date ON blog_post_views(viewed_at DESC);

-- Unique constraint to prevent duplicate views from same session
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_unique ON blog_post_views(post_id, session_id) WHERE session_id IS NOT NULL;

-- ===========================================
-- AI Generation Queue Table
-- ===========================================
CREATE TABLE IF NOT EXISTS blog_generation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    
    -- Generation parameters
    topic VARCHAR(500),
    keywords TEXT[],
    tone VARCHAR(50), -- 'informative', 'casual', 'professional', 'entertaining'
    target_length INTEGER, -- Target word count
    
    -- Status
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    priority INTEGER DEFAULT 0, -- Higher = more urgent
    
    -- Results
    generated_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
    error_message TEXT,
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for generation queue
CREATE INDEX IF NOT EXISTS idx_generation_queue_status ON blog_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_generation_queue_scheduled ON blog_generation_queue(scheduled_for) WHERE status = 'queued';

-- ===========================================
-- Functions & Triggers
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_authors_updated_at ON blog_authors;
CREATE TRIGGER update_blog_authors_updated_at
    BEFORE UPDATE ON blog_authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_products_updated_at ON blog_affiliate_products;
CREATE TRIGGER update_affiliate_products_updated_at
    BEFORE UPDATE ON blog_affiliate_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update category post count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
        UPDATE blog_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
        UPDATE blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_category_count ON blog_posts;
CREATE TRIGGER update_category_count
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Function to update author post count
CREATE OR REPLACE FUNCTION update_author_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.author_id IS NOT NULL THEN
        UPDATE blog_authors SET post_count = post_count + 1 WHERE id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' AND OLD.author_id IS NOT NULL THEN
        UPDATE blog_authors SET post_count = post_count - 1 WHERE id = OLD.author_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.author_id IS DISTINCT FROM NEW.author_id THEN
        IF OLD.author_id IS NOT NULL THEN
            UPDATE blog_authors SET post_count = post_count - 1 WHERE id = OLD.author_id;
        END IF;
        IF NEW.author_id IS NOT NULL THEN
            UPDATE blog_authors SET post_count = post_count + 1 WHERE id = NEW.author_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_author_count ON blog_posts;
CREATE TRIGGER update_author_count
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_author_post_count();

-- Function to update tag post count
CREATE OR REPLACE FUNCTION update_tag_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_tags SET post_count = post_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tag_count ON blog_post_tags;
CREATE TRIGGER update_tag_count
    AFTER INSERT OR DELETE ON blog_post_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_post_count();

-- Function to increment affiliate click count
CREATE OR REPLACE FUNCTION increment_affiliate_click()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE blog_affiliate_products SET click_count = click_count + 1 WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS increment_click_count ON blog_affiliate_clicks;
CREATE TRIGGER increment_click_count
    AFTER INSERT ON blog_affiliate_clicks
    FOR EACH ROW EXECUTE FUNCTION increment_affiliate_click();

-- Function to increment post view count
CREATE OR REPLACE FUNCTION increment_post_view()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE blog_posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS increment_view_count ON blog_post_views;
CREATE TRIGGER increment_view_count
    AFTER INSERT ON blog_post_views
    FOR EACH ROW EXECUTE FUNCTION increment_post_view();

-- ===========================================
-- Row Level Security Policies
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_generation_queue ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public read access for categories" ON blog_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for authors" ON blog_authors
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for published posts" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public read access for tags" ON blog_tags
    FOR SELECT USING (true);

CREATE POLICY "Public read access for post tags" ON blog_post_tags
    FOR SELECT USING (true);

CREATE POLICY "Public read access for products" ON blog_affiliate_products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Public read access for post products" ON blog_post_products
    FOR SELECT USING (true);

CREATE POLICY "Public read access for approved comments" ON blog_comments
    FOR SELECT USING (status = 'approved');

-- Insert policies for tracking
CREATE POLICY "Anyone can log affiliate clicks" ON blog_affiliate_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can log post views" ON blog_post_views
    FOR INSERT WITH CHECK (true);

-- Newsletter subscription
CREATE POLICY "Anyone can subscribe to newsletter" ON blog_newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Authenticated user comment creation
CREATE POLICY "Authenticated users can create comments" ON blog_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ===========================================
-- Helpful Views
-- ===========================================

-- View for published posts with category and author info
CREATE OR REPLACE VIEW v_published_posts AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.content,
    p.featured_image,
    p.featured_image_alt,
    p.meta_title,
    p.meta_description,
    p.keywords,
    p.published_at,
    p.view_count,
    p.share_count,
    p.comment_count,
    c.slug as category_slug,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    a.name as author_name,
    a.slug as author_slug,
    a.avatar_url as author_avatar,
    a.bio as author_bio
FROM blog_posts p
LEFT JOIN blog_categories c ON p.category_id = c.id
LEFT JOIN blog_authors a ON p.author_id = a.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC;

-- View for affiliate performance
CREATE OR REPLACE VIEW v_affiliate_performance AS
SELECT 
    p.id,
    p.asin,
    p.name,
    p.image_url,
    p.current_price,
    p.click_count,
    p.conversion_count,
    p.revenue_generated,
    CASE WHEN p.click_count > 0 
         THEN ROUND((p.conversion_count::decimal / p.click_count) * 100, 2) 
         ELSE 0 
    END as conversion_rate,
    COUNT(DISTINCT bp.post_id) as posts_featured_in
FROM blog_affiliate_products p
LEFT JOIN blog_post_products bp ON p.id = bp.product_id
GROUP BY p.id
ORDER BY p.click_count DESC;

-- View for category stats
CREATE OR REPLACE VIEW v_category_stats AS
SELECT 
    c.id,
    c.slug,
    c.name,
    c.icon,
    c.color,
    c.post_count,
    COALESCE(SUM(p.view_count), 0) as total_views,
    COALESCE(MAX(p.published_at), c.created_at) as last_post_at
FROM blog_categories c
LEFT JOIN blog_posts p ON c.id = p.category_id AND p.status = 'published'
WHERE c.is_active = true
GROUP BY c.id
ORDER BY c.post_count DESC;

-- Grant access to views
GRANT SELECT ON v_published_posts TO anon, authenticated;
GRANT SELECT ON v_affiliate_performance TO authenticated;
GRANT SELECT ON v_category_stats TO anon, authenticated;

-- ===========================================
-- Sample Data (Optional - for testing)
-- ===========================================

-- Uncomment to add sample data
/*
INSERT INTO blog_posts (category_id, author_id, title, slug, excerpt, content, status, published_at, is_ai_generated)
SELECT 
    c.id,
    a.id,
    'Welcome to the ' || c.name,
    'welcome-to-' || c.slug,
    'Discover the latest trends and reviews in ' || LOWER(c.name) || '.',
    '<p>Welcome to our ' || c.name || '! Here you''ll find expert reviews, buying guides, and the latest news.</p><h2>What to Expect</h2><p>We publish new content regularly, covering everything from new releases to in-depth reviews.</p>',
    'published',
    NOW(),
    true
FROM blog_categories c
CROSS JOIN (SELECT id FROM blog_authors WHERE slug = 'shoeswiper-team' LIMIT 1) a;
*/

COMMENT ON TABLE blog_posts IS 'Main blog posts table for all 4 ShoeSwiper blogs';
COMMENT ON TABLE blog_categories IS 'Blog categories: sneaker, shoes, workwear, music';
COMMENT ON TABLE blog_affiliate_products IS 'Amazon affiliate products linked from blog posts';
COMMENT ON TABLE blog_affiliate_clicks IS 'Tracking table for affiliate link clicks';
