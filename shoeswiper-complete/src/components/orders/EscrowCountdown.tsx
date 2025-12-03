import React, { useState, useEffect } from 'react';
import { EscrowTransaction, getTimeRemaining } from '../../lib/escrow';

interface EscrowCountdownProps {
  transaction: EscrowTransaction;
  onExpire?: () => void;
}

/**
 * Countdown timer showing time until escrow release
 */
export function EscrowCountdown({ transaction, onExpire }: EscrowCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!transaction.escrow_expires_at || !transaction.delivered_at) {
      return;
    }

    const updateCountdown = () => {
      const remaining = getTimeRemaining(transaction.escrow_expires_at);
      setTimeRemaining(remaining);

      // Calculate progress percentage
      const deliveredAt = new Date(transaction.delivered_at!).getTime();
      const expiresAt = new Date(transaction.escrow_expires_at!).getTime();
      const now = Date.now();
      const totalDuration = expiresAt - deliveredAt;
      const elapsed = now - deliveredAt;
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgress(progressPercent);

      // Check if expired
      if (now >= expiresAt && onExpire) {
        onExpire();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [transaction.escrow_expires_at, transaction.delivered_at, onExpire]);

  // Immediate release - no countdown needed
  if (transaction.escrow_days === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-medium text-green-400">Immediate Release</span>
        </div>
        <p className="text-sm text-green-300/80 mt-1">
          Trusted seller - funds released immediately upon delivery confirmation
        </p>
      </div>
    );
  }

  // Not yet delivered
  if (!transaction.delivered_at) {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-zinc-400">
            {transaction.escrow_days}-day Escrow Period
          </span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">
          Countdown begins after delivery is confirmed
        </p>
      </div>
    );
  }

  // Already released or expired
  if (transaction.status === 'released' || progress >= 100) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-green-400">Escrow Complete</span>
        </div>
        <p className="text-sm text-green-300/80 mt-1">
          Funds have been released to the seller
        </p>
      </div>
    );
  }

  // Active countdown
  const isNearExpiry = progress >= 75;

  return (
    <div className={`
      border rounded-lg p-4
      ${isNearExpiry
        ? 'bg-yellow-500/10 border-yellow-500/30'
        : 'bg-blue-500/10 border-blue-500/30'
      }
    `}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${isNearExpiry ? 'text-yellow-400' : 'text-blue-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`font-medium ${isNearExpiry ? 'text-yellow-400' : 'text-blue-400'}`}>
            Escrow Protection Active
          </span>
        </div>
        <span className={`text-sm font-medium ${isNearExpiry ? 'text-yellow-400' : 'text-blue-400'}`}>
          {timeRemaining}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isNearExpiry ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className={`text-xs mt-2 ${isNearExpiry ? 'text-yellow-300/70' : 'text-blue-300/70'}`}>
        {isNearExpiry
          ? 'Funds will be released soon. Open a dispute if there are issues.'
          : 'Buyer can open a dispute during this period if there are issues.'
        }
      </p>
    </div>
  );
}

export default EscrowCountdown;
