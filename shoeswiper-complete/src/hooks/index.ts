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

// PWA hooks
export { usePWAInstall } from './usePWAInstall';
export type { UsePWAInstallReturn } from './usePWAInstall';
export { useSwipeGestures, useSwipePosition } from './useSwipeGestures';
export type { SwipeDirection, SwipeCallbacks, SwipeOptions, UseSwipeGesturesReturn, SwipePosition, UseSwipePositionReturn } from './useSwipeGestures';
