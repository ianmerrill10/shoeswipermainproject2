// ============================================
// ESCROW PAYMENT SYSTEM
// Secure payment handling for ShoeSwiper marketplace
// ============================================
//
// This module provides escrow payment functionality:
// - Hold payments until buyer confirms delivery
// - Automatic release after escrow period
// - Dispute handling with admin resolution
// - Integration with seller verification tiers
//
// ============================================

import { VerificationTier } from './sellerVerification';

// ============================================
// TYPES
// ============================================

export type EscrowStatus =
  | 'pending_payment'    // Awaiting buyer payment
  | 'payment_held'       // Payment received, held in escrow
  | 'shipped'            // Seller has shipped item
  | 'delivered'          // Buyer confirmed delivery
  | 'released'           // Funds released to seller
  | 'disputed'           // Buyer opened dispute
  | 'refunded'           // Refunded to buyer
  | 'cancelled';         // Order cancelled

export type DisputeReason =
  | 'item_not_received'
  | 'item_not_as_described'
  | 'item_damaged'
  | 'counterfeit'
  | 'wrong_item'
  | 'other';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_buyer'     // Resolved in buyer's favor
  | 'resolved_seller'    // Resolved in seller's favor
  | 'resolved_split';    // Split resolution

export interface EscrowTransaction {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;

  // Financial details
  item_amount: number;          // Item price in cents
  shipping_amount: number;      // Shipping cost in cents
  platform_fee: number;         // Platform fee in cents
  total_amount: number;         // Total charged to buyer
  seller_payout: number;        // Amount seller receives

  // Status tracking
  status: EscrowStatus;
  escrow_days: number;          // Days until auto-release
  escrow_expires_at: string | null;

  // Payment IDs
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;

  // Timestamps
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  released_at: string | null;
  refunded_at: string | null;

  // Dispute
  dispute_id: string | null;
}

export interface EscrowDispute {
  id: string;
  escrow_id: string;
  opened_by: string;            // buyer_id or seller_id
  reason: DisputeReason;
  description: string;
  evidence_urls: string[];
  status: DisputeStatus;

  // Resolution
  resolved_by: string | null;
  resolution_notes: string | null;
  refund_amount: number | null; // Partial refund amount if split

