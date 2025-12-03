/**
 * PWA Utility Functions
 * Helper functions for Progressive Web App features
 */

/**
 * Check if the app is running in standalone mode (installed PWA)
 */
export const isAppInstalled = (): boolean => {
  // Check display-mode media query
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check iOS standalone mode
  if ('standalone' in window.navigator && (window.navigator as Navigator & { standalone: boolean }).standalone) {
    return true;
  }

  // Check if running in fullscreen mode
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }

  return false;
};

/**
 * Get the current display mode
 */
export type DisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';

export const getDisplayMode = (): DisplayMode => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
};

/**
 * Detect if the device is iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
};

/**
 * Detect if the device is Android
 */
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

/**
 * Detect if the device is mobile
 */
export const isMobile = (): boolean => {
  return isIOS() || isAndroid() || /webOS|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
};

/**
 * Check if the browser supports PWA installation
 */
export const isPWASupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Check if the browser supports the beforeinstallprompt event (Chrome, Edge, etc.)
 */
export const supportsInstallPrompt = (): boolean => {
  // iOS Safari doesn't support beforeinstallprompt
  if (isIOS()) {
    return false;
  }
  // Most Chromium-based browsers support it
  return 'BeforeInstallPromptEvent' in window || isAndroid();
};

/**
 * Check if app is running in iOS Safari
 */
export const isIOSSafari = (): boolean => {
  const ua = navigator.userAgent;
  const isIos = isIOS();
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
};

/**
 * Get install instructions for the current platform
 */
export interface InstallInstructions {
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  steps: string[];
  icon: string;
}

export const getInstallInstructions = (): InstallInstructions => {
  if (isIOS()) {
    return {
      platform: 'ios',
      steps: [
        'Tap the Share button in Safari',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to install ShoeSwiper',
      ],
      icon: '📤',
    };
  }

  if (isAndroid()) {
    return {
      platform: 'android',
      steps: [
        'Tap the menu button (⋮)',
        'Tap "Add to Home screen"',
        'Tap "Add" to install ShoeSwiper',
      ],
      icon: '📱',
    };
  }

  return {
    platform: 'desktop',
    steps: [
      'Click the install icon in the address bar',
      'Click "Install" in the prompt',
    ],
    icon: '💻',
  };
};

/**
 * Check if the app can be installed (not already installed and supports installation)
 */
export const canInstall = (): boolean => {
  return isPWASupported() && !isAppInstalled();
};

/**
 * Vibrate the device with haptic feedback (if supported)
 */
export const triggerHapticFeedback = (pattern: number | number[] = 10): boolean => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Check if the device supports haptic feedback
 */
export const supportsHapticFeedback = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Register the service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    if (import.meta.env.DEV) {
      console.log('[PWA] Service workers not supported');
    }
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    if (import.meta.env.DEV) {
      console.log('[PWA] Service worker registered:', registration.scope);
    }

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            if (import.meta.env.DEV) {
              console.log('[PWA] New content available');
            }
            // Could dispatch event or show update notification here
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return null;
  }
};
