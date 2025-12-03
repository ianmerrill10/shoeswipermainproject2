import { describe, it, expect } from 'vitest';
import {
  calculatePaymentBreakdown,
  getEscrowPeriod,
  calculateEscrowExpiration,
  isValidTransition,
  getValidNextStatuses,
  buildEscrowTimeline,
  canReleaseEscrow,
  canOpenDispute,
  canCancelOrder,
  formatAmount,
  getStatusClasses,
  getTimeRemaining,
  DEFAULT_ESCROW_CONFIG,
  ESCROW_PERIODS,
  ESCROW_STATUS_DISPLAY,
  DISPUTE_REASONS,
  EscrowTransaction,
  EscrowStatus,
} from '../escrow';

// ============================================
// TEST HELPERS
// ============================================

function createMockEscrow(overrides: Partial<EscrowTransaction> = {}): EscrowTransaction {
  return {
    id: 'escrow-123',
    order_id: 'order-123',
    buyer_id: 'buyer-123',
    seller_id: 'seller-123',
    item_amount: 10000, // $100
    shipping_amount: 1000, // $10
    platform_fee: 1000, // $10
    total_amount: 11000, // $110
    seller_payout: 9000, // $90
    status: 'pending_payment',
    escrow_days: 7,
    escrow_expires_at: null,
    stripe_payment_intent_id: null,
    stripe_transfer_id: null,
    created_at: new Date().toISOString(),
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    released_at: null,
    refunded_at: null,
    dispute_id: null,
    ...overrides,
  };
}

// ============================================
// PAYMENT CALCULATIONS TESTS
// ============================================

describe('calculatePaymentBreakdown', () => {
  it('should calculate correct breakdown for standard order', () => {
    const breakdown = calculatePaymentBreakdown(10000, 1000); // $100 + $10 shipping

    expect(breakdown.itemAmount).toBe(10000);
    expect(breakdown.shippingAmount).toBe(1000);
    expect(breakdown.platformFee).toBe(1000); // 10% of $100
    expect(breakdown.totalAmount).toBe(11000); // $110
    expect(breakdown.sellerPayout).toBe(9000); // $90 (item - fee)
  });

  it('should apply minimum platform fee', () => {
    const breakdown = calculatePaymentBreakdown(500, 0); // $5 item

    // 10% of $5 = $0.50, but minimum is $1.00
    expect(breakdown.platformFee).toBe(100);
    expect(breakdown.sellerPayout).toBe(400);
  });

  it('should apply maximum platform fee', () => {
    const breakdown = calculatePaymentBreakdown(200000, 0); // $2000 item

    // 10% of $2000 = $200, but maximum is $100
    expect(breakdown.platformFee).toBe(10000);
    expect(breakdown.sellerPayout).toBe(190000);
  });

  it('should handle free items (giveaways)', () => {
    const breakdown = calculatePaymentBreakdown(0, 500); // Free item, $5 shipping

    expect(breakdown.platformFee).toBe(0);
    expect(breakdown.totalAmount).toBe(500);
    expect(breakdown.sellerPayout).toBe(0);
  });

  it('should throw error for negative amounts', () => {
    expect(() => calculatePaymentBreakdown(-100, 0)).toThrow('Amounts cannot be negative');
    expect(() => calculatePaymentBreakdown(100, -50)).toThrow('Amounts cannot be negative');
  });

  it('should calculate total correctly', () => {
    const breakdown = calculatePaymentBreakdown(5000, 800);
    expect(breakdown.totalAmount).toBe(5000 + 800);
  });
});

// ============================================
// ESCROW PERIOD TESTS
// ============================================

describe('getEscrowPeriod', () => {
  it('should return 14 days for unverified sellers', () => {
    expect(getEscrowPeriod('unverified')).toBe(14);
  });

  it('should return 7 days for basic sellers', () => {
    expect(getEscrowPeriod('basic')).toBe(7);
  });

  it('should return 3 days for verified sellers', () => {
    expect(getEscrowPeriod('verified')).toBe(3);
  });

  it('should return 0 days for trusted sellers', () => {
    expect(getEscrowPeriod('trusted')).toBe(0);
  });
});

