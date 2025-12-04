// ============================================
// SOCIAL SYNDICATION HOOK
// ============================================
// React hook for managing social media syndication

import { useCallback, useState } from 'react';
import { DEMO_MODE } from '../lib/config';
import { useAnalytics } from './useAnalytics';
import {
  getSyndicationEndpoint,
  generateProductPostContent,
  generateBlogPostContent,
  validatePostContent,
  getOptimalPostingTimes,
  PLATFORM_CONFIGS,
} from '../lib/socialSyndication';
import type {
  SocialPlatform,
  ScheduledPost,
  PostStatus,
  ContentType,
  SocialPostContent,
  SyndicationRequest,
  SyndicationResponse,
  ProductSyndicationData,
  BlogSyndicationData,
  QueueOptions,
  RateLimitConfig,
} from '../lib/socialSyndicationTypes';

// ============================================
// DEMO MODE IN-MEMORY QUEUE
// ============================================

const demoQueue: ScheduledPost[] = [];
const demoRateLimits: RateLimitConfig[] = [
  { platform: 'twitter', requestsPerHour: 50, requestsPerDay: 500, currentHourlyCount: 0, currentDailyCount: 0, lastResetHour: new Date().toISOString(), lastResetDay: new Date().toISOString() },
  { platform: 'instagram', requestsPerHour: 25, requestsPerDay: 200, currentHourlyCount: 0, currentDailyCount: 0, lastResetHour: new Date().toISOString(), lastResetDay: new Date().toISOString() },
  { platform: 'tiktok', requestsPerHour: 30, requestsPerDay: 300, currentHourlyCount: 0, currentDailyCount: 0, lastResetHour: new Date().toISOString(), lastResetDay: new Date().toISOString() },
  { platform: 'facebook', requestsPerHour: 40, requestsPerDay: 400, currentHourlyCount: 0, currentDailyCount: 0, lastResetHour: new Date().toISOString(), lastResetDay: new Date().toISOString() },
];

let demoPostIdCounter = 1;

// ============================================
// HOOK IMPLEMENTATION
// ============================================

interface UseSocialSyndicationReturn {
  // State
  isLoading: boolean;
  error: string | null;
  queue: ScheduledPost[];
  rateLimits: RateLimitConfig[];
  
  // Queue Management
  schedulePost: (
    platform: SocialPlatform,
    content: SocialPostContent,
    scheduledAt: Date,
    contentType: ContentType,
    sourceType?: 'product' | 'blog' | 'manual',
    sourceId?: string
  ) => Promise<{ success: boolean; postId?: string; error?: string }>;
  
  cancelPost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  retryPost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Content Generation
  generateProductPost: (
    product: ProductSyndicationData,
    platform: SocialPlatform,
    templateId?: string
  ) => SocialPostContent;
  
  generateBlogPost: (
    blog: BlogSyndicationData,
    platform: SocialPlatform,
    templateId?: string
  ) => SocialPostContent;
  
  // Queue Queries
  fetchQueue: (options?: QueueOptions) => Promise<void>;
  getScheduledPosts: (platform?: SocialPlatform, status?: PostStatus) => ScheduledPost[];
  
  // Scheduling Helpers
  getNextOptimalTime: (platform: SocialPlatform) => Date;
  scheduleProductSyndication: (
    product: ProductSyndicationData,
    platforms?: SocialPlatform[]
  ) => Promise<{ scheduled: number; errors: string[] }>;
  
  scheduleBlogSyndication: (
    blog: BlogSyndicationData,
    platforms?: SocialPlatform[]
  ) => Promise<{ scheduled: number; errors: string[] }>;
  
  // Validation
  validateContent: (
    content: SocialPostContent,
    platform: SocialPlatform
  ) => { valid: boolean; errors: string[] };
  
  // Rate Limiting
  checkRateLimit: (platform: SocialPlatform) => boolean;
  fetchRateLimits: () => Promise<void>;
}

