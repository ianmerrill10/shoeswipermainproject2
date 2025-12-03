// ============================================
// MOCK DATA FOR LOCAL DEMO
// 102 Products with Amazon Affiliate Links
// Affiliate Tag: shoeswiper-20
// Generated: 2025-12-02
// ============================================

import { Shoe } from './types';

// ============================================
// MUSIC AFFILIATE CONFIGURATION
// Amazon: tag=shoeswiper-20 (Amazon Associates)
// Apple Music: at=1000lJFj (Replace with your Apple Services Performance Partners token)
// Spotify: No affiliate program - links for user convenience only
// ============================================
const APPLE_AFFILIATE_TOKEN = '1000lJFj'; // TODO: Replace with your Apple affiliate token
const AMAZON_AFFILIATE_TAG = 'shoeswiper-20';

// Music tracks with monetized affiliate links
const MUSIC_TRACKS = [
  { song: 'SICKO MODE', artist: 'Travis Scott', spotifyUrl: 'https://open.spotify.com/track/2xLMifQCjDGFmkHkpNLD9h', appleMusicUrl: `https://music.apple.com/us/album/sicko-mode/1421241217?i=1421241853&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B07GXJW5SF?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'Started From The Bottom', artist: 'Drake', spotifyUrl: 'https://open.spotify.com/track/4F4xZ8MpZ3OqMaG5cBNHhH', appleMusicUrl: `https://music.apple.com/us/album/started-from-the-bottom/1440890708?i=1440891396&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B00BFMYZGE?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'HUMBLE', artist: 'Kendrick Lamar', spotifyUrl: 'https://open.spotify.com/track/7KXjTSCq5nL1LoYtL7XAwS', appleMusicUrl: `https://music.apple.com/us/album/humble/1440881047?i=1440881378&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B06Y1Q8GRJ?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'Stronger', artist: 'Kanye West', spotifyUrl: 'https://open.spotify.com/track/0j2T0R9dR9qdJYsB7ciXhf', appleMusicUrl: `https://music.apple.com/us/album/stronger/1451901307?i=1451901308&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B000V6O18G?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'Around The World', artist: 'Daft Punk', spotifyUrl: 'https://open.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN', appleMusicUrl: `https://music.apple.com/us/album/around-the-world/697194953?i=697195404&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B00138CLGW?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'Blinding Lights', artist: 'The Weeknd', spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b', appleMusicUrl: `https://music.apple.com/us/album/blinding-lights/1488408555?i=1488408568&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B081J3QZ7L?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'Levitating', artist: 'Dua Lipa', spotifyUrl: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9', appleMusicUrl: `https://music.apple.com/us/album/levitating/1510821672?i=1510821689&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B086QYBXPR?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'Money Trees', artist: 'Kendrick Lamar', spotifyUrl: 'https://open.spotify.com/track/2HbKqm4o0w5wEeEFXm2sD4', appleMusicUrl: `https://music.apple.com/us/album/money-trees/1440818886?i=1440819328&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B009AQFNC0?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'goosebumps', artist: 'Travis Scott', spotifyUrl: 'https://open.spotify.com/track/6gBFPUFcJLzWGx4lenP6h2', appleMusicUrl: `https://music.apple.com/us/album/goosebumps/1453585079?i=1453585310&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B01JO9X3OW?tag=${AMAZON_AFFILIATE_TAG}` },
  { song: 'One Dance', artist: 'Drake', spotifyUrl: 'https://open.spotify.com/track/1zi7xx7UVEFkmKfv06H8x0', appleMusicUrl: `https://music.apple.com/us/album/one-dance/1440841363?i=1440841749&at=${APPLE_AFFILIATE_TOKEN}`, amazonMusicUrl: `https://amazon.com/dp/B01DWRQ3N6?tag=${AMAZON_AFFILIATE_TAG}` },
];

// Helper to get music for a shoe (based on index)
const getMusicForShoe = (id: number) => MUSIC_TRACKS[id % MUSIC_TRACKS.length];

// Helper to generate a mock shoe
const createShoe = (
  id: number,
  name: string,
  brand: string,
  asin: string,
  gender: 'men' | 'women' | 'unisex',
  styleTags: string[] = ['lifestyle', 'casual'],
  isFeatured: boolean = false
): Shoe => ({
  id: `shoe-${id}`,
  name,
  brand,
  amazon_asin: asin,
  amazon_url: `https://www.amazon.com/dp/${asin}?tag=shoeswiper-20`,
  image_url: getImageForBrand(brand),
  gender,
  style_tags: styleTags,
  color_tags: ['various'],
  favorite_count: Math.floor(Math.random() * 500) + 100,
  view_count: Math.floor(Math.random() * 1000) + 200,
  click_count: Math.floor(Math.random() * 300) + 50,
  is_active: true,
  is_featured: isFeatured,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  music: getMusicForShoe(id),
});

// Get stock image based on brand
const getImageForBrand = (brand: string): string => {
  const images: Record<string, string> = {
    'Nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'Jordan': 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
    'Adidas': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    'New Balance': 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    'Converse': 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
    'Vans': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
    'Puma': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    'Reebok': 'https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=800',
    'ASICS': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    'On': 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
    'Brooks': 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
    'Skechers': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
    'Birkenstock': 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
    'DKNY': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
  };
  return images[brand] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800';
};

// ============================================
// MEN'S SHOES (51)
// ============================================
const mensShoes: Shoe[] = [
  createShoe(1, "Air Force 1 '07", 'Nike', 'B07QXLFLXT', 'men', ['classic', 'streetwear', 'timeless'], true),
  createShoe(2, 'Dunk Low Retro', 'Nike', 'B09NLN47LP', 'men', ['streetwear', 'casual', 'trendy'], true),
  createShoe(3, 'Air Max 90', 'Nike', 'B0DFVXG97P', 'men', ['retro', 'casual', 'classic']),
  createShoe(4, 'Air Max Plus', 'Nike', 'B0DSNF3FHZ', 'men', ['streetwear', 'bold', 'chunky']),
  createShoe(5, 'Free Metcon 5', 'Nike', 'B0C7QHDR63', 'men', ['training', 'athletic', 'performance']),
  createShoe(6, 'Vomero 18', 'Nike', 'B0CVXHZ3VN', 'men', ['running', 'comfort', 'athletic']),
  createShoe(7, 'Court Vision Low', 'Nike', 'B07TFQSHMD', 'men', ['casual', 'clean', 'classic']),
  createShoe(8, 'SB Dunk Low Pro', 'Nike', 'B08P1KVDRB', 'men', ['skate', 'streetwear', 'casual']),
  createShoe(9, 'Zoom Vomero 5', 'Nike', 'B0D8PWWJ2R', 'men', ['chunky', 'techwear', 'retro'], true),
  createShoe(10, 'Pegasus 41', 'Nike', 'B0D2Q2VQVW', 'men', ['running', 'performance', 'comfort']),
  createShoe(11, 'Air VaporMax Plus', 'Nike', 'B0DG4YWLZL', 'men', ['futuristic', 'bold', 'streetwear']),
  createShoe(12, 'Air Max 1', 'Nike', 'B0D24HN2CB', 'men', ['retro', 'classic', 'iconic']),
  createShoe(13, 'Blazer Mid 77', 'Nike', 'B0949HSWCY', 'men', ['vintage', 'retro', 'casual']),
  createShoe(14, '1 Retro High OG', 'Jordan', 'B0DBHRM6VR', 'men', ['basketball', 'hypebeast', 'iconic'], true),
  createShoe(15, '4 Retro', 'Jordan', 'B0DJC5VP3Q', 'men', ['basketball', 'hypebeast', 'chunky'], true),
  createShoe(16, 'Air Jordan 1 Low', 'Jordan', 'B0D5T1HXPC', 'men', ['streetwear', 'casual', 'classic']),
  createShoe(17, '11 Retro', 'Jordan', 'B0DLBGPGFX', 'men', ['basketball', 'luxury', 'iconic'], true),
  createShoe(18, 'Spizike Low', 'Jordan', 'B0DGZ7BT7R', 'men', ['basketball', 'hybrid', 'bold']),
  createShoe(19, 'Air Jordan 1 Mid', 'Jordan', 'B0DTXVK65V', 'men', ['streetwear', 'casual', 'classic']),
  createShoe(20, 'Max Aura 5', 'Jordan', 'B0CMVBKJJV', 'men', ['basketball', 'casual', 'comfort']),
  createShoe(21, '3 Retro', 'Jordan', 'B0DJC4C5DK', 'men', ['basketball', 'iconic', 'elephant print']),
  createShoe(22, 'Stay Loyal 3', 'Jordan', 'B0D5RX5KVS', 'men', ['basketball', 'casual', 'modern']),
  createShoe(23, '12 Retro', 'Jordan', 'B0DP61V59T', 'men', ['basketball', 'luxury', 'bold']),
  createShoe(24, 'Samba OG', 'Adidas', 'B0C37GPXQ9', 'men', ['vintage', 'casual', 'timeless'], true),
  createShoe(25, 'Gazelle', 'Adidas', 'B09P86BPCR', 'men', ['vintage', 'casual', 'retro']),
  createShoe(26, 'Grand Court', 'Adidas', 'B09DXW3D8B', 'men', ['casual', 'clean', 'tennis']),
  createShoe(27, 'Forum Low', 'Adidas', 'B08745PCHW', 'men', ['retro', 'basketball', 'classic']),
  createShoe(28, 'Grand Court Alpha', 'Adidas', 'B0D2S69CWQ', 'men', ['casual', 'modern', 'clean']),
  createShoe(29, 'Grand Court Tennis', 'Adidas', 'B09DXVXBFR', 'men', ['tennis', 'casual', 'sport']),
  createShoe(30, 'Ultraboost', 'Adidas', 'B0D3P29Q5C', 'men', ['running', 'comfort', 'performance'], true),
  createShoe(31, 'Swift Run', 'Adidas', 'B0BHPVPF4H', 'men', ['running', 'casual', 'lightweight']),
  createShoe(32, 'Handball Spezial', 'Adidas', 'B0D7HMS8S2', 'men', ['vintage', 'terrace', 'classic']),
  createShoe(33, 'Streetalk', 'Adidas', 'B0DJV38CBT', 'men', ['streetwear', 'modern', 'bold']),
  createShoe(34, '550', 'New Balance', 'B0DCX24RNV', 'men', ['retro', 'basketball', 'trendy'], true),
  createShoe(35, '574 Core', 'New Balance', 'B093QJF4VR', 'men', ['classic', 'casual', 'comfort']),
  createShoe(36, 'FuelCell', 'New Balance', 'B096NND25R', 'men', ['running', 'performance', 'speed']),
  createShoe(37, '2002R', 'New Balance', 'B0FN5CXB8M', 'men', ['retro', 'chunky', 'comfort']),
  createShoe(38, '327', 'New Balance', 'B099TFD8W5', 'men', ['retro', 'bold', 'casual']),
  createShoe(39, '530', 'New Balance', 'B07B3VM8D2', 'men', ['retro', 'running', 'chunky']),
  createShoe(40, 'Fresh Foam X 1080v13', 'New Balance', 'B0CNKXG21F', 'men', ['running', 'comfort', 'premium']),
  createShoe(41, 'Brooklyn Low Top', 'Vans', 'B0D7QC25H7', 'men', ['skate', 'casual', 'streetwear']),
  createShoe(42, 'Filmore', 'Vans', 'B0949M2KTN', 'men', ['skate', 'casual', 'classic']),
  createShoe(43, 'Suede Classic', 'Puma', 'B0D32JWHM5', 'men', ['retro', 'casual', 'hip-hop']),
  createShoe(44, 'Club C Vintage', 'Reebok', 'B07DPD5NS4', 'men', ['retro', 'tennis', 'clean']),
  createShoe(45, 'Classic Leather', 'Reebok', 'B0971NHH8G', 'men', ['classic', 'retro', 'timeless']),
  createShoe(46, 'Whispers', 'Puma', 'B0FBHV4RFD', 'men', ['modern', 'casual', 'sleek']),
  createShoe(47, 'Gel-Kayano 14', 'ASICS', 'B0CMHXJWWN', 'men', ['retro', 'running', 'techwear'], true),
  createShoe(48, 'Cloud 5', 'On', 'B0D31TNKHB', 'men', ['running', 'swiss', 'premium']),
  createShoe(49, 'Ghost', 'Brooks', 'B0DQ2BMHDW', 'men', ['running', 'comfort', 'neutral']),
  createShoe(50, 'Go Walk Max', 'Skechers', 'B072KVD3WD', 'men', ['comfort', 'walking', 'casual']),
  createShoe(51, 'Fresh Foam X 880', 'New Balance', 'B0C34VNVJ6', 'men', ['running', 'comfort', 'stability']),
];

// ============================================
// UNISEX SHOES (3)
// ============================================
const unisexShoes: Shoe[] = [
  createShoe(52, '1906R', 'New Balance', 'B0C8BT9P9S', 'unisex', ['retro', 'chunky', 'premium']),
  createShoe(53, 'Chuck Taylor All Star High', 'Converse', 'B000OLRWO2', 'unisex', ['classic', 'vintage', 'iconic'], true),
  createShoe(54, 'Boston Clog', 'Birkenstock', 'B004S998FW', 'unisex', ['comfort', 'casual', 'classic']),
];

// ============================================
// WOMEN'S SHOES (48)
// ============================================
const womensShoes: Shoe[] = [
  createShoe(55, 'Gel-1130', 'ASICS', 'B0D82BRSYZ', 'women', ['retro', 'running', 'chunky']),
  createShoe(56, 'Dunk Low Next Nature', 'Nike', 'B0DWHRNVFN', 'women', ['sustainable', 'streetwear', 'trendy']),
  createShoe(57, 'Dunk Low Retro Panda', 'Nike', 'B08QBZFVY5', 'women', ['streetwear', 'trendy', 'clean'], true),
  createShoe(58, 'Court Vision', 'Nike', 'B0F138FGJG', 'women', ['casual', 'clean', 'classic']),
  createShoe(59, 'Air Max 90', 'Nike', 'B0B1YDKWZW', 'women', ['retro', 'casual', 'classic']),
  createShoe(60, 'Air Max 97', 'Nike', 'B08WPWWWQN', 'women', ['retro', 'metallic', 'bold']),
  createShoe(61, 'Cortez', 'Nike', 'B0D1YFHNNK', 'women', ['retro', 'classic', 'vintage']),
  createShoe(62, "Blazer Mid '77", 'Nike', 'B0BYFBJKTL', 'women', ['vintage', 'retro', 'casual']),
  createShoe(63, 'Court Vision Low', 'Nike', 'B0CZHQK1Q6', 'women', ['casual', 'clean', 'everyday']),
  createShoe(64, 'Air Max SC', 'Nike', 'B0F2G9G9H9', 'women', ['casual', 'comfort', 'modern']),
  createShoe(65, 'V2K Run', 'Nike', 'B0CQGS72QF', 'women', ['running', 'retro', 'chunky']),
  createShoe(66, 'Vomero', 'Nike', 'B0DYVSDM94', 'women', ['running', 'comfort', 'performance']),
  createShoe(67, 'Waffle Debut', 'Nike', 'B09NMHN3Q2', 'women', ['retro', 'casual', 'vintage']),
  createShoe(68, 'Free Metcon 5', 'Nike', 'B0BS6MTK41', 'women', ['training', 'athletic', 'performance']),
  createShoe(69, 'Pegasus 40', 'Nike', 'B0BQZ4X73G', 'women', ['running', 'comfort', 'everyday']),
  createShoe(70, '1 Retro Low Satin', 'Jordan', 'B0DJTHZB95', 'women', ['streetwear', 'satin', 'premium']),
  createShoe(71, 'Air Jordan 1 Low', 'Jordan', 'B0C3JM5YD8', 'women', ['streetwear', 'casual', 'classic']),
  createShoe(72, '4 Retro', 'Jordan', 'B0F9FVF4BZ', 'women', ['basketball', 'chunky', 'bold'], true),
  createShoe(73, 'Air Jordan 1 Mid', 'Jordan', 'B0DS6LV8BT', 'women', ['streetwear', 'casual', 'classic']),
  createShoe(74, 'Max Aura 4', 'Jordan', 'B093CC4LKQ', 'women', ['basketball', 'casual', 'comfort']),
  createShoe(75, 'Stadium 90', 'Jordan', 'B0DC6ZGC85', 'women', ['modern', 'casual', 'comfort']),
  createShoe(76, 'Air Jordan 1 Low SE', 'Jordan', 'B0DZVGK3DP', 'women', ['streetwear', 'special edition', 'premium']),
  createShoe(77, 'Delta 3 Low', 'Jordan', 'B0BZF531LC', 'women', ['modern', 'lifestyle', 'comfort']),
  createShoe(78, 'Samba OG', 'Adidas', 'B0C2JXJS3M', 'women', ['vintage', 'casual', 'timeless'], true),
  createShoe(79, 'Gazelle', 'Adidas', 'B0C2JY6GCT', 'women', ['vintage', 'casual', 'retro']),
  createShoe(80, 'Grand Court Tennis', 'Adidas', 'B09DXVKGTW', 'women', ['tennis', 'casual', 'clean']),
  createShoe(81, 'Forum Low', 'Adidas', 'B09DXWJPHY', 'women', ['retro', 'basketball', 'classic']),
  createShoe(82, 'Campus 00s', 'Adidas', 'B0FRYDBBHN', 'women', ['retro', 'casual', 'suede']),
  createShoe(83, 'Grand Court', 'Adidas', 'B09DXW115R', 'women', ['casual', 'clean', 'everyday']),
  createShoe(84, 'Ultraboost', 'Adidas', 'B0DJV2FSHF', 'women', ['running', 'comfort', 'performance']),
  createShoe(85, 'Ozweego', 'Adidas', 'B0989C9VGQ', 'women', ['chunky', 'retro', 'bold']),
  createShoe(86, '550', 'New Balance', 'B0C9W3BLT3', 'women', ['retro', 'basketball', 'trendy'], true),
  createShoe(87, '574', 'New Balance', 'B093QK8S8R', 'women', ['classic', 'casual', 'comfort']),
  createShoe(88, '327', 'New Balance', 'B0FCWDLYF3', 'women', ['retro', 'bold', 'casual']),
  createShoe(89, '530', 'New Balance', 'B0CQQDW6B8', 'women', ['retro', 'running', 'chunky']),
  createShoe(90, '9060', 'New Balance', 'B0DSX47PJ1', 'women', ['chunky', 'futuristic', 'bold']),
  createShoe(91, 'Cross Trainer', 'New Balance', 'B07B41SLY5', 'women', ['training', 'comfort', 'athletic']),
  createShoe(92, 'Fresh Foam X 880v14', 'New Balance', 'B0CLBB3WLL', 'women', ['running', 'comfort', 'stability']),
  createShoe(93, 'Chuck Taylor All Star', 'Converse', 'B09SBRZMLT', 'women', ['classic', 'vintage', 'casual']),
  createShoe(94, 'Brooklyn Low Top', 'Vans', 'B0D7QFMK5N', 'women', ['skate', 'casual', 'streetwear']),
  createShoe(95, 'Chuck Taylor', 'Converse', 'B07BTCBV5Q', 'women', ['classic', 'vintage', 'iconic']),
  createShoe(96, 'Ashwood', 'Vans', 'B0DQ1G5ZQ3', 'women', ['casual', 'modern', 'lifestyle']),
  createShoe(97, 'Carina', 'Puma', 'B07HJRV1YQ', 'women', ['casual', 'platform', 'trendy']),
  createShoe(98, 'Suede Classic', 'Puma', 'B0D7DVSQ37', 'women', ['retro', 'casual', 'hip-hop']),
  createShoe(99, 'Classic Leather', 'Reebok', 'B092YWBZ4F', 'women', ['classic', 'retro', 'timeless']),
  createShoe(100, 'Gel-1130', 'ASICS', 'B0D82FZ11P', 'women', ['retro', 'running', 'techwear']),
  createShoe(101, 'Boston Shearling', 'Birkenstock', 'B08CRZLHLJ', 'women', ['comfort', 'cozy', 'winter']),
  createShoe(102, 'Jaysha Heeled', 'DKNY', 'B0BPZWJRB4', 'women', ['fashion', 'heeled', 'luxury']),
];

// ============================================
// COMBINED MOCK DATA
// ============================================
export const MOCK_SHOES: Shoe[] = [
  ...mensShoes,
  ...unisexShoes,
  ...womensShoes,
];

// Re-export DEMO_MODE from config for backwards compatibility
export { DEMO_MODE } from './config';

// Get shuffled shoes for feed
export const getShuffledShoes = (): Shoe[] => {
  return [...MOCK_SHOES].sort(() => Math.random() - 0.5);
};

// Get featured shoes
export const getFeaturedShoes = (): Shoe[] => {
  return MOCK_SHOES.filter(shoe => shoe.is_featured);
};

// Search shoes
export const searchShoes = (query: string): Shoe[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_SHOES.filter(shoe =>
    shoe.name.toLowerCase().includes(lowerQuery) ||
    shoe.brand.toLowerCase().includes(lowerQuery) ||
    shoe.style_tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

console.log(`[MockData] Loaded ${MOCK_SHOES.length} products (${mensShoes.length} men's, ${womensShoes.length} women's, ${unisexShoes.length} unisex)`);