describe('calculateEscrowExpiration', () => {
  it('should return null for immediate release (0 days)', () => {
    const delivered = new Date();
    const expiration = calculateEscrowExpiration(delivered, 0);
    expect(expiration).toBeNull();
  });

  it('should calculate correct expiration date', () => {
    const delivered = new Date('2025-01-01T12:00:00Z');
    const expiration = calculateEscrowExpiration(delivered, 7);

    expect(expiration).not.toBeNull();
    expect(expiration!.toISOString()).toBe('2025-01-08T12:00:00.000Z');
  });

  it('should handle different escrow periods', () => {
    const delivered = new Date('2025-01-01T00:00:00Z');

    const exp3 = calculateEscrowExpiration(delivered, 3);
    const exp7 = calculateEscrowExpiration(delivered, 7);
    const exp14 = calculateEscrowExpiration(delivered, 14);

    expect(exp3!.toISOString()).toContain('2025-01-04');
    expect(exp7!.toISOString()).toContain('2025-01-08');
    expect(exp14!.toISOString()).toContain('2025-01-15');
  });
});

// ============================================
// STATUS TRANSITIONS TESTS
// ============================================

describe('isValidTransition', () => {
  it('should allow pending_payment to payment_held', () => {
    expect(isValidTransition('pending_payment', 'payment_held')).toBe(true);
  });

  it('should allow pending_payment to cancelled', () => {
    expect(isValidTransition('pending_payment', 'cancelled')).toBe(true);
  });

  it('should not allow pending_payment to shipped', () => {
    expect(isValidTransition('pending_payment', 'shipped')).toBe(false);
  });

  it('should allow payment_held to shipped', () => {
    expect(isValidTransition('payment_held', 'shipped')).toBe(true);
  });

  it('should allow shipped to delivered', () => {
    expect(isValidTransition('shipped', 'delivered')).toBe(true);
  });

  it('should allow delivered to released', () => {
    expect(isValidTransition('delivered', 'released')).toBe(true);
  });

  it('should allow delivered to disputed', () => {
    expect(isValidTransition('delivered', 'disputed')).toBe(true);
  });

  it('should not allow any transitions from released (final state)', () => {
    expect(isValidTransition('released', 'refunded')).toBe(false);
    expect(isValidTransition('released', 'disputed')).toBe(false);
  });

  it('should not allow any transitions from refunded (final state)', () => {
    expect(isValidTransition('refunded', 'released')).toBe(false);
  });

  it('should allow disputed to be resolved', () => {
    expect(isValidTransition('disputed', 'released')).toBe(true);
    expect(isValidTransition('disputed', 'refunded')).toBe(true);
  });
});

describe('getValidNextStatuses', () => {
  it('should return valid next statuses for pending_payment', () => {
    const next = getValidNextStatuses('pending_payment');
    expect(next).toContain('payment_held');
    expect(next).toContain('cancelled');
    expect(next).not.toContain('shipped');
  });

  it('should return empty array for final states', () => {
    expect(getValidNextStatuses('released')).toHaveLength(0);
    expect(getValidNextStatuses('refunded')).toHaveLength(0);
    expect(getValidNextStatuses('cancelled')).toHaveLength(0);
  });
});

// ============================================
// TIMELINE TESTS
// ============================================

