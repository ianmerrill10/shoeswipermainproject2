import { useState, useCallback, useEffect } from 'react';
import { DEMO_MODE } from '../lib/config';

// Viral analytics event types
export type ViralEventType =
  | 'wishlist_share'
  | 'style_card_create'
  | 'style_card_share'
  | 'referral_link_generate'
  | 'discount_popup_view'
  | 'discount_popup_submit'
  | 'discount_popup_dismiss'
  | 'viral_signup';

export type ReferralChannel = 'social' | 'email' | 'direct' | 'qr';

interface ViralEventData {
  channel?: ReferralChannel;
  referral_code?: string;
  shoe_ids?: string[];
  email?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  [key: string]: unknown;
}

interface ViralMetrics {
  wishlistShares: number;
  styleCardsCreated: number;
  styleCardsShared: number;
  referralLinksGenerated: number;
  discountPopupViews: number;
  discountPopupSubmissions: number;
  discountPopupDismissals: number;
  viralSignups: number;
}

// Storage key for demo mode
const VIRAL_METRICS_KEY = 'shoeswiper_viral_metrics';
const VIRAL_EVENTS_KEY = 'shoeswiper_viral_events';

// In-memory store for demo mode
const demoViralStore: {
  events: Array<{ event: ViralEventType; data: ViralEventData; timestamp: string }>;
  metrics: ViralMetrics;
} = {
  events: [],
  metrics: {
    wishlistShares: 0,
    styleCardsCreated: 0,
    styleCardsShared: 0,
    referralLinksGenerated: 0,
    discountPopupViews: 0,
    discountPopupSubmissions: 0,
    discountPopupDismissals: 0,
    viralSignups: 0,
  },
};

// Load stored metrics on module init (DEMO_MODE)
if (DEMO_MODE && typeof window !== 'undefined') {
  try {
    const storedMetrics = localStorage.getItem(VIRAL_METRICS_KEY);
    if (storedMetrics) {
      demoViralStore.metrics = JSON.parse(storedMetrics);
    }
    const storedEvents = localStorage.getItem(VIRAL_EVENTS_KEY);
    if (storedEvents) {
      demoViralStore.events = JSON.parse(storedEvents);
    }
  } catch {
    // Ignore parse errors
  }
}

