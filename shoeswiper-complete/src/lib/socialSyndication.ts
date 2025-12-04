// ============================================
// SOCIAL SYNDICATION CONFIGURATION
// ============================================
// Configuration and utilities for automated social media syndication

import { AFFILIATE_TAG } from './config';
import type {
  SocialPlatform,
  PlatformConfig,
  ContentTemplate,
  HashtagStrategy,
  ContentType,
  ProductSyndicationData,
  BlogSyndicationData,
  SocialPostContent,
} from './socialSyndicationTypes';
import { PLATFORM_LIMITS as platformLimits } from './socialSyndicationTypes';

// ============================================
// PLATFORM CONFIGURATIONS
// ============================================

/**
 * Default platform configurations for ShoeSwiper
 */
export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    platform: 'twitter',
    enabled: true,
    handle: '@shoeswiper',
    profileUrl: 'https://twitter.com/shoeswiper',
    defaultHashtags: ['ShoeSwiper', 'Sneakers', 'SneakerHead'],
    postingSchedule: {
      timezone: 'America/New_York',
      optimalTimes: ['09:00', '12:00', '17:00', '20:00'],
      daysActive: [0, 1, 2, 3, 4, 5, 6],
      maxPostsPerDay: 8,
      minTimeBetweenPosts: 60,
    },
    contentPreferences: {
      preferredContentTypes: ['product', 'blog', 'engagement'],
      toneOfVoice: 'enthusiastic',
      includeEmojis: true,
      includeCallToAction: true,
      includePricing: false, // Per SHOW_PRICES config
    },
  },
  instagram: {
    platform: 'instagram',
    enabled: true,
    handle: '@shoeswiper',
    profileUrl: 'https://instagram.com/shoeswiper',
    defaultHashtags: ['ShoeSwiper', 'Sneakers', 'SneakerHead', 'Kicks', 'Sneakerheads'],
    postingSchedule: {
      timezone: 'America/New_York',
      optimalTimes: ['11:00', '14:00', '19:00'],
      daysActive: [0, 1, 2, 3, 4, 5, 6],
      maxPostsPerDay: 3,
      minTimeBetweenPosts: 180,
    },
    contentPreferences: {
      preferredContentTypes: ['product', 'user_generated'],
      toneOfVoice: 'enthusiastic',
      includeEmojis: true,
      includeCallToAction: true,
      includePricing: false,
    },
  },
  tiktok: {
    platform: 'tiktok',
    enabled: true,
    handle: '@shoeswiper',
    profileUrl: 'https://tiktok.com/@shoeswiper',
    defaultHashtags: ['ShoeSwiper', 'Sneakers', 'SneakerTok', 'SneakerCheck'],
    postingSchedule: {
      timezone: 'America/New_York',
      optimalTimes: ['07:00', '12:00', '19:00', '21:00'],
      daysActive: [0, 1, 2, 3, 4, 5, 6],
      maxPostsPerDay: 4,
      minTimeBetweenPosts: 120,
    },
    contentPreferences: {
      preferredContentTypes: ['product', 'engagement', 'user_generated'],
      toneOfVoice: 'casual',
      includeEmojis: true,
      includeCallToAction: true,
      includePricing: false,
    },
  },
  facebook: {
    platform: 'facebook',
    enabled: true,
    handle: 'ShoeSwiper',
    profileUrl: 'https://facebook.com/shoeswiper',
    defaultHashtags: ['ShoeSwiper', 'Sneakers'],
    postingSchedule: {
      timezone: 'America/New_York',
      optimalTimes: ['09:00', '13:00', '16:00'],
      daysActive: [0, 1, 2, 3, 4, 5, 6],
      maxPostsPerDay: 4,
      minTimeBetweenPosts: 180,
    },
    contentPreferences: {
      preferredContentTypes: ['product', 'blog', 'promotion'],
      toneOfVoice: 'informative',
      includeEmojis: true,
      includeCallToAction: true,
      includePricing: false,
    },
  },
};

// ============================================
// HASHTAG STRATEGIES
// ============================================

/**
 * Hashtag strategies per platform
 */
