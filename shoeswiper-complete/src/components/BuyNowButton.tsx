import React from 'react';
import { FaAmazon, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getAffiliateUrl, trackAffiliateClick, extractAsinFromUrl } from '../lib/supabaseClient';

interface BuyNowButtonProps {
  amazonUrl: string;
  shoeId?: string;
  variant?: 'default' | 'compact' | 'large';
  showPrimeBadge?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'px-4 py-3 rounded-xl font-bold text-white',
  compact: 'px-3 py-2 rounded-lg text-sm font-semibold text-white',
  large: 'px-6 py-4 rounded-xl text-lg font-black text-white',
};

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({
  amazonUrl,
  shoeId,
  variant = 'default',
  showPrimeBadge = false,
  className = '',
}) => {
  const affiliateUrl = getAffiliateUrl(amazonUrl);
  const buttonText = variant === 'compact' ? 'Buy' : 'Buy Now';

  const handleClick = (_e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track affiliate click for revenue attribution
    if (shoeId) {
      const asin = extractAsinFromUrl(amazonUrl);
      trackAffiliateClick(shoeId, asin ?? undefined, 'buy_button');
    }
    
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[BuyNowButton] Click tracked:', { shoeId, url: affiliateUrl });
    }
  };

  return (
    <motion.a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      aria-label="Buy on Amazon"
      className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 transition-shadow hover:shadow-lg hover:shadow-orange-500/25 ${variantStyles[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <FaAmazon className={variant === 'large' ? 'text-xl' : 'text-base'} aria-hidden="true" />
      <span>{buttonText}</span>
      {showPrimeBadge && (
        <span className="flex items-center gap-1 ml-1 text-blue-400">
          <FaCheck className="text-xs" aria-hidden="true" />
          <span className={variant === 'compact' ? 'text-xs' : 'text-sm'}>Prime</span>
        </span>
      )}
    </motion.a>
  );
};

export default BuyNowButton;
