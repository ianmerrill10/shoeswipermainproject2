import React, { useState } from 'react';
import { FaTimes, FaBell, FaBellSlash, FaTag, FaRocket, FaBox, FaPercent, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const {
    isSupported,
    permission,
    settings,
    loading,
    isEnabled,
    requestPermission,
    disablePush,
    updateSettings,
    notifyPriceDrop,
  } = usePushNotifications();

  const [enabling, setEnabling] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleEnableNotifications = async () => {
    setEnabling(true);
    try {
      await requestPermission();
    } finally {
      setEnabling(false);
    }
  };

  const handleDisableNotifications = async () => {
    await disablePush();
  };

  const handleTestNotification = async () => {
    const success = await notifyPriceDrop(
      'Air Jordan 1 Retro High OG',
      189.99,
      149.99,
      'https://amazon.com/dp/test',
      'test-shoe-id'
    );
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const toggleSetting = (key: 'priceDrops' | 'newReleases' | 'restocks' | 'promotions') => {
    updateSettings({ [key]: !settings[key] });
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-zinc-950 z-50 rounded-t-3xl transform transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <FaBell className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-zinc-500 text-xs">Never miss a deal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Not Supported Warning */}
          {!isSupported && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-medium text-sm">Notifications not supported</p>
                <p className="text-yellow-500/70 text-xs mt-1">
                  Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari on a newer device.
                </p>
              </div>
            </div>
          )}

          {/* Permission Denied Warning */}
          {isSupported && permission === 'denied' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <FaBellSlash className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium text-sm">Notifications blocked</p>
                <p className="text-red-400/70 text-xs mt-1">
                  You've blocked notifications for ShoeSwiper. To enable them, update your browser settings and allow notifications for this site.
                </p>
              </div>
            </div>
          )}

          {/* Main Toggle */}
          {isSupported && permission !== 'denied' && (
            <div className="bg-zinc-900 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isEnabled ? 'bg-green-500/20' : 'bg-zinc-800'
                  }`}>
                    {isEnabled ? (
                      <FaBell className="text-green-500 text-lg" />
                    ) : (
                      <FaBellSlash className="text-zinc-500 text-lg" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold">Push Notifications</p>
                    <p className="text-zinc-500 text-sm">
                      {isEnabled ? 'Enabled' : 'Get alerts for price drops'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={isEnabled ? handleDisableNotifications : handleEnableNotifications}
                  disabled={enabling}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                    isEnabled
                      ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  } disabled:opacity-50`}
                >
                  {enabling ? 'Enabling...' : isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          )}

          {/* Notification Types */}
          {isEnabled && (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm font-medium">Notification Types</p>

              {/* Price Drops */}
              <button
                onClick={() => toggleSetting('priceDrops')}
                className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    settings.priceDrops ? 'bg-green-500/20' : 'bg-zinc-800'
                  }`}>
                    <FaTag className={settings.priceDrops ? 'text-green-500' : 'text-zinc-500'} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Price Drops</p>
                    <p className="text-zinc-500 text-xs">When shoes you're watching drop in price</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors ${
                  settings.priceDrops ? 'bg-green-500' : 'bg-zinc-700'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${
                    settings.priceDrops ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </button>

              {/* New Releases */}
              <button
                onClick={() => toggleSetting('newReleases')}
                className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    settings.newReleases ? 'bg-green-500/20' : 'bg-zinc-800'
                  }`}>
                    <FaRocket className={settings.newReleases ? 'text-green-500' : 'text-zinc-500'} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">New Releases</p>
                    <p className="text-zinc-500 text-xs">Hot new sneaker drops from your favorite brands</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors ${
                  settings.newReleases ? 'bg-green-500' : 'bg-zinc-700'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${
                    settings.newReleases ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </button>

              {/* Restocks */}
              <button
                onClick={() => toggleSetting('restocks')}
                className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    settings.restocks ? 'bg-green-500/20' : 'bg-zinc-800'
                  }`}>
                    <FaBox className={settings.restocks ? 'text-green-500' : 'text-zinc-500'} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Restocks</p>
                    <p className="text-zinc-500 text-xs">When sold-out sneakers become available again</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors ${
                  settings.restocks ? 'bg-green-500' : 'bg-zinc-700'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${
                    settings.restocks ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </button>

              {/* Promotions */}
              <button
                onClick={() => toggleSetting('promotions')}
                className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    settings.promotions ? 'bg-green-500/20' : 'bg-zinc-800'
                  }`}>
                    <FaPercent className={settings.promotions ? 'text-green-500' : 'text-zinc-500'} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Promotions</p>
                    <p className="text-zinc-500 text-xs">Special deals and exclusive offers</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors ${
                  settings.promotions ? 'bg-green-500' : 'bg-zinc-700'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${
                    settings.promotions ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </button>
            </div>
          )}

          {/* Test Notification */}
          {isEnabled && (
            <div className="pt-2">
              <button
                onClick={handleTestNotification}
                disabled={testSent}
                className="w-full bg-zinc-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {testSent ? (
                  <>
                    <FaCheck className="text-green-500" />
                    Test notification sent!
                  </>
                ) : (
                  <>
                    <FaBell />
                    Send Test Notification
                  </>
                )}
              </button>
              <p className="text-center text-zinc-600 text-xs mt-2">
                Make sure notifications are allowed in your browser
              </p>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center pt-4 pb-safe">
            <p className="text-zinc-600 text-xs">
              You can change these settings anytime from your profile
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationSettings;