export const HASHTAG_STRATEGIES: Record<SocialPlatform, HashtagStrategy> = {
  twitter: {
    platform: 'twitter',
    brandHashtags: ['ShoeSwiper', 'ShoeSwiperApp'],
    categoryHashtags: {
      sneakers: ['Sneakers', 'Kicks', 'SneakerHead', 'KOTD'],
      running: ['RunningShoes', 'Running', 'Runners'],
      basketball: ['Basketball', 'Hoops', 'NBA'],
      lifestyle: ['StreetWear', 'StreetStyle', 'Fashion'],
      workwear: ['WorkBoots', 'WorkWear', 'BuiltTough'],
    },
    trendingHashtags: [],
    avoidHashtags: ['ad', 'sponsored'],
  },
  instagram: {
    platform: 'instagram',
    brandHashtags: ['ShoeSwiper', 'ShoeSwiperApp', 'SwipeYourStyle'],
    categoryHashtags: {
      sneakers: ['Sneakers', 'Kicks', 'SneakerHead', 'KOTD', 'SneakerCommunity', 'KicksOnFire', 'SneakerAddict', 'SneakersDaily'],
      running: ['RunningShoes', 'Running', 'Runners', 'RunningCommunity', 'RunnersLife'],
      basketball: ['Basketball', 'Hoops', 'NBA', 'BballShoes', 'BasketballLife'],
      lifestyle: ['StreetWear', 'StreetStyle', 'Fashion', 'OOTD', 'StyleInspo', 'FashionDaily'],
      workwear: ['WorkBoots', 'WorkWear', 'BuiltTough', 'TradesLife', 'ConstructionLife'],
    },
    trendingHashtags: [],
    avoidHashtags: ['followforfollow', 'f4f', 'likeforlike'],
  },
  tiktok: {
    platform: 'tiktok',
    brandHashtags: ['ShoeSwiper', 'SwipeYourStyle'],
    categoryHashtags: {
      sneakers: ['SneakerTok', 'SneakerCheck', 'Sneakers', 'Kicks', 'SneakerCollection'],
      running: ['RunningTok', 'RunningShoes', 'Running'],
      basketball: ['BasketballTok', 'Basketball', 'Hoops'],
      lifestyle: ['StreetWear', 'Fashion', 'OOTD', 'StyleTok'],
      workwear: ['WorkWear', 'TradesOfTikTok', 'ConstructionTok'],
    },
    trendingHashtags: ['fyp', 'foryou', 'foryoupage'],
    avoidHashtags: [],
  },
  facebook: {
    platform: 'facebook',
    brandHashtags: ['ShoeSwiper'],
    categoryHashtags: {
      sneakers: ['Sneakers', 'Kicks', 'SneakerHead'],
      running: ['RunningShoes', 'Running'],
      basketball: ['Basketball', 'Hoops'],
      lifestyle: ['Fashion', 'Style'],
      workwear: ['WorkBoots', 'WorkWear'],
    },
    trendingHashtags: [],
    avoidHashtags: [],
  },
};

// ============================================
// CONTENT TEMPLATES
// ============================================

/**
 * Content templates for different platforms and content types
 */
