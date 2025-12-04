# ShoeSwiper API Documentation

This document provides comprehensive documentation for all hooks and components in the ShoeSwiper application.

## Table of Contents

- [Hooks](#hooks)
  - [useAdmin](#useadmin)
  - [useAnalytics](#useanalytics)
  - [useAnimations](#useanimations)
  - [useAuth](#useauth)
  - [useAuthGuard](#useauthguard)
  - [useBlog](#useblog)
  - [useEmailCapture](#useemailcapture)
  - [useFavorites](#usefavorites)
  - [useNFTMarketplace](#usenftmarketplace)
  - [useOnboarding](#useonboarding)
  - [useOutfitAnalysis](#useoutfitanalysis)
  - [usePriceAlerts](#usepricealerts)
  - [usePushNotifications](#usepushnotifications)
  - [useReferral](#usereferral)
  - [useSneakerSearch](#usesneakersearch)
  - [useSneakers](#usesneakers)
- [Components](#components)
  - [Core Components](#core-components)
  - [Admin Components](#admin-components)
  - [Blog Components](#blog-components)
  - [Check-Fit Components](#check-fit-components)
  - [NFT Components](#nft-components)
  - [Onboarding Components](#onboarding-components)
- [State Management (Zustand Stores)](#state-management-zustand-stores)
  - [useAppStore](#useappstore)
  - [useUIStore](#useuistore)
- [Type Definitions](#type-definitions)
- [Configuration Reference](#configuration-reference)
- [Utility Functions](#utility-functions)

---

## Hooks

### useAdmin

Admin dashboard hook for product management, user oversight, and analytics.

**Location:** `src/hooks/useAdmin.ts`

#### Usage

```typescript
import { useAdmin } from '@/hooks/useAdmin';

const AdminDashboard = () => {
  const {
    isAdmin,
    loading,
    getProducts,
    saveProduct,
    deleteProduct,
    getAnalytics
  } = useAdmin();

  // Check admin status
  if (!isAdmin) return <AccessDenied />;

  // Fetch products
  const products = await getProducts();
};
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `isAdmin` | `boolean \| null` | Whether current user is admin |
| `loading` | `boolean` | Loading state for operations |
| `getProducts` | `() => Promise<Shoe[]>` | Fetch all products |
| `saveProduct` | `(product: Partial<Shoe>) => Promise<Shoe[]>` | Create or update product |
| `deleteProduct` | `(id: string) => Promise<void>` | Delete a product |
| `getAnalytics` | `() => Promise<AnalyticsData>` | Get analytics data |

#### Notes

- Admin access is restricted to `ADMIN_EMAIL` (dadsellsgadgets@gmail.com)
- All Amazon URLs are automatically formatted with the affiliate tag `shoeswiper-20`
- Admin actions are logged to `audit_logs` table in production

---

### useAnalytics

Event tracking hook for user interactions, affiliate clicks, and engagement metrics.

**Location:** `src/hooks/useAnalytics.ts`

#### Usage

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

const SneakerCard = ({ shoe }) => {
  const {
    trackShoeView,
    trackShoeClick,
    trackMusicClick,
    trackPanelOpen,
    trackShare,
    trackFavorite
  } = useAnalytics();

  useEffect(() => {
    trackShoeView(shoe.id);
  }, [shoe.id]);

  const handleBuyClick = () => {
    trackShoeClick(shoe.id);
    window.open(shoe.amazonUrl);
  };
};
```

#### Event Types

```typescript
type AnalyticsEvent =
  | 'shoe_view'
  | 'shoe_click'
  | 'music_click'
  | 'panel_open'
  | 'share'
  | 'favorite'
  | 'swipe';
```

#### Returns

| Method | Description |
|--------|-------------|
| `trackEvent(event, data)` | Core tracking function |
| `trackShoeView(shoeId)` | Track when a shoe card becomes visible |
| `trackShoeClick(shoeId)` | Track Amazon buy button clicks |
| `trackMusicClick(platform, shoeId, song, artist)` | Track music link clicks |
| `trackPanelOpen(panelType, shoeId)` | Track panel opens (shoe/music) |
| `trackShare(shoeId, method)` | Track share actions |
| `trackFavorite(shoeId, action)` | Track favorite add/remove |
| `getAnalyticsSummary()` | Get aggregated analytics |

---

### useAnimations

Animation and gesture hooks for accessibility and mobile interactions.

**Location:** `src/hooks/useAnimations.ts`

This module exports three animation-related hooks: `useReducedMotion`, `useHaptics`, and `useSwipeGesture`.

#### useReducedMotion

Detects user's prefers-reduced-motion setting for accessibility.

```typescript
import { useReducedMotion } from '@/hooks/useAnimations';

const AnimatedComponent = () => {
  const { prefersReducedMotion, animationsEnabled } = useReducedMotion();

  return (
    <motion.div
      animate={animationsEnabled ? { scale: 1.1 } : undefined}
    >
      {/* Content */}
    </motion.div>
  );
};
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `prefersReducedMotion` | `boolean` | Whether user prefers reduced motion |
| `animationsEnabled` | `boolean` | Inverse of prefersReducedMotion |

#### useHaptics

Manages haptic feedback (vibration) on supported devices.

```typescript
import { useHaptics } from '@/hooks/useAnimations';

const SwipeableCard = () => {
  const { isSupported, trigger, triggerCustom } = useHaptics();

  const handleSwipe = () => {
    trigger('swipe');  // Built-in pattern
  };

  const handleSuccess = () => {
    trigger('success');  // Built-in pattern
  };

  const handleCustom = () => {
    triggerCustom([50, 100, 50]);  // Custom vibration pattern
  };
};
```

**Haptic Patterns:**

| Pattern | Description |
|---------|-------------|
| `light` | Short light vibration (10ms) |
| `medium` | Medium vibration (20ms) |
| `heavy` | Strong vibration (30ms) |
| `success` | Success feedback pattern |
| `error` | Error feedback pattern |
| `swipe` | Swipe gesture feedback |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `isSupported` | `boolean` | Whether device supports haptics |
| `trigger` | `(pattern) => void` | Trigger predefined pattern |
| `triggerCustom` | `(pattern: number[]) => void` | Trigger custom pattern |

#### useSwipeGesture

Manages swipe gesture state for card interactions.

```typescript
import { useSwipeGesture, SwipeDirection } from '@/hooks/useAnimations';

const SwipeCard = () => {
  const { state, reset, updateDrag, endDrag } = useSwipeGesture({
    threshold: 100,
    onSwipe: (direction: SwipeDirection) => {
      console.log(`Swiped ${direction}`);
    },
    onCancel: () => {
      console.log('Swipe cancelled');
    },
    enabled: true,
  });

  return (
    <div
      onPointerMove={(e) => updateDrag(e.movementX, e.movementY)}
      onPointerUp={(e) => endDrag(e.movementX, e.movementY)}
    >
      {state.thresholdReached && <SwipeIndicator direction={state.direction} />}
    </div>
  );
};
```

**Config Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `100` | Pixels required to trigger swipe |
| `onSwipe` | `(direction) => void` | - | Callback when swipe completes |
| `onCancel` | `() => void` | - | Callback when swipe is cancelled |
| `enabled` | `boolean` | `true` | Whether swipe is enabled |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `state` | `SwipeState` | Current swipe state |
| `reset` | `() => void` | Reset swipe state |
| `updateDrag` | `(x, y) => void` | Update state based on drag position |
| `endDrag` | `(velocityX, velocityY) => void` | Complete the swipe gesture |

**SwipeState Interface:**

```typescript
interface SwipeState {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  progress: number;        // -1 to 1
  isDragging: boolean;
  thresholdReached: boolean;
}
```

---

### useAuth

Authentication hook for user sign-in, sign-up, and session management.

**Location:** `src/hooks/useAuth.ts`

#### Usage

```typescript
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
  const {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthenticated
  } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
};
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `session` | `Session \| null` | Current session |
| `loading` | `boolean` | Auth state loading |
| `signIn` | `(email, password) => Promise` | Email/password sign in |
| `signUp` | `(email, password, username?) => Promise` | Create new account |
| `signInWithGoogle` | `() => Promise` | OAuth sign in with Google |
| `signOut` | `() => Promise` | Sign out current user |
| `isAuthenticated` | `boolean` | Quick auth check |

---

### useAuthGuard

Protected route guard that checks if user's email is in the allowed list.

**Location:** `src/hooks/useAuthGuard.ts`

#### Usage

```typescript
import { useAuthGuard } from '@/hooks/useAuthGuard';

const ProtectedPage = () => {
  const { user, loading, isAllowed } = useAuthGuard();

  if (loading) return <LoadingSpinner />;
  if (!isAllowed) return <AccessDenied />;

  return <ProtectedContent />;
};
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current user |
| `loading` | `boolean` | Loading state |
| `isAllowed` | `boolean` | Whether user email is in ALLOWED_EMAILS |

#### Notes

- In DEMO_MODE, authentication is bypassed and all users are allowed
- `ALLOWED_EMAILS` is defined in `src/lib/config.ts`

---

### useBlog

React Query hooks for blog content management.

**Location:** `src/hooks/useBlog.ts`

#### Usage

```typescript
import { useBlogPosts, useBlogPost, useSubscribeToBlog } from '@/hooks/useBlog';

const BlogPage = () => {
  const { data: posts, isLoading } = useBlogPosts('sneakers', { page: 1 });
  const { data: post } = useBlogPost('sneakers', 'best-running-shoes-2024');
  const subscribeMutation = useSubscribeToBlog('sneakers');

  const handleSubscribe = (email: string) => {
    subscribeMutation.mutate(email);
  };
};
```

#### Available Hooks

| Hook | Description |
|------|-------------|
| `useBlogPosts(blogType, params)` | Fetch paginated blog posts |
| `useBlogPost(blogType, slug)` | Fetch single blog post |
| `useRelatedPosts(blogType, postId, limit)` | Fetch related posts |
| `useFeaturedPosts(blogType, limit)` | Fetch featured posts |
| `useLatestPosts(limit)` | Fetch latest across all blogs |
| `useBlogSearch(blogType, query, page)` | Search blog posts |
| `useRecordView()` | Mutation to record post view |
| `useRecordAffiliateClick()` | Mutation to record affiliate click |
| `useSubscribeToBlog(blogType)` | Mutation to subscribe to blog |

---

### useEmailCapture

Email subscription and preference management hook.

**Location:** `src/hooks/useEmailCapture.ts`

#### Usage

```typescript
import { useEmailCapture } from '@/hooks/useEmailCapture';

const NewsletterSignup = ({ shoeId, shoeName }) => {
  const {
    email,
    isSubscribed,
    preferences,
    captureEmail,
    updatePreferences
  } = useEmailCapture();

  const handleSubscribe = async (userEmail: string) => {
    const result = await captureEmail(
      userEmail,
      'price_alert',
      { id: shoeId, name: shoeName },
      { priceAlerts: true }
    );
    if (result.success) {
      // Success!
    }
  };
};
```

#### Source Types

```typescript
type EmailSource = 'price_alert' | 'newsletter' | 'exit_intent' | 'referral';
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `email` | `string \| null` | Captured email address |
| `isSubscribed` | `boolean` | Subscription status |
| `preferences` | `object` | Email preferences |
| `loading` | `boolean` | Loading state |
| `isValidEmail` | `(email) => boolean` | Validate email format |
| `captureEmail` | `(email, source, shoeData?, prefs?) => Promise` | Capture email |
| `updatePreferences` | `(prefs) => Promise<boolean>` | Update preferences |
| `unsubscribe` | `() => Promise<boolean>` | Unsubscribe |
| `getAllEmails` | `() => Promise<CapturedEmail[]>` | Admin: get all emails |

---

### useFavorites

User favorites/closet management hook.

**Location:** `src/hooks/useFavorites.ts`

#### Usage

```typescript
import { useFavorites } from '@/hooks/useFavorites';

const ShoeCard = ({ shoe }) => {
  const {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  } = useFavorites();

  const handleFavorite = async () => {
    await toggleFavorite(shoe.id);
  };

  return (
    <button onClick={handleFavorite}>
      {isFavorite(shoe.id) ? '❤️' : '🤍'}
    </button>
  );
};
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `favorites` | `Set<string>` | Set of favorite shoe IDs |
| `loading` | `boolean` | Loading state |
| `addFavorite` | `(shoeId) => Promise<boolean>` | Add to favorites |
| `removeFavorite` | `(shoeId) => Promise<boolean>` | Remove from favorites |
| `toggleFavorite` | `(shoeId) => Promise<boolean>` | Toggle favorite status |
| `isFavorite` | `(shoeId) => boolean` | Check if shoe is favorited |
| `getFavoriteCount` | `() => number` | Get total favorites count |
| `getFavoriteIds` | `() => string[]` | Get all favorite IDs |
| `refreshFavorites` | `() => void` | Refresh favorites from storage |

---

### useNFTMarketplace

NFT minting, buying, and listing functionality.

**Location:** `src/hooks/useNFTMarketplace.ts`

#### Usage

```typescript
import { useNFTMarketplace } from '@/hooks/useNFTMarketplace';

const NFTPage = () => {
  const {
    nfts,
    isLoading,
    error,
    listNFTs,
    mintNFT,
    buyNFT,
    listForSale
  } = useNFTMarketplace();

  // Fetch marketplace NFTs
  useEffect(() => {
    listNFTs({ filter: 'for_sale' });
  }, []);

  // Mint a new NFT
  const handleMint = async (shoeId: string, proofImages: File[]) => {
    await mintNFT(shoeId, proofImages, 'rare');
  };
};
```

#### Rarity Types

```typescript
type Rarity = 'common' | 'rare' | 'legendary' | 'grail';
```

#### Filter Types

```typescript
type NFTFilter = 'all' | 'for_sale' | 'auction' | 'recent';
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `nfts` | `NFT[]` | Array of NFTs |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `listNFTs` | `(params?) => Promise<NFT[]>` | Fetch NFTs with filters |
| `mintNFT` | `(shoeId, proofs, rarity) => Promise<NFT>` | Mint new NFT |
| `buyNFT` | `(nftId) => Promise<NFT>` | Purchase an NFT |
| `listForSale` | `(nftId, priceEth) => Promise<NFT>` | List NFT for sale |

---

### useOnboarding

User onboarding flow state management.

**Location:** `src/hooks/useOnboarding.ts`

#### Usage

```typescript
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingFlow = () => {
  const {
    completed,
    currentStep,
    stylePreferences,
    favoriteBrands,
    nextStep,
    previousStep,
    setStylePreferences,
    setFavoriteBrands,
    completeOnboarding,
    skipOnboarding
  } = useOnboarding();

  if (completed) return <MainApp />;

  return <OnboardingStep step={currentStep} />;
};
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `completed` | `boolean` | Whether onboarding is complete |
| `currentStep` | `number` | Current step index |
| `stylePreferences` | `string[]` | Selected style tags |
| `favoriteBrands` | `string[]` | Selected favorite brands |
| `emailCaptured` | `boolean` | Email capture status |
| `pushEnabled` | `boolean` | Push notification status |
| `loading` | `boolean` | Loading state |
| `setCurrentStep` | `(step) => void` | Set current step |
| `nextStep` | `() => void` | Go to next step |
| `previousStep` | `() => void` | Go to previous step |
| `setStylePreferences` | `(styles) => void` | Save style preferences |
| `setFavoriteBrands` | `(brands) => void` | Save favorite brands |
| `completeOnboarding` | `() => void` | Mark onboarding complete |
| `skipOnboarding` | `() => void` | Skip remaining steps |
| `resetOnboarding` | `() => void` | Reset onboarding state |
| `getPreferences` | `() => OnboardingPreferences` | Get saved preferences |

---

### useOutfitAnalysis

AI-powered outfit analysis for sneaker recommendations.

**Location:** `src/hooks/useOutfitAnalysis.ts`

#### Usage

```typescript
import { useOutfitAnalysis } from '@/hooks/useOutfitAnalysis';

const CheckMyFit = () => {
  const {
    analyzeImage,
    manualAnalyze,
    isAnalyzing,
    analysis,
    recommendations,
    error
  } = useOutfitAnalysis();

  const handleImageUpload = async (file: File) => {
    await analyzeImage(file);
    // analysis and recommendations are now populated
  };

  // Fallback for manual selection
  const handleStyleSelect = async (style: string) => {
    await manualAnalyze(style);
  };
};
```

#### Analysis Result

```typescript
interface OutfitAnalysis {
  rating: number;           // 1-10 outfit rating
  style_tags: string[];     // Detected styles
  dominant_colors: string[]; // Detected colors
  detected_shoe: string;    // Detected shoe type
  feedback: string;         // AI feedback text
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `analyzeImage` | `(file: File) => Promise<void>` | Analyze outfit image |
| `manualAnalyze` | `(style: string) => Promise<void>` | Manual style selection |
| `isAnalyzing` | `boolean` | Analysis in progress |
| `analysis` | `OutfitAnalysis \| null` | Analysis results |
| `recommendations` | `Shoe[]` | Recommended sneakers |
| `error` | `string \| null` | Error message |

---

### usePriceAlerts

Price drop alert management hook.

**Location:** `src/hooks/usePriceAlerts.ts`

#### Usage

```typescript
import { usePriceAlerts } from '@/hooks/usePriceAlerts';

const ShoeDetail = ({ shoe }) => {
  const {
    alerts,
    notifications,
    unreadCount,
    addAlert,
    removeAlert,
    hasAlert,
    getAlert,
    markNotificationRead
  } = usePriceAlerts();

  const handleSetAlert = async (targetPrice: number) => {
    await addAlert(shoe, targetPrice);
  };

  return (
    <div>
      {hasAlert(shoe.id) ? (
        <span>Alert set at ${getAlert(shoe.id)?.targetPrice}</span>
      ) : (
        <PriceAlertButton onSet={handleSetAlert} />
      )}
    </div>
  );
};
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `alerts` | `PriceAlert[]` | Active price alerts |
| `notifications` | `PriceNotification[]` | Price drop notifications |
| `loading` | `boolean` | Loading state |
| `unreadCount` | `number` | Unread notifications count |
| `addAlert` | `(shoe, targetPrice) => Promise<boolean>` | Add price alert |
| `removeAlert` | `(shoeId) => Promise<boolean>` | Remove price alert |
| `hasAlert` | `(shoeId) => boolean` | Check if alert exists |
| `getAlert` | `(shoeId) => PriceAlert \| undefined` | Get alert for shoe |
| `simulatePriceDrop` | `(shoeId, newPrice) => void` | Demo: simulate price drop |
| `markNotificationRead` | `(notificationId) => void` | Mark as read |
| `clearNotifications` | `() => void` | Clear all notifications |

---

### usePushNotifications

Push notification permission and delivery management.

**Location:** `src/hooks/usePushNotifications.ts`

#### Usage

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationSettings = () => {
  const {
    isSupported,
    permission,
    settings,
    isEnabled,
    requestPermission,
    disablePush,
    updateSettings,
    notifyPriceDrop
  } = usePushNotifications();

  const handleEnable = async () => {
    const success = await requestPermission();
    if (success) {
      console.log('Push notifications enabled!');
    }
  };
};
```

#### Settings Interface

```typescript
interface PushSettings {
  enabled: boolean;
  priceDrops: boolean;
  newReleases: boolean;
  restocks: boolean;
  promotions: boolean;
  subscribedAt?: string;
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `isSupported` | `boolean` | Browser supports push |
| `permission` | `NotificationPermission` | Current permission state |
| `settings` | `PushSettings` | User's notification settings |
| `loading` | `boolean` | Loading state |
| `isEnabled` | `boolean` | Push fully enabled |
| `requestPermission` | `() => Promise<boolean>` | Request permission |
| `disablePush` | `() => Promise<void>` | Disable push |
| `updateSettings` | `(updates) => void` | Update notification settings |
| `registerServiceWorker` | `() => Promise` | Register service worker |
| `showLocalNotification` | `(title, body, data?) => Promise` | Show local notification |
| `notifyPriceDrop` | `(name, oldPrice, newPrice, url, id) => Promise` | Price drop notification |
| `notifyNewRelease` | `(name, brand, id) => Promise` | New release notification |
| `notifyRestock` | `(name, url, id) => Promise` | Restock notification |

---

### useReferral

Referral program management hook.

**Location:** `src/hooks/useReferral.ts`

#### Usage

```typescript
import { useReferral } from '@/hooks/useReferral';

const ReferralCard = () => {
  const {
    referralCode,
    referralStats,
    getReferralUrl,
    shareReferralLink,
    getRewardTier
  } = useReferral();

  const handleShare = async () => {
    const result = await shareReferralLink();
    if (result.success) {
      console.log(`Shared via ${result.method}`);
    }
  };

  const tier = getRewardTier();

  return (
    <div>
      <p>Your code: {referralCode}</p>
      <p>Tier: {tier.tier}</p>
      <p>Signups: {referralStats.totalSignups}</p>
      <button onClick={handleShare}>Share</button>
    </div>
  );
};
```

#### Reward Tiers

| Tier | Signups Required |
|------|-----------------|
| Starter | 0 |
| Bronze | 3 |
| Silver | 10 |
| Gold | 25 |
| Diamond | 50 |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `referralCode` | `string \| null` | User's referral code |
| `referralStats` | `ReferralStats` | Stats object |
| `loading` | `boolean` | Loading state |
| `trackShare` | `() => Promise<void>` | Track share action |
| `trackClick` | `(code) => Promise<void>` | Track referral click |
| `processReferralSignup` | `(code, userId) => Promise<void>` | Process signup |
| `getReferralUrl` | `() => string` | Get shareable URL |
| `getReferralMessage` | `() => string` | Get share message |
| `shareReferralLink` | `() => Promise<ShareResult>` | Share via native or clipboard |
| `checkReferralStatus` | `() => Promise<ReferralInfo \| null>` | Check if user was referred |
| `getRewardTier` | `() => TierInfo` | Get current reward tier |

---

### useSneakerSearch

Search and filter sneakers with full-text search.

**Location:** `src/hooks/useSneakerSearch.ts`

#### Usage

```typescript
import { useSneakerSearch } from '@/hooks/useSneakerSearch';

const SearchPage = () => {
  const { searchSneakers, results, isSearching } = useSneakerSearch();

  const handleSearch = async () => {
    await searchSneakers('jordan', {
      brands: ['Nike', 'Jordan'],
      minPrice: 100,
      maxPrice: 300,
      gender: 'men',
      sortBy: 'price_asc'
    });
  };

  return (
    <div>
      {isSearching ? <Loading /> : <SearchResults shoes={results} />}
    </div>
  );
};
```

#### Filter Options

```typescript
interface SearchFilters {
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  styleTags?: string[];
  colorTags?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'trending';
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `searchSneakers` | `(query, filters?) => Promise<void>` | Execute search |
| `results` | `Shoe[]` | Search results |
| `isSearching` | `boolean` | Search in progress |

---

### useSneakers

Main sneaker feed data fetching hook with React Query caching.

**Location:** `src/hooks/useSneakers.ts`

#### Usage

```typescript
import { useSneakers } from '@/hooks/useSneakers';

const FeedPage = () => {
  const {
    getInfiniteFeed,
    getFeaturedSneakers,
    getSneakerById,
    trackView,
    trackClick,
    loading,
    error,
    sneakersData
  } = useSneakers();

  // Load more sneakers for infinite scroll
  const loadMore = async (page: number) => {
    const shoes = await getInfiniteFeed(page, 5);
    return shoes;
  };

  // Track view when card is visible
  const handleVisible = (shoeId: string) => {
    trackView(shoeId);
  };

  // Track click when user taps buy
  const handleBuy = (shoeId: string) => {
    trackClick(shoeId);
  };
};
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `getInfiniteFeed` | `(page?, limit?) => Promise<Shoe[]>` | Get paginated feed |
| `getFeaturedSneakers` | `() => Promise<Shoe[]>` | Get featured shoes |
| `getSneakerById` | `(id) => Promise<Shoe \| null>` | Get single shoe |
| `trackView` | `(id) => Promise<void>` | Track shoe view |
| `trackClick` | `(id) => Promise<void>` | Track affiliate click |
| `loading` | `boolean` | Initial loading state |
| `error` | `string \| null` | Error message |
| `sneakersData` | `Shoe[] \| undefined` | Cached sneakers from React Query |

---

## Components

### Core Components

#### BottomNavigation

Main navigation bar at bottom of screen.

**Location:** `src/components/BottomNavigation.tsx`

```typescript
<BottomNavigation />
```

#### SneakerCard

Displays a single sneaker with variants for feed and grid views.

**Location:** `src/components/SneakerCard.tsx`

```typescript
<SneakerCard 
  shoe={shoe}
  variant="feed"  // or "grid"
  onFavorite={handleFavorite}
/>
```

#### ShoePanel

Expandable panel with shoe details.

**Location:** `src/components/ShoePanel.tsx`

#### MusicPanel

Panel showing linked music tracks for a sneaker.

**Location:** `src/components/MusicPanel.tsx`

#### EmailCaptureModal

Modal for capturing user emails with preference options.

**Location:** `src/components/EmailCaptureModal.tsx`

#### NotificationSettings

Settings panel for push notification preferences.

**Location:** `src/components/NotificationSettings.tsx`

#### NotificationsPanel

Panel showing user notifications.

**Location:** `src/components/NotificationsPanel.tsx`

#### PriceAlertButton

Button to set price alerts on a sneaker.

**Location:** `src/components/PriceAlertButton.tsx`

#### ReferralCard

Card displaying referral code and stats.

**Location:** `src/components/ReferralCard.tsx`

#### OnboardingFlow

Multi-step onboarding flow component.

**Location:** `src/components/OnboardingFlow.tsx`

#### SwipeableCard

Touch-enabled card with swipe gestures for the feed.

**Location:** `src/components/SwipeableCard.tsx`

```typescript
<SwipeableCard
  shoe={shoe}
  onSwipeLeft={handleReject}
  onSwipeRight={handleLike}
/>
```

#### BuyNowButton

Button that opens Amazon product page with affiliate tag.

**Location:** `src/components/BuyNowButton.tsx`

```typescript
<BuyNowButton 
  amazonUrl={shoe.amazon_url}
  onClickTracking={() => trackClick(shoe.id)}
/>
```

**Note:** All Amazon URLs should include the affiliate tag `?tag=shoeswiper-20`. Use the `formatAmazonUrl` utility or the `AFFILIATE_TAG` constant from `src/lib/config.ts` to ensure proper formatting. See [Affiliate Tag Requirement](#affiliate-tag-requirement) for implementation details.

#### LoadingSpinner

Reusable loading indicator component.

**Location:** `src/components/LoadingSpinner.tsx`

```typescript
<LoadingSpinner size="md" />  // sm, md, lg
```

#### MatchCelebration

Animated celebration overlay shown when a match is made.

**Location:** `src/components/MatchCelebration.tsx`

```typescript
<MatchCelebration 
  shoe={matchedShoe}
  onDismiss={handleDismiss}
/>
```

---

### Admin Components

**Location:** `src/components/admin/`

#### AdminLayout

Layout wrapper for admin pages with navigation.

```typescript
<AdminLayout>
  <AdminContent />
</AdminLayout>
```

---

### Blog Components

**Location:** `src/components/blog/`

Components for blog post display and navigation.

---

### Check-Fit Components

**Location:** `src/components/check-fit/`

Components for the AI outfit analysis feature.

---

### NFT Components

**Location:** `src/components/nft/`

#### NFTMarketplace

Main marketplace view for browsing NFTs.

#### NFTMintFlow

Multi-step flow for minting new NFTs.

#### NFTDetailModal

Modal showing NFT details and purchase options.

---

### Onboarding Components

**Location:** `src/components/onboarding/`

Step-by-step onboarding components for new users.

---

## State Management (Zustand Stores)

ShoeSwiper uses Zustand for global client-side state management.

### useAppStore

Global application state including user authentication and favorites.

**Location:** `src/store/useAppStore.ts`

```typescript
import { useAppStore } from '@/store/useAppStore';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    favorites,
    setUser,
    logout,
    toggleFavorite,
    setTheme
  } = useAppStore();

  // Check auth status
  if (!isAuthenticated) return <LoginPrompt />;

  // Toggle favorite
  const handleFavorite = (shoeId: string) => {
    toggleFavorite(shoeId);
  };
};
```

#### State

| Property | Type | Description |
|----------|------|-------------|
| `user` | `Profile \| null` | Current user profile |
| `isAuthenticated` | `boolean` | Authentication status |
| `favorites` | `Set<string>` | Set of favorited shoe IDs |
| `theme` | `string` | Current theme (`'light'` or `'dark'`) |

#### Actions

| Action | Description |
|--------|-------------|
| `setUser(user)` | Set current user profile |
| `logout()` | Clear user and reset auth state |
| `addFavorite(id)` | Add shoe to favorites |
| `removeFavorite(id)` | Remove shoe from favorites |
| `toggleFavorite(id)` | Toggle favorite status |
| `setTheme(theme)` | Set app theme |

---

### useUIStore

UI state for panels, modals, and notifications.

**Location:** `src/store/useUIStore.ts`

```typescript
import { useUIStore } from '@/store/useUIStore';

const FeedPage = () => {
  const {
    isMusicPanelOpen,
    isShoePanelOpen,
    activeShoeId,
    openShoePanel,
    closeShoePanel,
    addNotification
  } = useUIStore();

  const handleShoeClick = (shoeId: string) => {
    openShoePanel(shoeId);
  };

  const showSuccess = () => {
    addNotification({ 
      message: 'Added to favorites!', 
      type: 'success' 
    });
  };
};
```

#### State

| Property | Type | Description |
|----------|------|-------------|
| `isMusicPanelOpen` | `boolean` | Music panel visibility |
| `isShoePanelOpen` | `boolean` | Shoe details panel visibility |
| `isNotificationsPanelOpen` | `boolean` | Notifications panel visibility |
| `activeShoeId` | `string \| null` | Currently selected shoe ID |
| `notifications` | `Notification[]` | Toast notifications queue |

#### Actions

| Action | Description |
|--------|-------------|
| `openMusicPanel()` | Show music panel |
| `closeMusicPanel()` | Hide music panel |
| `openShoePanel(shoeId)` | Show shoe panel for specific shoe |
| `closeShoePanel()` | Hide shoe panel |
| `openNotificationsPanel()` | Show notifications panel |
| `closeNotificationsPanel()` | Hide notifications panel |
| `addNotification(notification)` | Add toast notification |
| `removeNotification(id)` | Remove specific notification |

---

## Type Definitions

All TypeScript types are defined in `src/lib/types.ts`. Key types include:

### Product Types
- `Shoe` - Product/sneaker data with pricing, images, and Amazon affiliate URL
- `Brand` - Brand information
- `Category` - Product category
- `PriceHistory` - Historical pricing data

### User Types
- `Profile` - User profile data
- `UserSneaker` - User's sneaker collection item

### NFT Types
- `NFT` - NFT token data
- `Rarity` - NFT rarity levels (`'common' | 'rare' | 'legendary' | 'grail'`)
- `NFTOwnershipHistory` - Transfer history

### Search & Filter Types
- `SearchFilters` - Search filter options
- `NFTFilter` - NFT marketplace filters
- `PaginationOptions` - Pagination configuration

### Analytics Types
- `AnalyticsData` - Analytics summary
- `AffiliateClick` - Click tracking data
- `AuditLog` - Admin action logs

### AI Types
- `OutfitAnalysis` - AI outfit analysis result

See the [types file](../shoeswiper-complete/src/lib/types.ts) for complete definitions.

---

## Configuration Reference

Key configuration values from `src/lib/config.ts`:

| Constant | Value | Description |
|----------|-------|-------------|
| `DEMO_MODE` | `true` | Toggle for local vs production mode |
| `AFFILIATE_TAG` | `'shoeswiper-20'` | Amazon affiliate tag (required on all Amazon URLs) |
| `SHOW_PRICES` | `false` | Enable when Amazon PA-API is connected |
| `ADMIN_EMAIL` | `'dadsellsgadgets@gmail.com'` | Admin dashboard access |
| `ALLOWED_EMAILS` | `['ianmerrill10@gmail.com', ADMIN_EMAIL]` | Authorized users for production |

### Affiliate Tag Requirement

**Important:** All Amazon URLs MUST include the affiliate tag `?tag=shoeswiper-20`. Use the `AFFILIATE_TAG` constant:

```typescript
import { AFFILIATE_TAG } from '@/lib/config';

const formatAmazonUrl = (url: string): string => {
  if (!url.includes('amazon.com')) return url;
  const urlObj = new URL(url);
  urlObj.searchParams.set('tag', AFFILIATE_TAG);
  return urlObj.toString();
};
```

---

## Utility Functions

### Validation Utilities

**Location:** `src/lib/validation.ts`

Security-focused input validation functions for ShoeSwiper.

| Function | Description |
|----------|-------------|
| `validateEmail(email)` | Validates and sanitizes email addresses |
| `validateUrl(url)` | Validates URLs, blocks dangerous protocols |
| `validatePrice(input)` | Validates and converts prices to cents |
| `validateDisplayName(name)` | Validates display names with profanity filter |
| `validateImageUpload(file)` | Validates image uploads (type, size, magic bytes) |
| `sanitizeSearchQuery(query)` | Sanitizes search queries against XSS/SQL injection |
| `sanitizeText(text)` | Escapes HTML special characters |
| `sanitizeHtml(html)` | Removes dangerous HTML tags and attributes |
| `isAllowedAffiliateDomain(url)` | Checks if URL is from allowed affiliate domain |

```typescript
import { validateEmail, sanitizeSearchQuery } from '@/lib/validation';

// Validate email
const result = validateEmail('user@example.com');
if (result.valid) {
  console.log('Valid email:', result.sanitized);
}

// Sanitize search query
const safeQuery = sanitizeSearchQuery(userInput);
```

### Deep Link Utilities

**Location:** `src/lib/deepLinks.ts`

Smart link generation for app installs and referral tracking.

| Function | Description |
|----------|-------------|
| `generateReferralCode(source, userId?)` | Generate unique referral tracking code |
| `createTrackedWebUrl(shoeId, referralCode)` | Create web URL with UTM parameters |
| `createDeepLinkUrl(shoeId, referralCode)` | Create app deep link URL |
| `createSmartShareLink(options)` | Create cross-platform share link |
| `createAffiliateShareData(shoe, source)` | Create share data with affiliate tracking |
| `parseDeepLink(url)` | Parse incoming deep link parameters |
| `trackReferralArrival(code)` | Track user arrival via referral |
| `generateQRCodeUrl(shoeId)` | Generate QR code URL for sharing |

```typescript
import { createAffiliateShareData, parseDeepLink } from '@/lib/deepLinks';

// Create share data with affiliate tag
const shareData = createAffiliateShareData(shoe, 'share_native');
// Result includes properly tagged Amazon URL

// Parse incoming deep link
const { shoeId, referralCode } = parseDeepLink(url);
```
