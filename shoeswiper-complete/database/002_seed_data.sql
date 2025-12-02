-- ============================================
-- SHOESWIPER SEED DATA
-- Run AFTER 001_schema.sql
-- ============================================

-- Insert Brands
INSERT INTO brands (name, slug) VALUES 
('Nike', 'nike'),
('Adidas', 'adidas'),
('Jordan', 'jordan'),
('New Balance', 'new-balance'),
('ASICS', 'asics'),
('Puma', 'puma'),
('Converse', 'converse'),
('Vans', 'vans'),
('HOKA', 'hoka'),
('Salomon', 'salomon')
ON CONFLICT (slug) DO NOTHING;

-- Insert Categories
INSERT INTO categories (name, slug, icon) VALUES
('Running', 'running', '🏃'),
('Basketball', 'basketball', '🏀'),
('Lifestyle', 'lifestyle', '👟'),
('Skateboarding', 'skateboarding', '🛹'),
('Training', 'training', '💪'),
('Outdoor', 'outdoor', '🏔️')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED SHOES (All with affiliate tag shoeswiper-20)
-- ============================================

INSERT INTO shoes (name, brand, price, image_url, amazon_url, style_tags, color_tags, gender, is_featured, vibe_score) VALUES
-- Jordan
('Air Jordan 1 Retro High OG Chicago', 'Jordan', 180.00, 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800', 'https://amazon.com/dp/B01M0327J8?tag=shoeswiper-20', ARRAY['streetwear', 'retro', 'hype', 'basketball'], ARRAY['red', 'white', 'black'], 'men', true, 95),
('Air Jordan 4 Retro Military Black', 'Jordan', 210.00, 'https://images.unsplash.com/photo-1584735175315-9d5df23be652?w=800', 'https://amazon.com/dp/B09T12345?tag=shoeswiper-20', ARRAY['streetwear', 'bulky', 'hype'], ARRAY['white', 'black', 'grey'], 'men', true, 92),
('Air Jordan 3 Retro White Cement', 'Jordan', 200.00, 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800', 'https://amazon.com/dp/B02345678?tag=shoeswiper-20', ARRAY['basketball', 'retro', 'hype'], ARRAY['white', 'grey', 'red'], 'men', true, 90),
('Air Jordan 11 Retro Cool Grey', 'Jordan', 225.00, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800', 'https://amazon.com/dp/B03456789?tag=shoeswiper-20', ARRAY['basketball', 'formal', 'hype'], ARRAY['grey', 'white'], 'men', true, 93),
('Air Jordan 1 Low', 'Jordan', 110.00, 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800', 'https://amazon.com/dp/B04567890?tag=shoeswiper-20', ARRAY['casual', 'streetwear', 'essential'], ARRAY['various'], 'unisex', false, 78),

-- Nike
('Nike Dunk Low Panda', 'Nike', 110.00, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800', 'https://amazon.com/dp/B09556789?tag=shoeswiper-20', ARRAY['casual', 'streetwear', 'essential'], ARRAY['black', 'white'], 'unisex', true, 88),
('Nike Air Force 1 07', 'Nike', 110.00, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', 'https://amazon.com/dp/B00012345?tag=shoeswiper-20', ARRAY['classic', 'essential', 'casual'], ARRAY['white'], 'unisex', false, 85),
('Nike Air Max 90', 'Nike', 130.00, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800', 'https://amazon.com/dp/B08123456?tag=shoeswiper-20', ARRAY['retro', 'running', 'casual'], ARRAY['grey', 'black'], 'men', false, 82),
('Nike Blazer Mid 77', 'Nike', 105.00, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', 'https://amazon.com/dp/B08X12345?tag=shoeswiper-20', ARRAY['retro', 'casual', 'vintage'], ARRAY['white', 'black'], 'unisex', false, 80),
('Nike Air Max 97 Silver Bullet', 'Nike', 175.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 'https://amazon.com/dp/B07123456?tag=shoeswiper-20', ARRAY['retro', 'metallic', 'streetwear'], ARRAY['silver'], 'men', true, 87),
('Nike Cortez', 'Nike', 90.00, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800', 'https://amazon.com/dp/B01234567?tag=shoeswiper-20', ARRAY['retro', 'classic', 'casual'], ARRAY['white', 'red', 'blue'], 'unisex', false, 75),

-- Adidas
('Adidas Samba OG', 'Adidas', 100.00, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', 'https://amazon.com/dp/B00078901?tag=shoeswiper-20', ARRAY['vintage', 'casual', 'streetwear'], ARRAY['white', 'black', 'gum'], 'unisex', true, 89),
('Adidas Yeezy Boost 350 V2 Bone', 'Adidas', 230.00, 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800', 'https://amazon.com/dp/B09234567?tag=shoeswiper-20', ARRAY['hype', 'modern', 'comfort'], ARRAY['white', 'cream'], 'unisex', true, 94),
('Adidas Forum Low', 'Adidas', 90.00, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800', 'https://amazon.com/dp/B08234567?tag=shoeswiper-20', ARRAY['retro', 'skate', 'casual'], ARRAY['blue', 'white'], 'men', false, 77),
('Adidas Ultraboost Light', 'Adidas', 190.00, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800', 'https://amazon.com/dp/B0B234567?tag=shoeswiper-20', ARRAY['running', 'athletic', 'comfort'], ARRAY['black'], 'women', false, 84),
('Adidas Gazelle Bold Platform', 'Adidas', 120.00, 'https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=800', 'https://amazon.com/dp/B0C123456?tag=shoeswiper-20', ARRAY['platform', 'vintage', 'streetwear'], ARRAY['pink', 'white'], 'women', true, 86),

-- New Balance
('New Balance 550 Green', 'New Balance', 110.00, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800', 'https://amazon.com/dp/B09345678?tag=shoeswiper-20', ARRAY['retro', 'casual', 'streetwear'], ARRAY['white', 'green'], 'men', true, 88),
('New Balance 9060', 'New Balance', 150.00, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800', 'https://amazon.com/dp/B0B345678?tag=shoeswiper-20', ARRAY['chunky', 'futuristic', 'streetwear'], ARRAY['grey', 'cream'], 'unisex', true, 91),
('New Balance 2002R Protection Pack', 'New Balance', 160.00, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800', 'https://amazon.com/dp/B09456789?tag=shoeswiper-20', ARRAY['deconstructed', 'streetwear', 'hype'], ARRAY['grey'], 'unisex', false, 85),
('New Balance 530', 'New Balance', 100.00, 'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800', 'https://amazon.com/dp/B08456789?tag=shoeswiper-20', ARRAY['retro', 'running', 'casual'], ARRAY['white', 'silver'], 'women', false, 79),

-- Gorpcore / Running
('Salomon XT-6', 'Salomon', 190.00, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800', 'https://amazon.com/dp/B08567890?tag=shoeswiper-20', ARRAY['gorpcore', 'outdoor', 'techwear'], ARRAY['black', 'multi'], 'unisex', true, 90),
('HOKA Clifton 9', 'HOKA', 145.00, 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800', 'https://amazon.com/dp/B0B567890?tag=shoeswiper-20', ARRAY['running', 'comfort', 'athletic'], ARRAY['blue', 'orange'], 'men', false, 83),
('ASICS Gel-Kayano 14', 'ASICS', 150.00, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800', 'https://amazon.com/dp/B09567890?tag=shoeswiper-20', ARRAY['retro', 'runner', 'metallic'], ARRAY['silver', 'cream'], 'women', true, 87),

-- Classics
('Vans Old Skool', 'Vans', 70.00, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800', 'https://amazon.com/dp/B00067890?tag=shoeswiper-20', ARRAY['skate', 'classic', 'punk'], ARRAY['black', 'white'], 'unisex', false, 76),
('Converse Chuck 70 High', 'Converse', 85.00, 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800', 'https://amazon.com/dp/B00078901?tag=shoeswiper-20', ARRAY['classic', 'vintage', 'casual'], ARRAY['parchment'], 'unisex', false, 78),

-- Puma
('Puma Suede Classic', 'Puma', 75.00, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', 'https://amazon.com/dp/B05678901?tag=shoeswiper-20', ARRAY['retro', 'casual', 'streetwear'], ARRAY['black', 'white'], 'unisex', false, 74),
('Puma RS-X', 'Puma', 110.00, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800', 'https://amazon.com/dp/B06789012?tag=shoeswiper-20', ARRAY['chunky', 'techwear', 'streetwear'], ARRAY['multi'], 'unisex', false, 77),

-- Kids
('Nike Air Force 1 Kids', 'Nike', 85.00, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', 'https://amazon.com/dp/B09K12345?tag=shoeswiper-20', ARRAY['classic', 'essential'], ARRAY['white'], 'kids', false, 80),
('Adidas Stan Smith Kids', 'Adidas', 65.00, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800', 'https://amazon.com/dp/B08K12345?tag=shoeswiper-20', ARRAY['classic', 'minimalist'], ARRAY['white', 'green'], 'kids', false, 78),
('Converse Chuck Taylor Kids', 'Converse', 45.00, 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800', 'https://amazon.com/dp/B07K12345?tag=shoeswiper-20', ARRAY['classic', 'casual'], ARRAY['red'], 'kids', false, 75);

-- Randomize engagement metrics for realism
UPDATE shoes SET 
  view_count = floor(random() * 5000 + 100)::int,
  favorite_count = floor(random() * 500 + 20)::int,
  click_count = floor(random() * 1000 + 50)::int
WHERE view_count = 0;
