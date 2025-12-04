// ============================================
// DEEP LINK CONFIGURATION & UTILITIES
// ============================================
// Handles smart links that drive app installs + track referrals

import { getAffiliateUrl } from './supabaseClient';

// App identifiers (update when app is published)
export const APP_CONFIG = {
  // iOS App Store
  iosAppId: '', // e.g., '1234567890'
  iosAppStoreUrl: '', // e.g., 'https://apps.apple.com/app/shoeswiper/id1234567890'

  // Android Play Store
  androidPackage: '', // e.g., 'com.shoeswiper.app'
  androidPlayStoreUrl: '', // e.g., 'https://play.google.com/store/apps/details?id=com.shoeswiper.app'

  // Web fallback
  webBaseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://shoeswiper.com',

  // Deep link scheme
  scheme: 'shoeswiper://',

  // Universal link domain (for iOS universal links / Android app links)
  universalLinkDomain: 'shoeswiper.com',
};

// Referral tracking prefixes
export const REFERRAL_SOURCES = {
  share_native: 'shr_nat',
  share_clipboard: 'shr_clp',
  share_social: 'shr_soc',
  qr_code: 'qr',
  email: 'eml',
} as const;

export type ReferralSource = keyof typeof REFERRAL_SOURCES;

interface DeepLinkOptions {
  shoeId: string;
  shoeName: string;
  brand: string;
  imageUrl?: string;
  amazonUrl?: string;
  referralSource?: ReferralSource;
  referrerId?: string; // User ID who shared
}

interface ShareData {
  title: string;
  text: string;
  url: string;
  deepLinkUrl: string;
  webFallbackUrl: string;
}

/**
 * Generate a unique referral code for tracking
 */
export const generateReferralCode = (source: ReferralSource, userId?: string): string => {
  const prefix = REFERRAL_SOURCES[source];
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  const userPart = userId ? `_${userId.substring(0, 6)}` : '';
  return `${prefix}_${timestamp}${random}${userPart}`;
};

/**
 * Create a tracked web URL that includes referral info
 */
export const createTrackedWebUrl = (
  shoeId: string,
  referralCode: string
): string => {
  const baseUrl = APP_CONFIG.webBaseUrl;
  const params = new URLSearchParams({
    shoe: shoeId,
    ref: referralCode,
    utm_source: 'share',
    utm_medium: 'social',
    utm_campaign: 'shoe_share',
  });
  return `${baseUrl}/shoe/${shoeId}?${params.toString()}`;
};

/**
 * Create a deep link URL (app://path)
 */
export const createDeepLinkUrl = (shoeId: string, referralCode: string): string => {
  return `${APP_CONFIG.scheme}shoe/${shoeId}?ref=${referralCode}`;
};

/**
 * Create a universal link URL (https domain that apps can intercept)
 */
export const createUniversalLinkUrl = (
  shoeId: string,
  referralCode: string
): string => {
  const params = new URLSearchParams({
    ref: referralCode,
  });
  return `https://${APP_CONFIG.universalLinkDomain}/shoe/${shoeId}?${params.toString()}`;
};

/**
 * Create a smart link that works across platforms
 * - Opens app if installed (via universal link / deep link)
 * - Falls back to web with app install prompt
 * - Tracks referral source
 */
export const createSmartShareLink = (options: DeepLinkOptions): ShareData => {
  const {
    shoeId,
    shoeName,
    brand,
    referralSource = 'share_native',
  } = options;

  const referralCode = generateReferralCode(referralSource);

  // Primary URL: Universal link for app open or web fallback
  const webFallbackUrl = createTrackedWebUrl(shoeId, referralCode);
  const deepLinkUrl = createDeepLinkUrl(shoeId, referralCode);

  // For share, use the web URL (which can have app banner)
  const shareUrl = webFallbackUrl;

  return {
    title: `${brand} ${shoeName}`,
    text: `Check out these ${brand} ${shoeName} on ShoeSwiper! Swipe through the hottest sneakers 🔥`,
    url: shareUrl,
    deepLinkUrl,
    webFallbackUrl,
  };
};

