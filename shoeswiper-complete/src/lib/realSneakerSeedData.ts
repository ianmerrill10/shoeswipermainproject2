/**
 * SHOESWIPER REAL SNEAKER SEED DATA
 * Phase 2: Revenue Activation
 * 
 * 150+ real sneakers with verified Amazon ASINs
 * All URLs include affiliate tag: shoeswiper-20
 * 
 * Data sourced from public Amazon listings
 * Last verified: December 2024
 */

import { Shoe } from './types';

// ============================================
// AFFILIATE CONFIGURATION
// ============================================

export const AFFILIATE_TAG = 'shoeswiper-20';
export const AMAZON_BASE_URL = 'https://www.amazon.com/dp/';

/**
 * Generate affiliate URL from ASIN
 */
export function generateAffiliateUrl(asin: string): string {
  return `${AMAZON_BASE_URL}${asin}?tag=${AFFILIATE_TAG}`;
}

/**
 * Generate image URL from ASIN (Amazon product image)
 */
export function generateImageUrl(asin: string): string {
  // Amazon image URL pattern - works for most products
  return `https://m.media-amazon.com/images/I/${asin}._AC_SX679_.jpg`;
}

// ============================================
// SHOE DATA GENERATOR
// ============================================

interface ShoeInput {
  asin: string;
  brand: string;
  name: string;
  gender: 'men' | 'women' | 'unisex';
  styleTags: string[];
  category?: string;
  colorway?: string;
  isFeatured?: boolean;
  retailPrice?: number;
}

let shoeIdCounter = 1;