export const useViralTracking = () => {
  const [metrics, setMetrics] = useState<ViralMetrics>(demoViralStore.metrics);
  const [loading, setLoading] = useState(true);

  // Load metrics on mount
  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        if (DEMO_MODE) {
          setMetrics(demoViralStore.metrics);
        } else {
          // Production: Load from Supabase
          const { supabase } = await import('../lib/supabaseClient');
          const { data } = await supabase
            .from('viral_metrics')
            .select('*')
            .single();

          if (data) {
            setMetrics({
              wishlistShares: data.wishlist_shares || 0,
              styleCardsCreated: data.style_cards_created || 0,
              styleCardsShared: data.style_cards_shared || 0,
              referralLinksGenerated: data.referral_links_generated || 0,
              discountPopupViews: data.discount_popup_views || 0,
              discountPopupSubmissions: data.discount_popup_submissions || 0,
              discountPopupDismissals: data.discount_popup_dismissals || 0,
              viralSignups: data.viral_signups || 0,
            });
          }
        }
      } catch (err) {
        console.error('[ViralTracking] Error loading metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  /**
   * Track a viral event
   */
  const trackViralEvent = useCallback(async (event: ViralEventType, data: ViralEventData = {}) => {
    const timestamp = new Date().toISOString();

    if (DEMO_MODE) {
      // Store event
      demoViralStore.events.push({ event, data, timestamp });

      // Update metrics
      switch (event) {
        case 'wishlist_share':
          demoViralStore.metrics.wishlistShares++;
          break;
        case 'style_card_create':
          demoViralStore.metrics.styleCardsCreated++;
          break;
        case 'style_card_share':
          demoViralStore.metrics.styleCardsShared++;
          break;
        case 'referral_link_generate':
          demoViralStore.metrics.referralLinksGenerated++;
          break;
        case 'discount_popup_view':
          demoViralStore.metrics.discountPopupViews++;
          break;
        case 'discount_popup_submit':
          demoViralStore.metrics.discountPopupSubmissions++;
          break;
        case 'discount_popup_dismiss':
          demoViralStore.metrics.discountPopupDismissals++;
          break;
        case 'viral_signup':
          demoViralStore.metrics.viralSignups++;
          break;
      }

      // Persist to localStorage
      localStorage.setItem(VIRAL_METRICS_KEY, JSON.stringify(demoViralStore.metrics));
      localStorage.setItem(VIRAL_EVENTS_KEY, JSON.stringify(demoViralStore.events.slice(-100)));

      // Update state
      setMetrics({ ...demoViralStore.metrics });

      if (import.meta.env.DEV) {
        console.warn(`[ViralTracking] ${event}:`, data);
      }
      return;
    }

    // Production: Send to Supabase
    try {
      const { supabase } = await import('../lib/supabaseClient');

      await supabase.from('viral_events').insert({
        event_type: event,
        event_data: data,
        created_at: timestamp,
      });

      // Update aggregate metrics via RPC
      await supabase.rpc('increment_viral_metric', { metric_type: event });
    } catch (err) {
      console.error('[ViralTracking] Error tracking event:', err);
    }
  }, []);

  /**
   * Track wishlist share
   */
  const trackWishlistShare = useCallback((shoeIds: string[], method: 'native' | 'clipboard') => {
    trackViralEvent('wishlist_share', {
      shoe_ids: shoeIds,
      method,
      count: shoeIds.length,
    });
  }, [trackViralEvent]);

  /**
   * Track style card creation
   */
  const trackStyleCardCreate = useCallback((shoeIds: string[]) => {
    trackViralEvent('style_card_create', {
      shoe_ids: shoeIds,
      count: shoeIds.length,
    });
  }, [trackViralEvent]);

  /**
   * Track style card share
   */
  const trackStyleCardShare = useCallback((shoeIds: string[], method: 'native' | 'clipboard' | 'download') => {
    trackViralEvent('style_card_share', {
      shoe_ids: shoeIds,
      method,
      count: shoeIds.length,
    });
  }, [trackViralEvent]);

  /**
   * Track referral link generation
   */
  const trackReferralLinkGenerate = useCallback((channel: ReferralChannel, referralCode: string) => {
    trackViralEvent('referral_link_generate', {
      channel,
      referral_code: referralCode,
    });
  }, [trackViralEvent]);

  /**
   * Track discount popup view
   */
  const trackDiscountPopupView = useCallback(() => {
    trackViralEvent('discount_popup_view', {});
  }, [trackViralEvent]);

  /**
   * Track discount popup submission
   */
  const trackDiscountPopupSubmit = useCallback((email: string) => {
    trackViralEvent('discount_popup_submit', { email });
  }, [trackViralEvent]);

  /**
   * Track discount popup dismiss
   */
  const trackDiscountPopupDismiss = useCallback(() => {
    trackViralEvent('discount_popup_dismiss', {});
  }, [trackViralEvent]);

  /**
   * Track viral signup (from referral/share)
   */
  const trackViralSignup = useCallback((source: string, referralCode?: string) => {
    trackViralEvent('viral_signup', {
      source,
      referral_code: referralCode,
    });
  }, [trackViralEvent]);

  /**
   * Generate UTM-tagged referral URL
   */
  const generateReferralUrl = useCallback((
    referralCode: string,
    channel: ReferralChannel,
    campaign?: string
  ): string => {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'https://shoeswiper.com';

    const params = new URLSearchParams({
      ref: referralCode,
      utm_source: 'shoeswiper',
      utm_medium: channel === 'email' ? 'email' : 'referral',
      utm_campaign: campaign || `referral_${channel}`,
    });

    trackReferralLinkGenerate(channel, referralCode);

    return `${baseUrl}/?${params.toString()}`;
  }, [trackReferralLinkGenerate]);

  /**
   * Get viral metrics summary
   */
  const getViralMetricsSummary = useCallback(async () => {
    if (DEMO_MODE) {
      const conversionRate = demoViralStore.metrics.discountPopupViews > 0
        ? (demoViralStore.metrics.discountPopupSubmissions / demoViralStore.metrics.discountPopupViews) * 100
        : 0;

      const shareToSignupRate = demoViralStore.metrics.styleCardsShared + demoViralStore.metrics.wishlistShares > 0
        ? (demoViralStore.metrics.viralSignups / (demoViralStore.metrics.styleCardsShared + demoViralStore.metrics.wishlistShares)) * 100
        : 0;

      return {
        ...demoViralStore.metrics,
        totalShares: demoViralStore.metrics.wishlistShares + demoViralStore.metrics.styleCardsShared,
        discountPopupConversionRate: conversionRate.toFixed(1),
        shareToSignupRate: shareToSignupRate.toFixed(1),
        recentEvents: demoViralStore.events.slice(-20).reverse(),
      };
    }

    // Production: Query Supabase
    const { supabase } = await import('../lib/supabaseClient');
    const { data } = await supabase
      .from('viral_metrics')
      .select('*')
      .single();

    return data || metrics;
  }, [metrics]);

  return {
    metrics,
    loading,
    trackViralEvent,
    trackWishlistShare,
    trackStyleCardCreate,
    trackStyleCardShare,
    trackReferralLinkGenerate,
    trackDiscountPopupView,
    trackDiscountPopupSubmit,
    trackDiscountPopupDismiss,
    trackViralSignup,
    generateReferralUrl,
    getViralMetricsSummary,
  };
};
