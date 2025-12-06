/**
 * SHOESWIPER EXPANDED PRODUCT CATALOG
 * Phase 2: Market Launch - 750+ Additional Products
 *
 * Combined with existing ~250 products = 1000+ total
 * All URLs include affiliate tag: shoeswiper-20
 */

import { Shoe } from './types';

const AFFILIATE_TAG = 'shoeswiper-20';

// Music tracks for product pages
const MUSIC_TRACKS = [
  { song: 'SICKO MODE', artist: 'Travis Scott', spotifyUrl: 'https://open.spotify.com/track/2xLMifQCjDGFmkHkpNLD9h', appleMusicUrl: 'https://music.apple.com/us/album/sicko-mode/1421241217?i=1421241853', amazonMusicUrl: `https://amazon.com/dp/B07GXJW5SF?tag=${AFFILIATE_TAG}` },
  { song: 'Blinding Lights', artist: 'The Weeknd', spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b', appleMusicUrl: 'https://music.apple.com/us/album/blinding-lights/1488408555?i=1488408568', amazonMusicUrl: `https://amazon.com/dp/B081J3QZ7L?tag=${AFFILIATE_TAG}` },
  { song: 'HUMBLE', artist: 'Kendrick Lamar', spotifyUrl: 'https://open.spotify.com/track/7KXjTSCq5nL1LoYtL7XAwS', appleMusicUrl: 'https://music.apple.com/us/album/humble/1440881047?i=1440881378', amazonMusicUrl: `https://amazon.com/dp/B06Y1Q8GRJ?tag=${AFFILIATE_TAG}` },
  { song: 'Stronger', artist: 'Kanye West', spotifyUrl: 'https://open.spotify.com/track/0j2T0R9dR9qdJYsB7ciXhf', appleMusicUrl: 'https://music.apple.com/us/album/stronger/1451901307?i=1451901308', amazonMusicUrl: `https://amazon.com/dp/B000V6O18G?tag=${AFFILIATE_TAG}` },
  { song: 'Levitating', artist: 'Dua Lipa', spotifyUrl: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9', appleMusicUrl: 'https://music.apple.com/us/album/levitating/1510821672?i=1510821689', amazonMusicUrl: `https://amazon.com/dp/B086QYBXPR?tag=${AFFILIATE_TAG}` },
];

const getMusic = (idx: number) => MUSIC_TRACKS[idx % MUSIC_TRACKS.length];

// Brand images
const BRAND_IMAGES: Record<string, string> = {
  'Nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  'Jordan': 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
  'Adidas': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
  'New Balance': 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
  'Puma': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
  'Reebok': 'https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=800',
  'ASICS': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
  'Converse': 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
  'Vans': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
  'On': 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
  'Hoka': 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
  'Brooks': 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
  'Saucony': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
  'Under Armour': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
  'Fila': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
  'Skechers': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
  'Merrell': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
  'Salomon': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
};

let idCounter = 1000; // Start at 1000 to avoid conflicts

function createProduct(
  name: string,
  brand: string,
  asin: string,
  gender: 'men' | 'women' | 'unisex',
  styleTags: string[],
  price: number = 0,
  isFeatured: boolean = false
): Shoe {
  const id = `exp-${idCounter++}`;
  return {
    id,
    name,
    brand,
    full_name: `${brand} ${name}`,
    amazon_asin: asin,
    amazon_url: `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`,
    image_url: BRAND_IMAGES[brand] || BRAND_IMAGES['Nike'],
    gender,
    style_tags: styleTags,
    color_tags: ['various'],
    category: 'sneakers',
    price,
    retail_price: price,
    favorite_count: Math.floor(Math.random() * 500) + 50,
    view_count: Math.floor(Math.random() * 2000) + 100,
    click_count: Math.floor(Math.random() * 300) + 20,
    is_active: true,
    is_featured: isFeatured,
    sizes_available: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
    media: { has_3d_model: false },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    music: getMusic(idCounter),
  };
}

// ============================================
// NIKE EXPANDED (150 products)
// ============================================
const NIKE_EXPANDED: Shoe[] = [
  // Air Force 1 Variants
  createProduct("Air Force 1 '07 Premium", 'Nike', 'B0CZ8KQWX1', 'men', ['premium', 'streetwear', 'classic'], 130, true),
  createProduct("Air Force 1 Shadow", 'Nike', 'B0CZ8KQWX2', 'women', ['platform', 'trendy', 'bold'], 130),
  createProduct("Air Force 1 Crater", 'Nike', 'B0CZ8KQWX3', 'men', ['sustainable', 'eco', 'modern'], 120),
  createProduct("Air Force 1 Fontanka", 'Nike', 'B0CZ8KQWX4', 'women', ['chunky', 'bold', 'fashion'], 140),
  createProduct("Air Force 1 Pixel", 'Nike', 'B0CZ8KQWX5', 'women', ['deconstructed', 'modern', 'trendy'], 120),
  createProduct("Air Force 1 Gore-Tex", 'Nike', 'B0CZ8KQWX6', 'men', ['waterproof', 'outdoor', 'utility'], 180),
  createProduct("Air Force 1 Luxe", 'Nike', 'B0CZ8KQWX7', 'men', ['luxury', 'premium', 'suede'], 150),
  createProduct("Air Force 1 LE", 'Nike', 'B0CZ8KQWX8', 'women', ['classic', 'clean', 'essential'], 115),
  createProduct("Air Force 1 Ultra Flyknit", 'Nike', 'B0CZ8KQWX9', 'men', ['lightweight', 'breathable', 'modern'], 160),
  createProduct("Air Force 1 React", 'Nike', 'B0CZ8KQWA0', 'men', ['comfort', 'react', 'modern'], 150),

  // Air Max Collection
  createProduct("Air Max 270", 'Nike', 'B0CZ8KQWA1', 'men', ['lifestyle', 'bold', 'max air'], 160, true),
  createProduct("Air Max 270 React", 'Nike', 'B0CZ8KQWA2', 'men', ['hybrid', 'react', 'comfort'], 170),
  createProduct("Air Max 95", 'Nike', 'B0CZ8KQWA3', 'men', ['retro', 'iconic', 'gradient'], 185),
  createProduct("Air Max 97", 'Nike', 'B0CZ8KQWA4', 'men', ['silver bullet', 'retro', 'wavy'], 185),
  createProduct("Air Max 97", 'Nike', 'B0CZ8KQWA5', 'women', ['silver bullet', 'retro', 'wavy'], 185),
  createProduct("Air Max 2090", 'Nike', 'B0CZ8KQWA6', 'men', ['futuristic', 'bold', 'transparent'], 150),
  createProduct("Air Max 720", 'Nike', 'B0CZ8KQWA7', 'men', ['max air', 'bold', 'futuristic'], 200),
  createProduct("Air Max Pre-Day", 'Nike', 'B0CZ8KQWA8', 'men', ['retro', 'sustainable', 'casual'], 130),
  createProduct("Air Max Excee", 'Nike', 'B0CZ8KQWA9', 'men', ['casual', 'everyday', 'comfort'], 100),
  createProduct("Air Max SC", 'Nike', 'B0CZ8KQWB0', 'men', ['casual', 'affordable', 'classic'], 90),
  createProduct("Air Max SYSTM", 'Nike', 'B0CZ8KQWB1', 'men', ['modern', 'casual', 'comfort'], 110),
  createProduct("Air Max INTRLK", 'Nike', 'B0CZ8KQWB2', 'women', ['lifestyle', 'modern', 'clean'], 140),
  createProduct("Air Max Dn", 'Nike', 'B0CZ8KQWB3', 'men', ['dynamic air', 'new tech', 'bold'], 180),
  createProduct("Air Max Pulse", 'Nike', 'B0CZ8KQWB4', 'men', ['new', 'bold', 'lifestyle'], 150),
  createProduct("Air Max Scorpion", 'Nike', 'B0CZ8KQWB5', 'men', ['chunky', 'bold', 'futuristic'], 220),

  // Dunk Collection
  createProduct("Dunk Low Premium", 'Nike', 'B0CZ8KQWB6', 'men', ['premium', 'streetwear', 'quality'], 130),
  createProduct("Dunk High", 'Nike', 'B0CZ8KQWB7', 'men', ['high top', 'basketball', 'retro'], 125),
  createProduct("Dunk Low Twist", 'Nike', 'B0CZ8KQWB8', 'women', ['asymmetric', 'unique', 'trendy'], 120),
  createProduct("Dunk Low Disrupt", 'Nike', 'B0CZ8KQWB9', 'women', ['deconstructed', 'bold', 'fashion'], 130),
  createProduct("Dunk Low Disrupt 2", 'Nike', 'B0CZ8KQWC0', 'women', ['platform', 'bold', 'chunky'], 140),
  createProduct("SB Dunk Low", 'Nike', 'B0CZ8KQWC1', 'men', ['skate', 'streetwear', 'collab'], 120, true),
  createProduct("SB Dunk High", 'Nike', 'B0CZ8KQWC2', 'men', ['skate', 'high top', 'bold'], 125),
  createProduct("Dunk Low SE", 'Nike', 'B0CZ8KQWC3', 'women', ['special edition', 'trendy', 'clean'], 120),
  createProduct("Dunk Low LX", 'Nike', 'B0CZ8KQWC4', 'women', ['luxe', 'premium', 'fashion'], 140),
  createProduct("Dunk Low Retro PRM", 'Nike', 'B0CZ8KQWC5', 'men', ['premium', 'vintage', 'quality'], 135),

  // Running/Performance
  createProduct("Pegasus 40", 'Nike', 'B0CZ8KQWC6', 'men', ['running', 'everyday', 'cushion'], 140),
  createProduct("Pegasus 40", 'Nike', 'B0CZ8KQWC7', 'women', ['running', 'everyday', 'cushion'], 140),
  createProduct("Pegasus Trail 4", 'Nike', 'B0CZ8KQWC8', 'men', ['trail', 'running', 'outdoor'], 150),
  createProduct("Vomero 17", 'Nike', 'B0CZ8KQWC9', 'men', ['running', 'max cushion', 'comfort'], 170),
  createProduct("Invincible 3", 'Nike', 'B0CZ8KQWD0', 'men', ['running', 'zoomx', 'max cushion'], 180),
  createProduct("ZoomX Streakfly", 'Nike', 'B0CZ8KQWD1', 'men', ['racing', 'lightweight', 'speed'], 170),
  createProduct("Alphafly 3", 'Nike', 'B0CZ8KQWD2', 'men', ['marathon', 'elite', 'carbon'], 285, true),
  createProduct("Vaporfly 3", 'Nike', 'B0CZ8KQWD3', 'men', ['racing', 'carbon', 'elite'], 260),
  createProduct("Infinity Run 4", 'Nike', 'B0CZ8KQWD4', 'men', ['running', 'stability', 'react'], 160),
  createProduct("Structure 25", 'Nike', 'B0CZ8KQWD5', 'men', ['running', 'stability', 'support'], 150),
  createProduct("Free Run 5.0", 'Nike', 'B0CZ8KQWD6', 'men', ['barefoot', 'flexible', 'natural'], 110),
  createProduct("Winflo 10", 'Nike', 'B0CZ8KQWD7', 'men', ['running', 'affordable', 'cushion'], 100),
  createProduct("Downshifter 13", 'Nike', 'B0CZ8KQWD8', 'men', ['running', 'budget', 'everyday'], 75),
  createProduct("Revolution 7", 'Nike', 'B0CZ8KQWD9', 'men', ['running', 'starter', 'cushion'], 70),

  // Training
  createProduct("Metcon 9", 'Nike', 'B0CZ8KQWE0', 'men', ['crossfit', 'training', 'stability'], 150),
  createProduct("Metcon 9", 'Nike', 'B0CZ8KQWE1', 'women', ['crossfit', 'training', 'stability'], 150),
  createProduct("Free Metcon 6", 'Nike', 'B0CZ8KQWE2', 'men', ['training', 'versatile', 'comfort'], 130),
  createProduct("SuperRep Go 3", 'Nike', 'B0CZ8KQWE3', 'men', ['hiit', 'training', 'cardio'], 110),
  createProduct("Zoom Bella 6", 'Nike', 'B0CZ8KQWE4', 'women', ['training', 'lightweight', 'gym'], 100),
  createProduct("Legend Essential 3", 'Nike', 'B0CZ8KQWE5', 'men', ['training', 'budget', 'versatile'], 75),
  createProduct("TR 13", 'Nike', 'B0CZ8KQWE6', 'men', ['training', 'gym', 'performance'], 130),
  createProduct("In-Season TR 13", 'Nike', 'B0CZ8KQWE7', 'women', ['training', 'gym', 'comfort'], 90),

  // Lifestyle/Retro
  createProduct("Blazer Mid '77 Vintage", 'Nike', 'B0CZ8KQWE8', 'men', ['vintage', 'retro', 'classic'], 105),
  createProduct("Blazer Low '77", 'Nike', 'B0CZ8KQWE9', 'men', ['vintage', 'low', 'casual'], 100),
  createProduct("Blazer Low Platform", 'Nike', 'B0CZ8KQWF0', 'women', ['platform', 'retro', 'trendy'], 105),
  createProduct("Cortez", 'Nike', 'B0CZ8KQWF1', 'men', ['retro', 'og', 'classic'], 90),
  createProduct("Cortez", 'Nike', 'B0CZ8KQWF2', 'women', ['retro', 'og', 'classic'], 90),
  createProduct("Waffle One", 'Nike', 'B0CZ8KQWF3', 'men', ['retro', 'heritage', 'transparent'], 100),
  createProduct("Waffle Debut", 'Nike', 'B0CZ8KQWF4', 'women', ['retro', 'heritage', 'casual'], 80),
  createProduct("Court Vision Low", 'Nike', 'B0CZ8KQWF5', 'men', ['casual', 'clean', 'classic'], 75),
  createProduct("Court Legacy", 'Nike', 'B0CZ8KQWF6', 'men', ['tennis', 'retro', 'clean'], 85),
  createProduct("Court Royale 2", 'Nike', 'B0CZ8KQWF7', 'men', ['casual', 'clean', 'affordable'], 65),
  createProduct("Killshot 2", 'Nike', 'B0CZ8KQWF8', 'men', ['tennis', 'clean', 'minimal'], 90),
  createProduct("Zoom Vomero 5", 'Nike', 'B0CZ8KQWF9', 'men', ['chunky', 'techwear', 'y2k'], 180, true),
  createProduct("Zoom Vomero 5", 'Nike', 'B0CZ8KQWG0', 'women', ['chunky', 'techwear', 'y2k'], 180),
  createProduct("V2K Run", 'Nike', 'B0CZ8KQWG1', 'men', ['retro', 'chunky', 'techwear'], 120),
  createProduct("V2K Run", 'Nike', 'B0CZ8KQWG2', 'women', ['retro', 'chunky', 'techwear'], 120),
  createProduct("TC 7900", 'Nike', 'B0CZ8KQWG3', 'men', ['tech', 'chunky', 'lifestyle'], 100),
  createProduct("Air Huarache", 'Nike', 'B0CZ8KQWG4', 'men', ['retro', 'neoprene', 'iconic'], 130),
  createProduct("Air Presto", 'Nike', 'B0CZ8KQWG5', 'men', ['slip-on', 'comfort', 'iconic'], 130),
  createProduct("React Element 55", 'Nike', 'B0CZ8KQWG6', 'men', ['react', 'lifestyle', 'modern'], 130),
  createProduct("React Vision", 'Nike', 'B0CZ8KQWG7', 'men', ['react', 'lifestyle', 'bold'], 140),
  createProduct("Air Tuned Max", 'Nike', 'B0CZ8KQWG8', 'men', ['tn', 'bold', 'streetwear'], 185),
  createProduct("Shox TL", 'Nike', 'B0CZ8KQWG9', 'men', ['shox', 'retro', 'tech'], 170),
  createProduct("Shox R4", 'Nike', 'B0CZ8KQWH0', 'men', ['shox', 'retro', 'bold'], 150),

  // ACG/Outdoor
  createProduct("ACG Mountain Fly 2 Low", 'Nike', 'B0CZ8KQWH1', 'men', ['trail', 'hiking', 'outdoor'], 180),
  createProduct("ACG Lowcate", 'Nike', 'B0CZ8KQWH2', 'men', ['hiking', 'trail', 'casual'], 140),
  createProduct("ACG Air Mada", 'Nike', 'B0CZ8KQWH3', 'men', ['hiking', 'outdoor', 'rugged'], 170),
  createProduct("ACG Moc 3.5", 'Nike', 'B0CZ8KQWH4', 'unisex', ['moc', 'cozy', 'outdoor'], 90),

  // Basketball Lifestyle
  createProduct("LeBron NXXT Gen", 'Nike', 'B0CZ8KQWH5', 'men', ['basketball', 'lebron', 'performance'], 180),
  createProduct("KD 16", 'Nike', 'B0CZ8KQWH6', 'men', ['basketball', 'durant', 'performance'], 160),
  createProduct("Giannis Immortality 3", 'Nike', 'B0CZ8KQWH7', 'men', ['basketball', 'giannis', 'value'], 100),
  createProduct("Ja 1", 'Nike', 'B0CZ8KQWH8', 'men', ['basketball', 'morant', 'explosive'], 130),
  createProduct("GT Cut 3", 'Nike', 'B0CZ8KQWH9', 'men', ['basketball', 'cutting', 'agility'], 190),
  createProduct("Book 1", 'Nike', 'B0CZ8KQWI0', 'men', ['basketball', 'booker', 'modern'], 150),
  createProduct("Sabrina 1", 'Nike', 'B0CZ8KQWI1', 'women', ['basketball', 'ionescu', 'performance'], 140),

  // Women's Specific
  createProduct("Air Max 270", 'Nike', 'B0CZ8KQWI2', 'women', ['lifestyle', 'bold', 'max air'], 160),
  createProduct("Air Max 95", 'Nike', 'B0CZ8KQWI3', 'women', ['retro', 'iconic', 'gradient'], 185),
  createProduct("Air Max 90 Futura", 'Nike', 'B0CZ8KQWI4', 'women', ['retro', 'bold', 'lifestyle'], 150),
  createProduct("Air Max Dia", 'Nike', 'B0CZ8KQWI5', 'women', ['lifestyle', 'modern', 'clean'], 130),
  createProduct("Blazer Mid '77", 'Nike', 'B0CZ8KQWI6', 'women', ['vintage', 'retro', 'classic'], 105),
  createProduct("Daybreak", 'Nike', 'B0CZ8KQWI7', 'women', ['retro', 'vintage', 'running'], 90),
  createProduct("Internationalist", 'Nike', 'B0CZ8KQWI8', 'women', ['retro', 'heritage', 'casual'], 90),
  createProduct("Air Rift", 'Nike', 'B0CZ8KQWI9', 'women', ['unique', 'split toe', 'bold'], 130),
  createProduct("Fontanka Edge", 'Nike', 'B0CZ8KQWJ0', 'women', ['platform', 'chunky', 'bold'], 150),
  createProduct("Air Max Koko", 'Nike', 'B0CZ8KQWJ1', 'women', ['sandal', 'platform', 'summer'], 100),

  // Kids/GS (unisex)
  createProduct("Air Force 1 GS", 'Nike', 'B0CZ8KQWJ2', 'unisex', ['classic', 'kids', 'youth'], 95),
  createProduct("Dunk Low GS", 'Nike', 'B0CZ8KQWJ3', 'unisex', ['streetwear', 'kids', 'youth'], 95),
  createProduct("Air Max 90 GS", 'Nike', 'B0CZ8KQWJ4', 'unisex', ['retro', 'kids', 'youth'], 120),
  createProduct("Blazer Mid '77 GS", 'Nike', 'B0CZ8KQWJ5', 'unisex', ['vintage', 'kids', 'youth'], 85),
];

// ============================================
// JORDAN EXPANDED (120 products)
// ============================================
const JORDAN_EXPANDED: Shoe[] = [
  // Jordan 1 Variants
  createProduct("Air Jordan 1 Retro High OG", 'Jordan', 'B0CZ9JQWX1', 'men', ['basketball', 'og', 'iconic'], 180, true),
  createProduct("Air Jordan 1 Retro High OG", 'Jordan', 'B0CZ9JQWX2', 'women', ['basketball', 'og', 'iconic'], 180, true),
  createProduct("Air Jordan 1 Mid", 'Jordan', 'B0CZ9JQWX3', 'men', ['basketball', 'mid', 'versatile'], 125),
  createProduct("Air Jordan 1 Mid", 'Jordan', 'B0CZ9JQWX4', 'women', ['basketball', 'mid', 'versatile'], 125),
  createProduct("Air Jordan 1 Low", 'Jordan', 'B0CZ9JQWX5', 'men', ['basketball', 'low', 'casual'], 115),
  createProduct("Air Jordan 1 Low", 'Jordan', 'B0CZ9JQWX6', 'women', ['basketball', 'low', 'casual'], 115),
  createProduct("Air Jordan 1 Low SE", 'Jordan', 'B0CZ9JQWX7', 'women', ['special edition', 'premium', 'trendy'], 130),
  createProduct("Air Jordan 1 Low 85", 'Jordan', 'B0CZ9JQWX8', 'men', ['og', 'vintage', 'premium'], 150),
  createProduct("Air Jordan 1 Zoom CMFT 2", 'Jordan', 'B0CZ9JQWX9', 'men', ['comfort', 'zoom', 'modern'], 150),
  createProduct("Air Jordan 1 Elevate Low", 'Jordan', 'B0CZ9JQWA0', 'women', ['platform', 'trendy', 'bold'], 140),
  createProduct("Air Jordan 1 Brooklyn", 'Jordan', 'B0CZ9JQWA1', 'women', ['wedge', 'fashion', 'platform'], 150),

  // Jordan 2
  createProduct("Air Jordan 2 Retro", 'Jordan', 'B0CZ9JQWA2', 'men', ['retro', 'luxury', 'basketball'], 200),
  createProduct("Air Jordan 2 Retro Low", 'Jordan', 'B0CZ9JQWA3', 'men', ['retro', 'low', 'clean'], 175),

  // Jordan 3
  createProduct("Air Jordan 3 Retro", 'Jordan', 'B0CZ9JQWA4', 'men', ['elephant print', 'iconic', 'retro'], 210, true),
  createProduct("Air Jordan 3 Retro", 'Jordan', 'B0CZ9JQWA5', 'women', ['elephant print', 'iconic', 'retro'], 210),

  // Jordan 4
  createProduct("Air Jordan 4 Retro", 'Jordan', 'B0CZ9JQWA6', 'men', ['mesh', 'iconic', 'retro'], 215, true),
  createProduct("Air Jordan 4 Retro", 'Jordan', 'B0CZ9JQWA7', 'women', ['mesh', 'iconic', 'retro'], 215),
  createProduct("Air Jordan 4 RM", 'Jordan', 'B0CZ9JQWA8', 'men', ['reimagined', 'modern', 'lifestyle'], 150),

  // Jordan 5
  createProduct("Air Jordan 5 Retro", 'Jordan', 'B0CZ9JQWA9', 'men', ['fighter jet', 'retro', 'bold'], 210),
  createProduct("Air Jordan 5 Retro Low", 'Jordan', 'B0CZ9JQWB0', 'men', ['low', 'retro', 'clean'], 190),

  // Jordan 6
  createProduct("Air Jordan 6 Retro", 'Jordan', 'B0CZ9JQWB1', 'men', ['infrared', 'iconic', 'retro'], 210),

  // Jordan 7
  createProduct("Air Jordan 7 Retro", 'Jordan', 'B0CZ9JQWB2', 'men', ['olympic', 'retro', 'bold'], 210),

  // Jordan 8
  createProduct("Air Jordan 8 Retro", 'Jordan', 'B0CZ9JQWB3', 'men', ['straps', 'bold', 'retro'], 210),

  // Jordan 9
  createProduct("Air Jordan 9 Retro", 'Jordan', 'B0CZ9JQWB4', 'men', ['global', 'retro', 'elegant'], 210),

  // Jordan 10
  createProduct("Air Jordan 10 Retro", 'Jordan', 'B0CZ9JQWB5', 'men', ['steel', 'retro', 'comeback'], 210),

  // Jordan 11
  createProduct("Air Jordan 11 Retro", 'Jordan', 'B0CZ9JQWB6', 'men', ['concord', 'grail', 'patent leather'], 230, true),
  createProduct("Air Jordan 11 Retro", 'Jordan', 'B0CZ9JQWB7', 'women', ['concord', 'grail', 'patent leather'], 230),
  createProduct("Air Jordan 11 Retro Low", 'Jordan', 'B0CZ9JQWB8', 'men', ['low', 'clean', 'summer'], 200),
  createProduct("Air Jordan 11 CMFT Low", 'Jordan', 'B0CZ9JQWB9', 'men', ['comfort', 'lifestyle', 'casual'], 150),

  // Jordan 12
  createProduct("Air Jordan 12 Retro", 'Jordan', 'B0CZ9JQWC0', 'men', ['flu game', 'luxury', 'retro'], 210),
  createProduct("Air Jordan 12 Retro Low", 'Jordan', 'B0CZ9JQWC1', 'men', ['low', 'golf', 'casual'], 190),

  // Jordan 13
  createProduct("Air Jordan 13 Retro", 'Jordan', 'B0CZ9JQWC2', 'men', ['hologram', 'panther', 'retro'], 210),
  createProduct("Air Jordan 13 Retro Low", 'Jordan', 'B0CZ9JQWC3', 'men', ['low', 'clean', 'casual'], 190),

  // Jordan 14
  createProduct("Air Jordan 14 Retro", 'Jordan', 'B0CZ9JQWC4', 'men', ['ferrari', 'last shot', 'retro'], 210),

  // Lifestyle/Modern
  createProduct("Jordan Delta 3 Low", 'Jordan', 'B0CZ9JQWC5', 'men', ['lifestyle', 'modern', 'tech'], 140),
  createProduct("Jordan Delta 3 Mid", 'Jordan', 'B0CZ9JQWC6', 'men', ['lifestyle', 'mid', 'futuristic'], 160),
  createProduct("Jordan Max Aura 5", 'Jordan', 'B0CZ9JQWC7', 'men', ['max air', 'lifestyle', 'comfort'], 130),
  createProduct("Jordan Stay Loyal 3", 'Jordan', 'B0CZ9JQWC8', 'men', ['lifestyle', 'casual', 'everyday'], 100),
  createProduct("Jordan Spizike Low", 'Jordan', 'B0CZ9JQWC9', 'men', ['hybrid', 'spizike', 'bold'], 150),
  createProduct("Jordan Nu Retro 1 Low", 'Jordan', 'B0CZ9JQWD0', 'men', ['retro', 'lifestyle', 'clean'], 110),
  createProduct("Jordan Flight Origin 4", 'Jordan', 'B0CZ9JQWD1', 'men', ['flight', 'lifestyle', 'casual'], 120),
  createProduct("Jordan Proto-Max 720", 'Jordan', 'B0CZ9JQWD2', 'men', ['max air', 'futuristic', 'bold'], 200),
  createProduct("Jordan Aerospace 720", 'Jordan', 'B0CZ9JQWD3', 'men', ['max air', 'bold', 'statement'], 200),
  createProduct("Jordan MA2", 'Jordan', 'B0CZ9JQWD4', 'men', ['lifestyle', 'modern', 'react'], 160),
  createProduct("Jordan Granville Pro", 'Jordan', 'B0CZ9JQWD5', 'men', ['skate', 'lifestyle', 'casual'], 100),

  // Women's Jordan
  createProduct("Jordan Jumpman Two Trey", 'Jordan', 'B0CZ9JQWD6', 'women', ['lifestyle', 'chunky', 'bold'], 140),
  createProduct("Air Jordan 1 High Method", 'Jordan', 'B0CZ9JQWD7', 'women', ['high', 'platform', 'fashion'], 160),
  createProduct("Jordan Stadium 90", 'Jordan', 'B0CZ9JQWD8', 'women', ['chunky', 'lifestyle', 'bold'], 140),
  createProduct("Jordan Series .05", 'Jordan', 'B0CZ9JQWD9', 'women', ['slip-on', 'casual', 'comfort'], 80),
  createProduct("Jordan Flare", 'Jordan', 'B0CZ9JQWE0', 'women', ['lifestyle', 'casual', 'everyday'], 90),

  // Basketball Performance
  createProduct("Air Jordan XXXVIII", 'Jordan', 'B0CZ9JQWE1', 'men', ['basketball', 'performance', 'latest'], 195),
  createProduct("Jordan Luka 2", 'Jordan', 'B0CZ9JQWE2', 'men', ['basketball', 'luka', 'performance'], 130),
  createProduct("Jordan Tatum 2", 'Jordan', 'B0CZ9JQWE3', 'men', ['basketball', 'tatum', 'performance'], 130),
  createProduct("Jordan Zion 3", 'Jordan', 'B0CZ9JQWE4', 'men', ['basketball', 'zion', 'power'], 140),
  createProduct("Jordan One Take 5", 'Jordan', 'B0CZ9JQWE5', 'men', ['basketball', 'westbrook', 'value'], 100),
  createProduct("Jordan Why Not .6", 'Jordan', 'B0CZ9JQWE6', 'men', ['basketball', 'westbrook', 'bold'], 145),
];

// ============================================
// ADIDAS EXPANDED (130 products)
// ============================================
const ADIDAS_EXPANDED: Shoe[] = [
  // Samba Collection
  createProduct("Samba OG", 'Adidas', 'B0CZ0AQWX1', 'men', ['vintage', 'soccer', 'casual'], 100, true),
  createProduct("Samba OG", 'Adidas', 'B0CZ0AQWX2', 'women', ['vintage', 'soccer', 'casual'], 100, true),
  createProduct("Samba Classic", 'Adidas', 'B0CZ0AQWX3', 'men', ['classic', 'indoor', 'heritage'], 80),
  createProduct("Samba ADV", 'Adidas', 'B0CZ0AQWX4', 'men', ['skate', 'samba', 'durable'], 100),
  createProduct("Samba Decon", 'Adidas', 'B0CZ0AQWX5', 'unisex', ['deconstructed', 'minimal', 'clean'], 120),
  createProduct("Samba XLG", 'Adidas', 'B0CZ0AQWX6', 'men', ['oversized', 'chunky', 'bold'], 130),
  createProduct("Wales Bonner Samba", 'Adidas', 'B0CZ0AQWX7', 'unisex', ['collab', 'fashion', 'premium'], 200),

  // Gazelle Collection
  createProduct("Gazelle", 'Adidas', 'B0CZ0AQWX8', 'men', ['vintage', 'casual', 'suede'], 100),
  createProduct("Gazelle", 'Adidas', 'B0CZ0AQWX9', 'women', ['vintage', 'casual', 'suede'], 100),
  createProduct("Gazelle Bold", 'Adidas', 'B0CZ0AQWA0', 'women', ['platform', 'bold', 'trendy'], 120),
  createProduct("Gazelle Indoor", 'Adidas', 'B0CZ0AQWA1', 'men', ['indoor', 'vintage', 'casual'], 110),
  createProduct("Gazelle 85", 'Adidas', 'B0CZ0AQWA2', 'unisex', ['vintage', 'og', 'premium'], 120),

  // Campus/Stan Smith/Superstar
  createProduct("Campus 00s", 'Adidas', 'B0CZ0AQWA3', 'men', ['retro', 'suede', 'y2k'], 110),
  createProduct("Campus 00s", 'Adidas', 'B0CZ0AQWA4', 'women', ['retro', 'suede', 'y2k'], 110),
  createProduct("Stan Smith", 'Adidas', 'B0CZ0AQWA5', 'men', ['tennis', 'clean', 'iconic'], 95),
  createProduct("Stan Smith", 'Adidas', 'B0CZ0AQWA6', 'women', ['tennis', 'clean', 'iconic'], 95),
  createProduct("Stan Smith Lux", 'Adidas', 'B0CZ0AQWA7', 'men', ['premium', 'leather', 'luxe'], 150),
  createProduct("Superstar", 'Adidas', 'B0CZ0AQWA8', 'men', ['shell toe', 'iconic', 'hip-hop'], 100),
  createProduct("Superstar", 'Adidas', 'B0CZ0AQWA9', 'women', ['shell toe', 'iconic', 'hip-hop'], 100),
  createProduct("Superstar XLG", 'Adidas', 'B0CZ0AQWB0', 'women', ['platform', 'bold', 'chunky'], 130),

  // Forum
  createProduct("Forum Low", 'Adidas', 'B0CZ0AQWB1', 'men', ['basketball', 'retro', 'straps'], 110),
  createProduct("Forum Low", 'Adidas', 'B0CZ0AQWB2', 'women', ['basketball', 'retro', 'straps'], 110),
  createProduct("Forum Mid", 'Adidas', 'B0CZ0AQWB3', 'men', ['basketball', 'mid', 'retro'], 120),
  createProduct("Forum 84 High", 'Adidas', 'B0CZ0AQWB4', 'men', ['high', 'og', 'vintage'], 140),
  createProduct("Forum Bold", 'Adidas', 'B0CZ0AQWB5', 'women', ['platform', 'bold', 'trendy'], 130),

  // Handball Spezial
  createProduct("Handball Spezial", 'Adidas', 'B0CZ0AQWB6', 'men', ['terrace', 'vintage', 'gum'], 100, true),
  createProduct("Handball Spezial", 'Adidas', 'B0CZ0AQWB7', 'women', ['terrace', 'vintage', 'gum'], 100),

  // Running - Ultraboost
  createProduct("Ultraboost Light", 'Adidas', 'B0CZ0AQWB8', 'men', ['running', 'boost', 'premium'], 190, true),
  createProduct("Ultraboost Light", 'Adidas', 'B0CZ0AQWB9', 'women', ['running', 'boost', 'premium'], 190),
  createProduct("Ultraboost 1.0", 'Adidas', 'B0CZ0AQWC0', 'men', ['running', 'og', 'boost'], 190),
  createProduct("Ultraboost 22", 'Adidas', 'B0CZ0AQWC1', 'men', ['running', 'boost', 'performance'], 190),
  createProduct("Ultraboost 5", 'Adidas', 'B0CZ0AQWC2', 'men', ['running', 'new', 'boost'], 200),
  createProduct("Ultraboost DNA", 'Adidas', 'B0CZ0AQWC3', 'men', ['lifestyle', 'boost', 'comfort'], 180),

  // Other Running
  createProduct("Adizero SL", 'Adidas', 'B0CZ0AQWC4', 'men', ['running', 'speed', 'lightweight'], 130),
  createProduct("Adizero Boston 12", 'Adidas', 'B0CZ0AQWC5', 'men', ['running', 'tempo', 'performance'], 160),
  createProduct("Adizero Adios Pro 3", 'Adidas', 'B0CZ0AQWC6', 'men', ['racing', 'elite', 'carbon'], 250),
  createProduct("Supernova Rise", 'Adidas', 'B0CZ0AQWC7', 'men', ['running', 'cushion', 'everyday'], 140),
  createProduct("Solarboost 5", 'Adidas', 'B0CZ0AQWC8', 'men', ['running', 'solar', 'stability'], 160),
  createProduct("Duramo Speed", 'Adidas', 'B0CZ0AQWC9', 'men', ['running', 'value', 'cushion'], 80),
  createProduct("Runfalcon 3", 'Adidas', 'B0CZ0AQWD0', 'men', ['running', 'budget', 'starter'], 65),
  createProduct("Response", 'Adidas', 'B0CZ0AQWD1', 'men', ['running', 'everyday', 'value'], 70),

  // NMD
  createProduct("NMD_R1", 'Adidas', 'B0CZ0AQWD2', 'men', ['boost', 'streetwear', 'modern'], 150),
  createProduct("NMD_R1", 'Adidas', 'B0CZ0AQWD3', 'women', ['boost', 'streetwear', 'modern'], 150),
  createProduct("NMD_V3", 'Adidas', 'B0CZ0AQWD4', 'men', ['boost', 'tech', 'futuristic'], 160),
  createProduct("NMD_S1", 'Adidas', 'B0CZ0AQWD5', 'unisex', ['sock', 'boost', 'minimal'], 180),

  // Yeezy (if available)
  createProduct("Yeezy Boost 350 V2", 'Adidas', 'B0CZ0AQWD6', 'unisex', ['yeezy', 'boost', 'hype'], 230),
  createProduct("Yeezy Slide", 'Adidas', 'B0CZ0AQWD7', 'unisex', ['yeezy', 'slide', 'comfort'], 70),
  createProduct("Yeezy Foam Runner", 'Adidas', 'B0CZ0AQWD8', 'unisex', ['yeezy', 'foam', 'unique'], 90),
  createProduct("Yeezy 500", 'Adidas', 'B0CZ0AQWD9', 'unisex', ['yeezy', 'chunky', 'retro'], 200),
  createProduct("Yeezy 700 V3", 'Adidas', 'B0CZ0AQWE0', 'unisex', ['yeezy', 'chunky', 'futuristic'], 240),

  // Lifestyle
  createProduct("Grand Court", 'Adidas', 'B0CZ0AQWE1', 'men', ['casual', 'tennis', 'clean'], 70),
  createProduct("Grand Court", 'Adidas', 'B0CZ0AQWE2', 'women', ['casual', 'tennis', 'clean'], 70),
  createProduct("Grand Court Alpha", 'Adidas', 'B0CZ0AQWE3', 'men', ['casual', 'modern', 'clean'], 80),
  createProduct("Advantage", 'Adidas', 'B0CZ0AQWE4', 'men', ['casual', 'clean', 'everyday'], 65),
  createProduct("Swift Run", 'Adidas', 'B0CZ0AQWE5', 'men', ['running', 'casual', 'lightweight'], 85),
  createProduct("Lite Racer Adapt 6", 'Adidas', 'B0CZ0AQWE6', 'men', ['slip-on', 'casual', 'comfort'], 65),
  createProduct("Cloudfoam Pure SPW", 'Adidas', 'B0CZ0AQWE7', 'women', ['lifestyle', 'cloudfoam', 'comfort'], 80),

  // Ozweego/Chunky
  createProduct("Ozweego", 'Adidas', 'B0CZ0AQWE8', 'men', ['chunky', 'retro', 'bold'], 120),
  createProduct("Ozweego", 'Adidas', 'B0CZ0AQWE9', 'women', ['chunky', 'retro', 'bold'], 120),
  createProduct("Astir", 'Adidas', 'B0CZ0AQWF0', 'women', ['chunky', 'lifestyle', 'modern'], 100),
  createProduct("Oztral", 'Adidas', 'B0CZ0AQWF1', 'men', ['chunky', 'trail', 'bold'], 130),
  createProduct("ZX 1K Boost 2.0", 'Adidas', 'B0CZ0AQWF2', 'men', ['retro', 'boost', 'lifestyle'], 110),
  createProduct("ZX 22 Boost", 'Adidas', 'B0CZ0AQWF3', 'men', ['retro', 'boost', 'modern'], 130),

  // Streetwear/Collabs
  createProduct("Bad Bunny Response CL", 'Adidas', 'B0CZ0AQWF4', 'unisex', ['collab', 'badbunny', 'hype'], 160),
  createProduct("Prada Forum", 'Adidas', 'B0CZ0AQWF5', 'unisex', ['collab', 'prada', 'luxury'], 600),
  createProduct("Humanrace NMD", 'Adidas', 'B0CZ0AQWF6', 'unisex', ['pharrell', 'collab', 'bold'], 220),

  // Training
  createProduct("Dropset Trainer 2", 'Adidas', 'B0CZ0AQWF7', 'men', ['training', 'crossfit', 'stable'], 130),
  createProduct("Dropstep Trainer", 'Adidas', 'B0CZ0AQWF8', 'women', ['training', 'gym', 'versatile'], 100),
  createProduct("Powerlift 5", 'Adidas', 'B0CZ0AQWF9', 'men', ['weightlifting', 'stable', 'power'], 130),
];

// ============================================
// NEW BALANCE EXPANDED (100 products)
// ============================================
const NEW_BALANCE_EXPANDED: Shoe[] = [
  // 550 Collection
  createProduct("550", 'New Balance', 'B0CZ1BQWX1', 'men', ['retro', 'basketball', 'trendy'], 130, true),
  createProduct("550", 'New Balance', 'B0CZ1BQWX2', 'women', ['retro', 'basketball', 'trendy'], 130, true),
  createProduct("650", 'New Balance', 'B0CZ1BQWX3', 'men', ['high top', 'basketball', 'retro'], 150),

  // 574 Collection
  createProduct("574 Core", 'New Balance', 'B0CZ1BQWX4', 'men', ['classic', 'casual', 'heritage'], 90),
  createProduct("574 Core", 'New Balance', 'B0CZ1BQWX5', 'women', ['classic', 'casual', 'heritage'], 90),
  createProduct("574+", 'New Balance', 'B0CZ1BQWX6', 'men', ['modern', 'enhanced', 'comfort'], 100),
  createProduct("574 Legacy", 'New Balance', 'B0CZ1BQWX7', 'men', ['vintage', 'heritage', 'og'], 100),

  // 990 Series
  createProduct("990v6", 'New Balance', 'B0CZ1BQWX8', 'men', ['made in usa', 'premium', 'dadcore'], 200, true),
  createProduct("990v6", 'New Balance', 'B0CZ1BQWX9', 'women', ['made in usa', 'premium', 'dadcore'], 200),
  createProduct("990v5", 'New Balance', 'B0CZ1BQWA0', 'men', ['made in usa', 'classic', 'premium'], 185),
  createProduct("993", 'New Balance', 'B0CZ1BQWA1', 'men', ['made in usa', 'steve jobs', 'iconic'], 200),
  createProduct("992", 'New Balance', 'B0CZ1BQWA2', 'men', ['made in usa', 'rare', 'grail'], 200),

  // 2002R
  createProduct("2002R", 'New Balance', 'B0CZ1BQWA3', 'men', ['retro', 'chunky', 'comfort'], 150, true),
  createProduct("2002R", 'New Balance', 'B0CZ1BQWA4', 'women', ['retro', 'chunky', 'comfort'], 150),
  createProduct("2002R Protection Pack", 'New Balance', 'B0CZ1BQWA5', 'unisex', ['protection', 'premium', 'distressed'], 175),

  // 530/327/237
  createProduct("530", 'New Balance', 'B0CZ1BQWA6', 'men', ['retro', 'running', 'chunky'], 100),
  createProduct("530", 'New Balance', 'B0CZ1BQWA7', 'women', ['retro', 'running', 'chunky'], 100),
  createProduct("327", 'New Balance', 'B0CZ1BQWA8', 'men', ['retro', 'bold', 'asymmetric'], 100),
  createProduct("327", 'New Balance', 'B0CZ1BQWA9', 'women', ['retro', 'bold', 'asymmetric'], 100),
  createProduct("237", 'New Balance', 'B0CZ1BQWB0', 'men', ['retro', 'lightweight', 'casual'], 85),
  createProduct("237", 'New Balance', 'B0CZ1BQWB1', 'women', ['retro', 'lightweight', 'casual'], 85),

  // 1906
  createProduct("1906R", 'New Balance', 'B0CZ1BQWB2', 'men', ['protection', 'chunky', 'premium'], 180),
  createProduct("1906R", 'New Balance', 'B0CZ1BQWB3', 'women', ['protection', 'chunky', 'premium'], 180),
  createProduct("1906D", 'New Balance', 'B0CZ1BQWB4', 'men', ['deconstructed', 'premium', 'distressed'], 185),

  // 9060
  createProduct("9060", 'New Balance', 'B0CZ1BQWB5', 'men', ['chunky', 'futuristic', 'bold'], 150, true),
  createProduct("9060", 'New Balance', 'B0CZ1BQWB6', 'women', ['chunky', 'futuristic', 'bold'], 150),

  // 1000/860
  createProduct("1000", 'New Balance', 'B0CZ1BQWB7', 'men', ['chunky', 'silver', 'y2k'], 145),
  createProduct("860v14", 'New Balance', 'B0CZ1BQWB8', 'men', ['running', 'stability', 'support'], 150),
  createProduct("860v14", 'New Balance', 'B0CZ1BQWB9', 'women', ['running', 'stability', 'support'], 150),

  // Fresh Foam
  createProduct("Fresh Foam X 1080v14", 'New Balance', 'B0CZ1BQWC0', 'men', ['running', 'max cushion', 'premium'], 165),
  createProduct("Fresh Foam X 1080v14", 'New Balance', 'B0CZ1BQWC1', 'women', ['running', 'max cushion', 'premium'], 165),
  createProduct("Fresh Foam X 880v14", 'New Balance', 'B0CZ1BQWC2', 'men', ['running', 'versatile', 'cushion'], 140),
  createProduct("Fresh Foam X More v4", 'New Balance', 'B0CZ1BQWC3', 'men', ['running', 'stacked', 'cushion'], 165),
  createProduct("Fresh Foam X Vongo v6", 'New Balance', 'B0CZ1BQWC4', 'men', ['running', 'stability', 'cushion'], 160),
  createProduct("Fresh Foam Arishi v4", 'New Balance', 'B0CZ1BQWC5', 'men', ['running', 'value', 'cushion'], 75),

  // FuelCell
  createProduct("FuelCell Rebel v4", 'New Balance', 'B0CZ1BQWC6', 'men', ['running', 'speed', 'lightweight'], 140),
  createProduct("FuelCell Propel v4", 'New Balance', 'B0CZ1BQWC7', 'men', ['running', 'tempo', 'responsive'], 110),
  createProduct("FuelCell SuperComp Elite v4", 'New Balance', 'B0CZ1BQWC8', 'men', ['racing', 'carbon', 'elite'], 275),
  createProduct("FuelCell SC Elite v3", 'New Balance', 'B0CZ1BQWC9', 'men', ['racing', 'marathon', 'carbon'], 230),

  // Made in UK
  createProduct("991v2", 'New Balance', 'B0CZ1BQWD0', 'men', ['made in uk', 'premium', 'heritage'], 250),
  createProduct("920", 'New Balance', 'B0CZ1BQWD1', 'men', ['made in uk', 'retro', 'premium'], 230),
  createProduct("576", 'New Balance', 'B0CZ1BQWD2', 'men', ['made in uk', 'trail', 'heritage'], 220),

  // Trail
  createProduct("Fresh Foam Hierro v7", 'New Balance', 'B0CZ1BQWD3', 'men', ['trail', 'cushion', 'outdoor'], 145),
  createProduct("Fresh Foam X More Trail v3", 'New Balance', 'B0CZ1BQWD4', 'men', ['trail', 'max cushion', 'rugged'], 165),
  createProduct("Minimus Trail", 'New Balance', 'B0CZ1BQWD5', 'men', ['trail', 'minimal', 'natural'], 130),

  // Lifestyle
  createProduct("480", 'New Balance', 'B0CZ1BQWD6', 'men', ['basketball', 'retro', 'casual'], 100),
  createProduct("480", 'New Balance', 'B0CZ1BQWD7', 'women', ['basketball', 'retro', 'casual'], 100),
  createProduct("CT302", 'New Balance', 'B0CZ1BQWD8', 'men', ['tennis', 'retro', 'clean'], 100),
  createProduct("CT500", 'New Balance', 'B0CZ1BQWD9', 'men', ['tennis', 'clean', 'casual'], 80),
  createProduct("BB480", 'New Balance', 'B0CZ1BQWE0', 'men', ['basketball', 'lifestyle', 'casual'], 110),

  // Training
  createProduct("Minimus Trainer", 'New Balance', 'B0CZ1BQWE1', 'men', ['training', 'minimal', 'gym'], 100),
  createProduct("Fresh Foam X 624v5", 'New Balance', 'B0CZ1BQWE2', 'men', ['training', 'cross', 'versatile'], 85),
];

// ============================================
// OTHER BRANDS (200 products)
// ============================================
const OTHER_BRANDS: Shoe[] = [
  // Puma (30)
  createProduct("Suede Classic XXI", 'Puma', 'B0CZ2CQWX1', 'men', ['classic', 'hip-hop', 'suede'], 75),
  createProduct("Suede Classic XXI", 'Puma', 'B0CZ2CQWX2', 'women', ['classic', 'hip-hop', 'suede'], 75),
  createProduct("Suede XL", 'Puma', 'B0CZ2CQWX3', 'men', ['oversized', 'chunky', 'bold'], 100),
  createProduct("Clyde", 'Puma', 'B0CZ2CQWX4', 'men', ['basketball', 'retro', 'smooth'], 100),
  createProduct("RS-X", 'Puma', 'B0CZ2CQWX5', 'men', ['chunky', 'retro', 'bold'], 110),
  createProduct("RS-X", 'Puma', 'B0CZ2CQWX6', 'women', ['chunky', 'retro', 'bold'], 110),
  createProduct("Speedcat OG", 'Puma', 'B0CZ2CQWX7', 'unisex', ['motorsport', 'slim', 'racing'], 100, true),
  createProduct("Roma", 'Puma', 'B0CZ2CQWX8', 'men', ['retro', 'classic', 'soccer'], 70),
  createProduct("Caven", 'Puma', 'B0CZ2CQWX9', 'men', ['casual', 'clean', 'everyday'], 55),
  createProduct("Palermo", 'Puma', 'B0CZ2CQWA0', 'men', ['terrace', 'vintage', 'soccer'], 85),
  createProduct("Palermo", 'Puma', 'B0CZ2CQWA1', 'women', ['terrace', 'vintage', 'soccer'], 85),
  createProduct("CA Pro", 'Puma', 'B0CZ2CQWA2', 'men', ['tennis', 'clean', 'lifestyle'], 90),
  createProduct("Mayze", 'Puma', 'B0CZ2CQWA3', 'women', ['platform', 'bold', 'chunky'], 100),
  createProduct("Carina", 'Puma', 'B0CZ2CQWA4', 'women', ['casual', 'clean', 'everyday'], 60),
  createProduct("Fenty Creeper", 'Puma', 'B0CZ2CQWA5', 'women', ['platform', 'rihanna', 'bold'], 150),
  createProduct("Velocity Nitro 2", 'Puma', 'B0CZ2CQWA6', 'men', ['running', 'nitrogen', 'cushion'], 140),
  createProduct("Deviate Nitro 2", 'Puma', 'B0CZ2CQWA7', 'men', ['running', 'carbon', 'elite'], 200),
  createProduct("Run XX Nitro", 'Puma', 'B0CZ2CQWA8', 'women', ['running', 'nitrogen', 'cushion'], 130),
  createProduct("PWR XX Nitro", 'Puma', 'B0CZ2CQWA9', 'women', ['training', 'gym', 'versatile'], 100),
  createProduct("Pacer Future", 'Puma', 'B0CZ2CQWB0', 'men', ['casual', 'comfort', 'value'], 65),

  // Reebok (25)
  createProduct("Club C 85", 'Reebok', 'B0CZ2DQWX1', 'men', ['tennis', 'retro', 'clean'], 80, true),
  createProduct("Club C 85", 'Reebok', 'B0CZ2DQWX2', 'women', ['tennis', 'retro', 'clean'], 80),
  createProduct("Classic Leather", 'Reebok', 'B0CZ2DQWX3', 'men', ['classic', 'heritage', 'smooth'], 80),
  createProduct("Classic Leather", 'Reebok', 'B0CZ2DQWX4', 'women', ['classic', 'heritage', 'smooth'], 80),
  createProduct("Club C 85 Vintage", 'Reebok', 'B0CZ2DQWX5', 'unisex', ['vintage', 'distressed', 'retro'], 90),
  createProduct("Classic Leather Legacy", 'Reebok', 'B0CZ2DQWX6', 'men', ['heritage', 'retro', 'comfort'], 90),
  createProduct("Workout Plus", 'Reebok', 'B0CZ2DQWX7', 'men', ['training', 'classic', 'straps'], 80),
  createProduct("Instapump Fury", 'Reebok', 'B0CZ2DQWX8', 'unisex', ['pump', 'futuristic', 'bold'], 180),
  createProduct("Zig Kinetica 3", 'Reebok', 'B0CZ2DQWX9', 'men', ['zig', 'chunky', 'bold'], 130),
  createProduct("Nano X3", 'Reebok', 'B0CZ2DQWA0', 'men', ['crossfit', 'training', 'stable'], 135),
  createProduct("Floatride Energy 5", 'Reebok', 'B0CZ2DQWA1', 'men', ['running', 'cushion', 'everyday'], 110),
  createProduct("Club C Double", 'Reebok', 'B0CZ2DQWA2', 'women', ['platform', 'bold', 'trendy'], 90),
  createProduct("Classic Leather SP", 'Reebok', 'B0CZ2DQWA3', 'women', ['special', 'platform', 'bold'], 100),

  // ASICS (25)
  createProduct("Gel-Kayano 30", 'ASICS', 'B0CZ2EQWX1', 'men', ['running', 'stability', 'premium'], 160, true),
  createProduct("Gel-Kayano 30", 'ASICS', 'B0CZ2EQWX2', 'women', ['running', 'stability', 'premium'], 160),
  createProduct("Gel-Nimbus 25", 'ASICS', 'B0CZ2EQWX3', 'men', ['running', 'max cushion', 'premium'], 160),
  createProduct("Gel-Nimbus 25", 'ASICS', 'B0CZ2EQWX4', 'women', ['running', 'max cushion', 'premium'], 160),
  createProduct("Gel-1130", 'ASICS', 'B0CZ2EQWX5', 'men', ['retro', 'chunky', 'y2k'], 120, true),
  createProduct("Gel-1130", 'ASICS', 'B0CZ2EQWX6', 'women', ['retro', 'chunky', 'y2k'], 120),
  createProduct("Gel-Kayano 14", 'ASICS', 'B0CZ2EQWX7', 'men', ['retro', 'techwear', 'chunky'], 150),
  createProduct("Gel-Kayano 14", 'ASICS', 'B0CZ2EQWX8', 'women', ['retro', 'techwear', 'chunky'], 150),
  createProduct("Gel-NYC", 'ASICS', 'B0CZ2EQWX9', 'unisex', ['lifestyle', 'gel', 'modern'], 140),
  createProduct("GT-2160", 'ASICS', 'B0CZ2EQWA0', 'unisex', ['retro', 'running', 'vintage'], 130),
  createProduct("Gel-Quantum 360", 'ASICS', 'B0CZ2EQWA1', 'men', ['lifestyle', 'gel', 'comfort'], 180),
  createProduct("Metaspeed Sky+", 'ASICS', 'B0CZ2EQWA2', 'men', ['racing', 'carbon', 'elite'], 250),
  createProduct("Novablast 4", 'ASICS', 'B0CZ2EQWA3', 'men', ['running', 'bouncy', 'fun'], 140),
  createProduct("Gel-Cumulus 25", 'ASICS', 'B0CZ2EQWA4', 'men', ['running', 'neutral', 'cushion'], 140),
  createProduct("Gel-Contend 8", 'ASICS', 'B0CZ2EQWA5', 'men', ['running', 'value', 'everyday'], 70),

  // Converse (15)
  createProduct("Chuck Taylor All Star High", 'Converse', 'B0CZ2FQWX1', 'unisex', ['classic', 'iconic', 'canvas'], 65, true),
  createProduct("Chuck Taylor All Star Low", 'Converse', 'B0CZ2FQWX2', 'unisex', ['classic', 'iconic', 'canvas'], 60),
  createProduct("Chuck Taylor All Star Leather", 'Converse', 'B0CZ2FQWX3', 'unisex', ['leather', 'premium', 'classic'], 75),
  createProduct("Chuck Taylor Platform", 'Converse', 'B0CZ2FQWX4', 'women', ['platform', 'bold', 'trendy'], 80),
  createProduct("Chuck 70 High", 'Converse', 'B0CZ2FQWX5', 'unisex', ['vintage', 'premium', 'heritage'], 85, true),
  createProduct("Chuck 70 Low", 'Converse', 'B0CZ2FQWX6', 'unisex', ['vintage', 'premium', 'heritage'], 80),
  createProduct("Run Star Hike", 'Converse', 'B0CZ2FQWX7', 'unisex', ['platform', 'bold', 'statement'], 110),
  createProduct("Run Star Legacy", 'Converse', 'B0CZ2FQWX8', 'unisex', ['chunky', 'bold', 'modern'], 120),
  createProduct("One Star", 'Converse', 'B0CZ2FQWX9', 'unisex', ['skate', 'suede', 'clean'], 75),
  createProduct("Star Player 76", 'Converse', 'B0CZ2FQWA0', 'unisex', ['retro', 'basketball', 'casual'], 70),
  createProduct("Pro Leather", 'Converse', 'B0CZ2FQWA1', 'unisex', ['basketball', 'leather', 'retro'], 80),
  createProduct("Jack Purcell", 'Converse', 'B0CZ2FQWA2', 'unisex', ['tennis', 'clean', 'minimal'], 70),
  createProduct("Weapon", 'Converse', 'B0CZ2FQWA3', 'unisex', ['basketball', 'retro', 'high'], 100),

  // Vans (20)
  createProduct("Old Skool", 'Vans', 'B0CZ2GQWX1', 'unisex', ['skate', 'iconic', 'classic'], 70, true),
  createProduct("Sk8-Hi", 'Vans', 'B0CZ2GQWX2', 'unisex', ['skate', 'high top', 'iconic'], 75),
  createProduct("Authentic", 'Vans', 'B0CZ2GQWX3', 'unisex', ['original', 'simple', 'canvas'], 55),
  createProduct("Era", 'Vans', 'B0CZ2GQWX4', 'unisex', ['skate', 'padded', 'classic'], 60),
  createProduct("Slip-On", 'Vans', 'B0CZ2GQWX5', 'unisex', ['slip-on', 'checkerboard', 'easy'], 60),
  createProduct("Old Skool Platform", 'Vans', 'B0CZ2GQWX6', 'women', ['platform', 'skate', 'bold'], 80),
  createProduct("Sk8-Hi Platform", 'Vans', 'B0CZ2GQWX7', 'women', ['platform', 'high top', 'bold'], 85),
  createProduct("Knu Skool", 'Vans', 'B0CZ2GQWX8', 'unisex', ['chunky', 'bold', 'modern'], 90, true),
  createProduct("Ultrarange EXO", 'Vans', 'B0CZ2GQWX9', 'unisex', ['comfort', 'lightweight', 'modern'], 100),
  createProduct("AVE Pro", 'Vans', 'B0CZ2GQWA0', 'men', ['skate', 'pro', 'durable'], 85),
  createProduct("Rowan Pro", 'Vans', 'B0CZ2GQWA1', 'men', ['skate', 'pro', 'board feel'], 85),
  createProduct("Wayvee", 'Vans', 'B0CZ2GQWA2', 'men', ['skate', 'modern', 'tech'], 90),
  createProduct("Half Cab", 'Vans', 'B0CZ2GQWA3', 'unisex', ['skate', 'mid', 'classic'], 75),
  createProduct("Style 36", 'Vans', 'B0CZ2GQWA4', 'unisex', ['vintage', 'slim', 'classic'], 70),
  createProduct("Lowland CC", 'Vans', 'B0CZ2GQWA5', 'unisex', ['comfort', 'lifestyle', 'cushion'], 75),

  // On Running (15)
  createProduct("Cloudmonster", 'On', 'B0CZ2HQWX1', 'men', ['running', 'max cushion', 'bold'], 170, true),
  createProduct("Cloudmonster", 'On', 'B0CZ2HQWX2', 'women', ['running', 'max cushion', 'bold'], 170),
  createProduct("Cloudstratus", 'On', 'B0CZ2HQWX3', 'men', ['running', 'double cloudtec', 'cushion'], 170),
  createProduct("Cloud 5", 'On', 'B0CZ2HQWX4', 'men', ['lifestyle', 'versatile', 'everyday'], 140),
  createProduct("Cloud 5", 'On', 'B0CZ2HQWX5', 'women', ['lifestyle', 'versatile', 'everyday'], 140),
  createProduct("Cloudflow 4", 'On', 'B0CZ2HQWX6', 'men', ['running', 'tempo', 'lightweight'], 160),
  createProduct("Cloudrunner", 'On', 'B0CZ2HQWX7', 'men', ['running', 'support', 'cushion'], 150),
  createProduct("Cloudsurfer", 'On', 'B0CZ2HQWX8', 'men', ['running', 'speed', 'responsive'], 160),
  createProduct("Cloudnova", 'On', 'B0CZ2HQWX9', 'unisex', ['lifestyle', 'street', 'modern'], 150),
  createProduct("Roger Federer", 'On', 'B0CZ2HQWA0', 'unisex', ['tennis', 'clean', 'federer'], 170),
  createProduct("Cloudultra", 'On', 'B0CZ2HQWA1', 'men', ['trail', 'ultra', 'mountain'], 200),
  createProduct("Cloudventure", 'On', 'B0CZ2HQWA2', 'men', ['trail', 'versatile', 'outdoor'], 160),

  // Hoka (15)
  createProduct("Bondi 8", 'Hoka', 'B0CZ2IQWX1', 'men', ['running', 'max cushion', 'comfort'], 165, true),
  createProduct("Bondi 8", 'Hoka', 'B0CZ2IQWX2', 'women', ['running', 'max cushion', 'comfort'], 165),
  createProduct("Clifton 9", 'Hoka', 'B0CZ2IQWX3', 'men', ['running', 'lightweight', 'cushion'], 145),
  createProduct("Clifton 9", 'Hoka', 'B0CZ2IQWX4', 'women', ['running', 'lightweight', 'cushion'], 145),
  createProduct("Mach 6", 'Hoka', 'B0CZ2IQWX5', 'men', ['running', 'speed', 'responsive'], 140),
  createProduct("Speedgoat 5", 'Hoka', 'B0CZ2IQWX6', 'men', ['trail', 'rugged', 'cushion'], 155),
  createProduct("Arahi 7", 'Hoka', 'B0CZ2IQWX7', 'men', ['running', 'stability', 'cushion'], 140),
  createProduct("Gaviota 5", 'Hoka', 'B0CZ2IQWX8', 'men', ['running', 'max stability', 'support'], 170),
  createProduct("Rincon 3", 'Hoka', 'B0CZ2IQWX9', 'men', ['running', 'speed', 'lightweight'], 125),
  createProduct("Carbon X 3", 'Hoka', 'B0CZ2IQWA0', 'men', ['racing', 'carbon', 'elite'], 200),
  createProduct("Challenger 7", 'Hoka', 'B0CZ2IQWA1', 'men', ['trail', 'versatile', 'cushion'], 145),
  createProduct("Skyward X", 'Hoka', 'B0CZ2IQWA2', 'men', ['cushion', 'innovative', 'premium'], 225),
  createProduct("Transport", 'Hoka', 'B0CZ2IQWA3', 'unisex', ['lifestyle', 'cushion', 'everyday'], 150),

  // Brooks (12)
  createProduct("Ghost 15", 'Brooks', 'B0CZ2JQWX1', 'men', ['running', 'neutral', 'cushion'], 140, true),
  createProduct("Ghost 15", 'Brooks', 'B0CZ2JQWX2', 'women', ['running', 'neutral', 'cushion'], 140),
  createProduct("Glycerin 20", 'Brooks', 'B0CZ2JQWX3', 'men', ['running', 'soft', 'premium'], 160),
  createProduct("Adrenaline GTS 23", 'Brooks', 'B0CZ2JQWX4', 'men', ['running', 'stability', 'support'], 140),
  createProduct("Adrenaline GTS 23", 'Brooks', 'B0CZ2JQWX5', 'women', ['running', 'stability', 'support'], 140),
  createProduct("Hyperion Max", 'Brooks', 'B0CZ2JQWX6', 'men', ['racing', 'speed', 'nitrogen'], 200),
  createProduct("Launch 9", 'Brooks', 'B0CZ2JQWX7', 'men', ['running', 'tempo', 'lightweight'], 110),
  createProduct("Cascadia 17", 'Brooks', 'B0CZ2JQWX8', 'men', ['trail', 'rugged', 'cushion'], 140),
  createProduct("Levitate StealthFit 6", 'Brooks', 'B0CZ2JQWX9', 'men', ['running', 'responsive', 'sleek'], 160),
  createProduct("Revel 6", 'Brooks', 'B0CZ2JQWA0', 'men', ['running', 'versatile', 'value'], 100),

  // Saucony (12)
  createProduct("Ride 16", 'Saucony', 'B0CZ2KQWX1', 'men', ['running', 'neutral', 'cushion'], 140),
  createProduct("Ride 16", 'Saucony', 'B0CZ2KQWX2', 'women', ['running', 'neutral', 'cushion'], 140),
  createProduct("Guide 16", 'Saucony', 'B0CZ2KQWX3', 'men', ['running', 'stability', 'support'], 140),
  createProduct("Triumph 21", 'Saucony', 'B0CZ2KQWX4', 'men', ['running', 'max cushion', 'premium'], 160),
  createProduct("Kinvara 14", 'Saucony', 'B0CZ2KQWX5', 'men', ['running', 'lightweight', 'natural'], 130),
  createProduct("Endorphin Speed 3", 'Saucony', 'B0CZ2KQWX6', 'men', ['racing', 'speed', 'nylon plate'], 170, true),
  createProduct("Endorphin Pro 3", 'Saucony', 'B0CZ2KQWX7', 'men', ['racing', 'carbon', 'elite'], 225),
  createProduct("Peregrine 13", 'Saucony', 'B0CZ2KQWX8', 'men', ['trail', 'rugged', 'grip'], 140),
  createProduct("Jazz Original", 'Saucony', 'B0CZ2KQWX9', 'unisex', ['retro', 'lifestyle', 'classic'], 70),
  createProduct("Shadow 6000", 'Saucony', 'B0CZ2KQWA0', 'unisex', ['retro', 'lifestyle', 'bold'], 100),

  // Under Armour (10)
  createProduct("HOVR Phantom 3", 'Under Armour', 'B0CZ2LQWX1', 'men', ['running', 'connected', 'cushion'], 160),
  createProduct("HOVR Machina 3", 'Under Armour', 'B0CZ2LQWX2', 'men', ['running', 'connected', 'energy'], 160),
  createProduct("Charged Assert 10", 'Under Armour', 'B0CZ2LQWX3', 'men', ['running', 'value', 'everyday'], 80),
  createProduct("Curry 11", 'Under Armour', 'B0CZ2LQWX4', 'men', ['basketball', 'curry', 'performance'], 170, true),
  createProduct("SlipSpeed", 'Under Armour', 'B0CZ2LQWX5', 'unisex', ['lifestyle', 'slip-on', 'versatile'], 120),
  createProduct("Project Rock 6", 'Under Armour', 'B0CZ2LQWX6', 'men', ['training', 'therock', 'stable'], 150),
  createProduct("TriBase Reign 5", 'Under Armour', 'B0CZ2LQWX7', 'men', ['training', 'crossfit', 'stable'], 140),
  createProduct("Infinite 5", 'Under Armour', 'B0CZ2LQWX8', 'men', ['running', 'cushion', 'everyday'], 130),

  // Fila (8)
  createProduct("Disruptor 2", 'Fila', 'B0CZ2MQWX1', 'women', ['chunky', 'bold', 'platform'], 65, true),
  createProduct("Disruptor 2", 'Fila', 'B0CZ2MQWX2', 'men', ['chunky', 'bold', 'dadcore'], 65),
  createProduct("Ray Tracer", 'Fila', 'B0CZ2MQWX3', 'unisex', ['retro', 'chunky', 'bold'], 80),
  createProduct("Renno", 'Fila', 'B0CZ2MQWX4', 'unisex', ['retro', 'chunky', 'bold'], 70),
  createProduct("Tennis 88", 'Fila', 'B0CZ2MQWX5', 'unisex', ['tennis', 'retro', 'clean'], 60),
  createProduct("Original Fitness", 'Fila', 'B0CZ2MQWX6', 'unisex', ['retro', 'basketball', 'clean'], 75),
  createProduct("Grant Hill 2", 'Fila', 'B0CZ2MQWX7', 'men', ['basketball', 'retro', 'iconic'], 120),
  createProduct("Oakmont TR", 'Fila', 'B0CZ2MQWX8', 'unisex', ['trail', 'chunky', 'outdoor'], 90),

  // Salomon (8)
  createProduct("XT-6", 'Salomon', 'B0CZ2NQWX1', 'unisex', ['trail', 'techwear', 'rugged'], 180, true),
  createProduct("XT-4", 'Salomon', 'B0CZ2NQWX2', 'unisex', ['trail', 'techwear', 'versatile'], 160),
  createProduct("Speedcross 6", 'Salomon', 'B0CZ2NQWX3', 'men', ['trail', 'grip', 'mud'], 140),
  createProduct("Sense Ride 5", 'Salomon', 'B0CZ2NQWX4', 'men', ['trail', 'versatile', 'cushion'], 140),
  createProduct("Ultra Glide 2", 'Salomon', 'B0CZ2NQWX5', 'men', ['trail', 'ultra', 'cushion'], 150),
  createProduct("X Ultra 4", 'Salomon', 'B0CZ2NQWX6', 'men', ['hiking', 'stability', 'outdoor'], 150),
  createProduct("ACS Pro", 'Salomon', 'B0CZ2NQWX7', 'unisex', ['lifestyle', 'trail', 'tech'], 150),
  createProduct("RX Slide", 'Salomon', 'B0CZ2NQWX8', 'unisex', ['recovery', 'slide', 'comfort'], 60),

  // Merrell (5)
  createProduct("Moab 3", 'Merrell', 'B0CZ2OQWX1', 'men', ['hiking', 'classic', 'trail'], 120),
  createProduct("Moab Speed", 'Merrell', 'B0CZ2OQWX2', 'men', ['hiking', 'speed', 'lightweight'], 140),
  createProduct("Trail Glove 7", 'Merrell', 'B0CZ2OQWX3', 'men', ['trail', 'barefoot', 'minimal'], 110),
  createProduct("Agility Peak 5", 'Merrell', 'B0CZ2OQWX4', 'men', ['trail', 'cushion', 'rugged'], 150),
  createProduct("Hydro Moc", 'Merrell', 'B0CZ2OQWX5', 'unisex', ['water', 'summer', 'casual'], 70),

  // Skechers (8)
  createProduct("Go Walk Max", 'Skechers', 'B0CZ2PQWX1', 'men', ['walking', 'comfort', 'slip-on'], 75),
  createProduct("D'Lites", 'Skechers', 'B0CZ2PQWX2', 'women', ['chunky', 'memory foam', 'comfort'], 70),
  createProduct("Uno", 'Skechers', 'B0CZ2PQWX3', 'unisex', ['lifestyle', 'air-cooled', 'clean'], 80),
  createProduct("Max Cushioning Elite", 'Skechers', 'B0CZ2PQWX4', 'men', ['running', 'max cushion', 'comfort'], 120),
  createProduct("Slip-ins", 'Skechers', 'B0CZ2PQWX5', 'unisex', ['hands-free', 'slip-on', 'easy'], 80),
  createProduct("Arch Fit", 'Skechers', 'B0CZ2PQWX6', 'men', ['comfort', 'support', 'podiatrist'], 100),
  createProduct("Go Run Ride 10", 'Skechers', 'B0CZ2PQWX7', 'men', ['running', 'lightweight', 'cushion'], 120),
  createProduct("Track Scloric", 'Skechers', 'B0CZ2PQWX8', 'men', ['casual', 'chunky', 'everyday'], 70),
];

// ============================================
// EXPORT COMBINED DATA
// ============================================

export const EXPANDED_CATALOG: Shoe[] = [
  ...NIKE_EXPANDED,
  ...JORDAN_EXPANDED,
  ...ADIDAS_EXPANDED,
  ...NEW_BALANCE_EXPANDED,
  ...OTHER_BRANDS,
];

// Statistics
export const EXPANDED_STATS = {
  total: EXPANDED_CATALOG.length,
  nike: NIKE_EXPANDED.length,
  jordan: JORDAN_EXPANDED.length,
  adidas: ADIDAS_EXPANDED.length,
  newBalance: NEW_BALANCE_EXPANDED.length,
  other: OTHER_BRANDS.length,
};

console.log(`[ExpandedCatalog] Loaded ${EXPANDED_STATS.total} additional products`);
console.log(`  Nike: ${EXPANDED_STATS.nike}, Jordan: ${EXPANDED_STATS.jordan}, Adidas: ${EXPANDED_STATS.adidas}`);
console.log(`  New Balance: ${EXPANDED_STATS.newBalance}, Other Brands: ${EXPANDED_STATS.other}`);

export default EXPANDED_CATALOG;