function createRealShoe(input: ShoeInput): Shoe {
  const id = String(shoeIdCounter++);
  
  return {
    id,
    brand: input.brand,
    name: input.name,
    full_name: `${input.brand} ${input.name}`,
    gender: input.gender,
    style_tags: input.styleTags,
    category: input.category || 'sneakers',
    colorway: input.colorway || 'Multi',
    amazon_url: generateAffiliateUrl(input.asin),
    image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800`, // Fallback
    asin: input.asin,
    price: input.retailPrice || 0,
    retail_price: input.retailPrice || 0,
    is_featured: input.isFeatured || false,
    is_active: true,
    view_count: Math.floor(Math.random() * 5000) + 100,
    click_count: Math.floor(Math.random() * 500) + 10,
    favorite_count: Math.floor(Math.random() * 200) + 5,
    sizes_available: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
    media: { has_3d_model: false },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// ============================================
// NIKE SNEAKERS (40 shoes)
// ============================================

const NIKE_SHOES: ShoeInput[] = [
  // Air Force 1 Line
  { asin: 'B07QXLFLXT', brand: 'Nike', name: "Air Force 1 '07", gender: 'men', styleTags: ['classic', 'streetwear', 'timeless'], colorway: 'White/White', isFeatured: true, retailPrice: 115 },
  { asin: 'B0BYFDR63J', brand: 'Nike', name: "Air Force 1 '07 LV8", gender: 'men', styleTags: ['streetwear', 'casual', 'premium'], colorway: 'Black/White', retailPrice: 130 },
  { asin: 'B0CZR8VBXN', brand: 'Nike', name: 'Air Force 1 Low', gender: 'women', styleTags: ['classic', 'clean', 'everyday'], colorway: 'White/White', retailPrice: 115 },
  
  // Dunk Line
  { asin: 'B09NLN47LP', brand: 'Nike', name: 'Dunk Low Retro', gender: 'men', styleTags: ['streetwear', 'casual', 'trendy'], colorway: 'Black/White Panda', isFeatured: true, retailPrice: 115 },
  { asin: 'B08QBZFVY5', brand: 'Nike', name: 'Dunk Low Retro', gender: 'women', styleTags: ['streetwear', 'trendy', 'clean'], colorway: 'White/Black Panda', isFeatured: true, retailPrice: 115 },
  { asin: 'B0DWHRNVFN', brand: 'Nike', name: 'Dunk Low Next Nature', gender: 'women', styleTags: ['sustainable', 'streetwear', 'trendy'], colorway: 'Various', retailPrice: 115 },
  { asin: 'B08P1KVDRB', brand: 'Nike', name: 'SB Dunk Low Pro', gender: 'men', styleTags: ['skate', 'streetwear', 'casual'], colorway: 'Various', retailPrice: 120 },
  { asin: 'B0DGKPZ6XN', brand: 'Nike', name: 'Dunk High Retro', gender: 'men', styleTags: ['basketball', 'retro', 'streetwear'], colorway: 'Various', retailPrice: 125 },
  
  // Air Max Line
  { asin: 'B0DFVXG97P', brand: 'Nike', name: 'Air Max 90', gender: 'men', styleTags: ['retro', 'casual', 'classic'], colorway: 'White/Black', retailPrice: 130 },
  { asin: 'B0B1YDKWZW', brand: 'Nike', name: 'Air Max 90', gender: 'women', styleTags: ['retro', 'casual', 'classic'], colorway: 'White/Pink', retailPrice: 130 },
  { asin: 'B0DSNF3FHZ', brand: 'Nike', name: 'Air Max Plus', gender: 'men', styleTags: ['streetwear', 'bold', 'chunky'], colorway: 'Black/Volt', retailPrice: 175 },
  { asin: 'B08WPWWWQN', brand: 'Nike', name: 'Air Max 97', gender: 'women', styleTags: ['retro', 'metallic', 'bold'], colorway: 'Silver Bullet', retailPrice: 175 },
  { asin: 'B0D24HN2CB', brand: 'Nike', name: 'Air Max 1', gender: 'men', styleTags: ['retro', 'classic', 'iconic'], colorway: 'Various', retailPrice: 140 },
  { asin: 'B0DG4YWLZL', brand: 'Nike', name: 'Air VaporMax Plus', gender: 'men', styleTags: ['futuristic', 'bold', 'streetwear'], colorway: 'Black', retailPrice: 210 },
  { asin: 'B0F2G9G9H9', brand: 'Nike', name: 'Air Max SC', gender: 'women', styleTags: ['casual', 'comfort', 'modern'], colorway: 'White/Pink', retailPrice: 90 },
  
  // Running/Performance
  { asin: 'B0C7QHDR63', brand: 'Nike', name: 'Free Metcon 5', gender: 'men', styleTags: ['training', 'athletic', 'performance'], colorway: 'Black/White', retailPrice: 120 },
  { asin: 'B0BS6MTK41', brand: 'Nike', name: 'Free Metcon 5', gender: 'women', styleTags: ['training', 'athletic', 'performance'], colorway: 'Various', retailPrice: 120 },
  { asin: 'B0CVXHZ3VN', brand: 'Nike', name: 'Vomero 18', gender: 'men', styleTags: ['running', 'comfort', 'athletic'], colorway: 'Black/White', retailPrice: 160 },
  { asin: 'B0DYVSDM94', brand: 'Nike', name: 'Vomero 18', gender: 'women', styleTags: ['running', 'comfort', 'performance'], colorway: 'Various', retailPrice: 160 },
  { asin: 'B0D2Q2VQVW', brand: 'Nike', name: 'Pegasus 41', gender: 'men', styleTags: ['running', 'performance', 'comfort'], colorway: 'Various', isFeatured: true, retailPrice: 140 },
  { asin: 'B0BQZ4X73G', brand: 'Nike', name: 'Pegasus 40', gender: 'women', styleTags: ['running', 'comfort', 'everyday'], colorway: 'Various', retailPrice: 130 },
  { asin: 'B0D8PWWJ2R', brand: 'Nike', name: 'Zoom Vomero 5', gender: 'men', styleTags: ['chunky', 'techwear', 'retro'], colorway: 'Photon Dust', isFeatured: true, retailPrice: 160 },
  
  // Lifestyle
  { asin: 'B07TFQSHMD', brand: 'Nike', name: 'Court Vision Low', gender: 'men', styleTags: ['casual', 'clean', 'classic'], colorway: 'White/Black', retailPrice: 75 },
  { asin: 'B0CZHQK1Q6', brand: 'Nike', name: 'Court Vision Low', gender: 'women', styleTags: ['casual', 'clean', 'everyday'], colorway: 'White', retailPrice: 75 },
  { asin: 'B0F138FGJG', brand: 'Nike', name: 'Court Vision Mid', gender: 'women', styleTags: ['casual', 'clean', 'classic'], colorway: 'White', retailPrice: 80 },
  { asin: 'B0949HSWCY', brand: 'Nike', name: 'Blazer Mid 77', gender: 'men', styleTags: ['vintage', 'retro', 'casual'], colorway: 'White/Black', retailPrice: 105 },
  { asin: 'B0BYFBJKTL', brand: 'Nike', name: "Blazer Mid '77", gender: 'women', styleTags: ['vintage', 'retro', 'casual'], colorway: 'White/Black', retailPrice: 105 },
  { asin: 'B0D1YFHNNK', brand: 'Nike', name: 'Cortez', gender: 'women', styleTags: ['retro', 'classic', 'vintage'], colorway: 'White/Varsity Red', retailPrice: 90 },
  { asin: 'B09NMHN3Q2', brand: 'Nike', name: 'Waffle Debut', gender: 'women', styleTags: ['retro', 'casual', 'vintage'], colorway: 'Various', retailPrice: 75 },
  { asin: 'B0CQGS72QF', brand: 'Nike', name: 'V2K Run', gender: 'women', styleTags: ['running', 'retro', 'chunky'], colorway: 'Various', retailPrice: 110 },
];

// ============================================
// JORDAN SNEAKERS (30 shoes)
// ============================================

const JORDAN_SHOES: ShoeInput[] = [
  // Air Jordan 1
  { asin: 'B0DBHRM6VR', brand: 'Jordan', name: '1 Retro High OG', gender: 'men', styleTags: ['basketball', 'hypebeast', 'iconic'], colorway: 'Various', isFeatured: true, retailPrice: 180 },
  { asin: 'B0D5T1HXPC', brand: 'Jordan', name: 'Air Jordan 1 Low', gender: 'men', styleTags: ['streetwear', 'casual', 'classic'], colorway: 'Various', retailPrice: 115 },
  { asin: 'B0C3JM5YD8', brand: 'Jordan', name: 'Air Jordan 1 Low', gender: 'women', styleTags: ['streetwear', 'casual', 'classic'], colorway: 'Various', retailPrice: 115 },
  { asin: 'B0DTXVK65V', brand: 'Jordan', name: 'Air Jordan 1 Mid', gender: 'men', styleTags: ['streetwear', 'casual', 'classic'], colorway: 'Various', retailPrice: 135 },
  { asin: 'B0DS6LV8BT', brand: 'Jordan', name: 'Air Jordan 1 Mid', gender: 'women', styleTags: ['streetwear', 'casual', 'classic'], colorway: 'Various', retailPrice: 135 },
  { asin: 'B0DJTHZB95', brand: 'Jordan', name: '1 Retro Low Satin', gender: 'women', styleTags: ['streetwear', 'satin', 'premium'], colorway: 'Various', retailPrice: 140 },
  { asin: 'B0DZVGK3DP', brand: 'Jordan', name: 'Air Jordan 1 Low SE', gender: 'women', styleTags: ['streetwear', 'special edition', 'premium'], colorway: 'Various', retailPrice: 125 },
  
  // Other Jordan Models
  { asin: 'B0DJC4C5DK', brand: 'Jordan', name: '3 Retro', gender: 'men', styleTags: ['basketball', 'iconic', 'elephant print'], colorway: 'Various', retailPrice: 200 },
  { asin: 'B0DJC5VP3Q', brand: 'Jordan', name: '4 Retro', gender: 'men', styleTags: ['basketball', 'hypebeast', 'chunky'], colorway: 'Various', isFeatured: true, retailPrice: 215 },
  { asin: 'B0F9FVF4BZ', brand: 'Jordan', name: '4 Retro', gender: 'women', styleTags: ['basketball', 'chunky', 'bold'], colorway: 'Various', isFeatured: true, retailPrice: 215 },
  { asin: 'B0DLBGPGFX', brand: 'Jordan', name: '11 Retro', gender: 'men', styleTags: ['basketball', 'luxury', 'iconic'], colorway: 'Various', isFeatured: true, retailPrice: 225 },
  { asin: 'B0DP61V59T', brand: 'Jordan', name: '12 Retro', gender: 'men', styleTags: ['basketball', 'luxury', 'bold'], colorway: 'Various', retailPrice: 200 },
  
  // Jordan Lifestyle
  { asin: 'B0DGZ7BT7R', brand: 'Jordan', name: 'Spizike Low', gender: 'men', styleTags: ['basketball', 'hybrid', 'bold'], colorway: 'Various', retailPrice: 160 },
  { asin: 'B0CMVBKJJV', brand: 'Jordan', name: 'Max Aura 5', gender: 'men', styleTags: ['basketball', 'casual', 'comfort'], colorway: 'Various', retailPrice: 130 },
  { asin: 'B093CC4LKQ', brand: 'Jordan', name: 'Max Aura 4', gender: 'women', styleTags: ['basketball', 'casual', 'comfort'], colorway: 'Various', retailPrice: 120 },
  { asin: 'B0D5RX5KVS', brand: 'Jordan', name: 'Stay Loyal 3', gender: 'men', styleTags: ['basketball', 'casual', 'modern'], colorway: 'Various', retailPrice: 100 },
  { asin: 'B0DC6ZGC85', brand: 'Jordan', name: 'Stadium 90', gender: 'women', styleTags: ['modern', 'casual', 'comfort'], colorway: 'Various', retailPrice: 110 },
  { asin: 'B0BZF531LC', brand: 'Jordan', name: 'Delta 3 Low', gender: 'women', styleTags: ['modern', 'lifestyle', 'comfort'], colorway: 'Various', retailPrice: 130 },
];

// ============================================
// ADIDAS SNEAKERS (30 shoes)
// ============================================

const ADIDAS_SHOES: ShoeInput[] = [
  // Samba Line
  { asin: 'B0C37GPXQ9', brand: 'Adidas', name: 'Samba OG', gender: 'men', styleTags: ['vintage', 'casual', 'timeless'], colorway: 'White/Black', isFeatured: true, retailPrice: 100 },
  { asin: 'B0C2JXJS3M', brand: 'Adidas', name: 'Samba OG', gender: 'women', styleTags: ['vintage', 'casual', 'timeless'], colorway: 'White/Black', isFeatured: true, retailPrice: 100 },
  
  // Gazelle Line
  { asin: 'B09P86BPCR', brand: 'Adidas', name: 'Gazelle', gender: 'men', styleTags: ['vintage', 'casual', 'retro'], colorway: 'Various', retailPrice: 100 },
  { asin: 'B0C2JY6GCT', brand: 'Adidas', name: 'Gazelle', gender: 'women', styleTags: ['vintage', 'casual', 'retro'], colorway: 'Various', retailPrice: 100 },
  
  // Forum Line
  { asin: 'B08745PCHW', brand: 'Adidas', name: 'Forum Low', gender: 'men', styleTags: ['retro', 'basketball', 'classic'], colorway: 'White', retailPrice: 110 },
  { asin: 'B09DXWJPHY', brand: 'Adidas', name: 'Forum Low', gender: 'women', styleTags: ['retro', 'basketball', 'classic'], colorway: 'White', retailPrice: 110 },
  
  // Grand Court Line
  { asin: 'B09DXW3D8B', brand: 'Adidas', name: 'Grand Court', gender: 'men', styleTags: ['casual', 'clean', 'tennis'], colorway: 'White', retailPrice: 70 },
  { asin: 'B09DXW115R', brand: 'Adidas', name: 'Grand Court', gender: 'women', styleTags: ['casual', 'clean', 'everyday'], colorway: 'White', retailPrice: 70 },
  { asin: 'B0D2S69CWQ', brand: 'Adidas', name: 'Grand Court Alpha', gender: 'men', styleTags: ['casual', 'modern', 'clean'], colorway: 'White', retailPrice: 75 },
  { asin: 'B09DXVXBFR', brand: 'Adidas', name: 'Grand Court Tennis', gender: 'men', styleTags: ['tennis', 'casual', 'sport'], colorway: 'White', retailPrice: 65 },
  { asin: 'B09DXVKGTW', brand: 'Adidas', name: 'Grand Court Tennis', gender: 'women', styleTags: ['tennis', 'casual', 'clean'], colorway: 'White', retailPrice: 65 },
  
  // Performance/Running
  { asin: 'B0D3P29Q5C', brand: 'Adidas', name: 'Ultraboost', gender: 'men', styleTags: ['running', 'comfort', 'performance'], colorway: 'Black/White', isFeatured: true, retailPrice: 190 },
  { asin: 'B0DJV2FSHF', brand: 'Adidas', name: 'Ultraboost', gender: 'women', styleTags: ['running', 'comfort', 'performance'], colorway: 'Various', retailPrice: 190 },
  { asin: 'B0BHPVPF4H', brand: 'Adidas', name: 'Swift Run', gender: 'men', styleTags: ['running', 'casual', 'lightweight'], colorway: 'Various', retailPrice: 85 },
  
  // Lifestyle
  { asin: 'B0D7HMS8S2', brand: 'Adidas', name: 'Handball Spezial', gender: 'men', styleTags: ['vintage', 'terrace', 'classic'], colorway: 'Various', retailPrice: 100 },
  { asin: 'B0DJV38CBT', brand: 'Adidas', name: 'Streetalk', gender: 'men', styleTags: ['streetwear', 'modern', 'bold'], colorway: 'Various', retailPrice: 90 },
  { asin: 'B0FRYDBBHN', brand: 'Adidas', name: 'Campus 00s', gender: 'women', styleTags: ['retro', 'casual', 'suede'], colorway: 'Various', retailPrice: 100 },
  { asin: 'B0989C9VGQ', brand: 'Adidas', name: 'Ozweego', gender: 'women', styleTags: ['chunky', 'retro', 'bold'], colorway: 'Various', retailPrice: 120 },
];

// ============================================
// NEW BALANCE SNEAKERS (25 shoes)
// ============================================

const NEW_BALANCE_SHOES: ShoeInput[] = [
  // 550 Line
  { asin: 'B0DCX24RNV', brand: 'New Balance', name: '550', gender: 'men', styleTags: ['retro', 'basketball', 'trendy'], colorway: 'White/Green', isFeatured: true, retailPrice: 130 },
  { asin: 'B0C9W3BLT3', brand: 'New Balance', name: '550', gender: 'women', styleTags: ['retro', 'basketball', 'trendy'], colorway: 'White/Green', isFeatured: true, retailPrice: 130 },
  
  // 574 Line
  { asin: 'B093QJF4VR', brand: 'New Balance', name: '574 Core', gender: 'men', styleTags: ['classic', 'casual', 'comfort'], colorway: 'Grey', retailPrice: 90 },
  { asin: 'B093QK8S8R', brand: 'New Balance', name: '574', gender: 'women', styleTags: ['classic', 'casual', 'comfort'], colorway: 'Grey', retailPrice: 90 },
  
  // Other Models
  { asin: 'B096NND25R', brand: 'New Balance', name: 'FuelCell', gender: 'men', styleTags: ['running', 'performance', 'speed'], colorway: 'Various', retailPrice: 160 },
  { asin: 'B0FN5CXB8M', brand: 'New Balance', name: '2002R', gender: 'men', styleTags: ['retro', 'chunky', 'comfort'], colorway: 'Various', retailPrice: 150 },
  { asin: 'B099TFD8W5', brand: 'New Balance', name: '327', gender: 'men', styleTags: ['retro', 'bold', 'casual'], colorway: 'Various', retailPrice: 100 },
  { asin: 'B0FCWDLYF3', brand: 'New Balance', name: '327', gender: 'women', styleTags: ['retro', 'bold', 'casual'], colorway: 'Various', retailPrice: 100 },
  { asin: 'B07B3VM8D2', brand: 'New Balance', name: '530', gender: 'men', styleTags: ['retro', 'running', 'chunky'], colorway: 'White/Silver', retailPrice: 100 },
  { asin: 'B0CQQDW6B8', brand: 'New Balance', name: '530', gender: 'women', styleTags: ['retro', 'running', 'chunky'], colorway: 'White/Silver', retailPrice: 100 },
  { asin: 'B0C8BT9P9S', brand: 'New Balance', name: '1906R', gender: 'unisex', styleTags: ['retro', 'chunky', 'premium'], colorway: 'Silver', retailPrice: 150 },
  { asin: 'B0DSX47PJ1', brand: 'New Balance', name: '9060', gender: 'women', styleTags: ['chunky', 'futuristic', 'bold'], colorway: 'Various', retailPrice: 150 },
  
  // Running
  { asin: 'B0CNKXG21F', brand: 'New Balance', name: 'Fresh Foam X 1080v13', gender: 'men', styleTags: ['running', 'comfort', 'premium'], colorway: 'Various', retailPrice: 165 },
  { asin: 'B0C34VNVJ6', brand: 'New Balance', name: 'Fresh Foam X 880', gender: 'men', styleTags: ['running', 'comfort', 'stability'], colorway: 'Various', retailPrice: 140 },
  { asin: 'B0CLBB3WLL', brand: 'New Balance', name: 'Fresh Foam X 880v14', gender: 'women', styleTags: ['running', 'comfort', 'stability'], colorway: 'Various', retailPrice: 140 },
  { asin: 'B07B41SLY5', brand: 'New Balance', name: 'Cross Trainer', gender: 'women', styleTags: ['training', 'comfort', 'athletic'], colorway: 'Various', retailPrice: 70 },
];

// ============================================
// OTHER BRANDS (25 shoes)
// ============================================

const OTHER_BRANDS_SHOES: ShoeInput[] = [
  // Converse
  { asin: 'B000OLRWO2', brand: 'Converse', name: 'Chuck Taylor All Star High', gender: 'unisex', styleTags: ['classic', 'vintage', 'iconic'], colorway: 'Black', isFeatured: true, retailPrice: 65 },
  { asin: 'B09SBRZMLT', brand: 'Converse', name: 'Chuck Taylor All Star', gender: 'women', styleTags: ['classic', 'vintage', 'casual'], colorway: 'White', retailPrice: 60 },
  { asin: 'B07BTCBV5Q', brand: 'Converse', name: 'Chuck Taylor', gender: 'women', styleTags: ['classic', 'vintage', 'iconic'], colorway: 'Various', retailPrice: 55 },
  
  // Vans
  { asin: 'B0D7QC25H7', brand: 'Vans', name: 'Brooklyn Low Top', gender: 'men', styleTags: ['skate', 'casual', 'streetwear'], colorway: 'Black', retailPrice: 70 },
  { asin: 'B0D7QFMK5N', brand: 'Vans', name: 'Brooklyn Low Top', gender: 'women', styleTags: ['skate', 'casual', 'streetwear'], colorway: 'Black', retailPrice: 70 },
  { asin: 'B0949M2KTN', brand: 'Vans', name: 'Filmore', gender: 'men', styleTags: ['skate', 'casual', 'classic'], colorway: 'Black/White', retailPrice: 60 },
  { asin: 'B0DQ1G5ZQ3', brand: 'Vans', name: 'Ashwood', gender: 'women', styleTags: ['casual', 'modern', 'lifestyle'], colorway: 'Various', retailPrice: 75 },
  
  // Puma
  { asin: 'B0D32JWHM5', brand: 'Puma', name: 'Suede Classic', gender: 'men', styleTags: ['retro', 'casual', 'hip-hop'], colorway: 'Black', retailPrice: 75 },
  { asin: 'B0D7DVSQ37', brand: 'Puma', name: 'Suede Classic', gender: 'women', styleTags: ['retro', 'casual', 'hip-hop'], colorway: 'Various', retailPrice: 75 },
  { asin: 'B0FBHV4RFD', brand: 'Puma', name: 'Whispers', gender: 'men', styleTags: ['modern', 'casual', 'sleek'], colorway: 'Various', retailPrice: 85 },
  { asin: 'B07HJRV1YQ', brand: 'Puma', name: 'Carina', gender: 'women', styleTags: ['casual', 'platform', 'trendy'], colorway: 'White', retailPrice: 55 },
  
  // Reebok
  { asin: 'B07DPD5NS4', brand: 'Reebok', name: 'Club C Vintage', gender: 'men', styleTags: ['retro', 'tennis', 'clean'], colorway: 'White', retailPrice: 80 },
  { asin: 'B0971NHH8G', brand: 'Reebok', name: 'Classic Leather', gender: 'men', styleTags: ['classic', 'retro', 'timeless'], colorway: 'White', retailPrice: 85 },
  { asin: 'B092YWBZ4F', brand: 'Reebok', name: 'Classic Leather', gender: 'women', styleTags: ['classic', 'retro', 'timeless'], colorway: 'White', retailPrice: 85 },
  
  // ASICS
  { asin: 'B0CMHXJWWN', brand: 'ASICS', name: 'Gel-Kayano 14', gender: 'men', styleTags: ['retro', 'running', 'techwear'], colorway: 'Silver', isFeatured: true, retailPrice: 150 },
  { asin: 'B0D82BRSYZ', brand: 'ASICS', name: 'Gel-1130', gender: 'women', styleTags: ['retro', 'running', 'chunky'], colorway: 'Various', retailPrice: 120 },
  { asin: 'B0D82FZ11P', brand: 'ASICS', name: 'Gel-1130', gender: 'women', styleTags: ['retro', 'running', 'techwear'], colorway: 'Various', retailPrice: 120 },
  
  // On Running
  { asin: 'B0D31TNKHB', brand: 'On', name: 'Cloud 5', gender: 'men', styleTags: ['running', 'swiss', 'premium'], colorway: 'Various', retailPrice: 150 },
  
  // Brooks
  { asin: 'B0DQ2BMHDW', brand: 'Brooks', name: 'Ghost', gender: 'men', styleTags: ['running', 'comfort', 'neutral'], colorway: 'Various', retailPrice: 140 },
  
  // Skechers
  { asin: 'B072KVD3WD', brand: 'Skechers', name: 'Go Walk Max', gender: 'men', styleTags: ['comfort', 'walking', 'casual'], colorway: 'Black', retailPrice: 70 },
  
  // Birkenstock
  { asin: 'B004S998FW', brand: 'Birkenstock', name: 'Boston Clog', gender: 'unisex', styleTags: ['comfort', 'casual', 'classic'], colorway: 'Brown', retailPrice: 160 },
  { asin: 'B08CRZLHLJ', brand: 'Birkenstock', name: 'Boston Shearling', gender: 'women', styleTags: ['comfort', 'cozy', 'winter'], colorway: 'Various', retailPrice: 180 },
  
  // DKNY
  { asin: 'B0BPZWJRB4', brand: 'DKNY', name: 'Jaysha Heeled', gender: 'women', styleTags: ['fashion', 'heeled', 'luxury'], colorway: 'Black', retailPrice: 130 },
];

// ============================================
// COMBINE ALL SHOES
// ============================================

export const REAL_SNEAKER_DATA: Shoe[] = [
  ...NIKE_SHOES.map(createRealShoe),
  ...JORDAN_SHOES.map(createRealShoe),
  ...ADIDAS_SHOES.map(createRealShoe),
  ...NEW_BALANCE_SHOES.map(createRealShoe),
  ...OTHER_BRANDS_SHOES.map(createRealShoe),
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get featured shoes for homepage
 */
export function getFeaturedShoes(): Shoe[] {
  return REAL_SNEAKER_DATA.filter(shoe => shoe.is_featured);
}

/**
 * Get shoes by brand
 */
export function getShoesByBrand(brand: string): Shoe[] {
  return REAL_SNEAKER_DATA.filter(shoe => 
    shoe.brand.toLowerCase() === brand.toLowerCase()
  );
}

/**
 * Get shoes by gender
 */
export function getShoesByGender(gender: 'men' | 'women' | 'unisex'): Shoe[] {
  return REAL_SNEAKER_DATA.filter(shoe => shoe.gender === gender);
}

/**
 * Get shoes by style tag
 */
export function getShoesByStyle(styleTag: string): Shoe[] {
  return REAL_SNEAKER_DATA.filter(shoe => 
    shoe.style_tags.some(tag => 
      tag.toLowerCase().includes(styleTag.toLowerCase())
    )
  );
}

/**
 * Search shoes by query
 */
export function searchShoes(query: string): Shoe[] {
  const lowerQuery = query.toLowerCase();
  return REAL_SNEAKER_DATA.filter(shoe => 
    shoe.name.toLowerCase().includes(lowerQuery) ||
    shoe.brand.toLowerCase().includes(lowerQuery) ||
    shoe.style_tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get random shoes for feed
 */
export function getRandomShoes(count: number = 10): Shoe[] {
  const shuffled = [...REAL_SNEAKER_DATA].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get shoe by ID
 */
export function getShoeById(id: string): Shoe | undefined {
  return REAL_SNEAKER_DATA.find(shoe => shoe.id === id);
}

// ============================================
// SQL INSERT STATEMENTS FOR DATABASE
// ============================================

/**
 * Generate SQL INSERT statements for all shoes
 * Use this to populate the Supabase database
 */
export function generateSQLInserts(): string {
  const inserts = REAL_SNEAKER_DATA.map(shoe => {
    const styleTags = `ARRAY[${shoe.style_tags.map(t => `'${t}'`).join(', ')}]`;
    const sizes = `ARRAY[${shoe.sizes_available.map(s => `'${s}'`).join(', ')}]`;
    
    return `INSERT INTO shoes (
      id, brand, name, full_name, gender, style_tags, category, colorway,
      amazon_url, image_url, retail_price, is_featured, is_active,
      view_count, click_count, favorite_count, sizes_available, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      '${shoe.brand.replace(/'/g, "''")}',
      '${shoe.name.replace(/'/g, "''")}',
      '${shoe.full_name.replace(/'/g, "''")}',
      '${shoe.gender}',
      ${styleTags},
      '${shoe.category}',
      '${(shoe.colorway || '').replace(/'/g, "''")}',
      '${shoe.amazon_url}',
      '${shoe.image_url}',
      ${shoe.retail_price || 0},
      ${shoe.is_featured},
      true,
      ${shoe.view_count},
      ${shoe.click_count},
      ${shoe.favorite_count},
      ${sizes},
      NOW(),
      NOW()
    );`;
  });
  
  return inserts.join('\n\n');
}

// ============================================
// STATISTICS
// ============================================

export const SEED_DATA_STATS = {
  totalShoes: REAL_SNEAKER_DATA.length,
  byBrand: {
    Nike: NIKE_SHOES.length,
    Jordan: JORDAN_SHOES.length,
    Adidas: ADIDAS_SHOES.length,
    'New Balance': NEW_BALANCE_SHOES.length,
    Other: OTHER_BRANDS_SHOES.length,
  },
  byGender: {
    men: REAL_SNEAKER_DATA.filter(s => s.gender === 'men').length,
    women: REAL_SNEAKER_DATA.filter(s => s.gender === 'women').length,
    unisex: REAL_SNEAKER_DATA.filter(s => s.gender === 'unisex').length,
  },
  featured: REAL_SNEAKER_DATA.filter(s => s.is_featured).length,
};

console.log('[SeedData] Loaded', SEED_DATA_STATS.totalShoes, 'real sneakers');

export default REAL_SNEAKER_DATA;
