import React from 'react';
import { TrustScoreBreakdown, getTrustLevel } from '../../lib/sellerVerification';

interface TrustScoreDisplayProps {
  breakdown: TrustScoreBreakdown;
  showDetails?: boolean;
}

/**
 * Visual display of seller trust score with breakdown
 */
export function TrustScoreDisplay({
  breakdown,
  showDetails = true,
}: TrustScoreDisplayProps) {
  const level = getTrustLevel(breakdown.total);

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-zinc-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-zinc-500';
  };

  const scoreItems = [
    {
      label: 'Account Age',
      value: breakdown.accountAge,
      max: 15,
      description: '1 point per 30 days',
    },
    {
      label: 'Verification',
      value: breakdown.verificationLevel,
      max: 25,
      description: 'Based on verification tier',
    },
    {
      label: 'Transactions',
      value: breakdown.transactionHistory,
      max: 30,
      description: '1 point per sale',
    },
    {
      label: 'Ratings',
      value: breakdown.ratings,
      max: 20,
      description: 'Based on buyer reviews',
    },
    {
      label: 'Disputes',
      value: breakdown.disputes,
      max: 0,
      min: -10,
      description: '-2 points per dispute',
      isNegative: true,
    },
  ];

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      {/* Main Score */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Trust Score</h3>
          <p className="text-sm text-zinc-400">{level}</p>
        </div>
        <div className="text-right">
          <span className={`text-4xl font-bold ${getScoreColor(breakdown.total)}`}>
            {breakdown.total}
          </span>
          <span className="text-zinc-500 text-lg">/100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full ${getProgressColor(breakdown.total)} transition-all duration-500`}
          style={{ width: `${breakdown.total}%` }}
        />
      </div>

      {/* Score Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
            Score Breakdown
          </h4>

          {scoreItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{item.label}</span>
                <span
                  className={
                    item.isNegative && item.value < 0
                      ? 'text-red-400'
                      : 'text-zinc-400'
                  }
                >
                  {item.value > 0 ? '+' : ''}
                  {item.value} pts
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                {item.isNegative ? (
                  // Negative bar (disputes)
                  <div
                    className="h-full bg-red-500/50 transition-all"
                    style={{
                      width: `${Math.abs(item.value) * 10}%`,
                    }}
                  />
                ) : (
                  // Positive bar
                  <div
                    className="h-full bg-zinc-600 transition-all"
                    style={{
                      width: `${(item.value / item.max) * 100}%`,
                    }}
                  />
                )}
              </div>

              <p className="text-xs text-zinc-500">{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tips to improve */}
      {breakdown.total < 80 && (
        <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <h4 className="text-sm font-medium text-zinc-300 mb-2">
            Tips to improve your score
          </h4>
          <ul className="text-xs text-zinc-400 space-y-1">
            {breakdown.verificationLevel < 25 && (
              <li>• Upgrade your verification tier for up to +25 points</li>
            )}
            {breakdown.transactionHistory < 30 && (
              <li>• Complete more successful transactions</li>
            )}
            {breakdown.ratings < 20 && breakdown.ratings > 0 && (
              <li>• Maintain great service for better ratings</li>
            )}
            {breakdown.ratings === 0 && (
              <li>• Get at least 3 reviews to earn rating points</li>
            )}
            {breakdown.disputes < 0 && (
              <li>• Avoid disputes to prevent score deductions</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TrustScoreDisplay;
