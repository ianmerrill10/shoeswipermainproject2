import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import {
  SellerProfile,
  VerificationDocument,
  VerificationTier,
  DocumentType,
  TrustScoreBreakdown,
  calculateTrustScore,
  checkTierRequirements,
  canListItems,
  canReceiveDirectPayment,
  getMaxListingValue,
  getVerificationBadge,
  createDefaultSellerProfile,
} from '../lib/sellerVerification';

interface UseSellerVerificationResult {
  // State
  sellerProfile: SellerProfile | null;
  documents: VerificationDocument[];
  trustScore: TrustScoreBreakdown | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSellerProfile: () => Promise<void>;
  createSellerProfile: () => Promise<SellerProfile | null>;
  submitDocument: (
    documentType: DocumentType,
    file: File
  ) => Promise<VerificationDocument | null>;
  requestTierUpgrade: (targetTier: VerificationTier) => Promise<{
    success: boolean;
    missing?: string[];
    error?: string;
  }>;
  refreshTrustScore: () => void;

  // Computed values
  canList: { allowed: boolean; reason?: string };
  paymentTerms: { allowed: boolean; escrowDays: number };
  maxListingValue: number;
  badge: ReturnType<typeof getVerificationBadge> | null;
}

/**
 * Hook for managing seller verification status
 * Provides access to seller profile, documents, and verification actions
 */
export function useSellerVerification(): UseSellerVerificationResult {
  const { user } = useAuth();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [trustScore, setTrustScore] = useState<TrustScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate account age in days
   */
  const getAccountAgeDays = useCallback((): number => {
    if (!sellerProfile?.created_at) return 0;
    const created = new Date(sellerProfile.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, [sellerProfile?.created_at]);

  /**
   * Refresh trust score calculation
   */
  const refreshTrustScore = useCallback(() => {
    if (!sellerProfile) {
      setTrustScore(null);
      return;
    }

    const accountAgeDays = getAccountAgeDays();
    const score = calculateTrustScore(sellerProfile, accountAgeDays);
    setTrustScore(score);
  }, [sellerProfile, getAccountAgeDays]);

  /**
   * Fetch seller profile from database
   */
  const fetchSellerProfile = useCallback(async () => {
    if (!user) {
      setSellerProfile(null);
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch seller profile
      const { data: profile, error: profileError } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw profileError;
      }

      if (profile) {
        setSellerProfile(profile as SellerProfile);

        // Fetch verification documents
        const { data: docs, error: docsError } = await supabase
          .from('verification_documents')
          .select('*')
          .eq('seller_id', profile.id)
          .order('submitted_at', { ascending: false });

        if (docsError) throw docsError;
        setDocuments((docs as VerificationDocument[]) || []);
      } else {
        setSellerProfile(null);
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching seller profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch seller profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Create a new seller profile for the current user
   */
  const createSellerProfile = useCallback(async (): Promise<SellerProfile | null> => {
    if (!user) {
      setError('Must be logged in to create seller profile');
      return null;
    }

    setError(null);

    try {
      const defaultProfile = createDefaultSellerProfile(user.id);

      const { data, error: insertError } = await supabase
        .from('seller_profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (insertError) throw insertError;

      const profile = data as SellerProfile;
      setSellerProfile(profile);
      return profile;
    } catch (err) {
      console.error('Error creating seller profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create seller profile');
      return null;
    }
  }, [user]);

  /**
   * Submit a verification document
   */
  const submitDocument = useCallback(
    async (
      documentType: DocumentType,
      file: File
    ): Promise<VerificationDocument | null> => {
      if (!user || !sellerProfile) {
        setError('Must have seller profile to submit documents');
        return null;
      }

      setError(null);

      try {
        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('verification-documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL (or signed URL for private buckets)
        const { data: urlData } = supabase.storage
          .from('verification-documents')
          .getPublicUrl(fileName);

        // Create document record
        const { data: doc, error: docError } = await supabase
          .from('verification_documents')
          .insert({
            seller_id: sellerProfile.user_id,
            document_type: documentType,
            file_url: urlData.publicUrl,
            status: 'pending',
          })
          .select()
          .single();

        if (docError) throw docError;

        const newDoc = doc as VerificationDocument;
        setDocuments((prev) => [newDoc, ...prev]);
        return newDoc;
      } catch (err) {
        console.error('Error submitting document:', err);
        setError(err instanceof Error ? err.message : 'Failed to submit document');
        return null;
      }
    },
    [user, sellerProfile]
  );

  /**
   * Request upgrade to a higher verification tier
   */
  const requestTierUpgrade = useCallback(
    async (
      targetTier: VerificationTier
    ): Promise<{ success: boolean; missing?: string[]; error?: string }> => {
      if (!sellerProfile) {
        return { success: false, error: 'No seller profile found' };
      }

      // Check requirements
      const { eligible, missing } = checkTierRequirements(
        sellerProfile,
        documents,
        targetTier
      );

      if (!eligible) {
        return { success: false, missing };
      }

      try {
        // Update verification status to pending review
        const { error: updateError } = await supabase
          .from('seller_profiles')
          .update({
            verification_status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', sellerProfile.user_id);

        if (updateError) throw updateError;

        // Refresh profile
        await fetchSellerProfile();

        return { success: true };
      } catch (err) {
        console.error('Error requesting tier upgrade:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to request upgrade',
        };
      }
    },
    [sellerProfile, documents, fetchSellerProfile]
  );

  // Fetch profile on mount and when user changes
  useEffect(() => {
    fetchSellerProfile();
  }, [fetchSellerProfile]);

  // Update trust score when profile changes
  useEffect(() => {
    refreshTrustScore();
  }, [refreshTrustScore]);

  // Computed values
  const canList = sellerProfile
    ? canListItems(sellerProfile)
    : { allowed: false, reason: 'No seller profile' };

  const paymentTerms = sellerProfile
    ? canReceiveDirectPayment(sellerProfile)
    : { allowed: false, escrowDays: 14 };

  const maxListingValue = sellerProfile ? getMaxListingValue(sellerProfile) : 0;

  const badge = sellerProfile
    ? getVerificationBadge(sellerProfile.verification_tier)
    : null;

  return {
    // State
    sellerProfile,
    documents,
    trustScore,
    loading,
    error,

    // Actions
    fetchSellerProfile,
    createSellerProfile,
    submitDocument,
    requestTierUpgrade,
    refreshTrustScore,

    // Computed values
    canList,
    paymentTerms,
    maxListingValue,
    badge,
  };
}

export default useSellerVerification;
