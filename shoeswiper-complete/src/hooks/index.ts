// Export all hooks for easy importing
export { useAuth } from './useAuth';
export { useAuthGuard } from './useAuthGuard';
export { useSneakers } from './useSneakers';
export { useSneakerSearch } from './useSneakerSearch';
export { useOutfitAnalysis } from './useOutfitAnalysis';
export { useAdmin } from './useAdmin';
export { useNFTMarketplace } from './useNFTMarketplace';
export { useBlog, generateAffiliateUrl } from './useBlog';
export type { BlogPost, BlogCategory, BlogMetadata, AffiliateProduct } from './useBlog';
export { usePrices } from './usePrices';

// Animation hooks
export { useReducedMotion, useHaptics, useSwipeGesture } from './useAnimations';
export type { SwipeDirection } from './useAnimations';
