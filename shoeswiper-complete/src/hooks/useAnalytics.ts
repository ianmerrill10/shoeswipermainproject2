import { useCallback } from 'react';
import { DEMO_MODE } from '../lib/config';

/**
 * Event tracking hook for user interactions, affiliate clicks, and engagement metrics.
 * Provides methods to track various user actions for analytics and revenue attribution.
 * 
 * In DEMO_MODE, events are stored in memory and logged to console.
 * In production, events are sent to Supabase analytics tables.
 * 
 * @returns Object containing tracking methods and analytics summary
 * @example
 * const { trackShoeView, trackShoeClick, trackMusicClick } = useAnalytics();
 * 
 * // Track when shoe card becomes visible
 * trackShoeView(shoe.id);
 * 
 * // Track Amazon buy button click
 * trackShoeClick(shoe.id);
 * 
 * // Track music link click
 * trackMusicClick('spotify', shoe.id, 'Song Name', 'Artist');
 */

// Analytics event types for type safety
export type AnalyticsEvent =
  | 'shoe_view'
  | 'shoe_click'
  | 'music_click'
  | 'panel_open'
  | 'share'
  | 'favorite'
  | 'swipe';

export type MusicPlatform = 'spotify' | 'apple_music' | 'amazon_music';
export type PanelType = 'shoe' | 'music';

interface AnalyticsData {
  shoe_id?: string;
  platform?: MusicPlatform;
  panel_type?: PanelType;
  song?: string;
  artist?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  [key: string]: unknown;
}

// In-memory analytics store for DEMO_MODE
const demoAnalytics: {
  events: Array<{ event: AnalyticsEvent; data: AnalyticsData; timestamp: string }>;
  summary: {
    shoe_views: Record<string, number>;
    shoe_clicks: Record<string, number>;
    music_clicks: Record<MusicPlatform, number>;
    panel_opens: Record<PanelType, number>;
    shares: number;
    favorites: number;
  };
} = {
  events: [],
  summary: {
    shoe_views: {},
    shoe_clicks: {},
    music_clicks: { spotify: 0, apple_music: 0, amazon_music: 0 },
    panel_opens: { shoe: 0, music: 0 },
    shares: 0,
    favorites: 0,
  },
};

