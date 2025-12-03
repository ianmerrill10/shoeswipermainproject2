import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaSpinner } from 'react-icons/fa';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface NotificationStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onPushEnabled: (enabled: boolean) => void;
}

const NotificationStep: React.FC<NotificationStepProps> = ({
  onNext,
  onBack,
  onSkip,
  onPushEnabled,
}) => {
  const { requestPermission, isSupported, isEnabled, permission } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleEnableNotifications = async () => {
    setLoading(true);
    setRequested(true);
    const success = await requestPermission();
    setLoading(false);
    onPushEnabled(success);
    onNext();
  };

  const handleSkip = () => {
    onPushEnabled(false);
    onSkip();
  };

  // If already enabled, show success state
  if (isEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col min-h-full px-6 py-8"
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
          >
            <FaBell className="text-green-500 text-3xl" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Notifications Enabled!</h2>
          <p className="text-zinc-400 text-sm">
            You'll get instant alerts for price drops and new releases
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-xl"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onPushEnabled(true);
              onNext();
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl"
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // If permission denied, show alternative state
  if (permission === 'denied') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col min-h-full px-6 py-8"
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6"
          >
            <FaBell className="text-zinc-500 text-3xl" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Notifications Blocked</h2>
          <p className="text-zinc-400 text-sm max-w-xs">
            You can enable notifications later in your browser settings
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-xl"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onPushEnabled(false);
              onNext();
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl"
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-full px-6 py-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-black text-white mb-2"
        >
          Stay in the{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Loop
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-sm"
        >
          Enable notifications for instant price drop alerts
        </motion.p>
      </div>

      {/* Phone Mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex items-center justify-center mb-8"
      >
        <div className="relative w-64 h-80">
          {/* Phone Frame */}
          <div className="absolute inset-0 bg-zinc-800 rounded-3xl border-4 border-zinc-700 overflow-hidden shadow-2xl">
            {/* Status Bar */}
            <div className="h-8 bg-zinc-900 flex items-center justify-between px-4">
              <span className="text-white text-xs">9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 bg-white/50 rounded-sm" />
              </div>
            </div>

            {/* Notification Preview */}
            <div className="p-4 space-y-3">
              {/* Notification 1 */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👟</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold">Price Drop Alert!</p>
                    <p className="text-zinc-400 text-[10px] truncate">Jordan 1 Retro now $180 (was $220)</p>
                  </div>
                </div>
              </motion.div>

              {/* Notification 2 */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-zinc-700/50 rounded-xl p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🔥</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold">New Drop!</p>
                    <p className="text-zinc-400 text-[10px] truncate">Nike Dunk Low just released</p>
                  </div>
                </div>
              </motion.div>

              {/* Notification 3 */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-zinc-700/50 rounded-xl p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">💰</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold">Back in Stock!</p>
                    <p className="text-zinc-400 text-[10px] truncate">New Balance 550 available now</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Not Supported Message */}
      {!isSupported && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-800/50 rounded-xl p-4 mb-4 text-center"
        >
          <p className="text-zinc-400 text-sm">
            Push notifications are not supported on this browser/device
          </p>
        </motion.div>
      )}

      {/* Enable Button */}
      {isSupported && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEnableNotifications}
          disabled={loading || requested}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mb-4 shadow-lg shadow-purple-500/30"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Enabling...
            </>
          ) : (
            <>
              <FaBell />
              Enable Notifications
            </>
          )}
        </motion.button>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-xl"
        >
          Back
        </motion.button>
        {!isSupported && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onPushEnabled(false);
              onNext();
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl"
          >
            Continue
          </motion.button>
        )}
      </div>

      {/* Skip Link */}
      {isSupported && (
        <button
          onClick={handleSkip}
          className="text-zinc-500 text-sm hover:text-zinc-400 transition-colors text-center"
        >
          Maybe later
        </button>
      )}
    </motion.div>
  );
};

export default NotificationStep;