describe('buildEscrowTimeline', () => {
  it('should include created event', () => {
    const escrow = createMockEscrow();
    const timeline = buildEscrowTimeline(escrow);

    expect(timeline).toHaveLength(1);
    expect(timeline[0].event).toBe('created');
  });

  it('should include all events in order', () => {
    const escrow = createMockEscrow({
      paid_at: '2025-01-01T10:00:00Z',
      shipped_at: '2025-01-02T10:00:00Z',
      delivered_at: '2025-01-05T10:00:00Z',
      released_at: '2025-01-12T10:00:00Z',
    });

    const timeline = buildEscrowTimeline(escrow);

    expect(timeline.map((t) => t.event)).toContain('created');
    expect(timeline.map((t) => t.event)).toContain('paid');
    expect(timeline.map((t) => t.event)).toContain('shipped');
    expect(timeline.map((t) => t.event)).toContain('delivered');
    expect(timeline.map((t) => t.event)).toContain('released');
  });

  it('should include escrow period info when applicable', () => {
    const escrow = createMockEscrow({
      status: 'delivered',
      delivered_at: '2025-01-05T10:00:00Z',
      escrow_days: 7,
      escrow_expires_at: '2025-01-12T10:00:00Z',
    });

    const timeline = buildEscrowTimeline(escrow);
    const escrowEvent = timeline.find((t) => t.event === 'escrow_started');

    expect(escrowEvent).toBeDefined();
    expect(escrowEvent!.description).toContain('7-day');
  });
});

// ============================================
// RELEASE VALIDATION TESTS
// ============================================

describe('canReleaseEscrow', () => {
  it('should not release if already released', () => {
    const escrow = createMockEscrow({ status: 'released' });
    const result = canReleaseEscrow(escrow);

    expect(result.canRelease).toBe(false);
    expect(result.reason).toBe('Already released');
  });

  it('should not release if refunded', () => {
    const escrow = createMockEscrow({ status: 'refunded' });
    const result = canReleaseEscrow(escrow);

    expect(result.canRelease).toBe(false);
    expect(result.reason).toBe('Already refunded');
  });

  it('should not release if cancelled', () => {
    const escrow = createMockEscrow({ status: 'cancelled' });
    const result = canReleaseEscrow(escrow);

    expect(result.canRelease).toBe(false);
    expect(result.reason).toBe('Order cancelled');
  });

  it('should not release if disputed', () => {
    const escrow = createMockEscrow({ status: 'disputed' });
    const result = canReleaseEscrow(escrow);

    expect(result.canRelease).toBe(false);
    expect(result.reason).toContain('dispute');
  });

  it('should not release if not delivered', () => {
    const escrow = createMockEscrow({ status: 'shipped' });
    const result = canReleaseEscrow(escrow);

    expect(result.canRelease).toBe(false);
    expect(result.reason).toBe('Delivery not confirmed');
  });

  it('should not release if escrow period not passed', () => {
    const futureExpiration = new Date();
    futureExpiration.setDate(futureExpiration.getDate() + 3);

    const escrow = createMockEscrow({
      status: 'delivered',
      escrow_expires_at: futureExpiration.toISOString(),
    });
    const result = canReleaseEscrow(escrow);

    expect(result.canRelease).toBe(false);
    expect(result.reason).toContain('hours remaining');
  });

  it('should allow release after escrow period', () => {
    const pastExpiration = new Date();
    pastExpiration.setDate(pastExpiration.getDate() - 1);

    const escrow = createMockEscrow({
      status: 'delivered',
      escrow_expires_at: pastExpiration.toISOString(),
    });
    const result = canReleaseEscrow(escrow);

    expect(result.canRelease).toBe(true);
  });

  it('should allow immediate release when no escrow period', () => {
    const escrow = createMockEscrow({
      status: 'delivered',
      escrow_expires_at: null,
    });
    const result = canReleaseEscrow(escrow);

    expect(result.canRelease).toBe(true);
  });
});

// ============================================
// DISPUTE VALIDATION TESTS
// ============================================

