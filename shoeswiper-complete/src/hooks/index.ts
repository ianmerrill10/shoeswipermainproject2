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

// Animation hooks
export { useReducedMotion, useHaptics, useSwipeGesture } from './useAnimations';
export type { SwipeDirection } from './useAnimations';

// Seller verification
export { useSellerVerification } from './useSellerVerification';

// Escrow payments
export { useEscrow, ESCROW_STATUS_DISPLAY } from './useEscrow';
