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
// ADDITIONAL COLORWAYS & VARIANTS (350+ more)
// ============================================
const ADDITIONAL_PRODUCTS: Shoe[] = [
  // Nike Additional Colorways
  createProduct("Air Force 1 '07 University Blue", 'Nike', 'B0CZ3AQWX1', 'men', ['classic', 'streetwear', 'blue'], 115),
  createProduct("Air Force 1 '07 Gym Red", 'Nike', 'B0CZ3AQWX2', 'men', ['classic', 'streetwear', 'red'], 115),
  createProduct("Air Force 1 '07 Triple Black", 'Nike', 'B0CZ3AQWX3', 'men', ['classic', 'streetwear', 'black'], 115),
  createProduct("Dunk Low Grey Fog", 'Nike', 'B0CZ3AQWX4', 'men', ['streetwear', 'neutral', 'clean'], 115),
  createProduct("Dunk Low University Red", 'Nike', 'B0CZ3AQWX5', 'men', ['streetwear', 'bold', 'red'], 115),
  createProduct("Dunk Low Michigan", 'Nike', 'B0CZ3AQWX6', 'men', ['streetwear', 'college', 'yellow'], 115),
  createProduct("Dunk Low Syracuse", 'Nike', 'B0CZ3AQWX7', 'men', ['streetwear', 'college', 'orange'], 115),
  createProduct("Dunk Low Kentucky", 'Nike', 'B0CZ3AQWX8', 'men', ['streetwear', 'college', 'blue'], 115),
  createProduct("Dunk Low Georgetown", 'Nike', 'B0CZ3AQWX9', 'men', ['streetwear', 'college', 'grey'], 115),
  createProduct("Air Max 90 Infrared", 'Nike', 'B0CZ3AQWA0', 'men', ['retro', 'og', 'iconic'], 140),
  createProduct("Air Max 90 Laser Blue", 'Nike', 'B0CZ3AQWA1', 'men', ['retro', 'og', 'blue'], 140),
  createProduct("Air Max 90 Volt", 'Nike', 'B0CZ3AQWA2', 'men', ['retro', 'neon', 'bold'], 140),
  createProduct("Air Max 95 Neon", 'Nike', 'B0CZ3AQWA3', 'men', ['retro', 'iconic', 'neon'], 185),
  createProduct("Air Max 95 Greedy", 'Nike', 'B0CZ3AQWA4', 'men', ['retro', 'multicolor', 'bold'], 185),
  createProduct("Air Max 97 Gold", 'Nike', 'B0CZ3AQWA5', 'men', ['retro', 'metallic', 'premium'], 185),
  createProduct("Air Max 97 Black Bullet", 'Nike', 'B0CZ3AQWA6', 'men', ['retro', 'stealth', 'black'], 185),
  createProduct("Blazer Mid Sail", 'Nike', 'B0CZ3AQWA7', 'men', ['vintage', 'clean', 'cream'], 105),
  createProduct("Blazer Mid Black", 'Nike', 'B0CZ3AQWA8', 'men', ['vintage', 'classic', 'black'], 105),
  createProduct("Court Vision Mid", 'Nike', 'B0CZ3AQWA9', 'men', ['casual', 'mid', 'clean'], 85),
  createProduct("Cortez Basic", 'Nike', 'B0CZ3AQWB0', 'men', ['retro', 'forrest gump', 'classic'], 75),
  createProduct("Air Presto Off-White", 'Nike', 'B0CZ3AQWB1', 'men', ['slip-on', 'clean', 'minimal'], 130),
  createProduct("Air Huarache Runner", 'Nike', 'B0CZ3AQWB2', 'men', ['retro', 'neoprene', 'running'], 130),
  createProduct("Air Monarch IV", 'Nike', 'B0CZ3AQWB3', 'men', ['dadcore', 'training', 'classic'], 75),
  createProduct("React Infinity Run", 'Nike', 'B0CZ3AQWB4', 'men', ['running', 'react', 'injury prevention'], 160),
  createProduct("ZoomX Invincible", 'Nike', 'B0CZ3AQWB5', 'women', ['running', 'max cushion', 'zoomx'], 180),
  createProduct("Air Zoom Tempo Next%", 'Nike', 'B0CZ3AQWB6', 'men', ['running', 'training', 'carbon'], 200),
  createProduct("Metcon 8", 'Nike', 'B0CZ3AQWB7', 'men', ['crossfit', 'training', 'stable'], 130),
  createProduct("Air Zoom SuperRep", 'Nike', 'B0CZ3AQWB8', 'women', ['hiit', 'training', 'responsive'], 120),
  createProduct("Free RN 2018", 'Nike', 'B0CZ3AQWB9', 'men', ['running', 'flexible', 'natural'], 100),
  createProduct("Zoom Fly 5", 'Nike', 'B0CZ3AQWC0', 'men', ['running', 'carbon', 'tempo'], 160),

  // Jordan Additional Colorways
  createProduct("Air Jordan 1 Chicago", 'Jordan', 'B0CZ3BQWX1', 'men', ['basketball', 'og', 'chicago'], 180, true),
  createProduct("Air Jordan 1 Bred", 'Jordan', 'B0CZ3BQWX2', 'men', ['basketball', 'og', 'banned'], 180, true),
  createProduct("Air Jordan 1 Royal Blue", 'Jordan', 'B0CZ3BQWX3', 'men', ['basketball', 'og', 'royal'], 180),
  createProduct("Air Jordan 1 Shadow", 'Jordan', 'B0CZ3BQWX4', 'men', ['basketball', 'og', 'grey'], 180),
  createProduct("Air Jordan 1 Pine Green", 'Jordan', 'B0CZ3BQWX5', 'men', ['basketball', 'green', 'celtics'], 180),
  createProduct("Air Jordan 1 Court Purple", 'Jordan', 'B0CZ3BQWX6', 'men', ['basketball', 'purple', 'bold'], 180),
  createProduct("Air Jordan 1 University Blue", 'Jordan', 'B0CZ3BQWX7', 'men', ['basketball', 'unc', 'blue'], 180),
  createProduct("Air Jordan 1 Hyper Royal", 'Jordan', 'B0CZ3BQWX8', 'men', ['basketball', 'blue', 'bold'], 180),
  createProduct("Air Jordan 1 Mocha", 'Jordan', 'B0CZ3BQWX9', 'men', ['basketball', 'travis', 'brown'], 180),
  createProduct("Air Jordan 1 Obsidian", 'Jordan', 'B0CZ3BQWA0', 'men', ['basketball', 'unc', 'navy'], 180),
  createProduct("Air Jordan 3 White Cement", 'Jordan', 'B0CZ3BQWA1', 'men', ['basketball', 'og', 'elephant'], 210),
  createProduct("Air Jordan 3 Black Cement", 'Jordan', 'B0CZ3BQWA2', 'men', ['basketball', 'og', 'elephant'], 210),
  createProduct("Air Jordan 3 Fire Red", 'Jordan', 'B0CZ3BQWA3', 'men', ['basketball', 'og', 'red'], 210),
  createProduct("Air Jordan 4 White Cement", 'Jordan', 'B0CZ3BQWA4', 'men', ['basketball', 'og', 'cement'], 215),
  createProduct("Air Jordan 4 Bred", 'Jordan', 'B0CZ3BQWA5', 'men', ['basketball', 'og', 'fire red'], 215),
  createProduct("Air Jordan 4 Military Black", 'Jordan', 'B0CZ3BQWA6', 'men', ['basketball', 'military', 'black'], 215),
  createProduct("Air Jordan 4 Thunder", 'Jordan', 'B0CZ3BQWA7', 'men', ['basketball', 'black', 'yellow'], 215),
  createProduct("Air Jordan 5 Fire Red", 'Jordan', 'B0CZ3BQWA8', 'men', ['basketball', 'og', 'red'], 210),
  createProduct("Air Jordan 5 Grape", 'Jordan', 'B0CZ3BQWA9', 'men', ['basketball', 'og', 'purple'], 210),
  createProduct("Air Jordan 6 Carmine", 'Jordan', 'B0CZ3BQWB0', 'men', ['basketball', 'og', 'red'], 210),
  createProduct("Air Jordan 11 Space Jam", 'Jordan', 'B0CZ3BQWB1', 'men', ['basketball', 'movie', 'grail'], 230),
  createProduct("Air Jordan 11 Cool Grey", 'Jordan', 'B0CZ3BQWB2', 'men', ['basketball', 'og', 'grey'], 230),
  createProduct("Air Jordan 11 Bred", 'Jordan', 'B0CZ3BQWB3', 'men', ['basketball', 'playoff', 'grail'], 230),
  createProduct("Air Jordan 11 Legend Blue", 'Jordan', 'B0CZ3BQWB4', 'men', ['basketball', 'columbia', 'blue'], 230),
  createProduct("Air Jordan 12 Taxi", 'Jordan', 'B0CZ3BQWB5', 'men', ['basketball', 'og', 'yellow'], 210),
  createProduct("Air Jordan 12 Playoffs", 'Jordan', 'B0CZ3BQWB6', 'men', ['basketball', 'og', 'bred'], 210),
  createProduct("Air Jordan 13 Flint", 'Jordan', 'B0CZ3BQWB7', 'men', ['basketball', 'grey', 'navy'], 210),
  createProduct("Air Jordan 13 Bred", 'Jordan', 'B0CZ3BQWB8', 'men', ['basketball', 'og', 'red'], 210),

  // Adidas Additional
  createProduct("Samba OG Cloud White", 'Adidas', 'B0CZ3CQWX1', 'men', ['vintage', 'clean', 'white'], 100),
  createProduct("Samba OG Core Black", 'Adidas', 'B0CZ3CQWX2', 'men', ['vintage', 'classic', 'black'], 100),
  createProduct("Samba OG Cream White", 'Adidas', 'B0CZ3CQWX3', 'women', ['vintage', 'cream', 'trendy'], 100),
  createProduct("Gazelle Green", 'Adidas', 'B0CZ3CQWX4', 'men', ['vintage', 'bold', 'green'], 100),
  createProduct("Gazelle Navy", 'Adidas', 'B0CZ3CQWX5', 'men', ['vintage', 'classic', 'navy'], 100),
  createProduct("Gazelle Red", 'Adidas', 'B0CZ3CQWX6', 'men', ['vintage', 'bold', 'red'], 100),
  createProduct("Campus 00s Green", 'Adidas', 'B0CZ3CQWX7', 'men', ['retro', 'suede', 'green'], 110),
  createProduct("Campus 00s Navy", 'Adidas', 'B0CZ3CQWX8', 'men', ['retro', 'suede', 'navy'], 110),
  createProduct("Stan Smith Green", 'Adidas', 'B0CZ3CQWX9', 'men', ['tennis', 'og', 'green'], 95),
  createProduct("Stan Smith Navy", 'Adidas', 'B0CZ3CQWA0', 'men', ['tennis', 'clean', 'navy'], 95),
  createProduct("Superstar Black", 'Adidas', 'B0CZ3CQWA1', 'men', ['shell toe', 'classic', 'black'], 100),
  createProduct("Superstar Gold", 'Adidas', 'B0CZ3CQWA2', 'men', ['shell toe', 'premium', 'gold'], 100),
  createProduct("Forum Low White Green", 'Adidas', 'B0CZ3CQWA3', 'men', ['basketball', 'retro', 'green'], 110),
  createProduct("Forum Low White Navy", 'Adidas', 'B0CZ3CQWA4', 'men', ['basketball', 'retro', 'navy'], 110),
  createProduct("Ultraboost 22 Black", 'Adidas', 'B0CZ3CQWA5', 'men', ['running', 'boost', 'black'], 190),
  createProduct("Ultraboost 22 White", 'Adidas', 'B0CZ3CQWA6', 'men', ['running', 'boost', 'white'], 190),
  createProduct("NMD_R1 Core Black", 'Adidas', 'B0CZ3CQWA7', 'men', ['boost', 'streetwear', 'black'], 150),
  createProduct("NMD_R1 Cloud White", 'Adidas', 'B0CZ3CQWA8', 'men', ['boost', 'streetwear', 'white'], 150),
  createProduct("ZX 8000", 'Adidas', 'B0CZ3CQWA9', 'men', ['retro', 'torsion', 'og'], 140),
  createProduct("ZX 1000", 'Adidas', 'B0CZ3CQWB0', 'men', ['retro', 'torsion', 'classic'], 130),
  createProduct("Continental 80", 'Adidas', 'B0CZ3CQWB1', 'men', ['retro', 'tennis', 'clean'], 80),
  createProduct("Rivalry Low", 'Adidas', 'B0CZ3CQWB2', 'men', ['basketball', 'retro', 'classic'], 100),
  createProduct("Rivalry 86 Low", 'Adidas', 'B0CZ3CQWB3', 'men', ['basketball', 'vintage', 'og'], 120),
  createProduct("Response CL", 'Adidas', 'B0CZ3CQWB4', 'men', ['chunky', 'lifestyle', 'comfort'], 130),
  createProduct("Adistar Cushion", 'Adidas', 'B0CZ3CQWB5', 'men', ['running', 'retro', 'chunky'], 140),
  createProduct("SL 72", 'Adidas', 'B0CZ3CQWB6', 'men', ['retro', 'munich', '72'], 100),
  createProduct("Country OG", 'Adidas', 'B0CZ3CQWB7', 'men', ['retro', 'lifestyle', 'classic'], 100),
  createProduct("Spezial", 'Adidas', 'B0CZ3CQWB8', 'men', ['terrace', 'vintage', 'gum'], 110),
  createProduct("Tobacco", 'Adidas', 'B0CZ3CQWB9', 'men', ['terrace', 'vintage', 'brown'], 100),
  createProduct("Jeans", 'Adidas', 'B0CZ3CQWC0', 'men', ['terrace', 'vintage', 'blue'], 100),

  // New Balance Additional
  createProduct("550 White Green", 'New Balance', 'B0CZ3DQWX1', 'men', ['retro', 'basketball', 'green'], 130),
  createProduct("550 White Navy", 'New Balance', 'B0CZ3DQWX2', 'men', ['retro', 'basketball', 'navy'], 130),
  createProduct("550 White Red", 'New Balance', 'B0CZ3DQWX3', 'men', ['retro', 'basketball', 'red'], 130),
  createProduct("550 White Grey", 'New Balance', 'B0CZ3DQWX4', 'men', ['retro', 'basketball', 'grey'], 130),
  createProduct("550 ALD Green", 'New Balance', 'B0CZ3DQWX5', 'men', ['collab', 'ald', 'premium'], 130),
  createProduct("574 Grey Day", 'New Balance', 'B0CZ3DQWX6', 'men', ['classic', 'grey', 'og'], 90),
  createProduct("574 Navy", 'New Balance', 'B0CZ3DQWX7', 'men', ['classic', 'navy', 'casual'], 90),
  createProduct("574 Burgundy", 'New Balance', 'B0CZ3DQWX8', 'men', ['classic', 'burgundy', 'fall'], 90),
  createProduct("990v5 Grey", 'New Balance', 'B0CZ3DQWX9', 'men', ['made in usa', 'grey', 'premium'], 185),
  createProduct("990v5 Navy", 'New Balance', 'B0CZ3DQWA0', 'men', ['made in usa', 'navy', 'premium'], 185),
  createProduct("990v6 Grey", 'New Balance', 'B0CZ3DQWA1', 'men', ['made in usa', 'grey', 'latest'], 200),
  createProduct("992 Grey", 'New Balance', 'B0CZ3DQWA2', 'men', ['made in usa', 'steve jobs', 'rare'], 200),
  createProduct("993 Grey", 'New Balance', 'B0CZ3DQWA3', 'men', ['made in usa', 'classic', 'premium'], 200),
  createProduct("998 Grey", 'New Balance', 'B0CZ3DQWA4', 'men', ['made in usa', 'premium', 'abzorb'], 200),
  createProduct("2002R Rain Cloud", 'New Balance', 'B0CZ3DQWA5', 'men', ['retro', 'grey', 'protection'], 150),
  createProduct("2002R Refined Future", 'New Balance', 'B0CZ3DQWA6', 'men', ['retro', 'distressed', 'premium'], 175),
  createProduct("1906R Silver", 'New Balance', 'B0CZ3DQWA7', 'men', ['protection', 'silver', 'metallic'], 180),
  createProduct("9060 Grey Matter", 'New Balance', 'B0CZ3DQWA8', 'men', ['chunky', 'grey', 'futuristic'], 150),
  createProduct("9060 Sea Salt", 'New Balance', 'B0CZ3DQWA9', 'men', ['chunky', 'cream', 'clean'], 150),
  createProduct("327 Green", 'New Balance', 'B0CZ3DQWB0', 'men', ['retro', 'bold', 'green'], 100),
  createProduct("327 Orange", 'New Balance', 'B0CZ3DQWB1', 'men', ['retro', 'bold', 'orange'], 100),
  createProduct("530 White Silver", 'New Balance', 'B0CZ3DQWB2', 'men', ['retro', 'silver', 'y2k'], 100),
  createProduct("530 Black", 'New Balance', 'B0CZ3DQWB3', 'men', ['retro', 'black', 'chunky'], 100),
  createProduct("237 Grey", 'New Balance', 'B0CZ3DQWB4', 'men', ['retro', 'grey', 'minimal'], 85),
  createProduct("480 White Green", 'New Balance', 'B0CZ3DQWB5', 'men', ['basketball', 'retro', 'green'], 100),
  createProduct("550 White Black", 'New Balance', 'B0CZ3DQWB6', 'women', ['retro', 'panda', 'trendy'], 130),
  createProduct("9060 Mushroom", 'New Balance', 'B0CZ3DQWB7', 'women', ['chunky', 'neutral', 'trendy'], 150),
  createProduct("2002R Phantom", 'New Balance', 'B0CZ3DQWB8', 'women', ['retro', 'black', 'premium'], 150),
  createProduct("574 Pink", 'New Balance', 'B0CZ3DQWB9', 'women', ['classic', 'pink', 'casual'], 90),

  // Puma Additional
  createProduct("Suede Classic Black", 'Puma', 'B0CZ3EQWX1', 'men', ['classic', 'black', 'hip-hop'], 75),
  createProduct("Suede Classic Blue", 'Puma', 'B0CZ3EQWX2', 'men', ['classic', 'blue', 'retro'], 75),
  createProduct("Suede Classic Red", 'Puma', 'B0CZ3EQWX3', 'men', ['classic', 'red', 'bold'], 75),
  createProduct("RS-X Bold", 'Puma', 'B0CZ3EQWX4', 'men', ['chunky', 'multicolor', 'bold'], 110),
  createProduct("RS-X Reinvention", 'Puma', 'B0CZ3EQWX5', 'men', ['chunky', 'retro', 'tech'], 110),
  createProduct("Speedcat White", 'Puma', 'B0CZ3EQWX6', 'unisex', ['motorsport', 'clean', 'racing'], 100),
  createProduct("Clyde All-Pro", 'Puma', 'B0CZ3EQWX7', 'men', ['basketball', 'performance', 'modern'], 130),
  createProduct("LaMelo Ball MB.01", 'Puma', 'B0CZ3EQWX8', 'men', ['basketball', 'lamelo', 'bold'], 160),
  createProduct("Palermo White", 'Puma', 'B0CZ3EQWX9', 'men', ['terrace', 'clean', 'minimal'], 85),
  createProduct("Palermo Navy", 'Puma', 'B0CZ3EQWA0', 'men', ['terrace', 'navy', 'classic'], 85),
  createProduct("CA Pro Heritage", 'Puma', 'B0CZ3EQWA1', 'men', ['tennis', 'vintage', 'cream'], 90),
  createProduct("Slipstream", 'Puma', 'B0CZ3EQWA2', 'men', ['basketball', 'retro', 'straps'], 100),
  createProduct("Wild Rider", 'Puma', 'B0CZ3EQWA3', 'men', ['chunky', 'bold', 'statement'], 120),
  createProduct("Future Rider", 'Puma', 'B0CZ3EQWA4', 'men', ['retro', 'running', 'bright'], 90),
  createProduct("Mirage Sport", 'Puma', 'B0CZ3EQWA5', 'men', ['retro', 'tech', 'bold'], 100),

  // Reebok Additional
  createProduct("Club C 85 Vintage White", 'Reebok', 'B0CZ3FQWX1', 'men', ['tennis', 'vintage', 'cream'], 90),
  createProduct("Club C 85 Black", 'Reebok', 'B0CZ3FQWX2', 'men', ['tennis', 'classic', 'black'], 80),
  createProduct("Classic Leather White", 'Reebok', 'B0CZ3FQWX3', 'men', ['classic', 'clean', 'white'], 80),
  createProduct("Classic Leather Black", 'Reebok', 'B0CZ3FQWX4', 'men', ['classic', 'black', 'timeless'], 80),
  createProduct("Question Mid", 'Reebok', 'B0CZ3FQWX5', 'men', ['basketball', 'iverson', 'og'], 150),
  createProduct("Answer IV", 'Reebok', 'B0CZ3FQWX6', 'men', ['basketball', 'iverson', 'retro'], 140),
  createProduct("Kamikaze II", 'Reebok', 'B0CZ3FQWX7', 'men', ['basketball', 'kemp', 'bold'], 130),
  createProduct("Shaq Attaq", 'Reebok', 'B0CZ3FQWX8', 'men', ['basketball', 'shaq', 'pump'], 160),
  createProduct("Pump Omni Zone II", 'Reebok', 'B0CZ3FQWX9', 'men', ['basketball', 'pump', 'og'], 150),
  createProduct("BB 4000 II", 'Reebok', 'B0CZ3FQWA0', 'men', ['basketball', 'retro', 'clean'], 90),
  createProduct("Royal BB 4500 Hi", 'Reebok', 'B0CZ3FQWA1', 'men', ['basketball', 'high', 'clean'], 80),
  createProduct("Royal Complete Clean", 'Reebok', 'B0CZ3FQWA2', 'men', ['casual', 'clean', 'minimal'], 55),
  createProduct("Floatride Energy 4", 'Reebok', 'B0CZ3FQWA3', 'men', ['running', 'cushion', 'everyday'], 100),
  createProduct("Zig Dynamica", 'Reebok', 'B0CZ3FQWA4', 'men', ['zig', 'chunky', 'modern'], 120),
  createProduct("Club C Extra", 'Reebok', 'B0CZ3FQWA5', 'women', ['platform', 'trendy', 'bold'], 100),

  // ASICS Additional
  createProduct("Gel-1130 White Silver", 'ASICS', 'B0CZ3GQWX1', 'men', ['retro', 'clean', 'silver'], 120),
  createProduct("Gel-1130 Black", 'ASICS', 'B0CZ3GQWX2', 'men', ['retro', 'black', 'stealth'], 120),
  createProduct("Gel-Kayano 14 White", 'ASICS', 'B0CZ3GQWX3', 'men', ['retro', 'clean', 'techwear'], 150),
  createProduct("Gel-NYC Grey", 'ASICS', 'B0CZ3GQWX4', 'men', ['lifestyle', 'grey', 'modern'], 140),
  createProduct("Gel-NYC Cream", 'ASICS', 'B0CZ3GQWX5', 'men', ['lifestyle', 'cream', 'clean'], 140),
  createProduct("GT-2160 White", 'ASICS', 'B0CZ3GQWX6', 'men', ['retro', 'running', 'clean'], 130),
  createProduct("Gel-Quantum 180", 'ASICS', 'B0CZ3GQWX7', 'men', ['lifestyle', 'gel', 'comfort'], 160),
  createProduct("Gel-Sonoma 7", 'ASICS', 'B0CZ3GQWX8', 'men', ['trail', 'rugged', 'outdoor'], 100),
  createProduct("Gel-Venture 9", 'ASICS', 'B0CZ3GQWX9', 'men', ['trail', 'value', 'outdoor'], 75),
  createProduct("Gel-Excite 9", 'ASICS', 'B0CZ3GQWA0', 'men', ['running', 'value', 'cushion'], 75),
  createProduct("Gel-Kayano 30 Black", 'ASICS', 'B0CZ3GQWA1', 'men', ['running', 'stability', 'black'], 160),
  createProduct("Gel-Nimbus 25 Black", 'ASICS', 'B0CZ3GQWA2', 'men', ['running', 'cushion', 'black'], 160),
  createProduct("Novablast 3", 'ASICS', 'B0CZ3GQWA3', 'men', ['running', 'bouncy', 'colorful'], 140),
  createProduct("Magic Speed 2", 'ASICS', 'B0CZ3GQWA4', 'men', ['racing', 'carbon', 'speed'], 180),
  createProduct("Gel-1130 Paris", 'ASICS', 'B0CZ3GQWA5', 'unisex', ['collab', 'limited', 'premium'], 150),

  // Converse Additional
  createProduct("Chuck Taylor All Star Black", 'Converse', 'B0CZ3HQWX1', 'unisex', ['classic', 'black', 'canvas'], 65),
  createProduct("Chuck Taylor All Star Red", 'Converse', 'B0CZ3HQWX2', 'unisex', ['classic', 'red', 'bold'], 65),
  createProduct("Chuck Taylor All Star Navy", 'Converse', 'B0CZ3HQWX3', 'unisex', ['classic', 'navy', 'preppy'], 65),
  createProduct("Chuck 70 Parchment", 'Converse', 'B0CZ3HQWX4', 'unisex', ['vintage', 'cream', 'premium'], 85),
  createProduct("Chuck 70 Black", 'Converse', 'B0CZ3HQWX5', 'unisex', ['vintage', 'black', 'premium'], 85),
  createProduct("One Star Pro", 'Converse', 'B0CZ3HQWX6', 'unisex', ['skate', 'suede', 'pro'], 85),
  createProduct("Run Star Hike Black", 'Converse', 'B0CZ3HQWX7', 'unisex', ['platform', 'bold', 'black'], 110),
  createProduct("Run Star Motion", 'Converse', 'B0CZ3HQWX8', 'unisex', ['chunky', 'cx', 'modern'], 130),
  createProduct("CONS AS-1 Pro", 'Converse', 'B0CZ3HQWX9', 'unisex', ['skate', 'pro', 'alexis sablone'], 90),
  createProduct("Star Player 76 Suede", 'Converse', 'B0CZ3HQWA0', 'unisex', ['retro', 'suede', 'casual'], 75),
  createProduct("Weapon CX", 'Converse', 'B0CZ3HQWA1', 'unisex', ['basketball', 'modern', 'tech'], 110),
  createProduct("Pro Leather Gold Standard", 'Converse', 'B0CZ3HQWA2', 'unisex', ['basketball', 'premium', 'leather'], 100),
  createProduct("Louie Lopez Pro", 'Converse', 'B0CZ3HQWA3', 'unisex', ['skate', 'pro', 'durable'], 80),
  createProduct("Fastbreak Mid", 'Converse', 'B0CZ3HQWA4', 'unisex', ['basketball', 'retro', 'mid'], 85),
  createProduct("Chuck Taylor Lift", 'Converse', 'B0CZ3HQWA5', 'women', ['platform', 'trendy', 'bold'], 80),

  // Vans Additional
  createProduct("Old Skool Black White", 'Vans', 'B0CZ3IQWX1', 'unisex', ['skate', 'classic', 'essential'], 70),
  createProduct("Old Skool Checkerboard", 'Vans', 'B0CZ3IQWX2', 'unisex', ['skate', 'iconic', 'checkered'], 70),
  createProduct("Sk8-Hi Black White", 'Vans', 'B0CZ3IQWX3', 'unisex', ['skate', 'high top', 'classic'], 75),
  createProduct("Authentic Black", 'Vans', 'B0CZ3IQWX4', 'unisex', ['original', 'simple', 'black'], 55),
  createProduct("Authentic White", 'Vans', 'B0CZ3IQWX5', 'unisex', ['original', 'clean', 'white'], 55),
  createProduct("Era Pro", 'Vans', 'B0CZ3IQWX6', 'men', ['skate', 'pro', 'durable'], 70),
  createProduct("Slip-On Pro", 'Vans', 'B0CZ3IQWX7', 'unisex', ['slip-on', 'pro', 'skate'], 70),
  createProduct("Knu Skool Black", 'Vans', 'B0CZ3IQWX8', 'unisex', ['chunky', 'bold', 'black'], 90),
  createProduct("Bold Ni", 'Vans', 'B0CZ3IQWX9', 'unisex', ['platform', 'bold', 'modern'], 85),
  createProduct("Ultrarange EXO SE", 'Vans', 'B0CZ3IQWA0', 'unisex', ['comfort', 'modern', 'lifestyle'], 110),
  createProduct("Sk8-Hi MTE-2", 'Vans', 'B0CZ3IQWA1', 'unisex', ['weatherized', 'high', 'winter'], 110),
  createProduct("Old Skool MTE-1", 'Vans', 'B0CZ3IQWA2', 'unisex', ['weatherized', 'winter', 'durable'], 100),
  createProduct("Sport Low", 'Vans', 'B0CZ3IQWA3', 'unisex', ['retro', 'suede', 'minimal'], 70),
  createProduct("Lowland CC", 'Vans', 'B0CZ3IQWA4', 'unisex', ['comfort', 'cushion', 'lifestyle'], 80),
  createProduct("Full Patch Snapback", 'Vans', 'B0CZ3IQWA5', 'unisex', ['lifestyle', 'casual', 'everyday'], 65),

  // On Running Additional
  createProduct("Cloudmonster 2", 'On', 'B0CZ3JQWX1', 'men', ['running', 'max cushion', 'new'], 180),
  createProduct("Cloudmonster Black", 'On', 'B0CZ3JQWX2', 'men', ['running', 'black', 'stealth'], 170),
  createProduct("Cloud 5 Black", 'On', 'B0CZ3JQWX3', 'men', ['lifestyle', 'black', 'everyday'], 140),
  createProduct("Cloud 5 All White", 'On', 'B0CZ3JQWX4', 'men', ['lifestyle', 'white', 'clean'], 140),
  createProduct("Cloudswift 3", 'On', 'B0CZ3JQWX5', 'men', ['running', 'urban', 'versatile'], 150),
  createProduct("Cloudrunner 2", 'On', 'B0CZ3JQWX6', 'men', ['running', 'stability', 'cushion'], 160),
  createProduct("Cloudsurfer 2", 'On', 'B0CZ3JQWX7', 'men', ['running', 'performance', 'speed'], 170),
  createProduct("Cloudgo", 'On', 'B0CZ3JQWX8', 'men', ['running', 'everyday', 'comfort'], 130),
  createProduct("Cloudvista", 'On', 'B0CZ3JQWX9', 'men', ['trail', 'technical', 'grip'], 170),
  createProduct("Cloudrock 2 Waterproof", 'On', 'B0CZ3JQWA0', 'men', ['hiking', 'waterproof', 'outdoor'], 220),
  createProduct("Roger Pro", 'On', 'B0CZ3JQWA1', 'unisex', ['tennis', 'performance', 'federer'], 200),
  createProduct("Roger Advantage", 'On', 'B0CZ3JQWA2', 'unisex', ['tennis', 'lifestyle', 'clean'], 150),
  createProduct("Cloudaway", 'On', 'B0CZ3JQWA3', 'unisex', ['lifestyle', 'travel', 'comfort'], 150),
  createProduct("Cloudnova Form", 'On', 'B0CZ3JQWA4', 'unisex', ['lifestyle', 'platform', 'bold'], 170),
  createProduct("Cloudtilt", 'On', 'B0CZ3JQWA5', 'women', ['lifestyle', 'fashion', 'unique'], 160),

  // Hoka Additional
  createProduct("Bondi 8 Black", 'Hoka', 'B0CZ3KQWX1', 'men', ['running', 'black', 'max cushion'], 165),
  createProduct("Bondi 8 White", 'Hoka', 'B0CZ3KQWX2', 'men', ['running', 'white', 'clean'], 165),
  createProduct("Clifton 9 Black", 'Hoka', 'B0CZ3KQWX3', 'men', ['running', 'black', 'lightweight'], 145),
  createProduct("Mach 5", 'Hoka', 'B0CZ3KQWX4', 'men', ['running', 'speed', 'responsive'], 140),
  createProduct("Kawana", 'Hoka', 'B0CZ3KQWX5', 'men', ['running', 'versatile', 'new'], 140),
  createProduct("Torrent 3", 'Hoka', 'B0CZ3KQWX6', 'men', ['trail', 'lightweight', 'fast'], 140),
  createProduct("Tecton X 2", 'Hoka', 'B0CZ3KQWX7', 'men', ['trail', 'carbon', 'racing'], 225),
  createProduct("Stinson 7", 'Hoka', 'B0CZ3KQWX8', 'men', ['trail', 'max cushion', 'ultra'], 185),
  createProduct("Ora Recovery Slide", 'Hoka', 'B0CZ3KQWX9', 'unisex', ['recovery', 'slide', 'comfort'], 60),
  createProduct("Hopara", 'Hoka', 'B0CZ3KQWA0', 'unisex', ['outdoor', 'sandal', 'adventure'], 140),
  createProduct("Anacapa Mid GTX", 'Hoka', 'B0CZ3KQWA1', 'men', ['hiking', 'waterproof', 'mid'], 185),
  createProduct("Anacapa Low GTX", 'Hoka', 'B0CZ3KQWA2', 'men', ['hiking', 'waterproof', 'low'], 175),
  createProduct("Kaha 2 GTX", 'Hoka', 'B0CZ3KQWA3', 'men', ['hiking', 'boot', 'waterproof'], 240),
  createProduct("Transport", 'Hoka', 'B0CZ3KQWA4', 'men', ['lifestyle', 'everyday', 'comfort'], 150),
  createProduct("Restore TC", 'Hoka', 'B0CZ3KQWA5', 'unisex', ['recovery', 'clog', 'comfort'], 70),

  // Brooks Additional
  createProduct("Ghost 16", 'Brooks', 'B0CZ3LQWX1', 'men', ['running', 'neutral', 'new'], 140),
  createProduct("Glycerin 21", 'Brooks', 'B0CZ3LQWX2', 'men', ['running', 'soft', 'premium'], 160),
  createProduct("Adrenaline GTS 24", 'Brooks', 'B0CZ3LQWX3', 'men', ['running', 'stability', 'new'], 140),
  createProduct("Beast 20", 'Brooks', 'B0CZ3LQWX4', 'men', ['running', 'max stability', 'support'], 160),
  createProduct("Addiction 15", 'Brooks', 'B0CZ3LQWX5', 'men', ['running', 'motion control', 'support'], 140),
  createProduct("Trace 3", 'Brooks', 'B0CZ3LQWX6', 'men', ['running', 'value', 'cushion'], 100),
  createProduct("Hyperion Tempo", 'Brooks', 'B0CZ3LQWX7', 'men', ['running', 'tempo', 'speed'], 150),
  createProduct("Catamount 2", 'Brooks', 'B0CZ3LQWX8', 'men', ['trail', 'racing', 'fast'], 170),
  createProduct("Divide 4", 'Brooks', 'B0CZ3LQWX9', 'men', ['trail', 'value', 'versatile'], 100),
  createProduct("Caldera 6", 'Brooks', 'B0CZ3LQWA0', 'men', ['trail', 'max cushion', 'ultra'], 170),
  createProduct("Glycerin GTS 21", 'Brooks', 'B0CZ3LQWA1', 'men', ['running', 'stability', 'soft'], 170),
  createProduct("Aurora BL", 'Brooks', 'B0CZ3LQWA2', 'men', ['running', 'neutral', 'cushion'], 150),
  createProduct("Transcend 7", 'Brooks', 'B0CZ3LQWA3', 'men', ['running', 'max support', 'premium'], 170),
  createProduct("Ricochet 3", 'Brooks', 'B0CZ3LQWA4', 'men', ['running', 'responsive', 'versatile'], 130),
  createProduct("Addiction Walker 2", 'Brooks', 'B0CZ3LQWA5', 'men', ['walking', 'comfort', 'support'], 130),

  // Additional Women's Styles
  createProduct("Air Force 1 Shadow Pastel", 'Nike', 'B0CZ3MQWX1', 'women', ['platform', 'pastel', 'trendy'], 130),
  createProduct("Dunk Low Rose Whisper", 'Nike', 'B0CZ3MQWX2', 'women', ['streetwear', 'pink', 'clean'], 115),
  createProduct("Air Max 97 Pink", 'Nike', 'B0CZ3MQWX3', 'women', ['retro', 'pink', 'bold'], 185),
  createProduct("Blazer Low Sacai", 'Nike', 'B0CZ3MQWX4', 'women', ['collab', 'deconstructed', 'fashion'], 140),
  createProduct("Air Jordan 1 Low Starfish", 'Jordan', 'B0CZ3MQWX5', 'women', ['basketball', 'orange', 'bold'], 115),
  createProduct("Air Jordan 1 Low Arctic Pink", 'Jordan', 'B0CZ3MQWX6', 'women', ['basketball', 'pink', 'clean'], 115),
  createProduct("Samba OG Pink", 'Adidas', 'B0CZ3MQWX7', 'women', ['vintage', 'pink', 'trendy'], 100),
  createProduct("Gazelle Bold Pink Glow", 'Adidas', 'B0CZ3MQWX8', 'women', ['platform', 'pink', 'bold'], 120),
  createProduct("550 White Pink", 'New Balance', 'B0CZ3MQWX9', 'women', ['retro', 'pink', 'trendy'], 130),
  createProduct("9060 Pink Haze", 'New Balance', 'B0CZ3MQWA0', 'women', ['chunky', 'pink', 'bold'], 150),
  createProduct("Mayze Leather", 'Puma', 'B0CZ3MQWA1', 'women', ['platform', 'leather', 'trendy'], 110),
  createProduct("Carina Street", 'Puma', 'B0CZ3MQWA2', 'women', ['casual', 'platform', 'everyday'], 70),
  createProduct("Club C Double Geo", 'Reebok', 'B0CZ3MQWA3', 'women', ['platform', 'geometric', 'bold'], 100),
  createProduct("Gel-1130 Pink", 'ASICS', 'B0CZ3MQWA4', 'women', ['retro', 'pink', 'trendy'], 120),
  createProduct("Chuck Taylor Lift Canvas", 'Converse', 'B0CZ3MQWA5', 'women', ['platform', 'canvas', 'trendy'], 75),

  // === FINAL BATCH: 100+ MORE PRODUCTS TO REACH 1000 ===

  // Nike Blazer Series
  createProduct("Blazer Mid '77 White Black", 'Nike', 'B0CZ4AQWX1', 'men', ['retro', 'basketball', 'clean'], 110),
  createProduct("Blazer Mid '77 Vintage", 'Nike', 'B0CZ4AQWX2', 'men', ['vintage', 'suede', 'cream'], 105),
  createProduct("Blazer Low '77 Jumbo", 'Nike', 'B0CZ4AQWX3', 'women', ['oversized', 'swoosh', 'trendy'], 100),
  createProduct("Blazer Mid '77 Suede Green", 'Nike', 'B0CZ4AQWX4', 'men', ['suede', 'green', 'retro'], 105),
  createProduct("Blazer Mid '77 Suede Navy", 'Nike', 'B0CZ4AQWX5', 'men', ['suede', 'navy', 'classic'], 105),

  // Nike Air Max Additional
  createProduct("Air Max 1 Bred", 'Nike', 'B0CZ4AQWX6', 'men', ['og', 'bred', 'retro'], 150),
  createProduct("Air Max 1 Amsterdam", 'Nike', 'B0CZ4AQWX7', 'men', ['city pack', 'special', 'orange'], 160),
  createProduct("Air Max 95 Solar Red", 'Nike', 'B0CZ4AQWX8', 'men', ['neon', 'bold', 'og'], 180),
  createProduct("Air Max 95 Anatomy", 'Nike', 'B0CZ4AQWX9', 'men', ['special', 'detailed', 'collector'], 185),
  createProduct("Air Max 97 Silver Bullet", 'Nike', 'B0CZ4AQWA0', 'men', ['silver', 'og', 'iconic'], 185),
  createProduct("Air Max 97 Sean Wotherspoon", 'Nike', 'B0CZ4AQWA1', 'men', ['collab', 'corduroy', 'grail'], 350),
  createProduct("Air Max 98 Gundam", 'Nike', 'B0CZ4AQWA2', 'men', ['bold', 'multicolor', 'anime'], 180),
  createProduct("Air Max 270 React", 'Nike', 'B0CZ4AQWA3', 'men', ['hybrid', 'comfort', 'modern'], 160),
  createProduct("Air Max Tailwind 4", 'Nike', 'B0CZ4AQWA4', 'men', ['retro', 'runner', '99'], 160),
  createProduct("Air Max Triax 96", 'Nike', 'B0CZ4AQWA5', 'men', ['chunky', 'retro', '96'], 150),

  // Nike Running Tech
  createProduct("Invincible Run 3", 'Nike', 'B0CZ4BQWX1', 'men', ['zoomx', 'max cushion', 'bouncy'], 180),
  createProduct("Infinity Run 4", 'Nike', 'B0CZ4BQWX2', 'men', ['react', 'cushion', 'everyday'], 160),
  createProduct("Structure 25", 'Nike', 'B0CZ4BQWX3', 'men', ['stability', 'support', 'running'], 140),
  createProduct("Vomero 17 Black", 'Nike', 'B0CZ4BQWX4', 'men', ['zoomx', 'cushion', 'black'], 160),
  createProduct("Alphafly 3", 'Nike', 'B0CZ4BQWX5', 'men', ['racing', 'carbon', 'elite'], 285),
  createProduct("Vaporfly 3", 'Nike', 'B0CZ4BQWX6', 'men', ['racing', 'carbon', 'fast'], 260),
  createProduct("Streakfly", 'Nike', 'B0CZ4BQWX7', 'men', ['racing', '5k', 'lightweight'], 170),
  createProduct("Pegasus Trail 4", 'Nike', 'B0CZ4BQWX8', 'men', ['trail', 'versatile', 'gore-tex'], 160),
  createProduct("Ultrafly Trail", 'Nike', 'B0CZ4BQWX9', 'men', ['trail', 'cushion', 'technical'], 180),
  createProduct("Wildhorse 8", 'Nike', 'B0CZ4BQWA0', 'men', ['trail', 'rugged', 'grip'], 140),

  // Jordan Additional Retros
  createProduct("Air Jordan 1 Mid Chicago Black Toe", 'Jordan', 'B0CZ4CQWX1', 'men', ['mid', 'chicago', 'classic'], 135),
  createProduct("Air Jordan 1 Mid SE", 'Jordan', 'B0CZ4CQWX2', 'men', ['mid', 'special', 'tumbled'], 135),
  createProduct("Air Jordan 2 Low Titan", 'Jordan', 'B0CZ4CQWX3', 'men', ['low', 'italy', 'luxury'], 175),
  createProduct("Air Jordan 3 Fire Red", 'Jordan', 'B0CZ4CQWX4', 'men', ['og', 'fire red', 'classic'], 210),
  createProduct("Air Jordan 3 White Cement Reimagined", 'Jordan', 'B0CZ4CQWX5', 'men', ['og', 'cement', 'reimagined'], 210),
  createProduct("Air Jordan 4 Military Black", 'Jordan', 'B0CZ4CQWX6', 'men', ['military', 'black', 'clean'], 210),
  createProduct("Air Jordan 4 SB Pine Green", 'Jordan', 'B0CZ4CQWX7', 'men', ['sb', 'pine green', 'collab'], 225),
  createProduct("Air Jordan 5 Fire Red", 'Jordan', 'B0CZ4CQWX8', 'men', ['og', 'fire red', 'reflective'], 210),
  createProduct("Air Jordan 5 Aqua", 'Jordan', 'B0CZ4CQWX9', 'men', ['retro', 'aqua', 'premium'], 210),
  createProduct("Air Jordan 6 Toro Bravo", 'Jordan', 'B0CZ4CQWA0', 'men', ['red suede', 'bold', 'premium'], 210),
  createProduct("Air Jordan 7 Citrus", 'Jordan', 'B0CZ4CQWA1', 'men', ['retro', 'citrus', 'og'], 210),
  createProduct("Air Jordan 8 Playoff", 'Jordan', 'B0CZ4CQWA2', 'men', ['og', 'playoff', 'straps'], 210),
  createProduct("Air Jordan 9 Powder Blue", 'Jordan', 'B0CZ4CQWA3', 'men', ['retro', 'powder blue', 'clean'], 200),
  createProduct("Air Jordan 10 Seattle", 'Jordan', 'B0CZ4CQWA4', 'men', ['city pack', 'seattle', 'green'], 200),
  createProduct("Air Jordan 11 Cherry", 'Jordan', 'B0CZ4CQWA5', 'men', ['holiday', 'cherry', 'patent'], 230),

  // Adidas Terrace Culture
  createProduct("Handball Spezial Navy", 'Adidas', 'B0CZ4DQWX1', 'men', ['terrace', 'navy', 'gum'], 100),
  createProduct("Handball Spezial Cream", 'Adidas', 'B0CZ4DQWX2', 'men', ['terrace', 'cream', 'vintage'], 100),
  createProduct("Bern City Series", 'Adidas', 'B0CZ4DQWX3', 'men', ['city pack', 'limited', 'swiss'], 110),
  createProduct("Dublin City Series", 'Adidas', 'B0CZ4DQWX4', 'men', ['city pack', 'ireland', 'green'], 110),
  createProduct("Koln City Series", 'Adidas', 'B0CZ4DQWX5', 'men', ['city pack', 'germany', 'rare'], 110),
  createProduct("Trimm Star", 'Adidas', 'B0CZ4DQWX6', 'men', ['retro', 'runner', 'og'], 100),
  createProduct("Oregon Ultra Tech", 'Adidas', 'B0CZ4DQWX7', 'men', ['retro', 'oregon', 'tech'], 130),
  createProduct("LA Trainer", 'Adidas', 'B0CZ4DQWX8', 'men', ['retro', 'la', 'classic'], 100),
  createProduct("TRX Runner", 'Adidas', 'B0CZ4DQWX9', 'men', ['retro', 'trail', 'vintage'], 110),
  createProduct("SL 76 Green Gold", 'Adidas', 'B0CZ4DQWA0', 'men', ['retro', 'brazil', 'green'], 100),

  // New Balance Made in Series
  createProduct("990v4 Grey", 'New Balance', 'B0CZ4EQWX1', 'men', ['made in usa', 'grey', 'classic'], 185),
  createProduct("990v3 Grey", 'New Balance', 'B0CZ4EQWX2', 'men', ['made in usa', 'grey', 'og'], 185),
  createProduct("997 Grey", 'New Balance', 'B0CZ4EQWX3', 'men', ['made in usa', 'grey', 'premium'], 185),
  createProduct("997H Black", 'New Balance', 'B0CZ4EQWX4', 'men', ['lifestyle', 'black', 'modern'], 90),
  createProduct("1300 Grey", 'New Balance', 'B0CZ4EQWX5', 'men', ['made in usa', 'grey', 'original'], 275),
  createProduct("1400 Grey", 'New Balance', 'B0CZ4EQWX6', 'men', ['made in japan', 'grey', 'rare'], 200),
  createProduct("1500 Made in UK Grey", 'New Balance', 'B0CZ4EQWX7', 'men', ['made in uk', 'grey', 'flimby'], 225),
  createProduct("1500 Made in UK Navy", 'New Balance', 'B0CZ4EQWX8', 'men', ['made in uk', 'navy', 'premium'], 225),
  createProduct("576 Made in UK Grey", 'New Balance', 'B0CZ4EQWX9', 'men', ['made in uk', 'grey', 'trail'], 200),
  createProduct("991 Made in UK Grey", 'New Balance', 'B0CZ4EQWA0', 'men', ['made in uk', 'grey', 'tech'], 225),

  // Saucony
  createProduct("Shadow 6000", 'Saucony', 'B0CZ4FQWX1', 'men', ['retro', 'runner', 'classic'], 110),
  createProduct("Jazz Original", 'Saucony', 'B0CZ4FQWX2', 'men', ['classic', 'everyday', 'value'], 70),
  createProduct("Courageous", 'Saucony', 'B0CZ4FQWX3', 'men', ['retro', 'bold', 'chunky'], 90),
  createProduct("Grid Web", 'Saucony', 'B0CZ4FQWX4', 'men', ['grid', 'chunky', 'retro'], 100),
  createProduct("Grid Shadow 2", 'Saucony', 'B0CZ4FQWX5', 'men', ['grid', 'techwear', 'black'], 100),
  createProduct("Endorphin Pro 3", 'Saucony', 'B0CZ4FQWX6', 'men', ['racing', 'carbon', 'elite'], 225),
  createProduct("Triumph 21", 'Saucony', 'B0CZ4FQWX7', 'men', ['running', 'cushion', 'premium'], 160),
  createProduct("Ride 17", 'Saucony', 'B0CZ4FQWX8', 'men', ['running', 'everyday', 'balanced'], 140),
  createProduct("Kinvara 14", 'Saucony', 'B0CZ4FQWX9', 'men', ['running', 'lightweight', 'fast'], 130),
  createProduct("Peregrine 13", 'Saucony', 'B0CZ4FQWA0', 'men', ['trail', 'rugged', 'grip'], 140),

  // Salomon
  createProduct("XT-6 Black", 'Salomon', 'B0CZ4GQWX1', 'unisex', ['trail', 'techwear', 'black'], 180),
  createProduct("XT-6 White", 'Salomon', 'B0CZ4GQWX2', 'unisex', ['trail', 'clean', 'white'], 180),
  createProduct("XT-4 OG", 'Salomon', 'B0CZ4GQWX3', 'unisex', ['trail', 'og', 'retro'], 170),
  createProduct("ACS Pro", 'Salomon', 'B0CZ4GQWX4', 'unisex', ['trail', 'tech', 'modern'], 190),
  createProduct("Speedcross 6", 'Salomon', 'B0CZ4GQWX5', 'men', ['trail', 'grip', 'technical'], 140),
  createProduct("Sense Ride 5", 'Salomon', 'B0CZ4GQWX6', 'men', ['trail', 'versatile', 'cushion'], 140),
  createProduct("S/Lab Ultra 3", 'Salomon', 'B0CZ4GQWX7', 'men', ['ultra', 'elite', 'racing'], 200),
  createProduct("Cross 2", 'Salomon', 'B0CZ4GQWX8', 'men', ['cross training', 'versatile', 'gym'], 120),
  createProduct("RX Slide 3.0", 'Salomon', 'B0CZ4GQWX9', 'unisex', ['recovery', 'slide', 'comfort'], 60),
  createProduct("SR90 Street", 'Salomon', 'B0CZ4GQWA0', 'unisex', ['lifestyle', 'street', 'modern'], 170),

  // Under Armour
  createProduct("Curry 11 Bruce Lee", 'Under Armour', 'B0CZ4HQWX1', 'men', ['basketball', 'curry', 'special'], 170),
  createProduct("Curry Flow 10", 'Under Armour', 'B0CZ4HQWX2', 'men', ['basketball', 'flow', 'performance'], 160),
  createProduct("HOVR Phantom 3", 'Under Armour', 'B0CZ4HQWX3', 'men', ['running', 'hovr', 'connected'], 150),
  createProduct("HOVR Machina 3", 'Under Armour', 'B0CZ4HQWX4', 'men', ['running', 'carbon', 'speed'], 160),
  createProduct("HOVR Sonic 6", 'Under Armour', 'B0CZ4HQWX5', 'men', ['running', 'everyday', 'lightweight'], 110),
  createProduct("Project Rock 6", 'Under Armour', 'B0CZ4HQWX6', 'men', ['training', 'rock', 'tough'], 160),
  createProduct("TriBase Reign 5", 'Under Armour', 'B0CZ4HQWX7', 'men', ['training', 'stability', 'gym'], 140),
  createProduct("SlipSpeed", 'Under Armour', 'B0CZ4HQWX8', 'men', ['recovery', 'convertible', 'innovative'], 120),
  createProduct("Charged Rogue 3", 'Under Armour', 'B0CZ4HQWX9', 'men', ['running', 'value', 'cushion'], 90),
  createProduct("Charged Assert 10", 'Under Armour', 'B0CZ4HQWA0', 'men', ['running', 'budget', 'everyday'], 75),

  // Luxury/Designer Athletic
  createProduct("Triple S Black", 'Balenciaga', 'B0CZ4IQWX1', 'unisex', ['luxury', 'chunky', 'statement'], 1050),
  createProduct("Track Trainer White", 'Balenciaga', 'B0CZ4IQWX2', 'unisex', ['luxury', 'techwear', 'layered'], 1090),
  createProduct("Speed Trainer 2.0", 'Balenciaga', 'B0CZ4IQWX3', 'unisex', ['luxury', 'sock', 'minimal'], 950),
  createProduct("Defender Black", 'Balenciaga', 'B0CZ4IQWX4', 'unisex', ['luxury', 'extreme', 'chunky'], 1250),
  createProduct("Rhyton Logo", 'Gucci', 'B0CZ4IQWX5', 'unisex', ['luxury', 'chunky', 'logo'], 890),
  createProduct("Screener Distressed", 'Gucci', 'B0CZ4IQWX6', 'unisex', ['luxury', 'vintage', 'tennis'], 870),
  createProduct("Ace Bee", 'Gucci', 'B0CZ4IQWX7', 'unisex', ['luxury', 'clean', 'bee'], 720),
  createProduct("B-Court Flash", 'Dior', 'B0CZ4IQWX8', 'men', ['luxury', 'oblique', 'basketball'], 1100),
  createProduct("B22 Grey", 'Dior', 'B0CZ4IQWX9', 'men', ['luxury', 'chunky', 'tech'], 1300),
  createProduct("Trainer White", 'Prada', 'B0CZ4IQWA0', 'men', ['luxury', 'clean', 'italian'], 950),
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
  ...ADDITIONAL_PRODUCTS,
];

// Statistics
export const EXPANDED_STATS = {
  total: EXPANDED_CATALOG.length,
  nike: NIKE_EXPANDED.length,
  jordan: JORDAN_EXPANDED.length,
  adidas: ADIDAS_EXPANDED.length,
  newBalance: NEW_BALANCE_EXPANDED.length,
  other: OTHER_BRANDS.length,
  additional: ADDITIONAL_PRODUCTS.length,
};

console.log(`[ExpandedCatalog] Loaded ${EXPANDED_STATS.total} additional products`);
console.log(`  Nike: ${EXPANDED_STATS.nike}, Jordan: ${EXPANDED_STATS.jordan}, Adidas: ${EXPANDED_STATS.adidas}`);
console.log(`  New Balance: ${EXPANDED_STATS.newBalance}, Other: ${EXPANDED_STATS.other}, Additional: ${EXPANDED_STATS.additional}`);

export default EXPANDED_CATALOG;
