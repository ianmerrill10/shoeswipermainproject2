// ============================================
// SELLER VERIFICATION SYSTEM
// Security and trust for ShoeSwiper marketplace
// ============================================
//
// This module provides seller verification for the marketplace:
// - Verification tiers (unverified, basic, verified, trusted)
// - Trust score calculation
// - Verification requirements
// - Status checks and badges
//
// ============================================

// ============================================
// TYPES
// ============================================

export type VerificationTier = 'unverified' | 'basic' | 'verified' | 'trusted';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type DocumentType =
  | 'government_id'
  | 'proof_of_address'
  | 'business_license'
  | 'bank_statement'
  | 'social_media_verification';

export interface SellerProfile {
  user_id: string;
  verification_tier: VerificationTier;
  verification_status: VerificationStatus;
  trust_score: number; // 0-100

  // Verification dates
  verified_at: string | null;
  verification_expires: string | null;
  last_review_at: string | null;

  // Metrics
  total_sales: number;
  total_listings: number;
  successful_transactions: number;
  dispute_count: number;
  average_rating: number;
  review_count: number;

  // Flags
  is_active: boolean;
  is_suspended: boolean;
  is_banned: boolean;
  suspension_reason: string | null;

  created_at: string;
  updated_at: string;
}

export interface VerificationDocument {
  id: string;
  seller_id: string;
  document_type: DocumentType;
  file_url: string;
  status: VerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  expires_at: string | null;
}

export interface VerificationRequirement {
  document_type: DocumentType;
  required: boolean;
  description: string;
}

export interface TrustScoreBreakdown {
  accountAge: number;        // Max 15 points
  verificationLevel: number; // Max 25 points
  transactionHistory: number; // Max 30 points
  ratings: number;           // Max 20 points
  disputes: number;          // Max 10 points (deductions)
  total: number;
}

export interface VerificationBadge {
  tier: VerificationTier;
  label: string;
  color: string;
  icon: string;
  description: string;
}

// ============================================
// CONSTANTS
// ============================================

export const VERIFICATION_TIERS: Record<VerificationTier, VerificationBadge> = {
  unverified: {
    tier: 'unverified',
    label: 'New Seller',
    color: 'gray',
    icon: '👤',
    description: 'This seller has not completed identity verification.',
  },
  basic: {
    tier: 'basic',
    label: 'Basic Verified',
    color: 'blue',
    icon: '✓',
    description: 'This seller has verified their email and phone number.',
  },
  verified: {
    tier: 'verified',
    label: 'Verified Seller',
    color: 'green',
    icon: '✔️',
    description: 'This seller has completed full identity verification.',
  },
  trusted: {
    tier: 'trusted',
    label: 'Trusted Seller',
    color: 'gold',
    icon: '⭐',
    description: 'Top-rated seller with excellent transaction history.',
  },
};

export const TIER_REQUIREMENTS: Record<VerificationTier, VerificationRequirement[]> = {
  unverified: [],
  basic: [
    { document_type: 'social_media_verification', required: true, description: 'Link a social media account' },
  ],
  verified: [
    { document_type: 'government_id', required: true, description: 'Valid government-issued ID' },
    { document_type: 'proof_of_address', required: true, description: 'Utility bill or bank statement' },
  ],
  trusted: [
    { document_type: 'government_id', required: true, description: 'Valid government-issued ID' },
    { document_type: 'proof_of_address', required: true, description: 'Utility bill or bank statement' },
    { document_type: 'bank_statement', required: false, description: 'Bank statement for business verification' },
  ],
};

// Minimum requirements for trusted status
export const TRUSTED_REQUIREMENTS = {
  minSales: 10,
  minRating: 4.5,
  minReviews: 5,
  maxDisputeRate: 0.05, // 5%
  minAccountAgeDays: 90,
};

// ============================================
// TRUST SCORE CALCULATION
// ============================================

/**
 * Calculate trust score breakdown for a seller
 * @param seller - Seller profile data
 * @param accountAgeDays - Age of account in days
 * @returns Trust score breakdown with total
 */
export function calculateTrustScore(
  seller: Pick<SellerProfile,
    'verification_tier' | 'successful_transactions' | 'dispute_count' |
    'average_rating' | 'review_count'
  >,
  accountAgeDays: number
): TrustScoreBreakdown {
  // Account Age (max 15 points)
  // 1 point per 30 days, max 15 points at 450+ days
  const accountAge = Math.min(15, Math.floor(accountAgeDays / 30));

  // Verification Level (max 25 points)
  const verificationPoints: Record<VerificationTier, number> = {
    unverified: 0,
    basic: 10,
    verified: 20,
    trusted: 25,
  };
  const verificationLevel = verificationPoints[seller.verification_tier];

  // Transaction History (max 30 points)
  // 1 point per successful transaction, max 30
  const transactionHistory = Math.min(30, seller.successful_transactions);

  // Ratings (max 20 points)
  // Requires at least 3 reviews to count
  let ratings = 0;
  if (seller.review_count >= 3) {
    // Scale: 4.0 rating = 10 points, 5.0 rating = 20 points
    ratings = Math.max(0, Math.min(20, (seller.average_rating - 3) * 10));
  }

  // Disputes (deduction, max -10 points)
  // Each dispute costs 2 points
  const disputes = Math.max(-10, -(seller.dispute_count * 2));

  // Calculate total (0-100)
  const total = Math.max(0, Math.min(100,
    accountAge + verificationLevel + transactionHistory + ratings + disputes
  ));

  return {
    accountAge,
    verificationLevel,
    transactionHistory,
    ratings,
    disputes,
    total,
  };
}

