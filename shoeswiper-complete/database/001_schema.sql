-- ============================================
-- SHOESWIPER DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- 2. BRANDS TABLE
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SHOES TABLE (Main Catalog)
CREATE TABLE IF NOT EXISTS shoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category_slug TEXT,
    
    -- Pricing
    price NUMERIC(10, 2) NOT NULL,
    retail_price NUMERIC(10, 2),
    sale_price NUMERIC(10, 2),
    currency TEXT DEFAULT 'USD',
    
    -- Media & Affiliate
    image_url TEXT NOT NULL,
    amazon_url TEXT NOT NULL, -- MUST include ?tag=shoeswiper-20
    amazon_asin TEXT,
    
    -- Attributes
    style_tags TEXT[] DEFAULT '{}',
    color_tags TEXT[] DEFAULT '{}',
    gender TEXT CHECK (gender IN ('men', 'women', 'unisex', 'kids')),
    sizes_available TEXT[] DEFAULT '{}',
    release_date DATE,
    description TEXT,
    
    -- Metrics
    favorite_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    vibe_score INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    stock_status TEXT DEFAULT 'in_stock',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, shoe_id)
);

-- 7. USER SNEAKERS (Closet)
CREATE TABLE IF NOT EXISTS user_sneakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, shoe_id)
);

-- 8. PRICE HISTORY
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. AFFILIATE CLICKS
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. AUDIT LOGS (Admin)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NFT TABLES
-- ============================================

-- 11. NFTs TABLE
CREATE TABLE IF NOT EXISTS nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sneaker_id UUID REFERENCES shoes(id),
    owner_id UUID REFERENCES auth.users(id),
    token_id TEXT UNIQUE,
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'legendary', 'grail')),
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    for_sale BOOLEAN DEFAULT false,
    price_eth DECIMAL(18, 8),
    auction_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. NFT OWNERSHIP HISTORY
CREATE TABLE IF NOT EXISTS nft_ownership_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
    from_user UUID REFERENCES auth.users(id),
    to_user UUID REFERENCES auth.users(id),
    price_eth DECIMAL(18, 8),
    transferred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Full Text Search
CREATE INDEX IF NOT EXISTS idx_shoes_search ON shoes USING GIN (to_tsvector('english', name || ' ' || brand || ' ' || COALESCE(description, '')));

-- Array Indexes
CREATE INDEX IF NOT EXISTS idx_shoes_style_tags ON shoes USING GIN (style_tags);
CREATE INDEX IF NOT EXISTS idx_shoes_color_tags ON shoes USING GIN (color_tags);

-- Sorting/Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_shoes_price ON shoes (price);
CREATE INDEX IF NOT EXISTS idx_shoes_created_at ON shoes (created_at);
CREATE INDEX IF NOT EXISTS idx_shoes_popularity ON shoes (view_count DESC, click_count DESC);
CREATE INDEX IF NOT EXISTS idx_shoes_brand ON shoes (brand);
CREATE INDEX IF NOT EXISTS idx_shoes_featured ON shoes (is_featured) WHERE is_featured = true;

-- User Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sneakers_user ON user_sneakers (user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON affiliate_clicks (clicked_at);

-- NFT Indexes
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts (owner_id);
CREATE INDEX IF NOT EXISTS idx_nfts_sneaker ON nfts (sneaker_id);
CREATE INDEX IF NOT EXISTS idx_nfts_for_sale ON nfts (for_sale) WHERE for_sale = true;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Admin Check Function
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'email' = 'dadsellsgadgets@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic View Counter
CREATE OR REPLACE FUNCTION increment_shoe_view(shoe_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE shoes SET view_count = view_count + 1 WHERE id = shoe_id;
END;
$$ LANGUAGE plpgsql;

-- Atomic Click Counter
CREATE OR REPLACE FUNCTION increment_shoe_click(shoe_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE shoes SET click_count = click_count + 1 WHERE id = shoe_id;
END;
$$ LANGUAGE plpgsql;

-- Style Matching Function (for AI Outfit Match)
CREATE OR REPLACE FUNCTION match_shoes_for_outfit(
  p_style_tags TEXT[],
  p_color_tags TEXT[],
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
  match_score INTEGER
) AS $$
BEGIN
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
      COALESCE(array_length(ARRAY(SELECT unnest(s.style_tags) INTERSECT SELECT unnest(p_style_tags)), 1), 0) * 30 +
      COALESCE(array_length(ARRAY(SELECT unnest(s.color_tags) INTERSECT SELECT unnest(p_color_tags)), 1), 0) * 20 +
      LEAST(s.favorite_count, 10)
    )::INTEGER as match_score
  FROM shoes s
  WHERE s.is_active = true
    AND (s.style_tags && p_style_tags OR s.color_tags && p_color_tags)
  ORDER BY match_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sneakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_ownership_history ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- SHOES
CREATE POLICY "Public can view active shoes" ON shoes FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can insert shoes" ON shoes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update shoes" ON shoes FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete shoes" ON shoes FOR DELETE USING (is_admin());

-- BRANDS
CREATE POLICY "Public can view brands" ON brands FOR SELECT USING (true);

-- FAVORITES
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- USER SNEAKERS
CREATE POLICY "Users can view own closet" ON user_sneakers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to closet" ON user_sneakers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from closet" ON user_sneakers FOR DELETE USING (auth.uid() = user_id);

-- AFFILIATE CLICKS
CREATE POLICY "Anyone can insert clicks" ON affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view clicks" ON affiliate_clicks FOR SELECT USING (is_admin());

-- AUDIT LOGS
CREATE POLICY "Admin can view logs" ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "Admin can insert logs" ON audit_logs FOR INSERT WITH CHECK (is_admin());

-- NFTs
CREATE POLICY "Public can view NFTs" ON nfts FOR SELECT USING (true);
CREATE POLICY "Users can mint NFTs" ON nfts FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update NFTs" ON nfts FOR UPDATE USING (auth.uid() = owner_id);

-- NFT OWNERSHIP HISTORY
CREATE POLICY "Public can view history" ON nft_ownership_history FOR SELECT USING (true);
CREATE POLICY "Insert history on transfer" ON nft_ownership_history FOR INSERT WITH CHECK (true);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
