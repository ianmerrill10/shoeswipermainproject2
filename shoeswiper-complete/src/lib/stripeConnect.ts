/**
 * SHOESWIPER STRIPE CONNECT INTEGRATION
 * Phase 3: Marketplace Payments
 *
 * Enables sellers to receive payments through Stripe Connect
 * Platform takes commission on each sale
 */

import { DEMO_MODE } from './config';

// ============================================
// CONFIGURATION
// ============================================

// Platform fee percentage (customize as needed)
export const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

// Stripe Connect account types
export type ConnectAccountType = 'express' | 'standard' | 'custom';

// Stripe Connect account status
export type ConnectAccountStatus =
  | 'pending'
  | 'enabled'
  | 'disabled'
  | 'rejected'
  | 'restricted';

// ============================================
// TYPES
// ============================================

export interface StripeConnectAccount {
  id: string;
  userId: string;
  stripeAccountId: string;
  accountType: ConnectAccountType;
  status: ConnectAccountStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  email?: string;
  businessName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  sellerId: string;
  buyerId: string;
  listingId: string;
  platformFee: number; // in cents
  sellerAmount: number; // in cents
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  stripePayoutId?: string;
  estimatedArrival?: string;
  createdAt: string;
}

// ============================================
// DEMO MODE STORAGE
// ============================================

const CONNECT_ACCOUNTS_KEY = 'shoeswiper_connect_accounts';
const PAYMENT_INTENTS_KEY = 'shoeswiper_payment_intents';
const PAYOUTS_KEY = 'shoeswiper_payouts';