  // Timestamps
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface EscrowConfig {
  platformFeePercent: number;   // Platform fee percentage (e.g., 10 for 10%)
  minPlatformFee: number;       // Minimum fee in cents
  maxPlatformFee: number;       // Maximum fee in cents
  autoReleaseEnabled: boolean;  // Auto-release after escrow period
  disputeWindowDays: number;    // Days after delivery to open dispute
}

export interface PaymentBreakdown {
  itemAmount: number;
  shippingAmount: number;
  platformFee: number;
  totalAmount: number;
  sellerPayout: number;
}

export interface EscrowTimeline {
  event: string;
  timestamp: string;
  description: string;
}

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_ESCROW_CONFIG: EscrowConfig = {
  platformFeePercent: 10,       // 10% platform fee
  minPlatformFee: 100,          // Minimum $1.00
  maxPlatformFee: 10000,        // Maximum $100.00
  autoReleaseEnabled: true,
  disputeWindowDays: 3,         // 3 days after delivery to dispute
};

// Escrow periods based on seller verification tier
export const ESCROW_PERIODS: Record<VerificationTier, number> = {
  unverified: 14,  // 14 days
  basic: 7,        // 7 days
  verified: 3,     // 3 days
  trusted: 0,      // Immediate (after delivery confirmation)
};

// Status descriptions for UI
export const ESCROW_STATUS_DISPLAY: Record<EscrowStatus, { label: string; color: string; description: string }> = {
  pending_payment: {
    label: 'Awaiting Payment',
    color: 'yellow',
    description: 'Waiting for buyer to complete payment',
  },
  payment_held: {
    label: 'Payment Secured',
    color: 'blue',
    description: 'Payment is securely held in escrow',
  },
  shipped: {
    label: 'Shipped',
    color: 'blue',
    description: 'Seller has shipped the item',
  },
  delivered: {
    label: 'Delivered',
    color: 'green',
    description: 'Buyer has confirmed delivery',
  },
  released: {
    label: 'Complete',
    color: 'green',
    description: 'Payment has been released to seller',
  },
  disputed: {
    label: 'Under Dispute',
    color: 'red',
    description: 'A dispute has been opened for this order',
  },
  refunded: {
    label: 'Refunded',
    color: 'gray',
    description: 'Payment has been refunded to buyer',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'gray',
    description: 'Order has been cancelled',
  },
};

export const DISPUTE_REASONS: Record<DisputeReason, { label: string; description: string }> = {
  item_not_received: {
    label: 'Item Not Received',
    description: 'I never received the item',
  },
  item_not_as_described: {
    label: 'Not As Described',
    description: 'The item is significantly different from the listing',
  },
  item_damaged: {
    label: 'Item Damaged',
    description: 'The item arrived damaged',
  },
  counterfeit: {
    label: 'Counterfeit',
    description: 'I believe the item is not authentic',
  },
  wrong_item: {
    label: 'Wrong Item',
    description: 'I received a different item than ordered',
  },
  other: {
    label: 'Other',
    description: 'Other issue not listed above',
  },
};

// ============================================
// PAYMENT CALCULATIONS
// ============================================

/**
 * Calculate payment breakdown for an order
 * @param itemAmount - Item price in cents
 * @param shippingAmount - Shipping cost in cents
 * @param config - Optional escrow configuration
 * @returns Payment breakdown with fees and payouts
 */
export function calculatePaymentBreakdown(
  itemAmount: number,
  shippingAmount: number,
  config: EscrowConfig = DEFAULT_ESCROW_CONFIG
): PaymentBreakdown {
  // Validate inputs
  if (itemAmount < 0 || shippingAmount < 0) {
    throw new Error('Amounts cannot be negative');
  }

  // Calculate platform fee (only on item amount, not shipping)
  let platformFee = Math.round(itemAmount * (config.platformFeePercent / 100));

  // Apply fee limits
  platformFee = Math.max(config.minPlatformFee, platformFee);
  platformFee = Math.min(config.maxPlatformFee, platformFee);

  // If item is free (giveaway), no fee
  if (itemAmount === 0) {
    platformFee = 0;
  }

  const totalAmount = itemAmount + shippingAmount;
  const sellerPayout = itemAmount - platformFee;

  return {
    itemAmount,
    shippingAmount,
    platformFee,
    totalAmount,
    sellerPayout,
  };
}

/**
 * Get the escrow period for a seller based on their verification tier
 * @param tier - Seller's verification tier
 * @returns Escrow period in days
 */
export function getEscrowPeriod(tier: VerificationTier): number {
  return ESCROW_PERIODS[tier];
}

/**
 * Calculate when escrow will expire (funds auto-release)
 * @param deliveredAt - When delivery was confirmed
 * @param escrowDays - Escrow period in days
 * @returns Expiration date or null if immediate
 */
export function calculateEscrowExpiration(
  deliveredAt: Date,
  escrowDays: number
): Date | null {
  if (escrowDays === 0) {
    return null; // Immediate release
  }

  const expiration = new Date(deliveredAt);
  expiration.setDate(expiration.getDate() + escrowDays);
  return expiration;
}

// ============================================
// STATUS TRANSITIONS
// ============================================

// Valid status transitions
const VALID_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  pending_payment: ['payment_held', 'cancelled'],
  payment_held: ['shipped', 'refunded', 'disputed', 'cancelled'],
  shipped: ['delivered', 'disputed', 'refunded'],
  delivered: ['released', 'disputed'],
  released: [], // Final state
  disputed: ['refunded', 'released'], // Resolution determines outcome
  refunded: [], // Final state
  cancelled: [], // Final state
};

/**
 * Check if a status transition is valid
 * @param from - Current status
 * @param to - Target status
 * @returns true if transition is allowed
 */
