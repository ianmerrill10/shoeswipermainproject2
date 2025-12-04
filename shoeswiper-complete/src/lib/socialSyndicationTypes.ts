// ============================================
// SOCIAL SYNDICATION TYPES
// ============================================
// TypeScript types for automated social media syndication

/**
 * Supported social media platforms
 */
export type SocialPlatform = 'twitter' | 'instagram' | 'tiktok' | 'facebook';

/**
 * Post status in the syndication queue
 */
export type PostStatus = 'draft' | 'scheduled' | 'processing' | 'posted' | 'failed';

/**
 * Content type for social posts
 */
export type ContentType = 'product' | 'blog' | 'promotion' | 'engagement' | 'user_generated';

/**
 * Platform-specific character limits
 */
export const PLATFORM_LIMITS: Record<SocialPlatform, {
  textLimit: number;
  hashtagLimit: number;
  linkLimit: number;
  imageLimit: number;
}> = {
  twitter: {
    textLimit: 280,
    hashtagLimit: 5,
    linkLimit: 1,
    imageLimit: 4,
  },
  instagram: {
    textLimit: 2200,
    hashtagLimit: 30,
    linkLimit: 0, // Links only in bio
    imageLimit: 10,
  },
  tiktok: {
    textLimit: 2200,
    hashtagLimit: 20,
    linkLimit: 1, // In bio only for most accounts
    imageLimit: 1, // For cover images
  },
  facebook: {
    textLimit: 63206,
    hashtagLimit: 10,
    linkLimit: 1,
    imageLimit: 10,
  },
};

/**
 * Platform configuration for posting
 */
export interface PlatformConfig {
  platform: SocialPlatform;
  enabled: boolean;
  handle: string;
  profileUrl: string;
  defaultHashtags: string[];
  postingSchedule: PostingSchedule;
  contentPreferences: ContentPreferences;
}

/**
 * Posting schedule configuration
 */
export interface PostingSchedule {
  timezone: string;
  optimalTimes: string[]; // ISO time strings (HH:MM)
  daysActive: number[]; // 0-6 (Sunday-Saturday)
  maxPostsPerDay: number;
  minTimeBetweenPosts: number; // Minutes
}

/**
 * Content preferences for a platform
 */
export interface ContentPreferences {
  preferredContentTypes: ContentType[];
  toneOfVoice: 'casual' | 'professional' | 'enthusiastic' | 'informative';
  includeEmojis: boolean;
  includeCallToAction: boolean;
  includePricing: boolean;
}

/**
 * Content template for generating posts
 */
export interface ContentTemplate {
  id: string;
  name: string;
  platform: SocialPlatform;
  contentType: ContentType;
  template: string; // Template with {{placeholders}}
  hashtags: string[];
  callToAction?: string;
  mediaRequirements: {
    required: boolean;
    count: number;
    aspectRatio?: string;
  };
}

/**
 * Hashtag strategy configuration
 */
export interface HashtagStrategy {
  platform: SocialPlatform;
  brandHashtags: string[];
  categoryHashtags: Record<string, string[]>;
  trendingHashtags: string[];
  avoidHashtags: string[];
}

/**
 * Social post content
 */
export interface SocialPostContent {
  text: string;
  hashtags: string[];
  mediaUrls: string[];
  linkUrl?: string;
  callToAction?: string;
  mentions?: string[];
}

/**
 * Scheduled social post
 */
export interface ScheduledPost {
  id: string;
  platform: SocialPlatform;
  content: SocialPostContent;
  contentType: ContentType;
  scheduledAt: string; // ISO timestamp
  status: PostStatus;
  sourceType: 'product' | 'blog' | 'manual';
  sourceId?: string; // Product ID or Blog Post ID
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
  errorMessage?: string;
  retryCount: number;
  analytics?: PostAnalytics;
}

/**
 * Post analytics data
 */
export interface PostAnalytics {
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  saves: number;
  comments: number;
  likes: number;
  reach: number;
  updatedAt: string;
}

/**
 * Queue management options
 */
export interface QueueOptions {
  platform?: SocialPlatform;
  status?: PostStatus;
  contentType?: ContentType;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Rate limiting configuration per platform
 */
export interface RateLimitConfig {
  platform: SocialPlatform;
  requestsPerHour: number;
  requestsPerDay: number;
  currentHourlyCount: number;
  currentDailyCount: number;
  lastResetHour: string;
  lastResetDay: string;
}

/**
 * Syndication request for Edge Function
 */
export interface SyndicationRequest {
  action: 'schedule' | 'post' | 'cancel' | 'retry' | 'get_queue' | 'get_analytics';
  platform?: SocialPlatform;
  postId?: string;
  content?: SocialPostContent;
  scheduledAt?: string;
  contentType?: ContentType;
  sourceType?: 'product' | 'blog' | 'manual';
  sourceId?: string;
  queueOptions?: QueueOptions;
}

/**
 * Syndication response from Edge Function
 */
export interface SyndicationResponse {
  success: boolean;
  message: string;
  data?: {
    postId?: string;
    scheduledAt?: string;
    queue?: ScheduledPost[];
    analytics?: PostAnalytics;
    rateLimits?: RateLimitConfig[];
  };
  error?: string;
}

/**
 * Product syndication data
 */
export interface ProductSyndicationData {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  amazonUrl: string;
  price?: number;
  styleTags: string[];
  colorTags: string[];
}

/**
 * Blog syndication data
 */
export interface BlogSyndicationData {
  id: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  url: string;
  category: string;
  tags: string[];
  author: string;
}

/**
 * Syndication event for analytics tracking
 */
export interface SyndicationEvent {
  type: 'post_scheduled' | 'post_published' | 'post_failed' | 'post_cancelled';
  platform: SocialPlatform;
  postId: string;
  contentType: ContentType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * OAuth token storage (server-side only)
 */
export interface OAuthToken {
  platform: SocialPlatform;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  scope: string[];
}
