import React from 'react';
import {
  VerificationTier,
  getVerificationBadge,
  getBadgeClasses,
} from '../../lib/sellerVerification';

interface SellerVerificationBadgeProps {
  tier: VerificationTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
}

/**
 * Badge displaying seller verification status
 */
export function SellerVerificationBadge({
  tier,
  size = 'md',
  showLabel = true,
  showTooltip = true,
}: SellerVerificationBadgeProps) {
  const badge = getVerificationBadge(tier);
  const classes = getBadgeClasses(tier);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="relative group inline-flex">
      <span
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium
          ${classes}
          ${sizeClasses[size]}
        `}
      >
        <span className={iconSize[size]}>{badge.icon}</span>
        {showLabel && <span>{badge.label}</span>}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {badge.description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
        </div>
      )}
    </div>
  );
}

export default SellerVerificationBadge;