export function isValidTransition(from: EscrowStatus, to: EscrowStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Get all possible next statuses from current status
 * @param current - Current escrow status
 * @returns Array of valid next statuses
 */
export function getValidNextStatuses(current: EscrowStatus): EscrowStatus[] {
  return VALID_TRANSITIONS[current];
}

// ============================================
// ESCROW TIMELINE
// ============================================

/**
 * Build a timeline of events for an escrow transaction
 * @param escrow - Escrow transaction
 * @returns Array of timeline events
 */
export function buildEscrowTimeline(escrow: EscrowTransaction): EscrowTimeline[] {
  const timeline: EscrowTimeline[] = [];

  // Order created
  timeline.push({
    event: 'created',
    timestamp: escrow.created_at,
    description: 'Order placed',
  });

  // Payment received
  if (escrow.paid_at) {
    timeline.push({
      event: 'paid',
      timestamp: escrow.paid_at,
      description: 'Payment secured in escrow',
    });
  }

  // Shipped
  if (escrow.shipped_at) {
    timeline.push({
      event: 'shipped',
      timestamp: escrow.shipped_at,
      description: 'Item shipped by seller',
    });
  }

  // Delivered
  if (escrow.delivered_at) {
    timeline.push({
      event: 'delivered',
      timestamp: escrow.delivered_at,
      description: 'Delivery confirmed by buyer',
    });

    // Add escrow period info if applicable
    if (escrow.escrow_days > 0 && escrow.escrow_expires_at) {
      timeline.push({
        event: 'escrow_started',
        timestamp: escrow.delivered_at,
        description: `${escrow.escrow_days}-day escrow period started`,
      });
    }
  }

  // Released
  if (escrow.released_at) {
    timeline.push({
      event: 'released',
      timestamp: escrow.released_at,
      description: 'Funds released to seller',
    });
  }

  // Refunded
  if (escrow.refunded_at) {
    timeline.push({
      event: 'refunded',
      timestamp: escrow.refunded_at,
      description: 'Payment refunded to buyer',
    });
  }

  // Sort by timestamp
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return timeline;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Check if escrow can be released (auto or manual)
 * @param escrow - Escrow transaction
 * @returns Object with result and reason
 */
export function canReleaseEscrow(escrow: EscrowTransaction): { canRelease: boolean; reason?: string } {
  // Check status
  if (escrow.status === 'released') {
    return { canRelease: false, reason: 'Already released' };
  }

  if (escrow.status === 'refunded') {
    return { canRelease: false, reason: 'Already refunded' };
  }

  if (escrow.status === 'cancelled') {
    return { canRelease: false, reason: 'Order cancelled' };
  }

  if (escrow.status === 'disputed') {
    return { canRelease: false, reason: 'Under dispute - requires resolution' };
  }

  if (escrow.status !== 'delivered') {
    return { canRelease: false, reason: 'Delivery not confirmed' };
  }

  // Check if escrow period has passed
  if (escrow.escrow_expires_at) {
    const now = new Date();
    const expiration = new Date(escrow.escrow_expires_at);
    if (now < expiration) {
      const hoursRemaining = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60));
      return { canRelease: false, reason: `Escrow period: ${hoursRemaining} hours remaining` };
    }
  }

  return { canRelease: true };
}

/**
 * Check if buyer can open a dispute
 * @param escrow - Escrow transaction
 * @param config - Escrow configuration
 * @returns Object with result and reason
 */
export function canOpenDispute(
  escrow: EscrowTransaction,
  config: EscrowConfig = DEFAULT_ESCROW_CONFIG
): { canDispute: boolean; reason?: string } {
  // Check status
  if (escrow.status === 'released') {
    return { canDispute: false, reason: 'Funds already released' };
  }

  if (escrow.status === 'refunded') {
    return { canDispute: false, reason: 'Already refunded' };
  }

  if (escrow.status === 'cancelled') {
    return { canDispute: false, reason: 'Order cancelled' };
  }

  if (escrow.status === 'disputed') {
    return { canDispute: false, reason: 'Dispute already open' };
  }

  if (escrow.status === 'pending_payment') {
    return { canDispute: false, reason: 'Payment not received' };
  }

  // Check dispute window if delivered
  if (escrow.status === 'delivered' && escrow.delivered_at) {
    const deliveredDate = new Date(escrow.delivered_at);
    const disputeDeadline = new Date(deliveredDate);
    disputeDeadline.setDate(disputeDeadline.getDate() + config.disputeWindowDays);

    if (new Date() > disputeDeadline) {
      return { canDispute: false, reason: 'Dispute window has closed' };
    }
  }

  return { canDispute: true };
}

/**
 * Check if order can be cancelled
 * @param escrow - Escrow transaction
 * @param requestedBy - 'buyer' or 'seller'
 * @returns Object with result and reason
 */
export function canCancelOrder(
  escrow: EscrowTransaction,
  requestedBy: 'buyer' | 'seller'
): { canCancel: boolean; reason?: string } {
  // Cannot cancel after these statuses
  if (['delivered', 'released', 'refunded', 'cancelled'].includes(escrow.status)) {
    return { canCancel: false, reason: 'Order cannot be cancelled at this stage' };
  }

  // Seller cannot cancel after shipping
  if (requestedBy === 'seller' && escrow.status === 'shipped') {
    return { canCancel: false, reason: 'Cannot cancel after shipping' };
  }

  // Disputed orders need resolution
  if (escrow.status === 'disputed') {
    return { canCancel: false, reason: 'Order is under dispute' };
  }

  return { canCancel: true };
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format amount in cents to display string
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "$12.99")
 */
export function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Get CSS classes for status badge
 * @param status - Escrow status
 * @returns Tailwind CSS classes
 */
export function getStatusClasses(status: EscrowStatus): string {
  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border border-red-500/30',
    gray: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30',
  };

  const { color } = ESCROW_STATUS_DISPLAY[status];
  return colorMap[color] || colorMap.gray;
}

/**
 * Get human-readable time remaining until escrow release
 * @param expiresAt - Expiration timestamp
 * @returns Formatted string
 */
export function getTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) {
    return 'Immediate release';
  }

  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffMs = expiration.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Ready for release';
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} remaining`;
  }

  return `${hours} hour${hours === 1 ? '' : 's'} remaining`;
}
