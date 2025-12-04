// ============================================
// SOCIAL SYNDICATION CONFIGURATION & UTILITIES
// ============================================
// Handles social media sharing, syndication, and tracking for viral growth

import { AFFILIATE_TAG } from './config';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Base configuration for ShoeSwiper social syndication
 */
export const SOCIAL_CONFIG = {
  // Domain and branding
  baseUrl: 'https://shoeswiper.com',
  appName: 'ShoeSwiper',
  defaultHashtags: ['ShoeSwiper', 'Sneakers', 'SneakerHead', 'KicksOnFire'],
  
  // Admin contact
  adminEmail: 'dadsellsgadgets@gmail.com',
  
  // Affiliate
  affiliateTag: AFFILIATE_TAG,
} as const;

/**
 * Supported social media platforms
 */
export type SocialPlatform = 
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'linkedin'
  | 'whatsapp'
  | 'telegram'
  | 'email';

/**
 * Platform-specific configuration
 */
export const PLATFORM_CONFIG: Record<SocialPlatform, {
  name: string;
  baseShareUrl: string;
  supportsImages: boolean;
  maxTextLength: number;
  hashtagPrefix: string;
}> = {
  twitter: {
    name: 'X (Twitter)',
    baseShareUrl: 'https://twitter.com/intent/tweet',
    supportsImages: false, // Web intent doesn't support direct image upload
    maxTextLength: 280,
    hashtagPrefix: '#',
  },
  facebook: {
    name: 'Facebook',
    baseShareUrl: 'https://www.facebook.com/sharer/sharer.php',
    supportsImages: true,
    maxTextLength: 63206,
    hashtagPrefix: '#',
  },
  instagram: {
    name: 'Instagram',
    baseShareUrl: 'instagram://share', // Only works on mobile with app
    supportsImages: true,
    maxTextLength: 2200,
    hashtagPrefix: '#',
  },
  tiktok: {
    name: 'TikTok',
    baseShareUrl: 'https://www.tiktok.com/share',
    supportsImages: false,
    maxTextLength: 150,
    hashtagPrefix: '#',
  },
  pinterest: {
    name: 'Pinterest',
    baseShareUrl: 'https://pinterest.com/pin/create/button/',
    supportsImages: true,
    maxTextLength: 500,
    hashtagPrefix: '',
  },
  linkedin: {
    name: 'LinkedIn',
    baseShareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    supportsImages: false,
    maxTextLength: 3000,
    hashtagPrefix: '#',
  },
  whatsapp: {
    name: 'WhatsApp',
    baseShareUrl: 'https://wa.me/',
    supportsImages: false,
    maxTextLength: 65536,
    hashtagPrefix: '',
  },
  telegram: {
    name: 'Telegram',
    baseShareUrl: 'https://t.me/share/url',
    supportsImages: false,
    maxTextLength: 4096,
    hashtagPrefix: '',
  },
  email: {
    name: 'Email',
    baseShareUrl: 'mailto:',
    supportsImages: false,
    maxTextLength: 10000,
    hashtagPrefix: '',
  },
};

// ============================================
// TYPES
// ============================================

/**
 * Content types that can be shared
 */
export type ShareableContentType = 'sneaker' | 'outfit' | 'collection' | 'referral' | 'blog';

/**
 * UTM parameters for tracking
 */
export interface UTMParams {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  utmTerm?: string;
}

/**
 * Content to be shared
 */
export interface ShareableContent {
  type: ShareableContentType;
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  hashtags?: string[];
  amazonUrl?: string;
}

/**
 * Syndication message for a specific platform
 */
export interface SyndicationMessage {
  platform: SocialPlatform;
  text: string;
  url: string;
  imageUrl?: string;
  hashtags: string[];
}

/**
 * Scheduled post configuration
 */
export interface ScheduledPost {
  id: string;
  content: ShareableContent;
  platforms: SocialPlatform[];
  scheduledAt: string; // ISO timestamp
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  createdAt: string;
  publishedAt?: string;
  error?: string;
}

/**
 * Share analytics event
 */
