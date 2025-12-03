import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/config';

const PRICE_ALERTS_KEY = 'shoeswiper_price_alerts';
const PRICE_NOTIFICATIONS_KEY = 'shoeswiper_price_notifications';

export interface PriceAlert {
  shoeId: string;
  shoeName: string;
  shoeBrand: string;
  shoeImage: string;
  amazonUrl: string;
  targetPrice: number;
  currentPrice?: number;
  originalPrice?: number;
  createdAt: string;
  lastChecked?: string;
  triggered?: boolean;
  triggeredAt?: string;
}

export interface PriceNotification {
  id: string;
  shoeId: string;
  shoeName: string;
  shoeBrand: string;
  shoeImage: string;
  amazonUrl: string;
  oldPrice: number;
  newPrice: number;
  savedAmount: number;
  percentOff: number;
  createdAt: string;
  read: boolean;
}

interface PriceAlertDbRow {
  shoe_id: string;
  shoe_name: string;
  shoe_brand: string;
  shoe_image: string;
  amazon_url: string;
  target_price: number;
  current_price?: number;
  original_price?: number;
  created_at: string;
  last_checked?: string;
  triggered?: boolean;
  triggered_at?: string;
}

interface PriceNotificationDbRow {
  id: string;
  shoe_id: string;
  shoe_name: string;
  shoe_brand: string;
  shoe_image: string;
  amazon_url: string;
  old_price: number;
  new_price: number;
  saved_amount: number;
  percent_off: number;
  created_at: string;
  read: boolean;
}

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<PriceNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load alerts on mount
  useEffect(() => {
    loadAlerts();
    loadNotifications();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const stored = localStorage.getItem(PRICE_ALERTS_KEY);
        if (stored) {
          setAlerts(JSON.parse(stored));
        }
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('price_alerts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (data) {
            setAlerts(data.map((alert: PriceAlertDbRow) => ({
              shoeId: alert.shoe_id,
              shoeName: alert.shoe_name,
              shoeBrand: alert.shoe_brand,
              shoeImage: alert.shoe_image,
              amazonUrl: alert.amazon_url,
              targetPrice: alert.target_price,
              currentPrice: alert.current_price,
              originalPrice: alert.original_price,
              createdAt: alert.created_at,
              lastChecked: alert.last_checked,
              triggered: alert.triggered,
              triggeredAt: alert.triggered_at,
            })));
          }
        }
      }
    } catch (err) {
      console.error('[PriceAlerts] Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      if (DEMO_MODE) {
        const stored = localStorage.getItem(PRICE_NOTIFICATIONS_KEY);
        if (stored) {
          setNotifications(JSON.parse(stored));
        }
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('price_notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

          if (data) {
            setNotifications(data.map((n: PriceNotificationDbRow) => ({
              id: n.id,
              shoeId: n.shoe_id,
              shoeName: n.shoe_name,
              shoeBrand: n.shoe_brand,
              shoeImage: n.shoe_image,
              amazonUrl: n.amazon_url,
              oldPrice: n.old_price,
              newPrice: n.new_price,
              savedAmount: n.saved_amount,
              percentOff: n.percent_off,
              createdAt: n.created_at,
              read: n.read,
            })));
          }
        }
      }
    } catch (err) {
      console.error('[PriceAlerts] Error loading notifications:', err);
    }
  };

  // Add a price alert
  const addAlert = useCallback(async (
    shoe: {
      id: string;
      name: string;
      brand: string;
      image_url: string;
      amazon_url: string;
      price?: number | null;
    },
    targetPrice: number
  ): Promise<boolean> => {
    try {
      const newAlert: PriceAlert = {
        shoeId: shoe.id,
        shoeName: shoe.name,
        shoeBrand: shoe.brand,
        shoeImage: shoe.image_url,
        amazonUrl: shoe.amazon_url,
        targetPrice,
        originalPrice: shoe.price ?? undefined,
        currentPrice: shoe.price ?? undefined,
        createdAt: new Date().toISOString(),
        triggered: false,
      };

      if (DEMO_MODE) {
        const updatedAlerts = [...alerts.filter(a => a.shoeId !== shoe.id), newAlert];
        setAlerts(updatedAlerts);
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(updatedAlerts));
        if (import.meta.env.DEV) console.log(`[Demo] Price alert set for ${shoe.name} at $${targetPrice}`);
        return true;
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false;

        // Upsert alert (update if exists, insert if not)
        const { error } = await supabase
          .from('price_alerts')
          .upsert({
            user_id: user.id,
            shoe_id: shoe.id,
            shoe_name: shoe.name,
            shoe_brand: shoe.brand,
            shoe_image: shoe.image_url,
            amazon_url: shoe.amazon_url,
            target_price: targetPrice,
            original_price: shoe.price,
            current_price: shoe.price,
            created_at: new Date().toISOString(),
            triggered: false,
          }, {
            onConflict: 'user_id,shoe_id',
          });

        if (error) throw error;

        setAlerts(prev => [...prev.filter(a => a.shoeId !== shoe.id), newAlert]);
        return true;
      }
    } catch (err) {
      console.error('[PriceAlerts] Error adding alert:', err);
      return false;
    }
  }, [alerts]);

  // Remove a price alert
  const removeAlert = useCallback(async (shoeId: string): Promise<boolean> => {
    try {
      if (DEMO_MODE) {
        const updatedAlerts = alerts.filter(a => a.shoeId !== shoeId);
        setAlerts(updatedAlerts);
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(updatedAlerts));
        if (import.meta.env.DEV) console.log(`[Demo] Price alert removed for shoe ${shoeId}`);
        return true;
      } else {
        const { supabase } = await import('../lib/supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false;

        const { error } = await supabase
          .from('price_alerts')
          .delete()
          .eq('user_id', user.id)
          .eq('shoe_id', shoeId);

        if (error) throw error;

        setAlerts(prev => prev.filter(a => a.shoeId !== shoeId));
        return true;
      }
    } catch (err) {
      console.error('[PriceAlerts] Error removing alert:', err);
      return false;
    }
  }, [alerts]);

  // Check if alert exists for a shoe
  const hasAlert = useCallback((shoeId: string): boolean => {
    return alerts.some(a => a.shoeId === shoeId);
  }, [alerts]);

  // Get alert for a specific shoe
  const getAlert = useCallback((shoeId: string): PriceAlert | undefined => {
    return alerts.find(a => a.shoeId === shoeId);
  }, [alerts]);

  // Simulate a price drop (for DEMO mode) - also triggers push notification
  const simulatePriceDrop = useCallback(async (shoeId: string, newPrice: number) => {
    const alert = alerts.find(a => a.shoeId === shoeId);
    if (!alert) return;

    if (newPrice <= alert.targetPrice && !alert.triggered) {
      const oldPrice = alert.currentPrice || alert.originalPrice || 0;
      const notification: PriceNotification = {
        id: `notif-${Date.now()}`,
        shoeId: alert.shoeId,
        shoeName: alert.shoeName,
        shoeBrand: alert.shoeBrand,
        shoeImage: alert.shoeImage,
        amazonUrl: alert.amazonUrl,
        oldPrice,
        newPrice,
        savedAmount: oldPrice - newPrice,
        percentOff: Math.round((oldPrice - newPrice) / (oldPrice || 1) * 100),
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Update alert as triggered
      const updatedAlerts = alerts.map(a =>
        a.shoeId === shoeId
          ? { ...a, triggered: true, triggeredAt: new Date().toISOString(), currentPrice: newPrice }
          : a
      );
      setAlerts(updatedAlerts);
      localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(updatedAlerts));

      // Add notification
      const updatedNotifications = [notification, ...notifications];
      setNotifications(updatedNotifications);
      localStorage.setItem(PRICE_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));

      // Trigger push notification if enabled
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const percentOff = Math.round((oldPrice - newPrice) / (oldPrice || 1) * 100);
          const registration = await navigator.serviceWorker?.ready;
          if (registration?.active) {
            registration.active.postMessage({
              type: 'SHOW_LOCAL_NOTIFICATION',
              payload: {
                title: `Price Drop: ${alert.shoeName}`,
                body: `Now $${newPrice} (was $${oldPrice}) - Save ${percentOff}%!`,
                data: {
                  shoeId: alert.shoeId,
                  amazonUrl: alert.amazonUrl,
                  type: 'price_drop',
                },
              },
            });
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.log('[PriceAlerts] Push notification not available');
      }

      if (import.meta.env.DEV) console.log(`[Demo] Price drop alert triggered for ${alert.shoeName}! Now $${newPrice}`);
    }
  }, [alerts, notifications]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    if (DEMO_MODE) {
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
      localStorage.setItem(PRICE_NOTIFICATIONS_KEY, JSON.stringify(updated));
    } else {
      const { supabase } = await import('../lib/supabaseClient');
      await supabase
        .from('price_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  }, [notifications]);

  // Clear all notifications
  const clearNotifications = useCallback(async () => {
    if (DEMO_MODE) {
      setNotifications([]);
      localStorage.setItem(PRICE_NOTIFICATIONS_KEY, JSON.stringify([]));
    } else {
      const { supabase } = await import('../lib/supabaseClient');
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('price_notifications')
          .delete()
          .eq('user_id', user.id);

        setNotifications([]);
      }
    }
  }, []);

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    alerts,
    notifications,
    loading,
    unreadCount,
    addAlert,
    removeAlert,
    hasAlert,
    getAlert,
    simulatePriceDrop,
    markNotificationRead,
    clearNotifications,
    refreshAlerts: loadAlerts,
    refreshNotifications: loadNotifications,
  };
};
