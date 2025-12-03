import React, { useState } from 'react';
import {
  EscrowTransaction,
  EscrowStatus,
  formatAmount,
  canOpenDispute,
  canCancelOrder,
  getValidNextStatuses,
} from '../../lib/escrow';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { OrderTimeline } from './OrderTimeline';
import { EscrowCountdown } from './EscrowCountdown';
import { DisputeForm } from './DisputeForm';
import type { DisputeReason } from '../../lib/escrow';

interface OrderCardProps {
  transaction: EscrowTransaction;
  userRole: 'buyer' | 'seller';
  productName: string;
  productImage: string;
  onConfirmDelivery?: () => Promise<boolean>;
  onMarkShipped?: (trackingNumber?: string) => Promise<boolean>;
  onCancelOrder?: () => Promise<boolean>;
  onOpenDispute?: (reason: DisputeReason, description: string, evidence: File[]) => Promise<boolean>;
}

/**
 * Complete order card with status, actions, and timeline
 */
export function OrderCard({
  transaction,
  userRole,
  productName,
  productImage,
  onConfirmDelivery,
  onMarkShipped,
  onCancelOrder,
  onOpenDispute,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { canDispute } = canOpenDispute(transaction);
  const { canCancel } = canCancelOrder(transaction, userRole);
  const nextStatuses = getValidNextStatuses(transaction.status);

  const handleAction = async (action: () => Promise<boolean>) => {
    setActionLoading(true);
    try {
      await action();
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipOrder = async () => {
    if (onMarkShipped) {
      const success = await handleAction(() => onMarkShipped(trackingNumber || undefined));
      if (success) {
        setShowShippingModal(false);
        setTrackingNumber('');
      }
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Main Content */}
      <div className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Shoe';
              }}
            />
          </div>

          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-white truncate">{productName}</h3>
                <p className="text-sm text-zinc-500">
                  Order #{transaction.order_id.slice(0, 8)}
                </p>
              </div>
              <EscrowStatusBadge status={transaction.status} size="sm" />
            </div>

            {/* Price Info */}
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-zinc-400">
                {userRole === 'buyer' ? 'Total Paid:' : 'Your Payout:'}
                <span className="text-white ml-1 font-medium">
                  {formatAmount(userRole === 'buyer' ? transaction.total_amount : transaction.seller_payout)}
                </span>
              </span>
              {userRole === 'seller' && (
                <span className="text-zinc-500">
                  (Fee: {formatAmount(transaction.platform_fee)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Escrow Countdown - Show for relevant statuses */}
        {['delivered', 'payment_held', 'shipped'].includes(transaction.status) && (
          <div className="mt-4">
            <EscrowCountdown transaction={transaction} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Buyer Actions */}
          {userRole === 'buyer' && (
            <>
              {transaction.status === 'shipped' && onConfirmDelivery && (
                <button
                  onClick={() => handleAction(onConfirmDelivery)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Confirming...' : 'Confirm Delivery'}
                </button>
              )}
              {canDispute && onOpenDispute && (
                <button
                  onClick={() => setShowDisputeForm(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30"
                >
                  Open Dispute
                </button>
              )}
            </>
          )}

          {/* Seller Actions */}
          {userRole === 'seller' && (
            <>
              {transaction.status === 'payment_held' && onMarkShipped && (
                <button
                  onClick={() => setShowShippingModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  Mark as Shipped
                </button>
              )}
            </>
          )}

          {/* Common Actions */}
          {canCancel && onCancelOrder && (
            <button
              onClick={() => handleAction(onCancelOrder)}
              disabled={actionLoading}
              className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-600 disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}

          {/* Expand/Collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 text-zinc-400 hover:text-white text-sm"
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-zinc-800 p-4 bg-zinc-800/30">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Timeline */}
            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-3">Order Timeline</h4>
              <OrderTimeline transaction={transaction} />
            </div>

            {/* Order Details */}
            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-3">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Item Price</span>
                  <span className="text-white">{formatAmount(transaction.item_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shipping</span>
                  <span className="text-white">{formatAmount(transaction.shipping_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-700 pt-2">
                  <span className="text-zinc-400 font-medium">Total</span>
                  <span className="text-white font-medium">{formatAmount(transaction.total_amount)}</span>
                </div>
                {userRole === 'seller' && (
                  <>
                    <div className="flex justify-between text-red-400">
                      <span>Platform Fee (10%)</span>
                      <span>-{formatAmount(transaction.platform_fee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-700 pt-2">
                      <span className="text-green-400 font-medium">Your Payout</span>
                      <span className="text-green-400 font-medium">{formatAmount(transaction.seller_payout)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Escrow Info */}
              {transaction.escrow_days > 0 && (
                <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
                  <p className="text-xs text-zinc-400">
                    <span className="text-zinc-300 font-medium">Escrow Period:</span> {transaction.escrow_days} days
                  </p>
                  {transaction.escrow_expires_at && (
                    <p className="text-xs text-zinc-400 mt-1">
                      <span className="text-zinc-300 font-medium">Release Date:</span>{' '}
                      {new Date(transaction.escrow_expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">Ship Order</h3>
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-2">
                Tracking Number (Optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShippingModal(false)}
                className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleShipOrder}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Confirm Shipped'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Form Modal */}
      {showDisputeForm && onOpenDispute && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="max-w-lg w-full my-8">
            <DisputeForm
              transaction={transaction}
              onSubmit={async (reason, description, evidence) => {
                const success = await onOpenDispute(reason, description, evidence);
                if (success) {
                  setShowDisputeForm(false);
                }
                return success;
              }}
              onCancel={() => setShowDisputeForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderCard;