export const useAnalytics = () => {
  /**
   * Core tracking function - all events flow through here
   */
  const trackEvent = useCallback(async (event: AnalyticsEvent, data: AnalyticsData = {}) => {
    const timestamp = new Date().toISOString();

    // DEMO MODE: Store in memory and log
    if (DEMO_MODE) {
      demoAnalytics.events.push({ event, data, timestamp });

      // Update summary stats
      switch (event) {
        case 'shoe_view':
          if (data.shoe_id) {
            demoAnalytics.summary.shoe_views[data.shoe_id] =
              (demoAnalytics.summary.shoe_views[data.shoe_id] || 0) + 1;
          }
          break;
        case 'shoe_click':
          if (data.shoe_id) {
            demoAnalytics.summary.shoe_clicks[data.shoe_id] =
              (demoAnalytics.summary.shoe_clicks[data.shoe_id] || 0) + 1;
          }
          break;
        case 'music_click':
          if (data.platform) {
            demoAnalytics.summary.music_clicks[data.platform]++;
          }
          break;
        case 'panel_open':
          if (data.panel_type) {
            demoAnalytics.summary.panel_opens[data.panel_type]++;
          }
          break;
        case 'share':
          demoAnalytics.summary.shares++;
          break;
        case 'favorite':
          demoAnalytics.summary.favorites++;
          break;
      }

      if (import.meta.env.DEV) console.warn(`[Analytics] ${event}:`, data);
      return;
    }

    // PRODUCTION MODE: Send to Supabase
    try {
      const { supabase } = await import('../lib/supabaseClient');

      await supabase.from('analytics_events').insert({
        event_type: event,
        event_data: data,
        created_at: timestamp,
      });

      // Also update specific tracking tables based on event type
      if (event === 'shoe_click' && data.shoe_id) {
        await supabase.from('affiliate_clicks').insert({
          shoe_id: data.shoe_id,
          clicked_at: timestamp,
        });
        await supabase.rpc('increment_shoe_click', { shoe_id: data.shoe_id });
      }

      if (event === 'music_click' && data.platform) {
        await supabase.from('music_clicks').insert({
          shoe_id: data.shoe_id,
          platform: data.platform,
          song: data.song,
          artist: data.artist,
          clicked_at: timestamp,
        });
      }
    } catch (err) {
      console.error('[Analytics] Error tracking event:', err);
    }
  }, []);

  /**
   * Track shoe view (when card becomes visible)
   */
  const trackShoeView = useCallback((shoeId: string) => {
    trackEvent('shoe_view', { shoe_id: shoeId });
  }, [trackEvent]);

  /**
   * Track shoe click (Amazon buy button)
   */
  const trackShoeClick = useCallback((shoeId: string) => {
    trackEvent('shoe_click', { shoe_id: shoeId });
  }, [trackEvent]);

  /**
   * Track music link click (Spotify/Apple/Amazon)
   */
  const trackMusicClick = useCallback((
    platform: MusicPlatform,
    shoeId: string,
    song: string,
    artist: string
  ) => {
    trackEvent('music_click', {
      platform,
      shoe_id: shoeId,
      song,
      artist
    });
  }, [trackEvent]);

  /**
   * Track panel open (Shoe or Music panel)
   */
  const trackPanelOpen = useCallback((panelType: PanelType, shoeId: string) => {
    trackEvent('panel_open', { panel_type: panelType, shoe_id: shoeId });
  }, [trackEvent]);

  /**
   * Track share action
   */
  const trackShare = useCallback((shoeId: string, method: 'native' | 'clipboard') => {
    trackEvent('share', { shoe_id: shoeId, method });
  }, [trackEvent]);

  /**
   * Track favorite/save action
   */
  const trackFavorite = useCallback((shoeId: string, action: 'add' | 'remove') => {
    trackEvent('favorite', { shoe_id: shoeId, action });
  }, [trackEvent]);

  /**
   * Get analytics summary (for admin dashboard)
   */
  const getAnalyticsSummary = useCallback(async () => {
    if (DEMO_MODE) {
      return {
        totalEvents: demoAnalytics.events.length,
        shoeViews: Object.values(demoAnalytics.summary.shoe_views).reduce((a, b) => a + b, 0),
        shoeClicks: Object.values(demoAnalytics.summary.shoe_clicks).reduce((a, b) => a + b, 0),
        musicClicks: demoAnalytics.summary.music_clicks,
        panelOpens: demoAnalytics.summary.panel_opens,
        shares: demoAnalytics.summary.shares,
        favorites: demoAnalytics.summary.favorites,
        recentEvents: demoAnalytics.events.slice(-50).reverse(),
        topShoes: Object.entries(demoAnalytics.summary.shoe_clicks)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10),
      };
    }

    // PRODUCTION: Query Supabase
    const { supabase } = await import('../lib/supabaseClient');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalEvents },
      { data: musicClicks },
      { data: recentEvents },
    ] = await Promise.all([
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
      supabase.from('music_clicks').select('platform').gte('clicked_at', thirtyDaysAgo),
      supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    // Aggregate music clicks by platform
    const musicClicksByPlatform = (musicClicks || []).reduce((acc: Record<string, number>, click: { platform: string }) => {
      acc[click.platform] = (acc[click.platform] || 0) + 1;
      return acc;
    }, { spotify: 0, apple_music: 0, amazon_music: 0 });

    return {
      totalEvents: totalEvents || 0,
      musicClicks: musicClicksByPlatform,
      recentEvents: recentEvents || [],
    };
  }, []);

  return {
    trackEvent,
    trackShoeView,
    trackShoeClick,
    trackMusicClick,
    trackPanelOpen,
    trackShare,
    trackFavorite,
    getAnalyticsSummary,
  };
};
