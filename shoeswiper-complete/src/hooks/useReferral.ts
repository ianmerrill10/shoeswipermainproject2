import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/config';

/**
 * Referral program management hook.
 * Manages user referral codes, tracking shares and signups,
 * and calculating reward tiers based on referral performance.
 * 
 * Reward tiers: Starter (0) -> Bronze (3) -> Silver (10) -> Gold (25) -> Diamond (50)
 * 
 * In DEMO_MODE, referral data is stored in localStorage.
 * In production, data is stored in Supabase user_referrals table.
 * 
 * @returns Object containing referral code, stats, and sharing methods
 * @example
 * const { referralCode, referralStats, shareReferralLink, getRewardTier } = useReferral();
 * 
 * // Get shareable referral URL
 * const url = getReferralUrl(); // https://shoeswiper.com/?ref=SS123ABC
 * 
 * // Share via native share or clipboard
 * const result = await shareReferralLink();
 * 
 * // Check reward tier
 * const tier = getRewardTier(); // { tier: 'Bronze', progress: 50, ... }
 */

const REFERRAL_STORAGE_KEY = 'shoeswiper_referral';
const USER_REFERRAL_CODE_KEY = 'shoeswiper_my_referral_code';
const REFERRAL_STATS_KEY = 'shoeswiper_referral_stats';

interface ReferralStats {
  totalShares: number;
  totalClicks: number;
  totalSignups: number;
  earnedRewards: number; // Points or credits earned
  pendingRewards: number;
}

interface ReferralInfo {
  code: string;
  referredBy?: string;
  createdAt: string;
}

