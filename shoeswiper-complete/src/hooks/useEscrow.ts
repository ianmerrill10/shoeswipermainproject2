import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import {
  EscrowTransaction,
  EscrowDispute,
  EscrowStatus,
  DisputeReason,
  PaymentBreakdown,
  EscrowTimeline,
  calculatePaymentBreakdown,
  getEscrowPeriod,
  buildEscrowTimeline,
  canReleaseEscrow,
  canOpenDispute,
  canCancelOrder,
  isValidTransition,
  ESCROW_STATUS_DISPLAY,
} from '../lib/escrow';
import { VerificationTier } from '../lib/sellerVerification';

interface UseEscrowResult {
  // State
  transactions: EscrowTransaction[];
  currentTransaction: EscrowTransaction | null;
  dispute: EscrowDispute | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchTransactions: (role?: 'buyer' | 'seller') => Promise<void>;
  fetchTransaction: (escrowId: string) => Promise<void>;
  createEscrowTransaction: (params: CreateEscrowParams) => Promise<EscrowTransaction | null>;
  updateStatus: (escrowId: string, status: EscrowStatus) => Promise<boolean>;
  confirmDelivery: (escrowId: string) => Promise<boolean>;
  openDispute: (escrowId: string, reason: DisputeReason, description: string) => Promise<EscrowDispute | null>;
  cancelOrder: (escrowId: string) => Promise<boolean>;

  // Helpers
  calculateBreakdown: (itemAmount: number, shippingAmount: number) => PaymentBreakdown;
  getTimeline: (escrow: EscrowTransaction) => EscrowTimeline[];
  canRelease: (escrow: EscrowTransaction) => { canRelease: boolean; reason?: string };
  canDispute: (escrow: EscrowTransaction) => { canDispute: boolean; reason?: string };
}

interface CreateEscrowParams {
  orderId: string;
  sellerId: string;
  sellerTier: VerificationTier;
  itemAmount: number;
  shippingAmount: number;
}

/**
 * Hook for managing escrow transactions
 * Provides access to escrow operations for buyers and sellers
 */
