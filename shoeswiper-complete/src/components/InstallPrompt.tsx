import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaApple, FaAndroid, FaDesktop, FaShare, FaEllipsisV, FaPlus } from 'react-icons/fa';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallPromptProps {
  /** Delay before showing the prompt (in milliseconds) */
  delay?: number;
  /** Variant of the prompt: 'modal' or 'banner' */
  variant?: 'modal' | 'banner';
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Callback when install is successful */
  onInstall?: () => void;
  /** Callback when prompt is dismissed */
  onDismiss?: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({
  delay = 3000,
  variant = 'banner',
  title = 'Install ShoeSwiper',
  description = 'Add to your home screen for the best experience',
  onInstall,
  onDismiss,
}) => {
  const {
    canInstall,
    isInstalled,
    isIOS,
    isPromptAvailable,
    isDismissed,
    instructions,
    promptInstall,
    dismissPrompt,
  } = usePWAInstall();

  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Show prompt after delay
  useEffect(() => {
    if (!canInstall || isInstalled || isDismissed) {
      return;
    }

    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, isDismissed, delay]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (isPromptAvailable) {
      const installed = await promptInstall();
      if (installed) {
        setShowPrompt(false);
        onInstall?.();
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    dismissPrompt();
    onDismiss?.();
  };

  const getPlatformIcon = () => {
    switch (instructions.platform) {
      case 'ios':
        return <FaApple className="text-xl" />;
      case 'android':
        return <FaAndroid className="text-xl" />;
      default:
        return <FaDesktop className="text-xl" />;
    }
  };

  // Don't render if not installable or already dismissed
  if (!canInstall || isInstalled || isDismissed) {
    return null;
  }

  // iOS Instructions Modal
  if (showIOSInstructions) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 rounded-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center relative">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                aria-label="Close"
              >
                <FaTimes />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaApple className="text-white text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-white">Install on iPhone</h2>
              <p className="text-white/80 text-sm mt-1">Follow these steps to install ShoeSwiper</p>
            </div>

            {/* Steps */}
            <div className="p-6 space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Tap the Share button</span>
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                      <FaShare className="text-blue-500" />
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">Located at the bottom of Safari</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Scroll and tap &quot;Add to Home Screen&quot;</span>
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                      <FaPlus className="text-zinc-400" />
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">In the share menu options</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div className="flex-1">
                  <span className="text-white font-medium">Tap &quot;Add&quot;</span>
                  <p className="text-zinc-400 text-sm mt-1">Confirm to add ShoeSwiper to your home screen</p>
                </div>
              </div>

              {/* Got it button */}
              <button
                onClick={handleDismiss}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl mt-4"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  {getPlatformIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm">{title}</h3>
                  <p className="text-zinc-400 text-xs mt-0.5 truncate">{description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleDismiss}
                    className="w-8 h-8 text-zinc-500 hover:text-zinc-300 flex items-center justify-center"
                    aria-label="Dismiss"
                  >
                    <FaTimes />
                  </button>
                  <button
                    onClick={handleInstall}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors min-w-[44px] min-h-[44px]"
                  >
                    <FaDownload />
                    Install
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Modal variant
  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 rounded-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center relative">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                aria-label="Close"
              >
                <FaTimes />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaDownload className="text-white text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-white/80 text-sm mt-1">{description}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-white text-sm">Quick access from home screen</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-white text-sm">Full-screen experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-white text-sm">Offline access to saved sneakers</span>
                </div>
              </div>

              {/* iOS-specific hint */}
              {isIOS && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                  <FaShare className="text-blue-500 flex-shrink-0" />
                  <p className="text-blue-400 text-xs">
                    Tap the Share button below, then &quot;Add to Home Screen&quot;
                  </p>
                </div>
              )}

              {/* Android-specific hint */}
              {instructions.platform === 'android' && !isPromptAvailable && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                  <FaEllipsisV className="text-blue-500 flex-shrink-0" />
                  <p className="text-blue-400 text-xs">
                    Tap the menu button (⋮), then &quot;Add to Home screen&quot;
                  </p>
                </div>
              )}

              {/* Install Button */}
              <button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 min-h-[56px]"
              >
                <FaDownload />
                {isIOS ? 'Show Me How' : 'Install Now'}
              </button>

              {/* Later link */}
              <button
                onClick={handleDismiss}
                className="w-full text-zinc-500 hover:text-zinc-300 text-sm py-2"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;

// Also export the usePWAInstall hook for manual control
export { usePWAInstall } from '../hooks/usePWAInstall';
