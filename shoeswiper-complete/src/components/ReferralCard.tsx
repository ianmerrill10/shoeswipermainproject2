import React, { useState } from 'react';
import { FaGift, FaShare, FaUsers, FaCopy, FaCheck, FaTrophy, FaChevronRight } from 'react-icons/fa';
import { useReferral } from '../hooks/useReferral';

interface ReferralCardProps {
  compact?: boolean;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ compact = false }) => {
  const {
    referralCode,
    referralStats,
    loading,
    shareReferralLink,
    getReferralUrl,
    getRewardTier,
  } = useReferral();

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const result = await shareReferralLink();
    if (result.success && result.method === 'clipboard') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    if (referralCode) {
      await navigator.clipboard.writeText(getReferralUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/30 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-orange-500/30 rounded w-1/2 mb-2" />
            <div className="h-3 bg-orange-500/30 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  const { tier, progress, nextTier, signupsNeeded } = getRewardTier();

  // Tier colors
  const tierColors: Record<string, string> = {
    'Starter': 'from-zinc-500 to-zinc-600',
    'Bronze': 'from-amber-700 to-amber-800',
    'Silver': 'from-gray-400 to-gray-500',
    'Gold': 'from-yellow-500 to-amber-500',
    'Diamond': 'from-cyan-400 to-blue-500',
  };

  if (compact) {
    return (
      <button
        className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30 hover:border-orange-400 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <FaGift className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Invite Friends</p>
              <p className="text-zinc-400 text-xs">{referralStats.totalSignups} friends joined</p>
            </div>
          </div>
          <FaChevronRight className="text-zinc-500" />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaGift className="text-orange-400" />
          <span className="text-white font-bold">Refer & Earn</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${tierColors[tier]} text-white`}>
          {tier}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-3 border-b border-zinc-800/50">
        <div className="text-center">
          <p className="text-xl font-bold text-white">{referralStats.totalShares}</p>
          <p className="text-[10px] text-zinc-400 uppercase">Shares</p>
        </div>
        <div className="text-center border-x border-zinc-800/50">
          <p className="text-xl font-bold text-white">{referralStats.totalClicks}</p>
          <p className="text-[10px] text-zinc-400 uppercase">Clicks</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-orange-400">{referralStats.totalSignups}</p>
          <p className="text-[10px] text-zinc-400 uppercase">Signups</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {tier !== 'Diamond' && (
        <div className="px-4 py-3 border-b border-zinc-800/50">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-zinc-400">Progress to {nextTier}</span>
            <span className="text-xs text-orange-400 font-medium">{signupsNeeded} more</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${tierColors[nextTier]} transition-all duration-500`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Referral Code */}
      <div className="p-4 border-b border-zinc-800/50">
        <p className="text-xs text-zinc-400 mb-2">Your referral code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-900 rounded-lg px-3 py-2 font-mono text-orange-400 text-sm tracking-wider">
            {referralCode || '...'}
          </div>
          <button
            onClick={handleCopyCode}
            className={`p-2.5 rounded-lg transition-colors ${
              copied ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="flex items-center gap-2 mb-2">
          <FaTrophy className="text-yellow-500" />
          <span className="text-sm font-medium text-white">Rewards</span>
        </div>
        <div className="space-y-1.5 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>Per signup</span>
            <span className="text-orange-400">+100 points</span>
          </div>
          <div className="flex justify-between">
            <span>Your earnings</span>
            <span className="text-white font-medium">{referralStats.earnedRewards} pts</span>
          </div>
          {referralStats.pendingRewards > 0 && (
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="text-yellow-400">{referralStats.pendingRewards} pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Share Button */}
      <div className="p-4">
        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <FaShare />
          {copied ? 'Link Copied!' : 'Share & Invite Friends'}
        </button>
        <p className="text-center text-zinc-500 text-xs mt-2">
          <FaUsers className="inline mr-1" />
          Earn rewards when friends join
        </p>
      </div>
    </div>
  );
};

export default ReferralCard;
