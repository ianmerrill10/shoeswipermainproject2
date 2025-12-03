import { useCallback } from 'react';
import { AFFILIATE_TAG } from '../lib/supabaseClient';

interface UseAffiliateLinkResult {
  getAffiliateLink: (url: string) => string;
  openAffiliateLink: (url: string) => void;
  affiliateTag: string;
}

/**
 * Custom hook for managing Amazon affiliate links.
 * Ensures all Amazon URLs include the proper affiliate tag.
 */
export const useAffiliateLink = (): UseAffiliateLinkResult => {
  /**
   * Appends the affiliate tag to an Amazon URL if not already present.
   */
  const getAffiliateLink = useCallback((url: string): string => {
    if (!url) return '';
    
    // Check if tag already exists
    if (url.includes(`tag=${AFFILIATE_TAG}`)) {
      return url;
    }
    
    // Add the affiliate tag
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tag=${AFFILIATE_TAG}`;
  }, []);

  /**
   * Opens an affiliate link in a new tab.
   */
  const openAffiliateLink = useCallback((url: string): void => {
    const affiliateUrl = getAffiliateLink(url);
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  }, [getAffiliateLink]);

  return {
    getAffiliateLink,
    openAffiliateLink,
    affiliateTag: AFFILIATE_TAG,
  };
};

export default useAffiliateLink;