/**
 * Get the appropriate trust level label based on score
 * @param score - Trust score (0-100)
 * @returns Trust level label
 */
export function getTrustLevel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Low';
  return 'New';
}

// ============================================
// VERIFICATION CHECKS
// ============================================

/**
 * Check if a seller meets requirements for a verification tier
 * @param seller - Seller profile
 * @param documents - Submitted verification documents
 * @param targetTier - Target verification tier
 * @returns Object with result and missing requirements
 */
export function checkTierRequirements(
  seller: SellerProfile,
  documents: VerificationDocument[],
  targetTier: VerificationTier
): { eligible: boolean; missing: string[] } {
  const requirements = TIER_REQUIREMENTS[targetTier];
  const missing: string[] = [];

  for (const req of requirements) {
    if (!req.required) continue;

    const doc = documents.find(
      d => d.document_type === req.document_type && d.status === 'approved'
    );

    if (!doc) {
      missing.push(req.description);
    } else if (doc.expires_at && new Date(doc.expires_at) < new Date()) {
      missing.push(`${req.description} (expired)`);
    }
  }

  // Additional requirements for trusted tier
  if (targetTier === 'trusted') {
    if (seller.total_sales < TRUSTED_REQUIREMENTS.minSales) {
      missing.push(`Minimum ${TRUSTED_REQUIREMENTS.minSales} completed sales`);
    }
    if (seller.average_rating < TRUSTED_REQUIREMENTS.minRating) {
      missing.push(`Minimum ${TRUSTED_REQUIREMENTS.minRating} average rating`);
    }
    if (seller.review_count < TRUSTED_REQUIREMENTS.minReviews) {
      missing.push(`Minimum ${TRUSTED_REQUIREMENTS.minReviews} reviews`);
    }
    const disputeRate = seller.total_sales > 0
      ? seller.dispute_count / seller.total_sales
      : 0;
    if (disputeRate > TRUSTED_REQUIREMENTS.maxDisputeRate) {
      missing.push('Dispute rate too high');
    }
  }

  return {
    eligible: missing.length === 0,
    missing,
  };
}

/**
 * Check if a seller can list items for sale
 * @param seller - Seller profile
 * @returns Object with result and reason if not allowed
 */
export function canListItems(seller: SellerProfile): { allowed: boolean; reason?: string } {
  if (seller.is_suspended) {
    return { allowed: false, reason: seller.suspension_reason || 'Account suspended' };
  }

  if (seller.is_banned) {
    return { allowed: false, reason: 'Account banned' };
  }

  if (!seller.is_active) {
    return { allowed: false, reason: 'Seller account is inactive' };
  }

  // Minimum verification for listing
  if (seller.verification_tier === 'unverified') {
    return { allowed: false, reason: 'Basic verification required to list items' };
  }

  return { allowed: true };
}

/**
 * Check if a seller can receive payments directly
 * (vs. held in escrow for longer period)
 * @param seller - Seller profile
 * @returns Object with result and escrow period in days
 */
export function canReceiveDirectPayment(
  seller: SellerProfile
): { allowed: boolean; escrowDays: number } {
  // Trusted sellers get immediate payment (after buyer confirmation)
  if (seller.verification_tier === 'trusted' && seller.trust_score >= 80) {
    return { allowed: true, escrowDays: 0 };
  }

  // Verified sellers: 3-day escrow
  if (seller.verification_tier === 'verified' && seller.trust_score >= 50) {
    return { allowed: true, escrowDays: 3 };
  }

  // Basic verified: 7-day escrow
  if (seller.verification_tier === 'basic') {
    return { allowed: true, escrowDays: 7 };
  }

  // Unverified or low trust: 14-day escrow
  return { allowed: true, escrowDays: 14 };
}

/**
 * Get the maximum listing value allowed for a seller
 * @param seller - Seller profile
 * @returns Maximum listing value in cents
 */
export function getMaxListingValue(seller: SellerProfile): number {
  const limits: Record<VerificationTier, number> = {
    unverified: 0, // Cannot list
    basic: 50000, // $500
    verified: 200000, // $2,000
    trusted: 1000000, // $10,000
  };

  return limits[seller.verification_tier];
}

// ============================================
// BADGE HELPERS
// ============================================

/**
 * Get verification badge info for display
 * @param tier - Verification tier
 * @returns Badge information for UI
 */
export function getVerificationBadge(tier: VerificationTier): VerificationBadge {
  return VERIFICATION_TIERS[tier];
}

/**
 * Get CSS classes for badge colors
 * @param tier - Verification tier
 * @returns Tailwind CSS classes
 */
export function getBadgeClasses(tier: VerificationTier): string {
  const classes: Record<VerificationTier, string> = {
    unverified: 'bg-zinc-700 text-zinc-300',
    basic: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    verified: 'bg-green-500/20 text-green-400 border border-green-500/30',
    trusted: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  };

  return classes[tier];
}

// ============================================
// DEFAULT SELLER PROFILE
// ============================================

/**
 * Create a default seller profile for new users
 * @param userId - User ID
 * @returns Default seller profile
 */
export function createDefaultSellerProfile(userId: string): Omit<SellerProfile, 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    verification_tier: 'unverified',
    verification_status: 'pending',
    trust_score: 0,
    verified_at: null,
    verification_expires: null,
    last_review_at: null,
    total_sales: 0,
    total_listings: 0,
    successful_transactions: 0,
    dispute_count: 0,
    average_rating: 0,
    review_count: 0,
    is_active: true,
    is_suspended: false,
    is_banned: false,
    suspension_reason: null,
  };
}
