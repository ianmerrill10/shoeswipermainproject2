import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/config';

/**
 * User onboarding flow state management hook.
 * Manages multi-step onboarding process including style preferences,
 * favorite brands, email capture, and push notification opt-in.
 * 
 * In DEMO_MODE, state is stored in localStorage.
 * In production, state is synced with Supabase user_preferences table.
 * 
 * @returns Object containing onboarding state and navigation methods
 * @example
 * const { completed, currentStep, nextStep, completeOnboarding } = useOnboarding();
 * 
 * // Check if onboarding is complete
 * if (completed) return <MainApp />;
 * 
 * // Navigate through steps
 * nextStep();
 * previousStep();
 * 
 * // Save preferences
 * setStylePreferences(['streetwear', 'running']);
 * setFavoriteBrands(['Nike', 'Jordan']);
 */

const ONBOARDING_KEY = 'shoeswiper_onboarding';
const PREFERENCES_KEY = 'shoeswiper_preferences';

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  stylePreferences: string[];
  favoriteBrands: string[];
  emailCaptured: boolean;
  pushEnabled: boolean;
}

export interface OnboardingPreferences {
  stylePreferences: string[];
  favoriteBrands: string[];
}

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  currentStep: 0,
  stylePreferences: [],
  favoriteBrands: [],
  emailCaptured: false,
  pushEnabled: false,
};

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  // Load saved state on mount
  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      if (DEMO_MODE) {
        const stored = localStorage.getItem(ONBOARDING_KEY);
        if (stored) {
          const data = JSON.parse(stored) as OnboardingState;
          setState(data);
        }
      } else {
        // In production, check Supabase for user preferences
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data) {
            setState({
              completed: data.onboarding_completed ?? false,
              currentStep: data.onboarding_step ?? 0,
              stylePreferences: data.style_preferences ?? [],
              favoriteBrands: data.favorite_brands ?? [],
              emailCaptured: data.email_captured ?? false,
              pushEnabled: data.push_enabled ?? false,
            });
          }
        }
      }
    } catch (err) {
      console.error('[Onboarding] Error loading state:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveState = useCallback(async (newState: OnboardingState) => {
    try {
      if (DEMO_MODE) {
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              onboarding_completed: newState.completed,
              onboarding_step: newState.currentStep,
              style_preferences: newState.stylePreferences,
              favorite_brands: newState.favoriteBrands,
              email_captured: newState.emailCaptured,
              push_enabled: newState.pushEnabled,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });
        }
      }
    } catch (err) {
      console.error('[Onboarding] Error saving state:', err);
    }
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    const newState = { ...state, currentStep: step };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const nextStep = useCallback(() => {
    const newState = { ...state, currentStep: state.currentStep + 1 };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const previousStep = useCallback(() => {
    const newState = { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const setStylePreferences = useCallback((styles: string[]) => {
    const newState = { ...state, stylePreferences: styles };
    setState(newState);
    saveState(newState);
    
    // Also save to separate preferences key for feed algorithm
    if (DEMO_MODE) {
      try {
        const prefs = localStorage.getItem(PREFERENCES_KEY);
        const existingPrefs = prefs ? JSON.parse(prefs) as OnboardingPreferences : { stylePreferences: [], favoriteBrands: [] };
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ ...existingPrefs, stylePreferences: styles }));
      } catch {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ stylePreferences: styles, favoriteBrands: [] }));
      }
    }
  }, [state, saveState]);

  const setFavoriteBrands = useCallback((brands: string[]) => {
    const newState = { ...state, favoriteBrands: brands };
    setState(newState);
    saveState(newState);
    
    // Also save to separate preferences key for feed algorithm
    if (DEMO_MODE) {
      try {
        const prefs = localStorage.getItem(PREFERENCES_KEY);
        const existingPrefs = prefs ? JSON.parse(prefs) as OnboardingPreferences : { stylePreferences: [], favoriteBrands: [] };
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ ...existingPrefs, favoriteBrands: brands }));
      } catch {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ stylePreferences: [], favoriteBrands: brands }));
      }
    }
  }, [state, saveState]);

  const setEmailCaptured = useCallback((captured: boolean) => {
    const newState = { ...state, emailCaptured: captured };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const setPushEnabled = useCallback((enabled: boolean) => {
    const newState = { ...state, pushEnabled: enabled };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const completeOnboarding = useCallback(() => {
    const newState = { ...state, completed: true };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const skipOnboarding = useCallback(() => {
    const newState = { ...state, completed: true };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const resetOnboarding = useCallback(() => {
    setState(DEFAULT_STATE);
    if (DEMO_MODE) {
      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(PREFERENCES_KEY);
    }
  }, []);

  // Get saved preferences (for use in feed algorithm)
  const getPreferences = useCallback((): OnboardingPreferences => {
    if (DEMO_MODE) {
      try {
        const stored = localStorage.getItem(PREFERENCES_KEY);
        return stored ? JSON.parse(stored) as OnboardingPreferences : { stylePreferences: [], favoriteBrands: [] };
      } catch {
        return { stylePreferences: [], favoriteBrands: [] };
      }
    }
    return {
      stylePreferences: state.stylePreferences,
      favoriteBrands: state.favoriteBrands,
    };
  }, [state]);

  return {
    // State
    completed: state.completed,
    currentStep: state.currentStep,
    stylePreferences: state.stylePreferences,
    favoriteBrands: state.favoriteBrands,
    emailCaptured: state.emailCaptured,
    pushEnabled: state.pushEnabled,
    loading,

    // Actions
    setCurrentStep,
    nextStep,
    previousStep,
    setStylePreferences,
    setFavoriteBrands,
    setEmailCaptured,
    setPushEnabled,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    getPreferences,
  };
};
