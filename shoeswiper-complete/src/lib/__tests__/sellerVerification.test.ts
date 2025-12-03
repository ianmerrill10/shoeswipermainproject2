import { describe, it, expect } from 'vitest';
import {
  calculateTrustScore,
  getTrustLevel,
  checkTierRequirements,
  canListItems,
  canReceiveDirectPayment,
  getMaxListingValue,
  getVerificationBadge,
  getBadgeClasses,
  createDefaultSellerProfile,
  VERIFICATION_TIERS,
  TIER_REQUIREMENTS,
  TRUSTED_REQUIREMENTS,
  SellerProfile,
  VerificationDocument,
  VerificationTier,
} from '../sellerVerification';

// ============================================
// TEST HELPERS
// ============================================

function createMockSeller(overrides: Partial<SellerProfile> = {}): SellerProfile {
  return {
    user_id: 'test-user-123',
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function createMockDocument(overrides: Partial<VerificationDocument> = {}): VerificationDocument {
  return {
    id: 'doc-123',
    seller_id: 'seller-123',
    document_type: 'government_id',
    file_url: 'https://example.com/doc.pdf',
    status: 'approved',
    submitted_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString(),
    reviewer_notes: null,
    expires_at: null,
    ...overrides,
  };
}

// ============================================
// TRUST SCORE CALCULATION TESTS
// ============================================

describe('calculateTrustScore', () => {
  describe('account age component', () => {
    it('should give 0 points for new accounts', () => {
      const seller = createMockSeller();
      const score = calculateTrustScore(seller, 0);
      expect(score.accountAge).toBe(0);
    });

    it('should give 1 point per 30 days', () => {
      const seller = createMockSeller();
      expect(calculateTrustScore(seller, 30).accountAge).toBe(1);
      expect(calculateTrustScore(seller, 60).accountAge).toBe(2);
      expect(calculateTrustScore(seller, 90).accountAge).toBe(3);
    });

    it('should cap account age at 15 points', () => {
      const seller = createMockSeller();
      const score = calculateTrustScore(seller, 1000);
      expect(score.accountAge).toBe(15);
    });
  });

  describe('verification level component', () => {
    it('should give 0 points for unverified', () => {
      const seller = createMockSeller({ verification_tier: 'unverified' });
      const score = calculateTrustScore(seller, 0);
      expect(score.verificationLevel).toBe(0);
    });

    it('should give 10 points for basic', () => {
      const seller = createMockSeller({ verification_tier: 'basic' });
      const score = calculateTrustScore(seller, 0);
      expect(score.verificationLevel).toBe(10);
    });

    it('should give 20 points for verified', () => {
      const seller = createMockSeller({ verification_tier: 'verified' });
      const score = calculateTrustScore(seller, 0);
      expect(score.verificationLevel).toBe(20);
    });

    it('should give 25 points for trusted', () => {
      const seller = createMockSeller({ verification_tier: 'trusted' });
      const score = calculateTrustScore(seller, 0);
      expect(score.verificationLevel).toBe(25);
    });
  });

  describe('transaction history component', () => {
    it('should give 1 point per successful transaction', () => {
      const seller = createMockSeller({ successful_transactions: 5 });
      const score = calculateTrustScore(seller, 0);
      expect(score.transactionHistory).toBe(5);
    });

    it('should cap at 30 points', () => {
      const seller = createMockSeller({ successful_transactions: 100 });
      const score = calculateTrustScore(seller, 0);
      expect(score.transactionHistory).toBe(30);
    });
  });

  describe('ratings component', () => {
    it('should give 0 points with fewer than 3 reviews', () => {
      const seller = createMockSeller({
        average_rating: 5.0,
        review_count: 2,
      });
      const score = calculateTrustScore(seller, 0);
      expect(score.ratings).toBe(0);
    });

    it('should calculate rating points correctly', () => {
      const seller = createMockSeller({
        average_rating: 4.5,
        review_count: 5,
      });
      const score = calculateTrustScore(seller, 0);
      expect(score.ratings).toBe(15); // (4.5 - 3) * 10
    });

    it('should give 20 points for perfect rating', () => {
      const seller = createMockSeller({
        average_rating: 5.0,
        review_count: 10,
      });
      const score = calculateTrustScore(seller, 0);
      expect(score.ratings).toBe(20);
    });
  });

  describe('disputes component', () => {
    it('should deduct 2 points per dispute', () => {
      const seller = createMockSeller({ dispute_count: 2 });
      const score = calculateTrustScore(seller, 0);
      expect(score.disputes).toBe(-4);
    });

    it('should cap deductions at -10', () => {
      const seller = createMockSeller({ dispute_count: 10 });
      const score = calculateTrustScore(seller, 0);
      expect(score.disputes).toBe(-10);
    });
  });

  describe('total score', () => {
    it('should calculate total correctly', () => {
      const seller = createMockSeller({
        verification_tier: 'verified',
        successful_transactions: 10,
        average_rating: 4.5,
        review_count: 5,
        dispute_count: 1,
      });
      const score = calculateTrustScore(seller, 60);
      // accountAge: 2, verification: 20, transactions: 10, ratings: 15, disputes: -2
      expect(score.total).toBe(45);
    });

    it('should not go below 0', () => {
      const seller = createMockSeller({ dispute_count: 50 });
      const score = calculateTrustScore(seller, 0);
      expect(score.total).toBeGreaterThanOrEqual(0);
    });

    it('should not exceed 100', () => {
      const seller = createMockSeller({
        verification_tier: 'trusted',
        successful_transactions: 100,
        average_rating: 5.0,
        review_count: 50,
      });
      const score = calculateTrustScore(seller, 1000);
      expect(score.total).toBeLessThanOrEqual(100);
    });
  });
});

describe('getTrustLevel', () => {
  it('should return correct level labels', () => {
    expect(getTrustLevel(90)).toBe('Excellent');
    expect(getTrustLevel(80)).toBe('Excellent');
    expect(getTrustLevel(70)).toBe('Good');
    expect(getTrustLevel(60)).toBe('Good');
    expect(getTrustLevel(50)).toBe('Fair');
    expect(getTrustLevel(40)).toBe('Fair');
    expect(getTrustLevel(30)).toBe('Low');
    expect(getTrustLevel(20)).toBe('Low');
    expect(getTrustLevel(10)).toBe('New');
    expect(getTrustLevel(0)).toBe('New');
  });
});

// ============================================
// TIER REQUIREMENTS TESTS
// ============================================

describe('checkTierRequirements', () => {
  it('should always pass for unverified tier', () => {
    const seller = createMockSeller();
    const result = checkTierRequirements(seller, [], 'unverified');
    expect(result.eligible).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('should require social media for basic tier', () => {
    const seller = createMockSeller();
    const result = checkTierRequirements(seller, [], 'basic');
    expect(result.eligible).toBe(false);
    expect(result.missing).toContain('Link a social media account');
  });

  it('should pass basic tier with social media verification', () => {
    const seller = createMockSeller();
    const docs = [
      createMockDocument({ document_type: 'social_media_verification', status: 'approved' }),
    ];
    const result = checkTierRequirements(seller, docs, 'basic');
    expect(result.eligible).toBe(true);
  });

  it('should require ID and address for verified tier', () => {
    const seller = createMockSeller();
    const result = checkTierRequirements(seller, [], 'verified');
    expect(result.eligible).toBe(false);
    expect(result.missing).toContain('Valid government-issued ID');
    expect(result.missing).toContain('Utility bill or bank statement');
  });

  it('should detect expired documents', () => {
    const seller = createMockSeller();
    const expiredDoc = createMockDocument({
      document_type: 'government_id',
      expires_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    });
    const result = checkTierRequirements(seller, [expiredDoc], 'verified');
    expect(result.eligible).toBe(false);
    expect(result.missing.some(m => m.includes('expired'))).toBe(true);
  });

  describe('trusted tier requirements', () => {
    it('should require minimum sales', () => {
      const seller = createMockSeller({
        total_sales: 5,
        average_rating: 4.8,
        review_count: 10,
      });
      const docs = [
        createMockDocument({ document_type: 'government_id' }),
        createMockDocument({ document_type: 'proof_of_address' }),
      ];
      const result = checkTierRequirements(seller, docs, 'trusted');
      expect(result.eligible).toBe(false);
      expect(result.missing.some(m => m.includes('sales'))).toBe(true);
    });

    it('should require minimum rating', () => {
      const seller = createMockSeller({
        total_sales: 20,
        average_rating: 3.5,
        review_count: 10,
      });
      const docs = [
        createMockDocument({ document_type: 'government_id' }),
        createMockDocument({ document_type: 'proof_of_address' }),
      ];
      const result = checkTierRequirements(seller, docs, 'trusted');
      expect(result.eligible).toBe(false);
      expect(result.missing.some(m => m.includes('rating'))).toBe(true);
    });

    it('should require minimum reviews', () => {
      const seller = createMockSeller({
        total_sales: 20,
        average_rating: 4.8,
        review_count: 2,
      });
      const docs = [
        createMockDocument({ document_type: 'government_id' }),
        createMockDocument({ document_type: 'proof_of_address' }),
      ];
      const result = checkTierRequirements(seller, docs, 'trusted');
      expect(result.eligible).toBe(false);
      expect(result.missing.some(m => m.includes('reviews'))).toBe(true);
    });

    it('should check dispute rate', () => {
      const seller = createMockSeller({
        total_sales: 20,
        dispute_count: 5, // 25% dispute rate
        average_rating: 4.8,
        review_count: 10,
      });
      const docs = [
        createMockDocument({ document_type: 'government_id' }),
        createMockDocument({ document_type: 'proof_of_address' }),
      ];
      const result = checkTierRequirements(seller, docs, 'trusted');
      expect(result.eligible).toBe(false);
      expect(result.missing.some(m => m.includes('Dispute'))).toBe(true);
    });

    it('should pass when all requirements met', () => {
      const seller = createMockSeller({
        total_sales: 20,
        average_rating: 4.8,
        review_count: 10,
        dispute_count: 0,
      });
      const docs = [
        createMockDocument({ document_type: 'government_id' }),
        createMockDocument({ document_type: 'proof_of_address' }),
      ];
      const result = checkTierRequirements(seller, docs, 'trusted');
      expect(result.eligible).toBe(true);
    });
  });
});

// ============================================
// LISTING PERMISSION TESTS
// ============================================

describe('canListItems', () => {
  it('should not allow suspended sellers', () => {
    const seller = createMockSeller({
      verification_tier: 'verified',
      is_suspended: true,
      suspension_reason: 'Policy violation',
    });
    const result = canListItems(seller);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Policy violation');
  });

  it('should not allow banned sellers', () => {
    const seller = createMockSeller({
      verification_tier: 'verified',
      is_banned: true,
    });
    const result = canListItems(seller);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Account banned');
  });

  it('should not allow inactive sellers', () => {
    const seller = createMockSeller({
      verification_tier: 'verified',
      is_active: false,
    });
    const result = canListItems(seller);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('inactive');
  });

  it('should not allow unverified sellers', () => {
    const seller = createMockSeller({ verification_tier: 'unverified' });
    const result = canListItems(seller);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('verification required');
  });

  it('should allow verified sellers', () => {
    const seller = createMockSeller({ verification_tier: 'verified' });
    const result = canListItems(seller);
    expect(result.allowed).toBe(true);
  });

  it('should allow basic verified sellers', () => {
    const seller = createMockSeller({ verification_tier: 'basic' });
    const result = canListItems(seller);
    expect(result.allowed).toBe(true);
  });
});

// ============================================
// PAYMENT TESTS
// ============================================

describe('canReceiveDirectPayment', () => {
  it('should give immediate payment to trusted sellers with high trust', () => {
    const seller = createMockSeller({
      verification_tier: 'trusted',
      trust_score: 85,
    });
    const result = canReceiveDirectPayment(seller);
    expect(result.allowed).toBe(true);
    expect(result.escrowDays).toBe(0);
  });

  it('should give 3-day escrow to verified sellers with good trust', () => {
    const seller = createMockSeller({
      verification_tier: 'verified',
      trust_score: 55,
    });
    const result = canReceiveDirectPayment(seller);
    expect(result.allowed).toBe(true);
    expect(result.escrowDays).toBe(3);
  });

  it('should give 7-day escrow to basic sellers', () => {
    const seller = createMockSeller({
      verification_tier: 'basic',
      trust_score: 30,
    });
    const result = canReceiveDirectPayment(seller);
    expect(result.allowed).toBe(true);
    expect(result.escrowDays).toBe(7);
  });

  it('should give 14-day escrow to unverified sellers', () => {
    const seller = createMockSeller({
      verification_tier: 'unverified',
      trust_score: 0,
    });
    const result = canReceiveDirectPayment(seller);
    expect(result.allowed).toBe(true);
    expect(result.escrowDays).toBe(14);
  });
});

// ============================================
// LISTING VALUE TESTS
// ============================================

describe('getMaxListingValue', () => {
  it('should return 0 for unverified', () => {
    const seller = createMockSeller({ verification_tier: 'unverified' });
    expect(getMaxListingValue(seller)).toBe(0);
  });

  it('should return $500 for basic', () => {
    const seller = createMockSeller({ verification_tier: 'basic' });
    expect(getMaxListingValue(seller)).toBe(50000);
  });

  it('should return $2,000 for verified', () => {
    const seller = createMockSeller({ verification_tier: 'verified' });
    expect(getMaxListingValue(seller)).toBe(200000);
  });

  it('should return $10,000 for trusted', () => {
    const seller = createMockSeller({ verification_tier: 'trusted' });
    expect(getMaxListingValue(seller)).toBe(1000000);
  });
});

// ============================================
// BADGE TESTS
// ============================================

describe('getVerificationBadge', () => {
  it('should return correct badge for each tier', () => {
    const tiers: VerificationTier[] = ['unverified', 'basic', 'verified', 'trusted'];
    for (const tier of tiers) {
      const badge = getVerificationBadge(tier);
      expect(badge.tier).toBe(tier);
      expect(badge.label).toBeDefined();
      expect(badge.color).toBeDefined();
      expect(badge.icon).toBeDefined();
      expect(badge.description).toBeDefined();
    }
  });
});

describe('getBadgeClasses', () => {
  it('should return Tailwind classes for each tier', () => {
    expect(getBadgeClasses('unverified')).toContain('zinc');
    expect(getBadgeClasses('basic')).toContain('blue');
    expect(getBadgeClasses('verified')).toContain('green');
    expect(getBadgeClasses('trusted')).toContain('yellow');
  });
});

// ============================================
// DEFAULT PROFILE TESTS
// ============================================

describe('createDefaultSellerProfile', () => {
  it('should create default profile with user ID', () => {
    const profile = createDefaultSellerProfile('user-123');
    expect(profile.user_id).toBe('user-123');
    expect(profile.verification_tier).toBe('unverified');
    expect(profile.verification_status).toBe('pending');
    expect(profile.trust_score).toBe(0);
    expect(profile.total_sales).toBe(0);
    expect(profile.is_active).toBe(true);
    expect(profile.is_suspended).toBe(false);
    expect(profile.is_banned).toBe(false);
  });
});

// ============================================
// CONSTANTS TESTS
// ============================================

describe('VERIFICATION_TIERS', () => {
  it('should have all four tiers defined', () => {
    expect(VERIFICATION_TIERS).toHaveProperty('unverified');
    expect(VERIFICATION_TIERS).toHaveProperty('basic');
    expect(VERIFICATION_TIERS).toHaveProperty('verified');
    expect(VERIFICATION_TIERS).toHaveProperty('trusted');
  });
});

describe('TIER_REQUIREMENTS', () => {
  it('should have requirements for each tier', () => {
    expect(TIER_REQUIREMENTS.unverified).toHaveLength(0);
    expect(TIER_REQUIREMENTS.basic.length).toBeGreaterThan(0);
    expect(TIER_REQUIREMENTS.verified.length).toBeGreaterThan(0);
    expect(TIER_REQUIREMENTS.trusted.length).toBeGreaterThan(0);
  });
});

describe('TRUSTED_REQUIREMENTS', () => {
  it('should have sensible minimum values', () => {
    expect(TRUSTED_REQUIREMENTS.minSales).toBeGreaterThan(0);
    expect(TRUSTED_REQUIREMENTS.minRating).toBeGreaterThan(4);
    expect(TRUSTED_REQUIREMENTS.minReviews).toBeGreaterThan(0);
    expect(TRUSTED_REQUIREMENTS.maxDisputeRate).toBeLessThan(1);
    expect(TRUSTED_REQUIREMENTS.minAccountAgeDays).toBeGreaterThan(0);
  });
});