// Generate a unique referral code based on user ID
const generateReferralCode = (userId: string): string => {
  const prefix = 'SS'; // ShoeSwiper
  const userPart = userId.substring(0, 6).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${userPart}${random}`;
};

export const useReferral = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalShares: 0,
    totalClicks: 0,
    totalSignups: 0,
    earnedRewards: 0,
    pendingRewards: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load referral data on mount
  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // DEMO MODE: Load from localStorage
        let code = localStorage.getItem(USER_REFERRAL_CODE_KEY);

        if (!code) {
          // Generate a demo referral code
          code = generateReferralCode('demo-user-id');
          localStorage.setItem(USER_REFERRAL_CODE_KEY, code);
        }

        setReferralCode(code);

        // Load stats
        const storedStats = localStorage.getItem(REFERRAL_STATS_KEY);
        if (storedStats) {
          setReferralStats(JSON.parse(storedStats));
        }
      } else {
        // PRODUCTION MODE: Load from Supabase
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Get or create referral code
          const { data: referralData, error } = await supabase
            .from('user_referrals')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (referralData) {
            setReferralCode(referralData.code);
            setReferralStats({
              totalShares: referralData.total_shares || 0,
              totalClicks: referralData.total_clicks || 0,
              totalSignups: referralData.total_signups || 0,
              earnedRewards: referralData.earned_rewards || 0,
              pendingRewards: referralData.pending_rewards || 0,
            });
          } else if (!error || error.code === 'PGRST116') {
            // Create new referral code
            const newCode = generateReferralCode(user.id);
            await supabase.from('user_referrals').insert({
              user_id: user.id,
              code: newCode,
              created_at: new Date().toISOString(),
            });
            setReferralCode(newCode);
          }
        }
      }
    } catch (err) {
      console.error('[Referral] Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Track a share action
  const trackShare = useCallback(async () => {
    try {
      if (DEMO_MODE) {
        const newStats = {
          ...referralStats,
          totalShares: referralStats.totalShares + 1,
        };
        setReferralStats(newStats);
        localStorage.setItem(REFERRAL_STATS_KEY, JSON.stringify(newStats));
        if (import.meta.env.DEV) console.warn('[Demo] Referral share tracked');
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await supabase.rpc('increment_referral_shares', { user_id: user.id });
          setReferralStats(prev => ({
            ...prev,
            totalShares: prev.totalShares + 1,
          }));
        }
      }
    } catch (err) {
      console.error('[Referral] Error tracking share:', err);
    }
  }, [referralStats]);

  // Track when someone clicks a referral link
  const trackClick = useCallback(async (referrerCode: string) => {
    try {
      if (DEMO_MODE) {
        if (import.meta.env.DEV) console.warn(`[Demo] Referral click tracked for code: ${referrerCode}`);
        // In demo mode, we can simulate tracking
        const storedStats = localStorage.getItem(REFERRAL_STATS_KEY);
        if (storedStats) {
          const stats = JSON.parse(storedStats);
          stats.totalClicks = (stats.totalClicks || 0) + 1;
          localStorage.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));
        }
      } else {
        const { supabase } = await import('../lib/supabaseClient');

        // Find the referrer and increment their click count
        await supabase.rpc('track_referral_click', { referrer_code: referrerCode });
      }
    } catch (err) {
      console.error('[Referral] Error tracking click:', err);
    }
  }, []);

  // Process a successful signup via referral
  const processReferralSignup = useCallback(async (referrerCode: string, newUserId: string) => {
    try {
      if (DEMO_MODE) {
        if (import.meta.env.DEV) console.warn(`[Demo] Referral signup: ${newUserId} referred by ${referrerCode}`);

        // Store who referred this user
        localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify({
          code: referrerCode,
          userId: newUserId,
          signedUpAt: new Date().toISOString(),
        }));

        // Update referrer's stats
        const storedStats = localStorage.getItem(REFERRAL_STATS_KEY);
        if (storedStats) {
          const stats = JSON.parse(storedStats);
          stats.totalSignups = (stats.totalSignups || 0) + 1;
          stats.pendingRewards = (stats.pendingRewards || 0) + 100; // 100 points per referral
          localStorage.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));
        }
      } else {
        const { supabase } = await import('../lib/supabaseClient');

        // Process the referral in Supabase
        await supabase.rpc('process_referral_signup', {
          referrer_code: referrerCode,
          new_user_id: newUserId,
        });
      }
    } catch (err) {
      console.error('[Referral] Error processing signup:', err);
    }
  }, []);

  // Get the referral share URL
  const getReferralUrl = useCallback((): string => {
    if (!referralCode) return '';

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'https://shoeswiper.com';

    return `${baseUrl}/?ref=${referralCode}`;
  }, [referralCode]);

  // Get shareable referral message
  const getReferralMessage = useCallback((): string => {
    const url = getReferralUrl();
    return `Check out ShoeSwiper! Discover the hottest sneakers with a TikTok-style feed. Use my link to join: ${url}`;
  }, [getReferralUrl]);

  // Share referral link
  const shareReferralLink = useCallback(async () => {
    const message = getReferralMessage();
    const url = getReferralUrl();

    trackShare();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ShoeSwiper',
          text: message,
          url,
        });
        return { success: true, method: 'native' };
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Share cancelled');
        return { success: false, method: 'cancelled' };
      }
    } else {
      await navigator.clipboard.writeText(message);
      return { success: true, method: 'clipboard' };
    }
  }, [getReferralMessage, getReferralUrl, trackShare]);

  // Check if current user was referred and by whom
  const checkReferralStatus = useCallback(async (): Promise<ReferralInfo | null> => {
    try {
      if (DEMO_MODE) {
        const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('user_referrals')
            .select('referred_by, created_at')
            .eq('user_id', user.id)
            .single();

          if (data?.referred_by) {
            return {
              code: referralCode || '',
              referredBy: data.referred_by,
              createdAt: data.created_at,
            };
          }
        }
      }
      return null;
    } catch (err) {
      console.error('[Referral] Error checking referral status:', err);
      return null;
    }
  }, [referralCode]);

  // Calculate reward tier based on signups
  const getRewardTier = useCallback((): { tier: string; progress: number; nextTier: string; signupsNeeded: number } => {
    const signups = referralStats.totalSignups;

    if (signups >= 50) {
      return { tier: 'Diamond', progress: 100, nextTier: 'Diamond', signupsNeeded: 0 };
    } else if (signups >= 25) {
      return { tier: 'Gold', progress: ((signups - 25) / 25) * 100, nextTier: 'Diamond', signupsNeeded: 50 - signups };
    } else if (signups >= 10) {
      return { tier: 'Silver', progress: ((signups - 10) / 15) * 100, nextTier: 'Gold', signupsNeeded: 25 - signups };
    } else if (signups >= 3) {
      return { tier: 'Bronze', progress: ((signups - 3) / 7) * 100, nextTier: 'Silver', signupsNeeded: 10 - signups };
    } else {
      return { tier: 'Starter', progress: (signups / 3) * 100, nextTier: 'Bronze', signupsNeeded: 3 - signups };
    }
  }, [referralStats.totalSignups]);

  return {
    referralCode,
    referralStats,
    loading,
    trackShare,
    trackClick,
    processReferralSignup,
    getReferralUrl,
    getReferralMessage,
    shareReferralLink,
    checkReferralStatus,
    getRewardTier,
    refreshReferralData: loadReferralData,
  };
};
