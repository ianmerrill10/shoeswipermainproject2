import { useState, useEffect, useCallback } from 'react';
import {
  isAppInstalled,
  isIOS,
  canInstall,
  getInstallInstructions,
  type InstallInstructions,
} from '../lib/pwaUtils';

const INSTALL_PROMPT_DISMISSED_KEY = 'shoeswiper_install_dismissed';
const INSTALL_PROMPT_DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface UsePWAInstallReturn {
  /** Whether the app can be installed (not already installed and is installable) */
  canInstall: boolean;
  /** Whether the app is already installed as a PWA */
  isInstalled: boolean;
  /** Whether this is an iOS device (needs manual install instructions) */
  isIOS: boolean;
  /** Whether the install prompt is available (beforeinstallprompt event fired) */
  isPromptAvailable: boolean;
  /** Whether the install prompt has been dismissed by the user */
  isDismissed: boolean;
  /** Install instructions for the current platform */
  instructions: InstallInstructions;
  /** Trigger the native install prompt (Chrome/Edge/Android) */
  promptInstall: () => Promise<boolean>;
  /** Dismiss the install prompt and store preference */
  dismissPrompt: () => void;
  /** Reset the dismissed state */
  resetDismissed: () => void;
}

export const usePWAInstall = (): UsePWAInstallReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Check if dismissed state is stored
  useEffect(() => {
    const dismissedAt = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      if (now - dismissedTime < INSTALL_PROMPT_DISMISSED_DURATION) {
        setIsDismissed(true);
      } else {
        // Expired, remove the key
        localStorage.removeItem(INSTALL_PROMPT_DISMISSED_KEY);
      }
    }
  }, []);

  // Check if already installed
  useEffect(() => {
    setIsInstalled(isAppInstalled());

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (import.meta.env.DEV) {
        console.log('[PWA] Install prompt captured');
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (import.meta.env.DEV) {
        console.log('[PWA] App installed');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger the install prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      if (import.meta.env.DEV) {
        console.log('[PWA] No install prompt available');
      }
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user's response
      const choiceResult = await deferredPrompt.userChoice;

      if (import.meta.env.DEV) {
        console.log('[PWA] User choice:', choiceResult.outcome);
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);

      if (choiceResult.outcome === 'accepted') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Dismiss the install prompt
  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, Date.now().toString());
    if (import.meta.env.DEV) {
      console.log('[PWA] Install prompt dismissed');
    }
  }, []);

  // Reset the dismissed state
  const resetDismissed = useCallback(() => {
    setIsDismissed(false);
    localStorage.removeItem(INSTALL_PROMPT_DISMISSED_KEY);
    if (import.meta.env.DEV) {
      console.log('[PWA] Install prompt reset');
    }
  }, []);

  return {
    canInstall: canInstall() && !isDismissed,
    isInstalled,
    isIOS: isIOS(),
    isPromptAvailable: deferredPrompt !== null,
    isDismissed,
    instructions: getInstallInstructions(),
    promptInstall,
    dismissPrompt,
    resetDismissed,
  };
};