export interface ShareAnalyticsEvent {
  contentType: ShareableContentType;
  contentId: string;
  platform: SocialPlatform;
  method: 'native' | 'clipboard' | 'direct';
  timestamp: string;
  referralCode?: string;
  utmParams: UTMParams;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate UTM parameters for tracking share sources
 */
export const generateUTMParams = (
  platform: SocialPlatform,
  contentType: ShareableContentType,
  campaign?: string
): UTMParams => ({
  utmSource: 'shoeswiper',
  utmMedium: platform === 'email' ? 'email' : 'social',
  utmCampaign: campaign || `${contentType}_share`,
  utmContent: platform,
});

/**
 * Build a URL with UTM parameters
 */
export const buildTrackedUrl = (
  baseUrl: string,
  utm: UTMParams,
  referralCode?: string
): string => {
  const url = new URL(baseUrl);
  
  url.searchParams.set('utm_source', utm.utmSource);
  url.searchParams.set('utm_medium', utm.utmMedium);
  url.searchParams.set('utm_campaign', utm.utmCampaign);
  
  if (utm.utmContent) {
    url.searchParams.set('utm_content', utm.utmContent);
  }
  if (utm.utmTerm) {
    url.searchParams.set('utm_term', utm.utmTerm);
  }
  if (referralCode) {
    url.searchParams.set('ref', referralCode);
  }
  
  return url.toString();
};

/**
 * Ensure Amazon URL has affiliate tag
 */
export const ensureAffiliateTag = (amazonUrl: string): string => {
  if (!amazonUrl) return '';
  
  // Already has our tag
  if (amazonUrl.includes(`tag=${SOCIAL_CONFIG.affiliateTag}`)) {
    return amazonUrl;
  }
  
  // Has a different tag - replace it
  if (amazonUrl.includes('tag=')) {
    return amazonUrl.replace(/tag=[^&]+/, `tag=${SOCIAL_CONFIG.affiliateTag}`);
  }
  
  // No tag - add it
  const separator = amazonUrl.includes('?') ? '&' : '?';
  return `${amazonUrl}${separator}tag=${SOCIAL_CONFIG.affiliateTag}`;
};

/**
 * Format hashtags for a specific platform
 */
export const formatHashtags = (
  hashtags: string[],
  platform: SocialPlatform,
  maxCount: number = 5
): string => {
  const config = PLATFORM_CONFIG[platform];
  const prefix = config.hashtagPrefix;
  
  // Filter and format hashtags
  const formatted = hashtags
    .slice(0, maxCount)
    .map(tag => {
      // Remove existing # if present and add platform prefix
      const cleanTag = tag.replace(/^#/, '').replace(/\s+/g, '');
      return prefix ? `${prefix}${cleanTag}` : cleanTag;
    });
  
  return formatted.join(' ');
};

/**
 * Truncate text to platform limit with ellipsis
 */
export const truncateForPlatform = (
  text: string,
  platform: SocialPlatform,
  reserveChars: number = 50 // Reserve space for URL
): string => {
  const maxLength = PLATFORM_CONFIG[platform].maxTextLength - reserveChars;
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
};

// ============================================
// SHARE URL GENERATORS
// ============================================

/**
 * Generate Twitter/X share URL
 */
export const generateTwitterShareUrl = (
  content: ShareableContent,
  utm: UTMParams,
  referralCode?: string
): string => {
  const trackedUrl = buildTrackedUrl(content.url, utm, referralCode);
  const hashtags = content.hashtags || SOCIAL_CONFIG.defaultHashtags;
  
  // Build tweet text
  let text = `${content.title}\n\n${content.description}`;
  text = truncateForPlatform(text, 'twitter', 100); // Reserve more for URL and hashtags
  
  const params = new URLSearchParams({
    text,
    url: trackedUrl,
    hashtags: hashtags.map(h => h.replace('#', '')).join(','),
  });
  
  return `${PLATFORM_CONFIG.twitter.baseShareUrl}?${params.toString()}`;
};

/**
 * Generate Facebook share URL
 */
export const generateFacebookShareUrl = (
  content: ShareableContent,
  utm: UTMParams,
  referralCode?: string
): string => {
  const trackedUrl = buildTrackedUrl(content.url, utm, referralCode);
  
  const params = new URLSearchParams({
    u: trackedUrl,
    quote: truncateForPlatform(`${content.title} - ${content.description}`, 'facebook'),
  });
  
  return `${PLATFORM_CONFIG.facebook.baseShareUrl}?${params.toString()}`;
};

/**
 * Generate Pinterest share URL
 */
export const generatePinterestShareUrl = (
  content: ShareableContent,
  utm: UTMParams,
  referralCode?: string
): string => {
  const trackedUrl = buildTrackedUrl(content.url, utm, referralCode);
  
  const params = new URLSearchParams({
    url: trackedUrl,
    description: truncateForPlatform(`${content.title} - ${content.description}`, 'pinterest'),
  });
  
  if (content.imageUrl) {
    params.set('media', content.imageUrl);
  }
  
  return `${PLATFORM_CONFIG.pinterest.baseShareUrl}?${params.toString()}`;
};

/**
 * Generate LinkedIn share URL
 */
export const generateLinkedInShareUrl = (
  content: ShareableContent,
  utm: UTMParams,
  referralCode?: string
): string => {
  const trackedUrl = buildTrackedUrl(content.url, utm, referralCode);
  
  const params = new URLSearchParams({
    url: trackedUrl,
  });
  
  return `${PLATFORM_CONFIG.linkedin.baseShareUrl}?${params.toString()}`;
};

/**
 * Generate WhatsApp share URL
 */
export const generateWhatsAppShareUrl = (
  content: ShareableContent,
  utm: UTMParams,
  referralCode?: string
): string => {
  const trackedUrl = buildTrackedUrl(content.url, utm, referralCode);
  const hashtags = formatHashtags(
    content.hashtags || SOCIAL_CONFIG.defaultHashtags,
    'whatsapp',
    3
  );
  
  let text = `🔥 ${content.title}\n\n${content.description}\n\n${hashtags}\n\n👉 ${trackedUrl}`;
  
  // Add Amazon link if available
  if (content.amazonUrl) {
    const affiliateUrl = ensureAffiliateTag(content.amazonUrl);
    text += `\n\n🛒 Shop on Amazon: ${affiliateUrl}`;
  }
  
  return `${PLATFORM_CONFIG.whatsapp.baseShareUrl}?text=${encodeURIComponent(text)}`;
};

/**
 * Generate Telegram share URL
 */
export const generateTelegramShareUrl = (
  content: ShareableContent,
  utm: UTMParams,
  referralCode?: string
): string => {
  const trackedUrl = buildTrackedUrl(content.url, utm, referralCode);
  
  const params = new URLSearchParams({
    url: trackedUrl,
    text: `🔥 ${content.title}\n\n${content.description}`,
  });
  
  return `${PLATFORM_CONFIG.telegram.baseShareUrl}?${params.toString()}`;
};

/**
 * Generate Email share URL (mailto link)
 */
export const generateEmailShareUrl = (
  content: ShareableContent,
  utm: UTMParams,
  referralCode?: string
): string => {
  const trackedUrl = buildTrackedUrl(content.url, utm, referralCode);
  const hashtags = formatHashtags(
    content.hashtags || SOCIAL_CONFIG.defaultHashtags,
    'email',
    3
  );
  
  const subject = `Check out ${content.title} on ShoeSwiper!`;
  
  let body = `Hey!\n\nI found this amazing sneaker on ShoeSwiper and thought you'd love it:\n\n`;
  body += `${content.title}\n${content.description}\n\n`;
  body += `Check it out: ${trackedUrl}\n\n`;
  
  // Add Amazon link if available
  if (content.amazonUrl) {
    const affiliateUrl = ensureAffiliateTag(content.amazonUrl);
    body += `Shop on Amazon: ${affiliateUrl}\n\n`;
  }
  
  body += `${hashtags}\n\n`;
  body += `- Sent via ShoeSwiper`;
  
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * Generate share URL for any platform
 */
export const generateShareUrl = (
  platform: SocialPlatform,
  content: ShareableContent,
  referralCode?: string,
  campaign?: string
): string => {
  const utm = generateUTMParams(platform, content.type, campaign);
  
  switch (platform) {
    case 'twitter':
      return generateTwitterShareUrl(content, utm, referralCode);
    case 'facebook':
      return generateFacebookShareUrl(content, utm, referralCode);
    case 'pinterest':
      return generatePinterestShareUrl(content, utm, referralCode);
    case 'linkedin':
      return generateLinkedInShareUrl(content, utm, referralCode);
    case 'whatsapp':
      return generateWhatsAppShareUrl(content, utm, referralCode);
    case 'telegram':
      return generateTelegramShareUrl(content, utm, referralCode);
    case 'email':
      return generateEmailShareUrl(content, utm, referralCode);
    case 'instagram':
    case 'tiktok':
      // These platforms don't have web share intents
      // Return the tracked URL for clipboard copy
      return buildTrackedUrl(content.url, utm, referralCode);
    default:
      return buildTrackedUrl(content.url, utm, referralCode);
  }
};

// ============================================
// CONTENT GENERATORS
// ============================================

/**
 * Create shareable content from a sneaker
 */
export const createSneakerShareContent = (sneaker: {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  amazonUrl?: string;
  styleTags?: string[];
}): ShareableContent => {
  const brandHashtag = sneaker.brand.replace(/\s+/g, '');
  const hashtags = [
    ...SOCIAL_CONFIG.defaultHashtags,
    brandHashtag,
    ...(sneaker.styleTags || []).slice(0, 2),
  ];
  
  return {
    type: 'sneaker',
    id: sneaker.id,
    title: `${sneaker.brand} ${sneaker.name}`,
    description: `Check out these fire ${sneaker.brand} kicks on ShoeSwiper! 🔥👟`,
    imageUrl: sneaker.imageUrl,
    url: `${SOCIAL_CONFIG.baseUrl}/shoe/${sneaker.id}`,
    hashtags,
    amazonUrl: sneaker.amazonUrl,
  };
};

/**
 * Create shareable content from an outfit
 */
export const createOutfitShareContent = (outfit: {
  id: string;
  title?: string;
  imageUrl?: string;
  rating?: number;
  styleTags?: string[];
}): ShareableContent => {
  const ratingEmoji = outfit.rating && outfit.rating >= 8 ? '🔥' : '👟';
  
  return {
    type: 'outfit',
    id: outfit.id,
    title: outfit.title || 'My Outfit',
    description: `${ratingEmoji} Check out my outfit fit check on ShoeSwiper! Rate: ${outfit.rating || 'N/A'}/10`,
    imageUrl: outfit.imageUrl,
    url: `${SOCIAL_CONFIG.baseUrl}/outfit/${outfit.id}`,
    hashtags: [
      ...SOCIAL_CONFIG.defaultHashtags,
      'OutfitCheck',
      'OOTD',
      ...(outfit.styleTags || []).slice(0, 2),
    ],
  };
};

/**
 * Create shareable content for referral program
 */
export const createReferralShareContent = (referralCode: string): ShareableContent => ({
  type: 'referral',
  id: referralCode,
  title: 'Join ShoeSwiper',
  description: 'Discover the hottest sneakers with a TikTok-style feed! Use my link to join and we both get rewards 🎁',
  url: `${SOCIAL_CONFIG.baseUrl}/?ref=${referralCode}`,
  hashtags: [...SOCIAL_CONFIG.defaultHashtags, 'SneakerDeals', 'Referral'],
});

// ============================================
// ANALYTICS HELPERS
// ============================================

/**
 * Create a share analytics event
 */
export const createShareAnalyticsEvent = (
  content: ShareableContent,
  platform: SocialPlatform,
  method: 'native' | 'clipboard' | 'direct',
  referralCode?: string
): ShareAnalyticsEvent => ({
  contentType: content.type,
  contentId: content.id,
  platform,
  method,
  timestamp: new Date().toISOString(),
  referralCode,
  utmParams: generateUTMParams(platform, content.type),
});

/**
 * Check if Web Share API is available
 */
export const isNativeShareSupported = (): boolean => {
  return typeof navigator !== 'undefined' && !!navigator.share;
};

/**
 * Check if a platform can be shared to directly (has web intent)
 */
export const canShareDirect = (platform: SocialPlatform): boolean => {
  // Instagram and TikTok don't have web share intents
  return platform !== 'instagram' && platform !== 'tiktok';
};
