import { useCallback, useMemo } from 'react';
import { useAnalytics } from './useAnalytics';
import {
  SocialPlatform,
  ShareableContent,
  ShareAnalyticsEvent,
  generateShareUrl,
  createSneakerShareContent,
  createOutfitShareContent,
  createReferralShareContent,
  createShareAnalyticsEvent,
  isNativeShareSupported,
  canShareDirect,
  buildTrackedUrl,
  generateUTMParams,
  ensureAffiliateTag,
  SOCIAL_CONFIG,
} from '../lib/socialSyndication';
import { DEMO_MODE } from '../lib/config';

/**
 * Social sharing hook for ShoeSwiper.
 * Provides methods to share content to various social media platforms
 * with proper tracking, UTM parameters, and affiliate tags.
 * 
 * @returns Object containing sharing methods and utilities
 * @example
 * const { shareSneaker, shareToTwitter, copyShareLink } = useSocialSharing();
 * 
 * // Share a sneaker with native share dialog
 * await shareSneaker(shoe);
 * 
 * // Share to a specific platform
 * shareToTwitter(content);
 * 
 * // Copy share link to clipboard
 * const { success } = await copyShareLink(content);
 */

// In-memory analytics store for demo mode
const demoShareAnalytics: ShareAnalyticsEvent[] = [];

interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'direct' | 'cancelled';
  platform?: SocialPlatform;
  error?: string;
}

interface SneakerShareData {
  id: string;
  name: string;
  brand: string;
  image_url?: string;
  amazon_url?: string;
  style_tags?: string[];
}

interface OutfitShareData {
  id: string;
  title?: string;
  imageUrl?: string;
  rating?: number;
  styleTags?: string[];
}

