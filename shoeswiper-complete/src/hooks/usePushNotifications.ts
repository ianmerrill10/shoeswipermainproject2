import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/config';

const PUSH_SETTINGS_KEY = 'shoeswiper_push_settings';

export interface PushSettings {
  enabled: boolean;
  priceDrops: boolean;
  newReleases: boolean;
  restocks: boolean;
  promotions: boolean;
  subscribedAt?: string;
}

const DEFAULT_SETTINGS: PushSettings = {
  enabled: false,
  priceDrops: true,
  newReleases: true,
  restocks: true,
  promotions: false,
};

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [settings, setSettings] = useState<PushSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Check support and load settings on mount
  useEffect(() => {
    checkSupport();
    loadSettings();
  }, []);

  const checkSupport = () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(PUSH_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (err) {
      console.error('[Push] Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = (newSettings: PushSettings) => {
    setSettings(newSettings);
    localStorage.setItem(PUSH_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      if (import.meta.env.DEV) console.log('[Push] Service worker registered:', registration.scope);
      setSwRegistration(registration);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      if (import.meta.env.DEV) console.log('[Push] Service worker ready');

      return registration;
    } catch (err) {
      console.error('[Push] Service worker registration failed:', err);
      return null;
    }
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      if (import.meta.env.DEV) console.log('[Push] Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        if (import.meta.env.DEV) console.log('[Push] Permission granted');

        // Register service worker if not already registered
        let registration = swRegistration;
        if (!registration) {
          registration = await registerServiceWorker();
        }

        if (registration) {
          // Update settings
          saveSettings({
            ...settings,
            enabled: true,
            subscribedAt: new Date().toISOString(),
          });

          // Store subscription in Supabase (for production)
          if (!DEMO_MODE) {
            await saveSubscriptionToServer(registration);
          }

          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('[Push] Error requesting permission:', err);
      return false;
    }
  }, [isSupported, swRegistration, settings, registerServiceWorker]);

  // Save subscription to server (for production push from backend)
  const saveSubscriptionToServer = async (registration: ServiceWorkerRegistration) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // In production, you'd use a VAPID key here
        // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const { supabase } = await import('../lib/supabaseClient');
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString(),
          settings: settings,
        }, {
          onConflict: 'user_id',
        });
      }
    } catch (err) {
      console.error('[Push] Error saving subscription:', err);
    }
  };

  // Disable push notifications
  const disablePush = useCallback(async () => {
    saveSettings({
      ...settings,
      enabled: false,
    });

    // Unsubscribe from push manager
    if (swRegistration) {
      try {
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          if (import.meta.env.DEV) console.log('[Push] Unsubscribed from push notifications');
        }
      } catch (err) {
        console.error('[Push] Error unsubscribing:', err);
      }
    }

    // Remove from server
    if (!DEMO_MODE) {
      try {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
        }
      } catch (err) {
        console.error('[Push] Error removing subscription from server:', err);
      }
    }
  }, [swRegistration, settings]);

  // Update notification preferences
  const updateSettings = useCallback((updates: Partial<PushSettings>) => {
    const newSettings = { ...settings, ...updates };
    saveSettings(newSettings);

    // Sync to server in production
    if (!DEMO_MODE && newSettings.enabled) {
      syncSettingsToServer(newSettings);
    }
  }, [settings]);

  const syncSettingsToServer = async (newSettings: PushSettings) => {
    try {
      const { supabase } = await import('../lib/supabaseClient');
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('push_subscriptions')
          .update({ settings: newSettings })
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.error('[Push] Error syncing settings:', err);
    }
  };

  // Show a local notification (for demo/testing)
  const showLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) => {
    if (permission !== 'granted') {
      if (import.meta.env.DEV) console.log('[Push] No permission for notifications');
      return false;
    }

    try {
      // Try to use service worker for notification
      const registration = swRegistration || await navigator.serviceWorker.ready;

      if (registration && registration.active) {
        registration.active.postMessage({
          type: 'SHOW_LOCAL_NOTIFICATION',
          payload: { title, body, data },
        });
        return true;
      }

      // Fallback to basic notification
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'shoeswiper-notification',
        data,
      });

      return true;
    } catch (err) {
      console.error('[Push] Error showing notification:', err);
      return false;
    }
  }, [permission, swRegistration]);

  // Send price drop notification
  const notifyPriceDrop = useCallback(async (
    shoeName: string,
    oldPrice: number,
    newPrice: number,
    amazonUrl: string,
    shoeId: string
  ) => {
    if (!settings.enabled || !settings.priceDrops) return false;

    const percentOff = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    const savedAmount = (oldPrice - newPrice).toFixed(2);

    return showLocalNotification(
      `Price Drop: ${shoeName}`,
      `Now $${newPrice} (was $${oldPrice}) - Save $${savedAmount} (${percentOff}% off!)`,
      { shoeId, amazonUrl, type: 'price_drop' }
    );
  }, [settings, showLocalNotification]);

  // Send new release notification
  const notifyNewRelease = useCallback(async (
    shoeName: string,
    brand: string,
    shoeId: string
  ) => {
    if (!settings.enabled || !settings.newReleases) return false;

    return showLocalNotification(
      `New Release: ${brand}`,
      `${shoeName} is now available! Tap to check it out.`,
      { shoeId, type: 'new_release' }
    );
  }, [settings, showLocalNotification]);

  // Send restock notification
  const notifyRestock = useCallback(async (
    shoeName: string,
    amazonUrl: string,
    shoeId: string
  ) => {
    if (!settings.enabled || !settings.restocks) return false;

    return showLocalNotification(
      `Back in Stock!`,
      `${shoeName} is available again. Grab it before it sells out!`,
      { shoeId, amazonUrl, type: 'restock' }
    );
  }, [settings, showLocalNotification]);

  return {
    // State
    isSupported,
    permission,
    settings,
    loading,
    isEnabled: permission === 'granted' && settings.enabled,

    // Actions
    requestPermission,
    disablePush,
    updateSettings,
    registerServiceWorker,

    // Notification triggers
    showLocalNotification,
    notifyPriceDrop,
    notifyNewRelease,
    notifyRestock,
  };
};