describe('canOpenDispute', () => {
  it('should not allow dispute if already released', () => {
    const escrow = createMockEscrow({ status: 'released' });
    const result = canOpenDispute(escrow);

    expect(result.canDispute).toBe(false);
    expect(result.reason).toBe('Funds already released');
  });

  it('should not allow dispute if already refunded', () => {
    const escrow = createMockEscrow({ status: 'refunded' });
    const result = canOpenDispute(escrow);

    expect(result.canDispute).toBe(false);
  });

  it('should not allow dispute if already disputed', () => {
    const escrow = createMockEscrow({ status: 'disputed' });
    const result = canOpenDispute(escrow);

    expect(result.canDispute).toBe(false);
    expect(result.reason).toBe('Dispute already open');
  });

  it('should not allow dispute if payment not received', () => {
    const escrow = createMockEscrow({ status: 'pending_payment' });
    const result = canOpenDispute(escrow);

    expect(result.canDispute).toBe(false);
    expect(result.reason).toBe('Payment not received');
  });

  it('should allow dispute for payment_held status', () => {
    const escrow = createMockEscrow({ status: 'payment_held' });
    const result = canOpenDispute(escrow);

    expect(result.canDispute).toBe(true);
  });

  it('should allow dispute for shipped status', () => {
    const escrow = createMockEscrow({ status: 'shipped' });
    const result = canOpenDispute(escrow);

    expect(result.canDispute).toBe(true);
  });

  it('should not allow dispute after window closes', () => {
    const oldDelivery = new Date();
    oldDelivery.setDate(oldDelivery.getDate() - 10); // 10 days ago

    const escrow = createMockEscrow({
      status: 'delivered',
      delivered_at: oldDelivery.toISOString(),
    });
    const result = canOpenDispute(escrow);

    expect(result.canDispute).toBe(false);
    expect(result.reason).toBe('Dispute window has closed');
  });

  it('should allow dispute within window', () => {
    const recentDelivery = new Date();
    recentDelivery.setDate(recentDelivery.getDate() - 1); // Yesterday

    const escrow = createMockEscrow({
      status: 'delivered',
      delivered_at: recentDelivery.toISOString(),
    });
    const result = canOpenDispute(escrow);

    expect(result.canDispute).toBe(true);
  });
});

// ============================================
// CANCELLATION TESTS
// ============================================

describe('canCancelOrder', () => {
  it('should allow buyer to cancel pending payment', () => {
    const escrow = createMockEscrow({ status: 'pending_payment' });
    const result = canCancelOrder(escrow, 'buyer');

    expect(result.canCancel).toBe(true);
  });

  it('should allow seller to cancel pending payment', () => {
    const escrow = createMockEscrow({ status: 'pending_payment' });
    const result = canCancelOrder(escrow, 'seller');

    expect(result.canCancel).toBe(true);
  });

  it('should allow buyer to cancel after shipping', () => {
    const escrow = createMockEscrow({ status: 'shipped' });
    const result = canCancelOrder(escrow, 'buyer');

    expect(result.canCancel).toBe(true);
  });

  it('should not allow seller to cancel after shipping', () => {
    const escrow = createMockEscrow({ status: 'shipped' });
    const result = canCancelOrder(escrow, 'seller');

    expect(result.canCancel).toBe(false);
    expect(result.reason).toBe('Cannot cancel after shipping');
  });

  it('should not allow cancellation after delivery', () => {
    const escrow = createMockEscrow({ status: 'delivered' });

    expect(canCancelOrder(escrow, 'buyer').canCancel).toBe(false);
    expect(canCancelOrder(escrow, 'seller').canCancel).toBe(false);
  });

  it('should not allow cancellation when disputed', () => {
    const escrow = createMockEscrow({ status: 'disputed' });
    const result = canCancelOrder(escrow, 'buyer');

    expect(result.canCancel).toBe(false);
    expect(result.reason).toBe('Order is under dispute');
  });
});

// ============================================
// FORMATTING TESTS
// ============================================

describe('formatAmount', () => {
  it('should format cents to dollars', () => {
    expect(formatAmount(10000)).toBe('$100.00');
    expect(formatAmount(1299)).toBe('$12.99');
    expect(formatAmount(99)).toBe('$0.99');
    expect(formatAmount(0)).toBe('$0.00');
  });
});

