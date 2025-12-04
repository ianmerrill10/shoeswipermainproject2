import React, { useState } from 'react';
import { FaTimes, FaFire, FaBolt, FaGift, FaArrowRight, FaCheck, FaSpinner } from 'react-icons/fa';
import { useEmailCapture } from '../hooks/useEmailCapture';
import { motion, AnimatePresence } from 'framer-motion';

interface ExitIntentPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ isOpen, onClose }) => {
  const { captureEmail, isValidEmail, isSubscribed, email: savedEmail } = useEmailCapture();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
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
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  // Skip if already subscribed
  if (isSubscribed && savedEmail) {
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-[60]"
          >
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-3xl overflow-hidden shadow-2xl border border-zinc-700/50">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10"
                aria-label="Close"
              >
                <FaTimes />
              </button>

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
                  <h2 className="text-2xl font-bold text-white mb-2">You're In!</h2>
                  <p className="text-zinc-400">
                    Check your inbox for exclusive deals
                  </p>
                </div>
              ) : (
                <>
                  {/* Header with fire animation */}
                  <div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 p-6 pb-8">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

                    <div className="relative text-center">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4"
                      >
                        <FaFire className="text-yellow-300" />
                        <span className="text-white text-sm font-medium">Wait! Don't miss out</span>
                      </motion.div>

                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Get 10% Off Your First Order
                      </h2>
                      <p className="text-white/80 text-sm md:text-base">
                        Plus exclusive access to price drops & new releases
                      </p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="px-6 -mt-4">
                    <div className="bg-zinc-800/80 backdrop-blur rounded-2xl p-4 border border-zinc-700/50">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FaBolt className="text-orange-500" />
                          </div>
                          <p className="text-white text-xs font-medium">Price Alerts</p>
                        </div>
                        <div>
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FaFire className="text-purple-500" />
                          </div>
                          <p className="text-white text-xs font-medium">Early Access</p>
                        </div>
                        <div>
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FaGift className="text-green-500" />
                          </div>
                          <p className="text-white text-xs font-medium">Exclusive Deals</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 pt-4">
                    <div className="relative mb-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email for 10% off"
                        className="w-full bg-zinc-800 border-2 border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-4 pr-12 text-white placeholder-zinc-500 outline-none transition-colors"
                        autoFocus
                      />
                      {error && (
                        <p className="text-red-400 text-xs mt-2">{error}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          Claim My 10% Off
                          <FaArrowRight />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full text-zinc-500 hover:text-zinc-400 text-sm mt-4 py-2 transition-colors"
                    >
                      No thanks, I'll pay full price
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