export const useSocialSyndication = (): UseSocialSyndicationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<ScheduledPost[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitConfig[]>(demoRateLimits);
  
  const { trackEvent } = useAnalytics();

  /**
   * Make a request to the syndication Edge Function
   */
  const callSyndicationApi = useCallback(async (
    request: SyndicationRequest
  ): Promise<SyndicationResponse> => {
    if (DEMO_MODE) {
      // Handle requests in demo mode
      return handleDemoRequest(request);
    }

    const endpoint = getSyndicationEndpoint();
    const { supabase } = await import('../lib/supabaseClient');
    
    // Get the current session for auth
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Syndication API error: ${response.status}`);
    }

    return response.json();
  }, []);

  /**
   * Handle requests in demo mode
   */
  const handleDemoRequest = (request: SyndicationRequest): SyndicationResponse => {
    switch (request.action) {
      case 'schedule': {
        if (!request.platform || !request.content || !request.scheduledAt) {
          return { success: false, message: 'Missing required fields', error: 'Missing platform, content, or scheduledAt' };
        }
        
        const newPost: ScheduledPost = {
          id: `demo-${demoPostIdCounter++}`,
          platform: request.platform,
          content: request.content,
          contentType: request.contentType || 'product',
          scheduledAt: request.scheduledAt,
          status: 'scheduled',
          sourceType: request.sourceType || 'manual',
          sourceId: request.sourceId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          retryCount: 0,
        };
        
        demoQueue.push(newPost);
        
        return {
          success: true,
          message: 'Post scheduled successfully',
          data: { postId: newPost.id, scheduledAt: newPost.scheduledAt },
        };
      }
      
      case 'cancel': {
        const index = demoQueue.findIndex(p => p.id === request.postId);
        if (index === -1) {
          return { success: false, message: 'Post not found', error: 'Post ID not found' };
        }
        demoQueue[index].status = 'failed';
        demoQueue[index].errorMessage = 'Cancelled by user';
        return { success: true, message: 'Post cancelled' };
      }
      
      case 'retry': {
        const post = demoQueue.find(p => p.id === request.postId);
        if (!post) {
          return { success: false, message: 'Post not found', error: 'Post ID not found' };
        }
        post.status = 'scheduled';
        post.retryCount++;
        post.errorMessage = undefined;
        return { success: true, message: 'Post rescheduled for retry' };
      }
      
      case 'get_queue': {
        let filtered = [...demoQueue];
        
        if (request.queueOptions?.platform) {
          filtered = filtered.filter(p => p.platform === request.queueOptions?.platform);
        }
        if (request.queueOptions?.status) {
          filtered = filtered.filter(p => p.status === request.queueOptions?.status);
        }
        if (request.queueOptions?.contentType) {
          filtered = filtered.filter(p => p.contentType === request.queueOptions?.contentType);
        }
        
        const limit = request.queueOptions?.limit || 50;
        const offset = request.queueOptions?.offset || 0;
        
        return {
          success: true,
          message: 'Queue fetched',
          data: { queue: filtered.slice(offset, offset + limit) },
        };
      }
      
      case 'get_analytics': {
        const post = demoQueue.find(p => p.id === request.postId);
        return {
          success: true,
          message: 'Analytics fetched',
          data: {
            analytics: post?.analytics || {
              impressions: 0,
              engagements: 0,
              clicks: 0,
              shares: 0,
              saves: 0,
              comments: 0,
              likes: 0,
              reach: 0,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }
      
      default:
        return { success: false, message: 'Unknown action', error: 'Invalid action' };
    }
  };

  /**
   * Schedule a post
   */
  const schedulePost = useCallback(async (
    platform: SocialPlatform,
    content: SocialPostContent,
    scheduledAt: Date,
    contentType: ContentType,
    sourceType: 'product' | 'blog' | 'manual' = 'manual',
    sourceId?: string
  ): Promise<{ success: boolean; postId?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate content
      const validation = validatePostContent(content, platform);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check rate limits
      if (!checkRateLimit(platform)) {
        throw new Error(`Rate limit exceeded for ${platform}`);
      }

      const response = await callSyndicationApi({
        action: 'schedule',
        platform,
        content,
        scheduledAt: scheduledAt.toISOString(),
        contentType,
        sourceType,
        sourceId,
      });

      if (response.success) {
        // Track the event
        trackEvent('share' as never, {
          platform,
          content_type: contentType,
          source_type: sourceType,
          scheduled: true,
        } as never);

        if (import.meta.env.DEV) {
          console.warn('[SocialSyndication] Post scheduled:', {
            platform,
            postId: response.data?.postId,
            scheduledAt,
          });
        }
      }

      return {
        success: response.success,
        postId: response.data?.postId,
        error: response.error,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule post';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [callSyndicationApi, trackEvent]);

  /**
   * Cancel a scheduled post
   */
  const cancelPost = useCallback(async (
    postId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await callSyndicationApi({
        action: 'cancel',
        postId,
      });

      return {
        success: response.success,
        error: response.error,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel post';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [callSyndicationApi]);

  /**
   * Retry a failed post
   */
  const retryPost = useCallback(async (
    postId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await callSyndicationApi({
        action: 'retry',
        postId,
      });

      return {
        success: response.success,
        error: response.error,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry post';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [callSyndicationApi]);

  /**
   * Generate post content for a product
   */
  const generateProductPost = useCallback((
    product: ProductSyndicationData,
    platform: SocialPlatform,
    templateId?: string
  ): SocialPostContent => {
    return generateProductPostContent(product, platform, templateId);
  }, []);

  /**
   * Generate post content for a blog
   */
  const generateBlogPost = useCallback((
    blog: BlogSyndicationData,
    platform: SocialPlatform,
    templateId?: string
  ): SocialPostContent => {
    return generateBlogPostContent(blog, platform, templateId);
  }, []);

  /**
   * Fetch the queue from the API
   */
  const fetchQueue = useCallback(async (options?: QueueOptions): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await callSyndicationApi({
        action: 'get_queue',
        queueOptions: options,
      });

      if (response.success && response.data?.queue) {
        setQueue(response.data.queue);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch queue';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [callSyndicationApi]);

  /**
   * Get scheduled posts from local state
   */
  const getScheduledPosts = useCallback((
    platform?: SocialPlatform,
    status?: PostStatus
  ): ScheduledPost[] => {
    let filtered = [...queue];
    
    if (platform) {
      filtered = filtered.filter(p => p.platform === platform);
    }
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    
    return filtered.sort((a, b) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }, [queue]);

  /**
   * Get the next optimal posting time for a platform
   */
  const getNextOptimalTime = useCallback((platform: SocialPlatform): Date => {
    const optimalTimes = getOptimalPostingTimes(platform);
    
    // Check for conflicts with existing scheduled posts
    const scheduledTimes = queue
      .filter(p => p.platform === platform && p.status === 'scheduled')
      .map(p => new Date(p.scheduledAt).getTime());
    
    const minInterval = PLATFORM_CONFIGS[platform].postingSchedule.minTimeBetweenPosts * 60 * 1000;
    
    for (const time of optimalTimes) {
      const timeMs = time.getTime();
      const hasConflict = scheduledTimes.some(
        scheduled => Math.abs(scheduled - timeMs) < minInterval
      );
      
      if (!hasConflict) {
        return time;
      }
    }
    
    // If all optimal times have conflicts, return the first one anyway
    return optimalTimes[0] || new Date();
  }, [queue]);

  /**
   * Schedule a product across multiple platforms
   */
  const scheduleProductSyndication = useCallback(async (
    product: ProductSyndicationData,
    platforms: SocialPlatform[] = ['twitter', 'instagram', 'facebook', 'tiktok']
  ): Promise<{ scheduled: number; errors: string[] }> => {
    const enabledPlatforms = platforms.filter(p => PLATFORM_CONFIGS[p].enabled);
    const errors: string[] = [];
    let scheduled = 0;

    for (const platform of enabledPlatforms) {
      try {
        const content = generateProductPost(product, platform);
        const scheduledAt = getNextOptimalTime(platform);
        
        const result = await schedulePost(
          platform,
          content,
          scheduledAt,
          'product',
          'product',
          product.id
        );

        if (result.success) {
          scheduled++;
        } else {
          errors.push(`${platform}: ${result.error}`);
        }
      } catch (err) {
        errors.push(`${platform}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return { scheduled, errors };
  }, [generateProductPost, getNextOptimalTime, schedulePost]);

  /**
   * Schedule a blog post across multiple platforms
   */
  const scheduleBlogSyndication = useCallback(async (
    blog: BlogSyndicationData,
    platforms: SocialPlatform[] = ['twitter', 'facebook']
  ): Promise<{ scheduled: number; errors: string[] }> => {
    const enabledPlatforms = platforms.filter(p => PLATFORM_CONFIGS[p].enabled);
    const errors: string[] = [];
    let scheduled = 0;

    for (const platform of enabledPlatforms) {
      try {
        const content = generateBlogPost(blog, platform);
        const scheduledAt = getNextOptimalTime(platform);
        
        const result = await schedulePost(
          platform,
          content,
          scheduledAt,
          'blog',
          'blog',
          blog.id
        );

        if (result.success) {
          scheduled++;
        } else {
          errors.push(`${platform}: ${result.error}`);
        }
      } catch (err) {
        errors.push(`${platform}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return { scheduled, errors };
  }, [generateBlogPost, getNextOptimalTime, schedulePost]);

  /**
   * Validate content against platform limits
   */
  const validateContent = useCallback((
    content: SocialPostContent,
    platform: SocialPlatform
  ): { valid: boolean; errors: string[] } => {
    return validatePostContent(content, platform);
  }, []);

  /**
   * Check if we're within rate limits for a platform
   */
  const checkRateLimit = useCallback((platform: SocialPlatform): boolean => {
    const limit = rateLimits.find(l => l.platform === platform);
    if (!limit) return true;
    
    return (
      limit.currentHourlyCount < limit.requestsPerHour &&
      limit.currentDailyCount < limit.requestsPerDay
    );
  }, [rateLimits]);

  /**
   * Fetch current rate limits
   */
  const fetchRateLimits = useCallback(async (): Promise<void> => {
    if (DEMO_MODE) {
      setRateLimits(demoRateLimits);
      return;
    }

    // In production, this would fetch from the Edge Function
    // For now, use default limits
    setRateLimits(demoRateLimits);
  }, []);

  return {
    isLoading,
    error,
    queue,
    rateLimits,
    schedulePost,
    cancelPost,
    retryPost,
    generateProductPost,
    generateBlogPost,
    fetchQueue,
    getScheduledPosts,
    getNextOptimalTime,
    scheduleProductSyndication,
    scheduleBlogSyndication,
    validateContent,
    checkRateLimit,
    fetchRateLimits,
  };
};
