import React, { useState } from 'react';
import {
  VerificationTier,
  SellerProfile,
  VerificationDocument,
  VERIFICATION_TIERS,
  TIER_REQUIREMENTS,
  checkTierRequirements,
  getMaxListingValue,
} from '../../lib/sellerVerification';
import { formatAmount, ESCROW_PERIODS } from '../../lib/escrow';
import { SellerVerificationBadge } from './SellerVerificationBadge';

interface TierUpgradeCardProps {
  currentProfile: SellerProfile;
  documents: VerificationDocument[];
  onRequestUpgrade: (tier: VerificationTier) => Promise<{ success: boolean; missing?: string[]; error?: string }>;
}

const TIER_ORDER: VerificationTier[] = ['unverified', 'basic', 'verified', 'trusted'];

/**
 * Card showing verification tiers and upgrade options
 */
export function TierUpgradeCard({
  currentProfile,
  documents,
  onRequestUpgrade,
}: TierUpgradeCardProps) {
  const [upgrading, setUpgrading] = useState<VerificationTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);

  const currentTierIndex = TIER_ORDER.indexOf(currentProfile.verification_tier);

  const handleUpgradeRequest = async (tier: VerificationTier) => {
    setError(null);
    setMissingRequirements([]);
    setUpgrading(tier);

    try {
      const result = await onRequestUpgrade(tier);

      if (!result.success) {
        if (result.missing && result.missing.length > 0) {
          setMissingRequirements(result.missing);
        } else if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-2">
        Verification Tiers
      </h3>
      <p className="text-sm text-zinc-400 mb-6">
        Higher tiers unlock more benefits and build buyer trust.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {missingRequirements.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          <p className="font-medium mb-2">Missing requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            {missingRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {TIER_ORDER.map((tier, index) => {
          const badge = VERIFICATION_TIERS[tier];
          const requirements = TIER_REQUIREMENTS[tier];
          const { eligible, missing } = checkTierRequirements(currentProfile, documents, tier);
          const maxListing = getMaxListingValue({ ...currentProfile, verification_tier: tier });
          const escrowDays = ESCROW_PERIODS[tier];

          const isCurrent = tier === currentProfile.verification_tier;
          const isLocked = index > currentTierIndex + 1; // Can only upgrade one tier at a time
          const canUpgrade = index === currentTierIndex + 1 && eligible;
          const isPast = index < currentTierIndex;

          return (
            <div
              key={tier}
              className={`
                p-4 rounded-lg border transition-all
                ${isCurrent
                  ? 'bg-blue-500/10 border-blue-500/50'
                  : isPast
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-zinc-800/50 border-zinc-700'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <SellerVerificationBadge tier={tier} showTooltip={false} />
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        Current
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs text-green-400">✓ Completed</span>
                    )}
                  </div>

                  <p className="text-sm text-zinc-400 mb-3">{badge.description}</p>

                  {/* Benefits */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-800/50 rounded px-2 py-1">
                      <span className="text-zinc-500">Max Listing:</span>
                      <span className="text-white ml-1">
                        {maxListing === 0 ? 'Cannot list' : formatAmount(maxListing)}
                      </span>
                    </div>
                    <div className="bg-zinc-800/50 rounded px-2 py-1">
                      <span className="text-zinc-500">Escrow:</span>
                      <span className="text-white ml-1">
                        {escrowDays === 0 ? 'Immediate' : `${escrowDays} days`}
                      </span>
                    </div>
                  </div>

                  {/* Requirements */}
                  {requirements.length > 0 && !isPast && (
                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <p className="text-xs text-zinc-500 mb-2">Requirements:</p>
                      <ul className="text-xs text-zinc-400 space-y-1">
                        {requirements.map((req, i) => {
                          const isComplete = !missing.includes(req.description);
                          return (
                            <li key={i} className="flex items-center gap-2">
                              {isComplete ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-zinc-600">○</span>
                              )}
                              <span className={isComplete ? 'text-zinc-400' : ''}>
                                {req.description}
                                {!req.required && ' (optional)'}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  {canUpgrade && (
                    <button
                      onClick={() => handleUpgradeRequest(tier)}
                      disabled={upgrading === tier}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        bg-blue-500 text-white hover:bg-blue-600
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {upgrading === tier ? 'Requesting...' : 'Request Upgrade'}
                    </button>
                  )}
                  {index === currentTierIndex + 1 && !eligible && !isCurrent && (
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    >
                      Requirements Not Met
                    </button>
                  )}
                  {isLocked && (
                    <span className="text-xs text-zinc-500">
                      Complete previous tier first
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TierUpgradeCard;