function getDemoAccounts(): StripeConnectAccount[] {
  try {
    return JSON.parse(localStorage.getItem(CONNECT_ACCOUNTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDemoAccounts(accounts: StripeConnectAccount[]): void {
  localStorage.setItem(CONNECT_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getDemoPayments(): PaymentIntent[] {
  try {
    return JSON.parse(localStorage.getItem(PAYMENT_INTENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDemoPayments(payments: PaymentIntent[]): void {
  localStorage.setItem(PAYMENT_INTENTS_KEY, JSON.stringify(payments));
}

// ============================================
// CONNECT ACCOUNT FUNCTIONS
// ============================================

/**
 * Create a Stripe Connect account for a seller
 */
export async function createConnectAccount(
  userId: string,
  email: string,
  accountType: ConnectAccountType = 'express'
): Promise<{ success: boolean; account?: StripeConnectAccount; onboardingUrl?: string; error?: string }> {
  if (DEMO_MODE) {
    // Demo mode - create mock account
    const accounts = getDemoAccounts();

    // Check if user already has an account
    const existing = accounts.find(a => a.userId === userId);
    if (existing) {
      return { success: false, error: 'User already has a Connect account' };
    }

    const newAccount: StripeConnectAccount = {
      id: `ca_demo_${Date.now()}`,
      userId,
      stripeAccountId: `acct_demo_${Date.now()}`,
      accountType,
      status: 'pending',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    saveDemoAccounts(accounts);

    // In demo mode, return a fake onboarding URL
    return {
      success: true,
      account: newAccount,
      onboardingUrl: `${window.location.origin}/seller/onboarding?demo=true&accountId=${newAccount.id}`,
    };
  }

  // Production - call Supabase Edge Function
  try {
    const { supabase } = await import('./supabaseClient');
    const { data, error } = await supabase.functions.invoke('stripe-connect-create', {
      body: { userId, email, accountType },
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[StripeConnect] Create account error:', err);
    return { success: false, error: 'Failed to create Connect account' };
  }
}

/**
 * Get Connect account for a user
 */
export async function getConnectAccount(userId: string): Promise<StripeConnectAccount | null> {
  if (DEMO_MODE) {
    const accounts = getDemoAccounts();
    return accounts.find(a => a.userId === userId) || null;
  }

  try {
    const { supabase } = await import('./supabaseClient');
    const { data, error } = await supabase
      .from('stripe_connect_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Complete Connect onboarding (simulate for demo)
 */
export async function completeOnboarding(accountId: string): Promise<{ success: boolean; error?: string }> {
  if (DEMO_MODE) {
    const accounts = getDemoAccounts();
    const account = accounts.find(a => a.id === accountId);

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    account.status = 'enabled';
    account.chargesEnabled = true;
    account.payoutsEnabled = true;
    account.detailsSubmitted = true;
    account.updatedAt = new Date().toISOString();

    saveDemoAccounts(accounts);
    return { success: true };
  }

  // Production - webhook handles this
  return { success: true };
}

/**
 * Get Connect account onboarding/login link
 */
export async function getAccountLink(
  accountId: string,
  type: 'onboarding' | 'login' = 'login'
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (DEMO_MODE) {
    return {
      success: true,
      url: `${window.location.origin}/seller/dashboard?demo=true&accountId=${accountId}`,
    };
  }

  try {
    const { supabase } = await import('./supabaseClient');
    const { data, error } = await supabase.functions.invoke('stripe-connect-link', {
      body: { accountId, type },
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[StripeConnect] Get account link error:', err);
    return { success: false, error: 'Failed to get account link' };
  }
}

// ============================================
// PAYMENT FUNCTIONS
// ============================================

/**
 * Calculate platform fee and seller amount
 */
export function calculateFees(amountCents: number): {
  platformFee: number;
  sellerAmount: number;
  total: number;
} {
  const platformFee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
  const sellerAmount = amountCents - platformFee;

  return {
    platformFee,
    sellerAmount,
    total: amountCents,
  };
}

/**
 * Create a payment intent for a listing purchase
 */
export async function createPaymentIntent(
  listingId: string,
  sellerId: string,
  buyerId: string,
  amountCents: number
): Promise<{ success: boolean; paymentIntent?: PaymentIntent; clientSecret?: string; error?: string }> {
  const fees = calculateFees(amountCents);

  if (DEMO_MODE) {
    const payment: PaymentIntent = {
      id: `pi_demo_${Date.now()}`,
      amount: amountCents,
      currency: 'usd',
      status: 'pending',
      sellerId,
      buyerId,
      listingId,
      platformFee: fees.platformFee,
      sellerAmount: fees.sellerAmount,
      createdAt: new Date().toISOString(),
    };

    const payments = getDemoPayments();
    payments.push(payment);
    saveDemoPayments(payments);

    return {
      success: true,
      paymentIntent: payment,
      clientSecret: `demo_secret_${payment.id}`,
    };
  }

  try {
    const { supabase } = await import('./supabaseClient');
    const { data, error } = await supabase.functions.invoke('stripe-create-payment', {
      body: { listingId, sellerId, buyerId, amountCents },
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[StripeConnect] Create payment error:', err);
    return { success: false, error: 'Failed to create payment' };
  }
}

/**
 * Confirm payment (demo mode only - production uses webhooks)
 */
export async function confirmPayment(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
  if (DEMO_MODE) {
    const payments = getDemoPayments();
    const payment = payments.find(p => p.id === paymentIntentId);

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    payment.status = 'succeeded';
    saveDemoPayments(payments);

    console.log('[Demo] Payment confirmed:', paymentIntentId);
    return { success: true };
  }

  // Production - handled by webhooks
  return { success: true };
}

/**
 * Get seller's payment history
 */
export async function getSellerPayments(sellerId: string): Promise<PaymentIntent[]> {
  if (DEMO_MODE) {
    return getDemoPayments().filter(p => p.sellerId === sellerId);
  }

  try {
    const { supabase } = await import('./supabaseClient');
    const { data } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Get seller's total earnings
 */
export async function getSellerEarnings(sellerId: string): Promise<{
  total: number;
  pending: number;
  available: number;
}> {
  const payments = await getSellerPayments(sellerId);

  const succeeded = payments.filter(p => p.status === 'succeeded');
  const pending = payments.filter(p => p.status === 'pending');

  return {
    total: succeeded.reduce((sum, p) => sum + p.sellerAmount, 0),
    pending: pending.reduce((sum, p) => sum + p.sellerAmount, 0),
    available: succeeded.reduce((sum, p) => sum + p.sellerAmount, 0), // Simplified
  };
}

// ============================================
// REACT HOOKS
// ============================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing seller's Connect account
 */
export function useConnectAccount(userId: string | null) {
  const [account, setAccount] = useState<StripeConnectAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAccount(null);
      setLoading(false);
      return;
    }

    const loadAccount = async () => {
      setLoading(true);
      try {
        const acc = await getConnectAccount(userId);
        setAccount(acc);
      } catch (err) {
        setError('Failed to load account');
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [userId]);

  const createAccount = useCallback(async (email: string) => {
    if (!userId) return { success: false, error: 'Not logged in' };

    const result = await createConnectAccount(userId, email);
    if (result.success && result.account) {
      setAccount(result.account);
    }
    return result;
  }, [userId]);

  const refreshAccount = useCallback(async () => {
    if (!userId) return;
    const acc = await getConnectAccount(userId);
    setAccount(acc);
  }, [userId]);

  return {
    account,
    loading,
    error,
    createAccount,
    refreshAccount,
    isOnboarded: account?.chargesEnabled && account?.payoutsEnabled,
  };
}

/**
 * Hook for seller earnings dashboard
 */
export function useSellerEarnings(sellerId: string | null) {
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, available: 0 });
  const [payments, setPayments] = useState<PaymentIntent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [earningsData, paymentsData] = await Promise.all([
          getSellerEarnings(sellerId),
          getSellerPayments(sellerId),
        ]);
        setEarnings(earningsData);
        setPayments(paymentsData);
      } catch (err) {
        console.error('Failed to load earnings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sellerId]);

  return { earnings, payments, loading };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format currency amount (cents to dollars)
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * Check if user can receive payments
 */
export async function canReceivePayments(userId: string): Promise<boolean> {
  const account = await getConnectAccount(userId);
  return account?.chargesEnabled && account?.payoutsEnabled || false;
}

// ============================================
// EXPORT
// ============================================

export default {
  PLATFORM_FEE_PERCENT,
  createConnectAccount,
  getConnectAccount,
  completeOnboarding,
  getAccountLink,
  calculateFees,
  createPaymentIntent,
  confirmPayment,
  getSellerPayments,
  getSellerEarnings,
  useConnectAccount,
  useSellerEarnings,
  formatCurrency,
  canReceivePayments,
};