export const CONTENT_TEMPLATES: ContentTemplate[] = [
  // Twitter Product Templates
  {
    id: 'twitter-product-1',
    name: 'Product Highlight',
    platform: 'twitter',
    contentType: 'product',
    template: '🔥 {{brand}} {{name}}\n\n{{description}}\n\nSwipe right on ShoeSwiper to find your perfect pair! 👟',
    hashtags: ['ShoeSwiper', 'Sneakers'],
    callToAction: 'Link in bio!',
    mediaRequirements: { required: true, count: 1 },
  },
  {
    id: 'twitter-product-2',
    name: 'New Drop Alert',
    platform: 'twitter',
    contentType: 'product',
    template: '🚨 NEW DROP ALERT 🚨\n\n{{brand}} {{name}} just hit ShoeSwiper!\n\nDon\'t sleep on these 💤❌',
    hashtags: ['NewRelease', 'SneakerDrop', 'ShoeSwiper'],
    callToAction: 'Check them out!',
    mediaRequirements: { required: true, count: 1 },
  },
  {
    id: 'twitter-blog-1',
    name: 'Blog Share',
    platform: 'twitter',
    contentType: 'blog',
    template: '📖 New on the blog: {{title}}\n\n{{excerpt}}\n\nRead more 👇',
    hashtags: ['ShoeSwiper', 'SneakerBlog'],
    mediaRequirements: { required: true, count: 1 },
  },

  // Instagram Product Templates
  {
    id: 'instagram-product-1',
    name: 'Product Feature',
    platform: 'instagram',
    contentType: 'product',
    template: '{{brand}} {{name}} ✨\n\n{{description}}\n\nDiscover more heat on ShoeSwiper - link in bio! 🔗\n\n.',
    hashtags: ['ShoeSwiper', 'Sneakers', 'Kicks', 'SneakerHead', 'KOTD', 'SneakerCommunity'],
    callToAction: 'Tap to shop, link in bio!',
    mediaRequirements: { required: true, count: 1, aspectRatio: '1:1' },
  },
  {
    id: 'instagram-product-carousel',
    name: 'Product Carousel',
    platform: 'instagram',
    contentType: 'product',
    template: 'Swipe through the heat 🔥\n\n{{description}}\n\nWhich pair is your favorite? Comment below! 👇\n\n.',
    hashtags: ['ShoeSwiper', 'Sneakers', 'Kicks', 'SneakerHead', 'SneakerCollection'],
    callToAction: 'Find more on ShoeSwiper!',
    mediaRequirements: { required: true, count: 5, aspectRatio: '1:1' },
  },

  // TikTok Product Templates
  {
    id: 'tiktok-product-1',
    name: 'Quick Look',
    platform: 'tiktok',
    contentType: 'product',
    template: '{{brand}} {{name}} just dropped 🔥 Would you cop or drop? 👟\n\nFind more heat on ShoeSwiper!',
    hashtags: ['SneakerTok', 'SneakerCheck', 'ShoeSwiper', 'fyp'],
    mediaRequirements: { required: true, count: 1 },
  },
  {
    id: 'tiktok-engagement-1',
    name: 'This or That',
    platform: 'tiktok',
    contentType: 'engagement',
    template: 'Which one are you choosing? 🤔\n\nLeft or Right? Comment below! 👇\n\n#ShoeSwiper',
    hashtags: ['SneakerTok', 'ShoeSwiper', 'fyp', 'foryou'],
    mediaRequirements: { required: true, count: 1 },
  },

  // Facebook Product Templates
  {
    id: 'facebook-product-1',
    name: 'Product Post',
    platform: 'facebook',
    contentType: 'product',
    template: '👟 {{brand}} {{name}}\n\n{{description}}\n\nDiscover the latest sneaker drops on ShoeSwiper - your personal sneaker discovery app!\n\n🔗 Download now and swipe through thousands of styles.',
    hashtags: ['ShoeSwiper', 'Sneakers'],
    callToAction: 'Get the app!',
    mediaRequirements: { required: true, count: 1 },
  },
  {
    id: 'facebook-blog-1',
    name: 'Blog Post Share',
    platform: 'facebook',
    contentType: 'blog',
    template: '📰 {{title}}\n\n{{excerpt}}\n\nRead the full article on our blog! 📖',
    hashtags: ['ShoeSwiper'],
    mediaRequirements: { required: true, count: 1 },
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get optimal posting times for a platform
 */
export const getOptimalPostingTimes = (platform: SocialPlatform): Date[] => {
  const config = PLATFORM_CONFIGS[platform];
  const now = new Date();
  const times: Date[] = [];

  // Get the next 7 days of optimal posting times
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    
    if (config.postingSchedule.daysActive.includes(date.getDay())) {
      for (const timeStr of config.postingSchedule.optimalTimes) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const postTime = new Date(date);
        postTime.setHours(hours, minutes, 0, 0);
        
        if (postTime > now) {
          times.push(postTime);
        }
      }
    }
  }

  return times.sort((a, b) => a.getTime() - b.getTime());
};

/**
 * Select hashtags for a post based on platform and category
 */
export const selectHashtags = (
  platform: SocialPlatform,
  category: string,
  additionalTags: string[] = []
): string[] => {
  const strategy = HASHTAG_STRATEGIES[platform];
  const limits = platformLimits[platform];
  
  const hashtags = new Set<string>();
  
  // Add brand hashtags first
  strategy.brandHashtags.forEach(tag => hashtags.add(tag));
  
  // Add category-specific hashtags
  const categoryTags = strategy.categoryHashtags[category.toLowerCase()] || [];
  categoryTags.forEach(tag => hashtags.add(tag));
  
  // Add additional tags
  additionalTags.forEach(tag => hashtags.add(tag));
  
  // Add trending hashtags if there's room
  if (hashtags.size < limits.hashtagLimit) {
    strategy.trendingHashtags.forEach(tag => {
      if (hashtags.size < limits.hashtagLimit) {
        hashtags.add(tag);
      }
    });
  }
  
  // Filter out any blacklisted hashtags
  const filtered = Array.from(hashtags).filter(
    tag => !strategy.avoidHashtags.includes(tag.toLowerCase())
  );
  
  return filtered.slice(0, limits.hashtagLimit);
};

/**
 * Format text to fit platform character limits
 */
export const formatTextForPlatform = (
  text: string,
  platform: SocialPlatform,
  hashtags: string[]
): string => {
  const limits = platformLimits[platform];
  const hashtagStr = hashtags.map(h => `#${h}`).join(' ');
  const separator = '\n\n';
  
  // Calculate available space for main text
  const reservedSpace = hashtagStr.length + separator.length;
  const availableSpace = limits.textLimit - reservedSpace;
  
  // Truncate text if necessary
  let formattedText = text;
  if (formattedText.length > availableSpace) {
    formattedText = formattedText.slice(0, availableSpace - 3) + '...';
  }
  
  return `${formattedText}${separator}${hashtagStr}`;
};

/**
 * Generate post content from a product
 */
