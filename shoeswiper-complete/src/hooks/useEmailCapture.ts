import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/config';

const EMAIL_CAPTURE_KEY = 'shoeswiper_email_capture';
const EMAIL_LIST_KEY = 'shoeswiper_email_list';

export interface CapturedEmail {
  email: string;
  source: 'price_alert' | 'newsletter' | 'exit_intent' | 'referral';
  shoeId?: string;
  shoeName?: string;
  createdAt: string;
  preferences: {
    priceAlerts: boolean;
    newReleases: boolean;
    weeklyDigest: boolean;
    promotions: boolean;
  };
}

export interface EmailCaptureState {
  email: string | null;
  isSubscribed: boolean;
  preferences: CapturedEmail['preferences'];
}

const DEFAULT_PREFERENCES: CapturedEmail['preferences'] = {
  priceAlerts: true,
  newReleases: true,
  weeklyDigest: false,
  promotions: false,
};

export const useEmailCapture = () => {
  const [state, setState] = useState<EmailCaptureState>({
    email: null,
    isSubscribed: false,
    preferences: DEFAULT_PREFERENCES,
  });
  const [loading, setLoading] = useState(true);

  // Load saved email on mount
  useEffect(() => {
    loadSavedEmail();
  }, []);

  const loadSavedEmail = async () => {
    try {
      if (DEMO_MODE) {
        const stored = localStorage.getItem(EMAIL_CAPTURE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setState({
            email: data.email,
            isSubscribed: true,
            preferences: data.preferences || DEFAULT_PREFERENCES,
          });
        }
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.email) {
          // Check if user has email preferences saved
          const { data } = await supabase
            .from('email_subscriptions')
            .select('*')
            .eq('email', user.email)
            .single();

          if (data) {
            setState({
              email: data.email,
              isSubscribed: data.is_subscribed,
              preferences: data.preferences || DEFAULT_PREFERENCES,
            });
          } else {
            setState({
              email: user.email,
              isSubscribed: false,
              preferences: DEFAULT_PREFERENCES,
            });
          }
        }
      }
    } catch (err) {
      console.error('[EmailCapture] Error loading saved email:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Capture email for a specific purpose
  const captureEmail = useCallback(async (
    email: string,
    source: CapturedEmail['source'],
    shoeData?: { id: string; name: string },
    preferences?: Partial<CapturedEmail['preferences']>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    try {
      const capturedEmail: CapturedEmail = {
        email: email.toLowerCase().trim(),
        source,
        shoeId: shoeData?.id,
        shoeName: shoeData?.name,
        createdAt: new Date().toISOString(),
        preferences: { ...DEFAULT_PREFERENCES, ...preferences },
      };

      if (DEMO_MODE) {
        // Save to localStorage
        localStorage.setItem(EMAIL_CAPTURE_KEY, JSON.stringify({
          email: capturedEmail.email,
          preferences: capturedEmail.preferences,
        }));

        // Also add to email list for admin view
        const existingList = JSON.parse(localStorage.getItem(EMAIL_LIST_KEY) || '[]');
        const updatedList = [
          capturedEmail,
          ...existingList.filter((e: CapturedEmail) => e.email !== capturedEmail.email),
        ];
        localStorage.setItem(EMAIL_LIST_KEY, JSON.stringify(updatedList));

        setState({
          email: capturedEmail.email,
          isSubscribed: true,
          preferences: capturedEmail.preferences,
        });

        console.log(`[Demo] Email captured: ${email} for ${source}`);
        return { success: true };
      } else {
        const { supabase } = await import('../lib/supabaseClient');

        // Upsert email subscription
        const { error } = await supabase
          .from('email_subscriptions')
          .upsert({
            email: capturedEmail.email,
            source: capturedEmail.source,
            shoe_id: capturedEmail.shoeId,
            shoe_name: capturedEmail.shoeName,
            preferences: capturedEmail.preferences,
            is_subscribed: true,
            created_at: capturedEmail.createdAt,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'email',
          });

        if (error) throw error;

        setState({
          email: capturedEmail.email,
          isSubscribed: true,
          preferences: capturedEmail.preferences,
        });

        return { success: true };
      }
    } catch (err) {
      console.error('[EmailCapture] Error capturing email:', err);
      return { success: false, error: 'Failed to save email. Please try again.' };
    }
  }, []);

  // Update email preferences
  const updatePreferences = useCallback(async (
    newPreferences: Partial<CapturedEmail['preferences']>
  ): Promise<boolean> => {
    if (!state.email) return false;

    try {
      const updatedPreferences = { ...state.preferences, ...newPreferences };

      if (DEMO_MODE) {
        localStorage.setItem(EMAIL_CAPTURE_KEY, JSON.stringify({
          email: state.email,
          preferences: updatedPreferences,
        }));
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        await supabase
          .from('email_subscriptions')
          .update({
            preferences: updatedPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq('email', state.email);
      }

      setState(prev => ({ ...prev, preferences: updatedPreferences }));
      return true;
    } catch (err) {
      console.error('[EmailCapture] Error updating preferences:', err);
      return false;
    }
  }, [state.email, state.preferences]);

  // Unsubscribe from emails
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.email) return false;

    try {
      if (DEMO_MODE) {
        localStorage.removeItem(EMAIL_CAPTURE_KEY);
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        await supabase
          .from('email_subscriptions')
          .update({
            is_subscribed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('email', state.email);
      }

      setState({
        email: null,
        isSubscribed: false,
        preferences: DEFAULT_PREFERENCES,
      });
      return true;
    } catch (err) {
      console.error('[EmailCapture] Error unsubscribing:', err);
      return false;
    }
  }, [state.email]);

  // Get all captured emails (for admin)
  const getAllEmails = useCallback(async (): Promise<CapturedEmail[]> => {
    try {
      if (DEMO_MODE) {
        const stored = localStorage.getItem(EMAIL_LIST_KEY);
        return stored ? JSON.parse(stored) : [];
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data } = await supabase
          .from('email_subscriptions')
          .select('*')
          .eq('is_subscribed', true)
          .order('created_at', { ascending: false });

        return (data || []).map((e: any) => ({
          email: e.email,
          source: e.source,
          shoeId: e.shoe_id,
          shoeName: e.shoe_name,
          createdAt: e.created_at,
          preferences: e.preferences,
        }));
      }
    } catch (err) {
      console.error('[EmailCapture] Error getting emails:', err);
      return [];
    }
  }, []);

  return {
    email: state.email,
    isSubscribed: state.isSubscribed,
    preferences: state.preferences,
    loading,
    isValidEmail,
    captureEmail,
    updatePreferences,
    unsubscribe,
    getAllEmails,
  };
};