export function useEscrow(): UseEscrowResult {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<EscrowTransaction | null>(null);
  const [dispute, setDispute] = useState<EscrowDispute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all escrow transactions for the current user
   */
  const fetchTransactions = useCallback(
    async (role?: 'buyer' | 'seller') => {
      if (!user) {
        setTransactions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('escrow_transactions')
          .select('*')
          .order('created_at', { ascending: false });

        // Filter by role if specified
        if (role === 'buyer') {
          query = query.eq('buyer_id', user.id);
        } else if (role === 'seller') {
          query = query.eq('seller_id', user.id);
        } else {
          // Both roles
          query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setTransactions((data as EscrowTransaction[]) || []);
      } catch (err) {
        console.error('Error fetching escrow transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Fetch a single escrow transaction by ID
   */
  const fetchTransaction = useCallback(
    async (escrowId: string) => {
      if (!user) {
        setCurrentTransaction(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data: escrow, error: escrowError } = await supabase
          .from('escrow_transactions')
          .select('*')
          .eq('id', escrowId)
          .single();

        if (escrowError) throw escrowError;
        setCurrentTransaction(escrow as EscrowTransaction);

        // Also fetch any associated dispute
        if (escrow) {
          const { data: disputeData } = await supabase
            .from('escrow_disputes')
            .select('*')
            .eq('escrow_id', escrowId)
            .single();

          setDispute(disputeData as EscrowDispute | null);
        }
      } catch (err) {
        console.error('Error fetching escrow transaction:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Create a new escrow transaction
   */
  const createEscrowTransaction = useCallback(
    async (params: CreateEscrowParams): Promise<EscrowTransaction | null> => {
      if (!user) {
        setError('Must be logged in to create transactions');
        return null;
      }

      setError(null);

      try {
        // Calculate payment breakdown
        const breakdown = calculatePaymentBreakdown(params.itemAmount, params.shippingAmount);

        // Get escrow period based on seller tier
        const escrowDays = getEscrowPeriod(params.sellerTier);

        const transaction = {
          order_id: params.orderId,
          buyer_id: user.id,
          seller_id: params.sellerId,
          item_amount: breakdown.itemAmount,
          shipping_amount: breakdown.shippingAmount,
          platform_fee: breakdown.platformFee,
          total_amount: breakdown.totalAmount,
          seller_payout: breakdown.sellerPayout,
          escrow_days: escrowDays,
          status: 'pending_payment' as EscrowStatus,
        };

        const { data, error: insertError } = await supabase
          .from('escrow_transactions')
          .insert(transaction)
          .select()
          .single();

        if (insertError) throw insertError;

        const newTransaction = data as EscrowTransaction;
        setCurrentTransaction(newTransaction);
        return newTransaction;
      } catch (err) {
        console.error('Error creating escrow transaction:', err);
        setError(err instanceof Error ? err.message : 'Failed to create transaction');
        return null;
      }
    },
    [user]
  );

  /**
   * Update escrow status
   */
  const updateStatus = useCallback(
    async (escrowId: string, newStatus: EscrowStatus): Promise<boolean> => {
      if (!user) {
        setError('Must be logged in');
        return false;
      }

      setError(null);

      try {
        // First fetch current transaction to validate transition
        const { data: current, error: fetchError } = await supabase
          .from('escrow_transactions')
          .select('*')
          .eq('id', escrowId)
          .single();

        if (fetchError) throw fetchError;
        if (!current) throw new Error('Transaction not found');

        const escrow = current as EscrowTransaction;

        // Validate transition
        if (!isValidTransition(escrow.status, newStatus)) {
          throw new Error(`Invalid status transition from ${escrow.status} to ${newStatus}`);
        }

        // Update status
        const { error: updateError } = await supabase
          .from('escrow_transactions')
          .update({ status: newStatus })
          .eq('id', escrowId);

        if (updateError) throw updateError;

        // Refresh transaction
        await fetchTransaction(escrowId);
        return true;
      } catch (err) {
        console.error('Error updating escrow status:', err);
        setError(err instanceof Error ? err.message : 'Failed to update status');
        return false;
      }
    },
    [user, fetchTransaction]
  );

  /**
   * Confirm delivery (buyer action)
   */
  const confirmDelivery = useCallback(
    async (escrowId: string): Promise<boolean> => {
      if (!user) {
        setError('Must be logged in');
        return false;
      }

      try {
        // Verify user is the buyer
        const { data: escrow, error: fetchError } = await supabase
          .from('escrow_transactions')
          .select('buyer_id, status')
          .eq('id', escrowId)
          .single();

        if (fetchError) throw fetchError;
        if (escrow.buyer_id !== user.id) {
          throw new Error('Only the buyer can confirm delivery');
        }

        return await updateStatus(escrowId, 'delivered');
      } catch (err) {
        console.error('Error confirming delivery:', err);
        setError(err instanceof Error ? err.message : 'Failed to confirm delivery');
        return false;
      }
    },
    [user, updateStatus]
  );

  /**
   * Open a dispute
   */
  const openDispute = useCallback(
    async (
      escrowId: string,
      reason: DisputeReason,
      description: string
    ): Promise<EscrowDispute | null> => {
      if (!user) {
        setError('Must be logged in');
        return null;
      }

      setError(null);

      try {
        // Fetch current escrow
        const { data: escrow, error: fetchError } = await supabase
          .from('escrow_transactions')
          .select('*')
          .eq('id', escrowId)
          .single();

        if (fetchError) throw fetchError;

        const escrowTransaction = escrow as EscrowTransaction;

        // Validate user is the buyer
        if (escrowTransaction.buyer_id !== user.id) {
          throw new Error('Only the buyer can open disputes');
        }

        // Check if dispute can be opened
        const { canDispute, reason: disputeReason } = canOpenDispute(escrowTransaction);
        if (!canDispute) {
          throw new Error(disputeReason || 'Cannot open dispute');
        }

        // Create dispute
        const { data: newDispute, error: disputeError } = await supabase
          .from('escrow_disputes')
          .insert({
            escrow_id: escrowId,
            opened_by: user.id,
            reason,
            description,
          })
          .select()
          .single();

        if (disputeError) throw disputeError;

        // Update escrow status to disputed
        await updateStatus(escrowId, 'disputed');

        setDispute(newDispute as EscrowDispute);
        return newDispute as EscrowDispute;
      } catch (err) {
        console.error('Error opening dispute:', err);
        setError(err instanceof Error ? err.message : 'Failed to open dispute');
        return null;
      }
    },
    [user, updateStatus]
  );

  /**
   * Cancel an order
   */
  const cancelOrder = useCallback(
    async (escrowId: string): Promise<boolean> => {
      if (!user) {
        setError('Must be logged in');
        return false;
      }

      setError(null);

      try {
        // Fetch current escrow
        const { data: escrow, error: fetchError } = await supabase
          .from('escrow_transactions')
          .select('*')
          .eq('id', escrowId)
          .single();

        if (fetchError) throw fetchError;

        const escrowTransaction = escrow as EscrowTransaction;

        // Determine user role
        const isBuyer = escrowTransaction.buyer_id === user.id;
        const isSeller = escrowTransaction.seller_id === user.id;

        if (!isBuyer && !isSeller) {
          throw new Error('You are not a participant in this transaction');
        }

        // Check if cancellation is allowed
        const { canCancel, reason } = canCancelOrder(
          escrowTransaction,
          isBuyer ? 'buyer' : 'seller'
        );

        if (!canCancel) {
          throw new Error(reason || 'Cannot cancel order');
        }

        return await updateStatus(escrowId, 'cancelled');
      } catch (err) {
        console.error('Error cancelling order:', err);
        setError(err instanceof Error ? err.message : 'Failed to cancel order');
        return false;
      }
    },
    [user, updateStatus]
  );

  // Helper functions that don't need state
  const calculateBreakdown = useCallback(
    (itemAmount: number, shippingAmount: number): PaymentBreakdown => {
      return calculatePaymentBreakdown(itemAmount, shippingAmount);
    },
    []
  );

  const getTimeline = useCallback((escrow: EscrowTransaction): EscrowTimeline[] => {
    return buildEscrowTimeline(escrow);
  }, []);

  const canRelease = useCallback(
    (escrow: EscrowTransaction): { canRelease: boolean; reason?: string } => {
      return canReleaseEscrow(escrow);
    },
    []
  );

  const canDisputeFn = useCallback(
    (escrow: EscrowTransaction): { canDispute: boolean; reason?: string } => {
      return canOpenDispute(escrow);
    },
    []
  );

  // Subscribe to real-time updates for user's transactions
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('escrow_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'escrow_transactions',
          filter: `buyer_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as EscrowTransaction;
          setTransactions((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
          if (currentTransaction?.id === updated.id) {
            setCurrentTransaction(updated);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'escrow_transactions',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as EscrowTransaction;
          setTransactions((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
          if (currentTransaction?.id === updated.id) {
            setCurrentTransaction(updated);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentTransaction?.id]);

  return {
    // State
    transactions,
    currentTransaction,
    dispute,
    loading,
    error,

    // Actions
    fetchTransactions,
    fetchTransaction,
    createEscrowTransaction,
    updateStatus,
    confirmDelivery,
    openDispute,
    cancelOrder,

    // Helpers
    calculateBreakdown,
    getTimeline,
    canRelease,
    canDispute: canDisputeFn,
  };
}

// Export status display info for UI components
export { ESCROW_STATUS_DISPLAY };

export default useEscrow;
