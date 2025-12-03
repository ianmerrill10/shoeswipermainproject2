import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEscrow } from '../hooks/useEscrow';
import { OrderCard } from '../components/orders/OrderCard';
import { EscrowStatusBadge } from '../components/orders/EscrowStatusBadge';
import type { EscrowStatus, DisputeReason } from '../lib/escrow';

type TabType = 'all' | 'buying' | 'selling';
type StatusFilter = 'all' | EscrowStatus;

/**
 * Orders Page - View and manage all orders
 */
export function OrdersPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    confirmDelivery,
    updateStatus,
    openDispute,
    cancelOrder,
  } = useEscrow();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Fetch transactions on mount and tab change
  useEffect(() => {
    if (user) {
      const role = activeTab === 'all' ? undefined : activeTab === 'buying' ? 'buyer' : 'seller';
      fetchTransactions(role);
    }
  }, [user, activeTab, fetchTransactions]);

  // Filter transactions by status
  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  // Get counts for tabs
  const buyingCount = transactions.filter((t) => t.buyer_id === user?.id).length;
  const sellingCount = transactions.filter((t) => t.seller_id === user?.id).length;

  // Status filter options
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending_payment', label: 'Awaiting Payment' },
    { value: 'payment_held', label: 'Payment Secured' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'released', label: 'Complete' },
    { value: 'disputed', label: 'Disputes' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-xl font-bold">My Orders</h1>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              count={transactions.length}
            >
              All
            </TabButton>
            <TabButton
              active={activeTab === 'buying'}
              onClick={() => setActiveTab('buying')}
              count={buyingCount}
            >
              Buying
            </TabButton>
            <TabButton
              active={activeTab === 'selling'}
              onClick={() => setActiveTab('selling')}
              count={sellingCount}
            >
              Selling
            </TabButton>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`
                px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                ${statusFilter === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mb-4">
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState activeTab={activeTab} statusFilter={statusFilter} />
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const userRole = transaction.buyer_id === user?.id ? 'buyer' : 'seller';
              // Mock product data - in real app, this would come from a joined query
              const productName = `Order #${transaction.order_id.slice(0, 8)}`;
              const productImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200';

              return (
                <OrderCard
                  key={transaction.id}
                  transaction={transaction}
                  userRole={userRole}
                  productName={productName}
                  productImage={productImage}
                  onConfirmDelivery={
                    userRole === 'buyer' && transaction.status === 'shipped'
                      ? () => confirmDelivery(transaction.id)
                      : undefined
                  }
                  onMarkShipped={
                    userRole === 'seller' && transaction.status === 'payment_held'
                      ? async (trackingNumber) => {
                          // In production, you'd also save the tracking number
                          return updateStatus(transaction.id, 'shipped');
                        }
                      : undefined
                  }
                  onCancelOrder={() => cancelOrder(transaction.id)}
                  onOpenDispute={
                    userRole === 'buyer'
                      ? async (reason: DisputeReason, description: string, evidence: File[]) => {
                          // In production, you'd upload evidence files first
                          const dispute = await openDispute(transaction.id, reason, description);
                          return !!dispute;
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}

function TabButton({ active, onClick, count, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2
        ${active
          ? 'bg-blue-500 text-white'
          : 'bg-zinc-800 text-zinc-400 hover:text-white'
        }
      `}
    >
      {children}
      <span
        className={`
          px-2 py-0.5 rounded-full text-xs
          ${active ? 'bg-blue-600' : 'bg-zinc-700'}
        `}
      >
        {count}
      </span>
    </button>
  );
}

interface EmptyStateProps {
  activeTab: TabType;
  statusFilter: StatusFilter;
}

function EmptyState({ activeTab, statusFilter }: EmptyStateProps) {
  let message = 'No orders found';
  let subMessage = '';

  if (statusFilter !== 'all') {
    message = `No ${statusFilter.replace('_', ' ')} orders`;
    subMessage = 'Try selecting a different filter';
  } else if (activeTab === 'buying') {
    message = 'No purchases yet';
    subMessage = 'Start shopping to see your orders here';
  } else if (activeTab === 'selling') {
    message = 'No sales yet';
    subMessage = 'List some items to start selling';
  } else {
    subMessage = 'Your orders will appear here';
  }

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <p className="text-zinc-400 font-medium">{message}</p>
      <p className="text-sm text-zinc-600 mt-1">{subMessage}</p>
    </div>
  );
}

export default OrdersPage;
