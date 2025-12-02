// ============================================
// SHOE / PRODUCT TYPES
// ============================================

export interface Shoe {
  id: string;
  name: string;
  brand: string;
  category_slug?: string;
  
  // Pricing
  price: number;
  retail_price?: number;
  sale_price?: number;
  currency?: string;
  
  // Media & Affiliate
  image_url: string;
  amazon_url: string; // Must include ?tag=shoeswiper-20
  amazon_asin?: string;
  
  // Attributes
  style_tags: string[];
  color_tags: string[];
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  sizes_available?: string[];
  release_date?: string;
  description?: string;
  
  // Metrics
  favorite_count: number;
  view_count: number;
  click_count: number;
  vibe_score?: number;
  
  // Status
  is_active: boolean;
  is_featured: boolean;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface PriceHistory {
  id: string;
  shoe_id: string;
  price: number;
  recorded_at: string;
}

// ============================================
// USER / PROFILE TYPES
// ============================================

export interface Profile {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  is_banned?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserSneaker {
  id: string;
  user_id: string;
  shoe_id: string;
  added_at: string;
  shoe?: Shoe;
}

// ============================================
// NFT TYPES
// ============================================

export type Rarity = 'common' | 'rare' | 'legendary' | 'grail';

export interface NFT {
  id: string;
  sneaker_id: string;
  owner_id: string;
  token_id: string;
  rarity: Rarity;
  minted_at: string | null;
  for_sale: boolean;
  price_eth: string | null;
  auction_end: string | null;
  sneaker?: Shoe | null;
  owner?: Profile | null;
}

export interface NFTOwnershipHistory {
  id: string;
  nft_id: string;
  from_user: string | null;
  to_user: string;
  price_eth: string | null;
  transferred_at: string;
}

// ============================================
// AI OUTFIT MATCH TYPES
// ============================================

export interface OutfitAnalysis {
  rating: number; // 1-10
  feedback: string;
  detectedShoes?: string;
  styleTags: string[];
  colorTags: string[];
  recommendations: Shoe[];
}

// ============================================
// SEARCH / FILTER TYPES
// ============================================

export interface SearchFilters {
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  styleTags?: string[];
  colorTags?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'trending';
}

export type NFTFilter = 'all' | 'for_sale' | 'auction' | 'recent';

// ============================================
// ADMIN / ANALYTICS TYPES
// ============================================

export interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  target_table: string;
  target_id?: string;
  details?: any;
  created_at: string;
}

export interface AffiliateClick {
  id: string;
  shoe_id: string;
  user_id?: string;
  clicked_at: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalProducts: number;
  clicks: AffiliateClick[];
  chartData?: { date: string; clicks: number }[];
}
