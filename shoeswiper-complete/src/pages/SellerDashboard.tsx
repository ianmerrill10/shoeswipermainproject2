import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSellerVerification } from '../hooks/useSellerVerification';
import { SellerVerificationBadge } from '../components/seller/SellerVerificationBadge';
import { TrustScoreDisplay } from '../components/seller/TrustScoreDisplay';
import { DocumentUploadForm } from '../components/seller/DocumentUploadForm';
import { TierUpgradeCard } from '../components/seller/TierUpgradeCard';
import { formatAmount } from '../lib/escrow';

/**
 * Seller Dashboard - Verification and Trust Management
 */
export function SellerDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    sellerProfile,
    documents,
    trustScore,
    loading,
    error,
    createSellerProfile,
    submitDocument,
    requestTierUpgrade,
    canList,
    paymentTerms,
    maxListingValue,
  } = useSellerVerification();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Create seller profile if doesn't exist
  const handleBecomeSeller = async () => {
    await createSellerProfile();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // No seller profile yet
  if (!sellerProfile) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-2">Become a Seller</h1>
            <p className="text-zinc-400 mb-6">
              Start selling sneakers on ShoeSwiper. Build trust with buyers through our verification system.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="font-medium">Secure Payments</div>
                <div className="text-zinc-500 text-xs">Escrow protection</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-2xl mb-2">⭐</div>
                <div className="font-medium">Build Trust</div>
                <div className="text-zinc-500 text-xs">Verification badges</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium">10% Fee</div>
                <div className="text-zinc-500 text-xs">Competitive rates</div>
              </div>
            </div>

            <button
              onClick={handleBecomeSeller}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Create Seller Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
              <p className="text-zinc-400">Manage your verification and selling status</p>
            </div>
            <SellerVerificationBadge tier={sellerProfile.verification_tier} size="lg" />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mt-4">
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <div className="text-zinc-500 text-sm">Listing Status</div>
            <div className={`font-medium ${canList.allowed ? 'text-green-400' : 'text-red-400'}`}>
              {canList.allowed ? 'Active' : 'Restricted'}
            </div>
            {!canList.allowed && (
              <div className="text-xs text-zinc-500 mt-1">{canList.reason}</div>
            )}
          </div>

          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <div className="text-zinc-500 text-sm">Max Listing</div>
            <div className="font-medium text-white">
              {maxListingValue === 0 ? 'N/A' : formatAmount(maxListingValue)}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <div className="text-zinc-500 text-sm">Escrow Period</div>
            <div className="font-medium text-white">
              {paymentTerms.escrowDays === 0 ? 'Immediate' : `${paymentTerms.escrowDays} days`}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <div className="text-zinc-500 text-sm">Total Sales</div>
            <div className="font-medium text-white">{sellerProfile.total_sales}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trust Score */}
            {trustScore && <TrustScoreDisplay breakdown={trustScore} />}

            {/* Seller Stats */}
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Successful Transactions</span>
                  <span className="text-white">{sellerProfile.successful_transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Average Rating</span>
                  <span className="text-white">
                    {sellerProfile.average_rating.toFixed(1)} ⭐ ({sellerProfile.review_count} reviews)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Disputes</span>
                  <span className={sellerProfile.dispute_count > 0 ? 'text-red-400' : 'text-white'}>
                    {sellerProfile.dispute_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Active Listings</span>
                  <span className="text-white">{sellerProfile.total_listings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tier Upgrade */}
            <TierUpgradeCard
              currentProfile={sellerProfile}
              documents={documents}
              onRequestUpgrade={requestTierUpgrade}
            />
          </div>
        </div>

        {/* Document Upload - Full Width */}
        <div className="mt-6">
          <DocumentUploadForm
            onUpload={submitDocument}
            existingDocuments={documents}
            disabled={sellerProfile.is_suspended}
          />
        </div>

        {/* Suspension Notice */}
        {sellerProfile.is_suspended && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <h4 className="font-medium text-red-400 mb-1">Account Suspended</h4>
            <p className="text-sm text-red-300">
              {sellerProfile.suspension_reason || 'Your seller account has been suspended. Please contact support.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;