export const useSocialSharing = (referralCode?: string) => {
  const { trackEvent } = useAnalytics();

  /**
   * Track a share event
   */
  const trackShareEvent = useCallback(async (
    event: ShareAnalyticsEvent
  ): Promise<void> => {
    // Track in our analytics system
    trackEvent('share', {
      content_type: event.contentType,
      content_id: event.contentId,
      platform: event.platform,
      method: event.method,
      referral_code: event.referralCode,
    });

    // Store in demo analytics
    if (DEMO_MODE) {
      demoShareAnalytics.push(event);
      if (import.meta.env.DEV) {
        // Using console.debug for non-error development logging
        // eslint-disable-next-line no-console
        console.debug('[Social Share] Event tracked:', event);
      }
    } else {
      // Production: send to Supabase
      try {
        const { supabase } = await import('../lib/supabaseClient');
        await supabase.from('share_analytics').insert({
          content_type: event.contentType,
          content_id: event.contentId,
          platform: event.platform,
          method: event.method,
          referral_code: event.referralCode,
          utm_source: event.utmParams.utmSource,
          utm_medium: event.utmParams.utmMedium,
          utm_campaign: event.utmParams.utmCampaign,
          created_at: event.timestamp,
        });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[Social Share] Error storing analytics:', err);
        }
      }
    }
  }, [trackEvent]);

  /**
   * Share using the native Web Share API
   */
  const shareNative = useCallback(async (
    content: ShareableContent
  ): Promise<ShareResult> => {
    if (!isNativeShareSupported()) {
      return { success: false, method: 'cancelled', error: 'Native share not supported' };
    }

    // For native sharing (Web Share API), we use 'whatsapp' as the UTM content
    // since it's primarily used on mobile devices where WhatsApp is common.
    // The actual platform shared to is determined by the user's device share sheet.
    const utm = generateUTMParams('whatsapp', content.type);
    const shareUrl = buildTrackedUrl(content.url, utm, referralCode);

    try {
      let shareText = `🔥 ${content.title}\n\n${content.description}`;
      
      // Add Amazon link if available
      if (content.amazonUrl) {
        const affiliateUrl = ensureAffiliateTag(content.amazonUrl);
        shareText += `\n\n🛒 Shop: ${affiliateUrl}`;
      }

      await navigator.share({
        title: content.title,
        text: shareText,
        url: shareUrl,
      });

      // Track the share
      const analyticsEvent = createShareAnalyticsEvent(
        content,
        'whatsapp', // We don't know exact platform from native share
        'native',
        referralCode
      );
      await trackShareEvent(analyticsEvent);

      return { success: true, method: 'native' };
    } catch (err) {
      // User cancelled the share
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      return { success: false, method: 'cancelled', error: String(err) };
    }
  }, [referralCode, trackShareEvent]);

  /**
   * Copy share link to clipboard
   */
  const copyShareLink = useCallback(async (
    content: ShareableContent,
    platform: SocialPlatform = 'twitter'
  ): Promise<ShareResult> => {
    const utm = generateUTMParams(platform, content.type);
    const shareUrl = buildTrackedUrl(content.url, utm, referralCode);

    try {
      let textToCopy = `🔥 ${content.title}\n\n${content.description}\n\n👉 ${shareUrl}`;
      
      // Add Amazon link if available
      if (content.amazonUrl) {
        const affiliateUrl = ensureAffiliateTag(content.amazonUrl);
        textToCopy += `\n\n🛒 Shop on Amazon: ${affiliateUrl}`;
      }

      await navigator.clipboard.writeText(textToCopy);

      // Track the share
      const analyticsEvent = createShareAnalyticsEvent(
        content,
        platform,
        'clipboard',
        referralCode
      );
      await trackShareEvent(analyticsEvent);

      return { success: true, method: 'clipboard', platform };
    } catch (_err) {
      return { success: false, method: 'cancelled', error: 'Failed to copy to clipboard' };
    }
  }, [referralCode, trackShareEvent]);

  /**
   * Share to a specific platform
   */
  const shareToPlatform = useCallback(async (
    platform: SocialPlatform,
    content: ShareableContent
  ): Promise<ShareResult> => {
    if (!canShareDirect(platform)) {
      // Platform doesn't have web share intent - copy to clipboard instead
      return copyShareLink(content, platform);
    }

    const shareUrl = generateShareUrl(platform, content, referralCode);
    
    // Open the share URL in a new window/tab
    const shareWindow = window.open(
      shareUrl,
      '_blank',
      'width=600,height=500,scrollbars=yes'
    );

    if (!shareWindow) {
      // Popup blocked - try direct navigation
      window.location.href = shareUrl;
    }

    // Track the share
    const analyticsEvent = createShareAnalyticsEvent(
      content,
      platform,
      'direct',
      referralCode
    );
    await trackShareEvent(analyticsEvent);

    return { success: true, method: 'direct', platform };
  }, [referralCode, trackShareEvent, copyShareLink]);

  /**
   * Share a sneaker
   */
  const shareSneaker = useCallback(async (
    sneaker: SneakerShareData,
    preferNative: boolean = true
  ): Promise<ShareResult> => {
    const content = createSneakerShareContent({
      id: sneaker.id,
      name: sneaker.name,
      brand: sneaker.brand,
      imageUrl: sneaker.image_url,
      amazonUrl: sneaker.amazon_url,
      styleTags: sneaker.style_tags,
    });

    if (preferNative && isNativeShareSupported()) {
      return shareNative(content);
    }

    return copyShareLink(content);
  }, [shareNative, copyShareLink]);

  /**
   * Share an outfit
   */
  const shareOutfit = useCallback(async (
    outfit: OutfitShareData,
    preferNative: boolean = true
  ): Promise<ShareResult> => {
    const content = createOutfitShareContent(outfit);

    if (preferNative && isNativeShareSupported()) {
      return shareNative(content);
    }

    return copyShareLink(content);
  }, [shareNative, copyShareLink]);

  /**
   * Share referral link
   */
  const shareReferral = useCallback(async (
    code: string,
    preferNative: boolean = true
  ): Promise<ShareResult> => {
    const content = createReferralShareContent(code);

    if (preferNative && isNativeShareSupported()) {
      return shareNative(content);
    }

    return copyShareLink(content);
  }, [shareNative, copyShareLink]);

  // Platform-specific share methods
  const shareToTwitter = useCallback((content: ShareableContent) => 
    shareToPlatform('twitter', content), [shareToPlatform]);

  const shareToFacebook = useCallback((content: ShareableContent) => 
    shareToPlatform('facebook', content), [shareToPlatform]);

  const shareToPinterest = useCallback((content: ShareableContent) => 
    shareToPlatform('pinterest', content), [shareToPlatform]);

  const shareToWhatsApp = useCallback((content: ShareableContent) => 
    shareToPlatform('whatsapp', content), [shareToPlatform]);

  const shareToTelegram = useCallback((content: ShareableContent) => 
    shareToPlatform('telegram', content), [shareToPlatform]);

  const shareToLinkedIn = useCallback((content: ShareableContent) => 
    shareToPlatform('linkedin', content), [shareToPlatform]);

  const shareToEmail = useCallback((content: ShareableContent) => 
    shareToPlatform('email', content), [shareToPlatform]);

  /**
   * Get analytics summary (for admin/debugging)
   */
  const getShareAnalytics = useCallback(() => {
    if (DEMO_MODE) {
      const platformCounts: Record<string, number> = {};
      const contentTypeCounts: Record<string, number> = {};

      demoShareAnalytics.forEach(event => {
        platformCounts[event.platform] = (platformCounts[event.platform] || 0) + 1;
        contentTypeCounts[event.contentType] = (contentTypeCounts[event.contentType] || 0) + 1;
      });

      return {
        totalShares: demoShareAnalytics.length,
        byPlatform: platformCounts,
        byContentType: contentTypeCounts,
        recentShares: demoShareAnalytics.slice(-20).reverse(),
      };
    }

    return {
      totalShares: 0,
      byPlatform: {},
      byContentType: {},
      recentShares: [],
    };
  }, []);

  /**
   * Available platforms for UI rendering
   */
  const availablePlatforms = useMemo((): SocialPlatform[] => [
    'twitter',
    'facebook',
    'pinterest',
    'whatsapp',
    'telegram',
    'linkedin',
    'email',
  ], []);

  /**
   * Check if native share is available
   */
  const nativeShareAvailable = useMemo(() => isNativeShareSupported(), []);

  return {
    // Core sharing methods
    shareNative,
    shareToPlatform,
    copyShareLink,
    
    // Content-specific methods
    shareSneaker,
    shareOutfit,
    shareReferral,
    
    // Platform-specific methods
    shareToTwitter,
    shareToFacebook,
    shareToPinterest,
    shareToWhatsApp,
    shareToTelegram,
    shareToLinkedIn,
    shareToEmail,
    
    // Utilities
    createSneakerShareContent,
    createOutfitShareContent,
    createReferralShareContent,
    generateShareUrl,
    
    // Analytics
    getShareAnalytics,
    
    // State
    availablePlatforms,
    nativeShareAvailable,
    
    // Config
    baseUrl: SOCIAL_CONFIG.baseUrl,
  };
};

export type { ShareResult, SneakerShareData, OutfitShareData };
