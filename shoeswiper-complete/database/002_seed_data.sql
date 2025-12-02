-- ============================================
-- SHOESWIPER SEED DATA
-- Amazon Affiliate Tag: shoeswiper-20
-- Generated: 2025-12-02
-- Run AFTER 001_schema.sql
-- ============================================

-- ============================================
-- BRANDS
-- ============================================
INSERT INTO brands (name, slug, description) VALUES
('Nike', 'nike', 'Just Do It. World''s leading athletic footwear brand.'),
('Adidas', 'adidas', 'Impossible is Nothing. German sportswear giant.'),
('New Balance', 'new-balance', 'Fearlessly Independent Since 1906.'),
('Converse', 'converse', 'Shoes are boring. Wear sneakers.'),
('Vans', 'vans', 'Off The Wall. Skateboarding culture icon.'),
('Puma', 'puma', 'Forever Faster. German athletic brand.'),
('Reebok', 'reebok', 'Be More Human. Classic fitness footwear.'),
('ASICS', 'asics', 'Sound Mind, Sound Body. Japanese performance brand.'),
('Jordan', 'jordan', 'Become Legendary. Nike subsidiary basketball brand.'),
('Yeezy', 'yeezy', 'Adidas Yeezy. Premium designer collaboration.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, icon) VALUES
('Lifestyle', 'lifestyle', '👟'),
('Running', 'running', '🏃'),
('Basketball', 'basketball', '🏀'),
('Skateboarding', 'skateboarding', '🛹'),
('Training', 'training', '💪'),
('Casual', 'casual', '😎')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SHOES (50+ items with Amazon Affiliate Links)
-- All URLs include ?tag=shoeswiper-20
-- ============================================

-- ============================================
-- NIKE (15+ items)
-- ============================================

INSERT INTO shoes (name, brand, category_slug, price, retail_price, image_url, amazon_url, style_tags, color_tags, gender, sizes_available, description, is_active, is_featured, favorite_count, view_count, vibe_score) VALUES
-- Air Force 1 Collection
('Air Force 1 ''07 Low White', 'Nike', 'lifestyle', 115.00, 115.00, 
 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
 'https://www.amazon.com/dp/B07RZ6HKBS?tag=shoeswiper-20',
 ARRAY['classic', 'streetwear', 'casual', 'clean', 'timeless'],
 ARRAY['white'],
 'unisex',
 ARRAY['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
 'The radiance lives on in the Nike Air Force 1 ''07. Crisp leather, bold colors and the perfect amount of flash make this icon a daily go-to.',
 true, true, 487, 892, 95),

('Air Force 1 ''07 Low Black', 'Nike', 'lifestyle', 115.00, 115.00,
 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
 'https://www.amazon.com/s?k=Nike+Air+Force+1+Black&tag=shoeswiper-20',
 ARRAY['classic', 'streetwear', 'casual', 'clean', 'timeless'],
 ARRAY['black'],
 'unisex',
 ARRAY['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
 'The iconic Air Force 1 in all-black leather. A streetwear essential that pairs with everything.',
 true, false, 324, 678, 90),

-- Air Max Collection
('Air Max 90 White', 'Nike', 'lifestyle', 130.00, 130.00,
 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
 'https://www.amazon.com/s?k=Nike+Air+Max+90+White&tag=shoeswiper-20',
 ARRAY['retro', 'casual', 'classic', 'athletic'],
 ARRAY['white'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12'],
 'Nothing as iconic as an icon. The Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU details.',
 true, false, 256, 534, 85),

('Air Max 90 Black/White', 'Nike', 'lifestyle', 130.00, 130.00,
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
 'https://www.amazon.com/s?k=Nike+Air+Max+90+Black+White&tag=shoeswiper-20',
 ARRAY['retro', 'casual', 'classic', 'athletic'],
 ARRAY['black', 'white'],
 'men',
 ARRAY['7', '8', '9', '10', '11', '12', '13'],
 'The Air Max 90 in classic black and white. Visible Air cushioning and bold colorway.',
 true, false, 298, 612, 87),

('Air Max 97 Silver Bullet', 'Nike', 'lifestyle', 175.00, 175.00,
 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
 'https://www.amazon.com/s?k=Nike+Air+Max+97+Silver+Bullet&tag=shoeswiper-20',
 ARRAY['retro', 'metallic', 'streetwear', 'bold', 'hypebeast'],
 ARRAY['silver', 'metallic'],
 'men',
 ARRAY['8', '9', '10', '11', '12'],
 'The full-length Air unit and reflective design made the Air Max 97 an instant icon. The Silver Bullet colorway is legendary.',
 true, true, 412, 834, 92),

-- Dunk Collection
('Dunk Low Retro Panda', 'Nike', 'lifestyle', 110.00, 110.00,
 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
 'https://www.amazon.com/dp/B08SBR2P7L?tag=shoeswiper-20',
 ARRAY['streetwear', 'casual', 'clean', 'hypebeast', 'trendy'],
 ARRAY['black', 'white'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'Created for the hardwood but taken to the streets, the ''80s basketball icon returns with classic details and throwback hoops flair.',
 true, true, 534, 987, 96),

('Dunk Low Grey Fog', 'Nike', 'lifestyle', 110.00, 110.00,
 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
 'https://www.amazon.com/s?k=Nike+Dunk+Low+Grey+Fog&tag=shoeswiper-20',
 ARRAY['streetwear', 'casual', 'clean', 'minimalist'],
 ARRAY['grey', 'white'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11'],
 'The Dunk Low Grey Fog features a clean white and grey leather upper. Subtle and versatile.',
 true, false, 287, 543, 84),

('Dunk Low Retro University Blue', 'Nike', 'lifestyle', 110.00, 110.00,
 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
 'https://www.amazon.com/s?k=Nike+Dunk+Low+University+Blue&tag=shoeswiper-20',
 ARRAY['streetwear', 'casual', 'bold', 'trendy'],
 ARRAY['blue', 'white'],
 'men',
 ARRAY['8', '9', '10', '11', '12'],
 'The Nike Dunk Low in UNC colors. A tribute to basketball heritage.',
 true, false, 312, 621, 88),

-- Jordan Collection (Nike subsidiary)
('Air Jordan 1 Low', 'Jordan', 'lifestyle', 110.00, 110.00,
 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
 'https://www.amazon.com/s?k=Air+Jordan+1+Low&tag=shoeswiper-20',
 ARRAY['streetwear', 'casual', 'classic', 'basketball'],
 ARRAY['various'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12'],
 'An icon for casual kicks. The Air Jordan 1 Low offers a clean, classic look that''s iconic in every colorway.',
 true, false, 356, 712, 86),

('Air Jordan 1 Mid', 'Jordan', 'lifestyle', 125.00, 125.00,
 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
 'https://www.amazon.com/s?k=Air+Jordan+1+Mid&tag=shoeswiper-20',
 ARRAY['streetwear', 'casual', 'classic', 'basketball'],
 ARRAY['various'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12', '13'],
 'The Air Jordan 1 Mid offers a fresh look that''s iconic. Premium leather and signature Wings logo.',
 true, false, 398, 789, 88),

('Air Jordan 1 Retro High OG', 'Jordan', 'basketball', 180.00, 180.00,
 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
 'https://www.amazon.com/s?k=Air+Jordan+1+Retro+High+OG&tag=shoeswiper-20',
 ARRAY['streetwear', 'hypebeast', 'classic', 'basketball', 'luxury'],
 ARRAY['various'],
 'men',
 ARRAY['8', '9', '10', '11', '12', '13'],
 'The Air Jordan 1 that started it all. Premium leather, Nike Air cushioning, and the legendary Wings logo.',
 true, true, 523, 978, 97),

('Air Jordan 4 Retro', 'Jordan', 'basketball', 210.00, 210.00,
 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
 'https://www.amazon.com/s?k=Air+Jordan+4+Retro&tag=shoeswiper-20',
 ARRAY['streetwear', 'hypebeast', 'retro', 'basketball', 'chunky'],
 ARRAY['various'],
 'men',
 ARRAY['8', '9', '10', '11', '12', '13'],
 'The AJ4 changed the game with visible Air, supportive wings and bold design. A true sneaker grail.',
 true, true, 456, 876, 94),

-- Other Nike Models
('Blazer Mid ''77 Vintage', 'Nike', 'lifestyle', 105.00, 105.00,
 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
 'https://www.amazon.com/s?k=Nike+Blazer+Mid+77+Vintage&tag=shoeswiper-20',
 ARRAY['retro', 'vintage', 'casual', 'classic', 'clean'],
 ARRAY['white', 'black'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'In the ''70s, Nike was the new shoe on the block. So new that they were still experimenting with game-changing designs.',
 true, false, 234, 467, 82),

('Cortez Basic', 'Nike', 'lifestyle', 90.00, 90.00,
 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
 'https://www.amazon.com/s?k=Nike+Cortez&tag=shoeswiper-20',
 ARRAY['retro', 'classic', 'casual', 'vintage', 'minimalist'],
 ARRAY['white', 'red', 'blue'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11'],
 'Nike''s first track shoe, the Nike Cortez is a legend. Clean lines and lightweight design.',
 true, false, 189, 345, 78),

('Vomero 5', 'Nike', 'running', 160.00, 160.00,
 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
 'https://www.amazon.com/s?k=Nike+Vomero+5&tag=shoeswiper-20',
 ARRAY['chunky', 'techwear', 'retro', 'trendy', 'athletic'],
 ARRAY['grey', 'silver'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12'],
 'The Vomero 5 is back. With its chunky shape and layered look, it brings back early 2000s vibes.',
 true, false, 267, 534, 86),

-- ============================================
-- ADIDAS (10+ items)
-- ============================================

('Samba OG White', 'Adidas', 'lifestyle', 100.00, 100.00,
 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
 'https://www.amazon.com/s?k=Adidas+Samba+OG+White&tag=shoeswiper-20',
 ARRAY['vintage', 'casual', 'streetwear', 'classic', 'timeless'],
 ARRAY['white', 'gum'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The Samba is a timeless classic. Originally designed for soccer, now a lifestyle icon with the iconic T-toe and gum sole.',
 true, true, 498, 934, 95),

('Samba OG Black', 'Adidas', 'lifestyle', 100.00, 100.00,
 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800',
 'https://www.amazon.com/s?k=Adidas+Samba+OG+Black&tag=shoeswiper-20',
 ARRAY['vintage', 'casual', 'streetwear', 'classic', 'timeless'],
 ARRAY['black', 'gum'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The Samba in classic black leather. The perfect everyday sneaker with iconic three stripes.',
 true, true, 467, 889, 94),

('Gazelle Indoor', 'Adidas', 'lifestyle', 120.00, 120.00,
 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
 'https://www.amazon.com/s?k=Adidas+Gazelle+Indoor&tag=shoeswiper-20',
 ARRAY['vintage', 'casual', 'streetwear', 'retro', 'trendy'],
 ARRAY['various'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11'],
 'The Gazelle Indoor brings ''70s handball style to modern streets. Suede upper and gum sole.',
 true, false, 312, 623, 88),

('Stan Smith', 'Adidas', 'casual', 95.00, 95.00,
 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
 'https://www.amazon.com/s?k=Adidas+Stan+Smith&tag=shoeswiper-20',
 ARRAY['minimalist', 'clean', 'classic', 'casual', 'timeless'],
 ARRAY['white', 'green'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12'],
 'The Stan Smith is a tennis icon that has become a lifestyle staple. Clean white leather with signature green heel tab.',
 true, false, 378, 756, 87),

('Superstar', 'Adidas', 'lifestyle', 100.00, 100.00,
 'https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=800',
 'https://www.amazon.com/s?k=Adidas+Superstar&tag=shoeswiper-20',
 ARRAY['classic', 'streetwear', 'retro', 'hip-hop', 'timeless'],
 ARRAY['white', 'black'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12'],
 'Born on the basketball court. Iconic shell toe and premium leather make the Superstar a legend.',
 true, false, 345, 689, 85),

('Campus 00s', 'Adidas', 'lifestyle', 110.00, 110.00,
 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
 'https://www.amazon.com/s?k=Adidas+Campus+00s&tag=shoeswiper-20',
 ARRAY['retro', 'casual', 'streetwear', 'skate', 'trendy'],
 ARRAY['various'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11'],
 'The Campus returns with early 2000s styling. Suede upper and chunky proportions.',
 true, false, 287, 567, 84),

('Forum Low', 'Adidas', 'lifestyle', 110.00, 110.00,
 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
 'https://www.amazon.com/s?k=Adidas+Forum+Low&tag=shoeswiper-20',
 ARRAY['retro', 'basketball', 'casual', 'classic', 'clean'],
 ARRAY['white'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'Originally made for the basketball court in ''84. The Forum Low brings retro hoops style to the streets.',
 true, false, 256, 512, 82),

('Ultraboost 22', 'Adidas', 'running', 190.00, 190.00,
 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
 'https://www.amazon.com/s?k=Adidas+Ultraboost&tag=shoeswiper-20',
 ARRAY['running', 'athletic', 'comfort', 'modern', 'performance'],
 ARRAY['black'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12'],
 'Experience epic energy return with Boost cushioning. The Ultraboost delivers incredible comfort mile after mile.',
 true, false, 312, 634, 86),

('NMD_R1', 'Adidas', 'lifestyle', 150.00, 150.00,
 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
 'https://www.amazon.com/s?k=Adidas+NMD+R1&tag=shoeswiper-20',
 ARRAY['streetwear', 'modern', 'casual', 'comfort', 'trendy'],
 ARRAY['various'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12'],
 'The NMD_R1 combines Boost cushioning with modern streetwear design. Primeknit upper for ultimate comfort.',
 true, false, 234, 467, 83),

('Yeezy Boost 350 V2', 'Yeezy', 'lifestyle', 230.00, 230.00,
 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800',
 'https://www.amazon.com/s?k=Yeezy+Boost+350+V2&tag=shoeswiper-20',
 ARRAY['hypebeast', 'luxury', 'streetwear', 'modern', 'trendy'],
 ARRAY['various'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12'],
 'The iconic Yeezy Boost 350 V2 features Primeknit construction and full-length Boost cushioning.',
 true, true, 489, 978, 93),

-- ============================================
-- NEW BALANCE (8+ items)
-- ============================================

('550 White/Green', 'New Balance', 'lifestyle', 130.00, 130.00,
 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
 'https://www.amazon.com/s?k=New+Balance+550+White+Green&tag=shoeswiper-20',
 ARRAY['retro', 'casual', 'streetwear', 'clean', 'trendy'],
 ARRAY['white', 'green'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The New Balance 550 is a ''80s basketball classic reborn. Leather upper with iconic N logo.',
 true, true, 456, 912, 94),

('550 White/Navy', 'New Balance', 'lifestyle', 130.00, 130.00,
 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
 'https://www.amazon.com/s?k=New+Balance+550+White+Navy&tag=shoeswiper-20',
 ARRAY['retro', 'casual', 'streetwear', 'clean', 'classic'],
 ARRAY['white', 'navy'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The 550 in classic white and navy. Vintage basketball style for everyday wear.',
 true, false, 378, 756, 90),

('574 Classic', 'New Balance', 'lifestyle', 90.00, 90.00,
 'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800',
 'https://www.amazon.com/s?k=New+Balance+574&tag=shoeswiper-20',
 ARRAY['classic', 'casual', 'retro', 'comfort', 'timeless'],
 ARRAY['grey'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12'],
 'The New Balance 574 is a timeless classic. ENCAP midsole and suede/mesh upper.',
 true, false, 267, 534, 82),

('990v5 Grey', 'New Balance', 'lifestyle', 185.00, 185.00,
 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
 'https://www.amazon.com/s?k=New+Balance+990v5+Grey&tag=shoeswiper-20',
 ARRAY['premium', 'comfort', 'classic', 'dad-shoe', 'timeless'],
 ARRAY['grey'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12', '13'],
 'Made in USA. The 990v5 is the pinnacle of New Balance craftsmanship. Premium materials and ENCAP cushioning.',
 true, false, 312, 623, 88),

('990v6', 'New Balance', 'running', 200.00, 200.00,
 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
 'https://www.amazon.com/s?k=New+Balance+990v6&tag=shoeswiper-20',
 ARRAY['premium', 'comfort', 'running', 'dad-shoe', 'luxury'],
 ARRAY['grey'],
 'unisex',
 ARRAY['7', '8', '9', '10', '11', '12', '13'],
 'The latest in the legendary 990 series. Made in USA with FuelCell cushioning.',
 true, false, 287, 567, 89),

('2002R', 'New Balance', 'lifestyle', 150.00, 150.00,
 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
 'https://www.amazon.com/s?k=New+Balance+2002R&tag=shoeswiper-20',
 ARRAY['retro', 'chunky', 'streetwear', 'comfort', 'trendy'],
 ARRAY['grey', 'cream'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'Originally from 2010, the 2002R returns with premium suede and N-ERGY cushioning.',
 true, false, 298, 589, 86),

('530', 'New Balance', 'lifestyle', 100.00, 100.00,
 'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800',
 'https://www.amazon.com/s?k=New+Balance+530&tag=shoeswiper-20',
 ARRAY['retro', 'running', 'casual', 'chunky'],
 ARRAY['white', 'silver'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11'],
 'The 530 brings ''90s running style to modern streets. ABZORB cushioning and retro design.',
 true, false, 212, 423, 80),

('327', 'New Balance', 'lifestyle', 100.00, 100.00,
 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
 'https://www.amazon.com/s?k=New+Balance+327&tag=shoeswiper-20',
 ARRAY['retro', 'bold', 'casual', 'trendy'],
 ARRAY['various'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11'],
 'The 327 takes ''70s running heritage and flips it. Oversized N logo and wedge silhouette.',
 true, false, 234, 456, 81),

-- ============================================
-- CONVERSE (3+ items)
-- ============================================

('Chuck Taylor All Star High', 'Converse', 'casual', 65.00, 65.00,
 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
 'https://www.amazon.com/s?k=Converse+Chuck+Taylor+All+Star+High&tag=shoeswiper-20',
 ARRAY['classic', 'vintage', 'casual', 'punk', 'timeless'],
 ARRAY['black', 'white'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12', '13'],
 'The original basketball shoe, now a cultural icon. Canvas upper and rubber toe cap since 1917.',
 true, false, 345, 689, 84),

('Chuck Taylor All Star Low', 'Converse', 'casual', 60.00, 60.00,
 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
 'https://www.amazon.com/s?k=Converse+Chuck+Taylor+All+Star+Low&tag=shoeswiper-20',
 ARRAY['classic', 'vintage', 'casual', 'minimalist', 'timeless'],
 ARRAY['various'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12', '13'],
 'The low-top version of the classic Chuck. Versatile and timeless.',
 true, false, 312, 623, 82),

('Chuck 70 High', 'Converse', 'casual', 85.00, 85.00,
 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
 'https://www.amazon.com/s?k=Converse+Chuck+70&tag=shoeswiper-20',
 ARRAY['vintage', 'premium', 'casual', 'classic', 'retro'],
 ARRAY['parchment', 'black'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12'],
 'The Chuck 70 uses the original ''70s pattern for a premium vintage look. Higher rubber foxing and cushioned insole.',
 true, false, 278, 556, 85),

-- ============================================
-- VANS (3+ items)
-- ============================================

('Old Skool', 'Vans', 'skateboarding', 70.00, 70.00,
 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
 'https://www.amazon.com/s?k=Vans+Old+Skool&tag=shoeswiper-20',
 ARRAY['skate', 'classic', 'casual', 'punk', 'streetwear'],
 ARRAY['black', 'white'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12', '13'],
 'The Vans Old Skool, the first shoe to feature the iconic Vans Sidestripe. A skate legend since ''77.',
 true, false, 356, 712, 86),

('Sk8-Hi', 'Vans', 'skateboarding', 75.00, 75.00,
 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
 'https://www.amazon.com/s?k=Vans+Sk8+Hi&tag=shoeswiper-20',
 ARRAY['skate', 'classic', 'casual', 'punk', 'streetwear'],
 ARRAY['black', 'white'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12', '13'],
 'The Sk8-Hi is the legendary high top that has inspired skaters since 1978. Padded collar for support and style.',
 true, false, 298, 596, 84),

('Authentic', 'Vans', 'skateboarding', 55.00, 55.00,
 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
 'https://www.amazon.com/s?k=Vans+Authentic&tag=shoeswiper-20',
 ARRAY['skate', 'classic', 'casual', 'minimalist', 'simple'],
 ARRAY['various'],
 'unisex',
 ARRAY['5', '6', '7', '8', '9', '10', '11', '12'],
 'The original Vans shoe. Simple canvas upper and signature waffle outsole since 1966.',
 true, false, 234, 467, 79),

-- ============================================
-- PUMA (2+ items)
-- ============================================

('Suede Classic', 'Puma', 'lifestyle', 75.00, 75.00,
 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
 'https://www.amazon.com/s?k=Puma+Suede+Classic&tag=shoeswiper-20',
 ARRAY['retro', 'casual', 'streetwear', 'classic', 'hip-hop'],
 ARRAY['black', 'white'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The Puma Suede has been a streetwear staple since 1968. Iconic formstrip and soft suede upper.',
 true, false, 267, 534, 82),

('Palermo', 'Puma', 'lifestyle', 90.00, 90.00,
 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
 'https://www.amazon.com/s?k=Puma+Palermo&tag=shoeswiper-20',
 ARRAY['retro', 'casual', 'vintage', 'trendy'],
 ARRAY['various'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11'],
 'The Palermo returns from the ''80s terrace scene. Suede upper and gum rubber outsole.',
 true, false, 198, 396, 78),

-- ============================================
-- REEBOK (2+ items)
-- ============================================

('Club C 85', 'Reebok', 'lifestyle', 80.00, 80.00,
 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
 'https://www.amazon.com/s?k=Reebok+Club+C+85&tag=shoeswiper-20',
 ARRAY['classic', 'casual', 'clean', 'minimalist', 'retro'],
 ARRAY['white', 'green'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'A tennis court classic from 1985. Soft leather upper and timeless design.',
 true, false, 287, 567, 83),

('Classic Leather', 'Reebok', 'lifestyle', 75.00, 75.00,
 'https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=800',
 'https://www.amazon.com/s?k=Reebok+Classic+Leather&tag=shoeswiper-20',
 ARRAY['classic', 'retro', 'casual', 'clean', 'timeless'],
 ARRAY['white'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The Reebok Classic Leather is an icon. Soft leather upper and die-cut EVA midsole.',
 true, false, 234, 467, 80),

-- ============================================
-- ASICS (2+ items)
-- ============================================

('Gel-1130', 'ASICS', 'running', 120.00, 120.00,
 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
 'https://www.amazon.com/s?k=ASICS+Gel+1130&tag=shoeswiper-20',
 ARRAY['retro', 'running', 'chunky', 'techwear', 'trendy'],
 ARRAY['white', 'silver'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The Gel-1130 brings 2000s running tech to modern streets. GEL cushioning and retro style.',
 true, false, 298, 596, 86),

('Gel-Kayano 14', 'ASICS', 'running', 150.00, 150.00,
 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
 'https://www.amazon.com/s?k=ASICS+Gel+Kayano+14&tag=shoeswiper-20',
 ARRAY['retro', 'running', 'techwear', 'metallic', 'trendy'],
 ARRAY['silver', 'cream'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'Originally released in 2008, the Gel-Kayano 14 is back. GEL cushioning and Y2K aesthetic.',
 true, true, 345, 689, 89),

-- ============================================
-- ADDITIONAL POPULAR SNEAKERS
-- ============================================

-- More Nike
('Nike Air Max Plus', 'Nike', 'lifestyle', 175.00, 175.00,
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
 'https://www.amazon.com/s?k=Nike+Air+Max+Plus&tag=shoeswiper-20',
 ARRAY['streetwear', 'retro', 'bold', 'chunky'],
 ARRAY['black', 'silver'],
 'men',
 ARRAY['8', '9', '10', '11', '12'],
 'The Air Max Plus features unique gradient uppers and visible Tuned Air cushioning.',
 true, false, 289, 578, 85),

('Nike SB Dunk Low', 'Nike', 'skateboarding', 110.00, 110.00,
 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
 'https://www.amazon.com/s?k=Nike+SB+Dunk+Low&tag=shoeswiper-20',
 ARRAY['skate', 'streetwear', 'casual', 'hypebeast'],
 ARRAY['various'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The Nike SB Dunk Low brings skateboard-specific features to the classic Dunk silhouette.',
 true, false, 356, 712, 87),

-- More Adidas
('Adidas Spezial', 'Adidas', 'lifestyle', 100.00, 100.00,
 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
 'https://www.amazon.com/s?k=Adidas+Spezial&tag=shoeswiper-20',
 ARRAY['vintage', 'casual', 'terrace', 'classic'],
 ARRAY['blue', 'white', 'gum'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11'],
 'The Spezial is a handball classic from the ''70s. Suede upper and iconic three stripes.',
 true, false, 267, 534, 84),

('Adidas Rivalry Low', 'Adidas', 'lifestyle', 95.00, 95.00,
 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
 'https://www.amazon.com/s?k=Adidas+Rivalry+Low&tag=shoeswiper-20',
 ARRAY['retro', 'basketball', 'casual', 'clean'],
 ARRAY['white'],
 'unisex',
 ARRAY['6', '7', '8', '9', '10', '11', '12'],
 'The Rivalry Low brings ''80s basketball style to the streets. Leather upper and perforated stripes.',
 true, false, 198, 396, 79),

-- More Jordan
('Air Jordan 3 Retro', 'Jordan', 'basketball', 200.00, 200.00,
 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
 'https://www.amazon.com/s?k=Air+Jordan+3+Retro&tag=shoeswiper-20',
 ARRAY['basketball', 'hypebeast', 'retro', 'iconic'],
 ARRAY['white', 'cement', 'grey'],
 'men',
 ARRAY['8', '9', '10', '11', '12', '13'],
 'The Air Jordan 3 introduced the Jumpman logo and elephant print. A true sneaker grail.',
 true, true, 423, 845, 93),

('Air Jordan 11 Retro', 'Jordan', 'basketball', 225.00, 225.00,
 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
 'https://www.amazon.com/s?k=Air+Jordan+11+Retro&tag=shoeswiper-20',
 ARRAY['basketball', 'luxury', 'formal', 'hypebeast', 'iconic'],
 ARRAY['black', 'white'],
 'men',
 ARRAY['8', '9', '10', '11', '12', '13'],
 'The Air Jordan 11 is considered the greatest basketball shoe ever. Patent leather and full-length Air.',
 true, true, 467, 934, 96);

-- ============================================
-- UPDATE RANDOM METRICS FOR REALISM
-- ============================================
-- Add some variance to the initial metrics
UPDATE shoes SET 
  view_count = view_count + floor(random() * 200)::int,
  favorite_count = favorite_count + floor(random() * 100)::int,
  click_count = floor(random() * 300 + 50)::int
WHERE click_count IS NULL OR click_count = 0;