export const generateProductPostContent = (
  product: ProductSyndicationData,
  platform: SocialPlatform,
  templateId?: string
): SocialPostContent => {
  // Select template
  const templates = CONTENT_TEMPLATES.filter(
    t => t.platform === platform && t.contentType === 'product'
  );
  
  const template = templateId 
    ? templates.find(t => t.id === templateId) || templates[0]
    : templates[0];
  
  if (!template) {
    throw new Error(`No product template found for platform: ${platform}`);
  }
  
  // Build description from tags
  const description = product.styleTags.length > 0 
    ? `Style: ${product.styleTags.slice(0, 3).join(', ')}`
    : '';
  
  // Replace template placeholders
  const text = template.template
    .replace(/\{\{brand\}\}/g, product.brand)
    .replace(/\{\{name\}\}/g, product.name)
    .replace(/\{\{description\}\}/g, description);
  
  // Determine category from tags
  const category = product.styleTags.includes('running') 
    ? 'running'
    : product.styleTags.includes('basketball')
    ? 'basketball'
    : 'sneakers';
  
  // Select hashtags
  const hashtags = selectHashtags(
    platform,
    category,
    [product.brand.replace(/\s+/g, ''), ...template.hashtags]
  );
  
  // Build Amazon URL with affiliate tag
  const amazonUrlWithTag = product.amazonUrl.includes('?')
    ? `${product.amazonUrl}&tag=${AFFILIATE_TAG}`
    : `${product.amazonUrl}?tag=${AFFILIATE_TAG}`;
  
  return {
    text: formatTextForPlatform(text, platform, hashtags),
    hashtags,
    mediaUrls: [product.imageUrl],
    linkUrl: platform !== 'instagram' ? amazonUrlWithTag : undefined,
    callToAction: template.callToAction,
  };
};

/**
 * Generate post content from a blog post
 */
export const generateBlogPostContent = (
  blog: BlogSyndicationData,
  platform: SocialPlatform,
  templateId?: string
): SocialPostContent => {
  // Select template
  const templates = CONTENT_TEMPLATES.filter(
    t => t.platform === platform && t.contentType === 'blog'
  );
  
  const template = templateId 
    ? templates.find(t => t.id === templateId) || templates[0]
    : templates.find(t => t.contentType === 'blog') || CONTENT_TEMPLATES.find(t => t.platform === platform);
  
  if (!template) {
    throw new Error(`No blog template found for platform: ${platform}`);
  }
  
  // Truncate excerpt for platform
  const maxExcerptLength = platform === 'twitter' ? 100 : 200;
  const excerpt = blog.excerpt.length > maxExcerptLength
    ? blog.excerpt.slice(0, maxExcerptLength - 3) + '...'
    : blog.excerpt;
  
  // Replace template placeholders
  const text = template.template
    .replace(/\{\{title\}\}/g, blog.title)
    .replace(/\{\{excerpt\}\}/g, excerpt)
    .replace(/\{\{author\}\}/g, blog.author);
  
  // Select hashtags
  const hashtags = selectHashtags(
    platform,
    blog.category,
    [...blog.tags.slice(0, 3), ...template.hashtags]
  );
  
  return {
    text: formatTextForPlatform(text, platform, hashtags),
    hashtags,
    mediaUrls: [blog.featuredImage],
    linkUrl: platform !== 'instagram' ? blog.url : undefined,
  };
};

/**
 * Validate post content against platform limits
 */
export const validatePostContent = (
  content: SocialPostContent,
  platform: SocialPlatform
): { valid: boolean; errors: string[] } => {
  const limits = platformLimits[platform];
  const errors: string[] = [];
  
  if (content.text.length > limits.textLimit) {
    errors.push(`Text exceeds ${limits.textLimit} character limit (${content.text.length})`);
  }
  
  if (content.hashtags.length > limits.hashtagLimit) {
    errors.push(`Too many hashtags: ${content.hashtags.length}/${limits.hashtagLimit}`);
  }
  
  if (content.mediaUrls.length > limits.imageLimit) {
    errors.push(`Too many images: ${content.mediaUrls.length}/${limits.imageLimit}`);
  }
  
  if (content.linkUrl && limits.linkLimit === 0) {
    errors.push(`Platform ${platform} does not support links in posts`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get the Edge Function endpoint URL
 */
export const getSyndicationEndpoint = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is not configured');
  }
  return `${supabaseUrl}/functions/v1/social-syndication`;
};

/**
 * UTM parameters for syndicated links
 */
export const buildUTMUrl = (
  baseUrl: string,
  platform: SocialPlatform,
  contentType: ContentType,
  campaign?: string
): string => {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', 'shoeswiper');
  url.searchParams.set('utm_medium', platform);
  url.searchParams.set('utm_campaign', campaign || contentType);
  return url.toString();
};