describe('getStatusClasses', () => {
  it('should return correct classes for each status', () => {
    expect(getStatusClasses('pending_payment')).toContain('yellow');
    expect(getStatusClasses('payment_held')).toContain('blue');
    expect(getStatusClasses('shipped')).toContain('blue');
    expect(getStatusClasses('delivered')).toContain('green');
    expect(getStatusClasses('released')).toContain('green');
    expect(getStatusClasses('disputed')).toContain('red');
    expect(getStatusClasses('refunded')).toContain('zinc');
    expect(getStatusClasses('cancelled')).toContain('zinc');
  });
});

describe('getTimeRemaining', () => {
  it('should return "Immediate release" for null', () => {
    expect(getTimeRemaining(null)).toBe('Immediate release');
  });

  it('should return "Ready for release" for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(getTimeRemaining(past.toISOString())).toBe('Ready for release');
  });

  it('should return hours remaining for near future', () => {
    const future = new Date();
    future.setHours(future.getHours() + 12);
    const result = getTimeRemaining(future.toISOString());
    expect(result).toMatch(/\d+ hours? remaining/);
  });

  it('should return days remaining for far future', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const result = getTimeRemaining(future.toISOString());
    expect(result).toMatch(/\d+ days? remaining/);
  });
});

// ============================================
// CONSTANTS TESTS
// ============================================

describe('DEFAULT_ESCROW_CONFIG', () => {
  it('should have valid default values', () => {
    expect(DEFAULT_ESCROW_CONFIG.platformFeePercent).toBe(10);
    expect(DEFAULT_ESCROW_CONFIG.minPlatformFee).toBe(100);
    expect(DEFAULT_ESCROW_CONFIG.maxPlatformFee).toBe(10000);
    expect(DEFAULT_ESCROW_CONFIG.autoReleaseEnabled).toBe(true);
    expect(DEFAULT_ESCROW_CONFIG.disputeWindowDays).toBe(3);
  });
});

describe('ESCROW_PERIODS', () => {
  it('should have periods for all verification tiers', () => {
    expect(ESCROW_PERIODS).toHaveProperty('unverified');
    expect(ESCROW_PERIODS).toHaveProperty('basic');
    expect(ESCROW_PERIODS).toHaveProperty('verified');
    expect(ESCROW_PERIODS).toHaveProperty('trusted');
  });

  it('should decrease escrow period with higher trust', () => {
    expect(ESCROW_PERIODS.unverified).toBeGreaterThan(ESCROW_PERIODS.basic);
    expect(ESCROW_PERIODS.basic).toBeGreaterThan(ESCROW_PERIODS.verified);
    expect(ESCROW_PERIODS.verified).toBeGreaterThan(ESCROW_PERIODS.trusted);
  });
});

describe('ESCROW_STATUS_DISPLAY', () => {
  it('should have display info for all statuses', () => {
    const statuses: EscrowStatus[] = [
      'pending_payment',
      'payment_held',
      'shipped',
      'delivered',
      'released',
      'disputed',
      'refunded',
      'cancelled',
    ];

    for (const status of statuses) {
      expect(ESCROW_STATUS_DISPLAY[status]).toBeDefined();
      expect(ESCROW_STATUS_DISPLAY[status].label).toBeDefined();
      expect(ESCROW_STATUS_DISPLAY[status].color).toBeDefined();
      expect(ESCROW_STATUS_DISPLAY[status].description).toBeDefined();
    }
  });
});

describe('DISPUTE_REASONS', () => {
  it('should have all dispute reasons defined', () => {
    const reasons = [
      'item_not_received',
      'item_not_as_described',
      'item_damaged',
      'counterfeit',
      'wrong_item',
      'other',
    ];

    for (const reason of reasons) {
      expect(DISPUTE_REASONS[reason as keyof typeof DISPUTE_REASONS]).toBeDefined();
      expect(DISPUTE_REASONS[reason as keyof typeof DISPUTE_REASONS].label).toBeDefined();
    }
  });
});