/**
 * Create share data with affiliate tracking
 */
export const createAffiliateShareData = (
  shoe: {
    id: string;
    name: string;
    brand: string;
    amazon_url: string;
    image_url?: string;
  },
  source: ReferralSource = 'share_native'
): ShareData => {
  const referralCode = generateReferralCode(source);

  // Create the ShoeSwiper link (drives app installs)
  const shoeSwiperUrl = createTrackedWebUrl(shoe.id, referralCode);

  // Use centralized getAffiliateUrl to ensure tag is always present
  const amazonUrlWithAffiliate = getAffiliateUrl(shoe.amazon_url);

  return {
    title: `${shoe.brand} ${shoe.name}`,
    text: `🔥 ${shoe.brand} ${shoe.name}\n\n👟 View in ShoeSwiper: ${shoeSwiperUrl}\n\n🛒 Buy on Amazon: ${amazonUrlWithAffiliate}\n\n#ShoeSwiper #Sneakers #${shoe.brand.replace(/\s+/g, '')}`,
    url: shoeSwiperUrl, // Primary link is ShoeSwiper (for app installs)
    deepLinkUrl: createDeepLinkUrl(shoe.id, referralCode),
    webFallbackUrl: shoeSwiperUrl,
  };
};

/**
 * Parse incoming deep link and extract parameters
 */
export const parseDeepLink = (url: string): {
  shoeId?: string;
  referralCode?: string;
  source?: string;
} => {
  try {
    // Handle both scheme (shoeswiper://) and https URLs
    const urlObj = new URL(url.replace(APP_CONFIG.scheme, 'https://placeholder.com/'));
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    let shoeId: string | undefined;

    // Parse path like /shoe/123
    if (pathParts[0] === 'shoe' && pathParts[1]) {
      shoeId = pathParts[1];
    }

    const referralCode = urlObj.searchParams.get('ref') || undefined;

    // Extract source from referral code prefix
    let source: string | undefined;
    if (referralCode) {
      const prefix = referralCode.split('_')[0];
      source = Object.entries(REFERRAL_SOURCES).find(
        ([, value]) => value === prefix
      )?.[0];
    }

    return { shoeId, referralCode, source };
  } catch {
    return {};
  }
};

/**
 * Track when a user arrives via referral link
 */
export const trackReferralArrival = async (referralCode: string): Promise<void> => {
  // Store referral in localStorage for attribution
  localStorage.setItem('shoeswiper_referral', JSON.stringify({
    code: referralCode,
    arrivedAt: new Date().toISOString(),
  }));

  // In production, send to analytics
  if (import.meta.env.DEV) console.warn('[DeepLink] Referral arrival tracked:', referralCode);
};

/**
 * Get app store link based on platform
 */
export const getAppStoreLink = (): string | null => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return APP_CONFIG.iosAppStoreUrl || null;
  }

  if (/android/.test(userAgent)) {
    return APP_CONFIG.androidPlayStoreUrl || null;
  }

  return null;
};

/**
 * Attempt to open app, fallback to web/store
 */
export const openAppOrFallback = async (
  deepLinkUrl: string,
  webFallbackUrl: string
): Promise<void> => {
  const appStoreLink = getAppStoreLink();

  // Try to open app via deep link
  const start = Date.now();
  window.location.href = deepLinkUrl;

  // If still here after 1.5s, app not installed
  setTimeout(() => {
    if (Date.now() - start < 2000) {
      // App didn't open, redirect to store or web
      window.location.href = appStoreLink || webFallbackUrl;
    }
  }, 1500);
};

/**
 * Generate QR code data URL for a shoe
 * (Uses a simple QR generation approach - in production use a library)
 */
export const generateQRCodeUrl = (shoeId: string): string => {
  const referralCode = generateReferralCode('qr_code');
  const shareUrl = createTrackedWebUrl(shoeId, referralCode);

  // Use a public QR code API (in production, use qrcode library)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
};
