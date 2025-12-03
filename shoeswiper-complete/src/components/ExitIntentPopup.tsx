import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEnvelope, FaBell, FaGift, FaCheck, FaSpinner } from 'react-icons/fa';
import { useEmailCapture } from '../hooks/useEmailCapture';

interface ExitIntentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDismissPermanently?: () => void;
  onSuccess?: () => void;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
  isOpen,
  onClose,
  onDismissPermanently,
  onSuccess,
}) => {
  const { captureEmail, isValidEmail, email: savedEmail, isSubscribed } = useEmailCapture();
  const [email, setEmail] = useState(savedEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await captureEmail(email, 'exit_intent', undefined, {
      priceAlerts: true,
      newReleases: true,
      weeklyDigest: true,
      promotions: true,
    });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  if (!isOpen) return null;

  // Already subscribed - just close
  if (isSubscribed && savedEmail) {
    onClose();
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-zinc-900 rounded-3xl z-[101] overflow-hidden shadow-2xl"
          >
            {/* Success State */}
            {success ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FaCheck className="text-green-500 text-3xl" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">You're In! 🎉</h2>
                <p className="text-zinc-400">Check your inbox for exclusive deals</p>
              </div>
            ) : (
              <>
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-8 text-center">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/30 transition-all"
                  >
                    <FaTimes className="text-lg" />
                  </button>

                  {/* Gift Icon */}
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <FaGift className="text-white text-4xl" />
                  </motion.div>

                  <h2 className="text-2xl font-black text-white mb-2">
                    Wait! Don't Miss Out! 🔥
                  </h2>
                  <p className="text-white/90 text-sm">
                    Get exclusive deals on the hottest sneakers delivered to your inbox
                  </p>
                </div>

                {/* Benefits List */}
                <div className="p-6 space-y-3 bg-zinc-900/50">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <FaBell className="text-orange-500 text-sm" />
                    </div>
                    <span className="text-sm">Instant price drop alerts</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-500">🔥</span>
                    </div>
                    <span className="text-sm">Early access to new releases</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-500">💰</span>
                    </div>
                    <span className="text-sm">Exclusive member-only deals</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/25 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <FaGift />
                        Get Exclusive Deals
                      </>
                    )}
                  </button>

                  {/* No Thanks Link */}
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
                    >
                      Maybe later
                    </button>
                    <span className="text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={onDismissPermanently}
                      className="text-zinc-600 text-sm hover:text-zinc-400 transition-colors"
                    >
                      Don't show again
                    </button>
                  </div>

                  {/* Privacy Note */}
                  <p className="text-center text-zinc-600 text-xs">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
