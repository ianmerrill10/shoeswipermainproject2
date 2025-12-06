import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaGift, FaBolt, FaArrowRight } from 'react-icons/fa';
import { useEmailCapture } from '../hooks/useEmailCapture';
import { captureEmailSecure } from '../lib/apiService';

interface ExitIntentPopupProps {
  /** Delay before popup can show (prevents immediate popup) */
  delayMs?: number;
  /** How often to show (days between shows) */
  frequencyDays?: number;
}

const STORAGE_KEY = 'shoeswiper_exit_intent_shown';

/**
 * Exit Intent Popup - Shows when user is about to leave the page
 * Captures emails for marketing with a compelling offer
 */
const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
  delayMs = 5000,
  frequencyDays = 7,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [canShow, setCanShow] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { isSubscribed } = useEmailCapture();

  // Check if we should show based on frequency
  useEffect(() => {
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (lastShown) {
      const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSince < frequencyDays) {
        return; // Don't enable if shown recently
      }
    }

    // Don't show if already subscribed
    if (isSubscribed) return;

    // Enable after delay
    const timer = setTimeout(() => setCanShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, frequencyDays, isSubscribed]);

  // Detect exit intent
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves toward top of page (exit intent)
    if (e.clientY <= 5 && canShow && !isVisible && !isSubscribed) {
      setIsVisible(true);
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  }, [canShow, isVisible, isSubscribed]);

  // Mobile: detect back button or scroll up intent
  const handleBeforeUnload = useCallback((_e: BeforeUnloadEvent) => {
    if (canShow && !isSubscribed) {
      setIsVisible(true);
      // Don't actually prevent unload, just show popup
    }
  }, [canShow, isSubscribed]);

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleMouseLeave, handleBeforeUnload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);

    // Use secure API with built-in validation and rate limiting
    const result = await captureEmailSecure({
      email: email.trim().toLowerCase(),
      source: 'exit_intent',
      preferences: {
        priceAlerts: true,
        newReleases: true,
        weeklyDigest: true,
        promotions: true,
      },
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setIsVisible(false), 2500);
    } else if (result.errors) {
      // Validation errors
      setError(result.errors[0]?.message || 'Invalid email');
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-zinc-900 rounded-2xl z-[101] overflow-hidden shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white z-10 transition-colors"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {success ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaGift className="text-green-500 text-3xl animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">You're In! 🎉</h2>
            <p className="text-zinc-400">
              Check your inbox for exclusive deals and early access to new drops.
            </p>
          </div>
        ) : (
          <>
            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-8 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
                  <FaBolt className="text-yellow-300" />
                  <span className="text-white text-sm font-bold">WAIT! EXCLUSIVE OFFER</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                  Get 10% Off Your First Purchase
                </h2>
                <p className="text-white/90">
                  Plus early access to limited drops & price alerts
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for the deal..."
                  className="w-full bg-zinc-800 border-2 border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-4 text-white text-lg placeholder-zinc-500 outline-none transition-colors"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-lg transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    CLAIM MY 10% OFF
                    <FaArrowRight />
                  </>
                )}
              </button>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="text-green-500">✓</span> Price drop alerts
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="text-green-500">✓</span> Early access
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="text-green-500">✓</span> Exclusive deals
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="text-green-500">✓</span> No spam, ever
                </div>
              </div>

              <p className="text-center text-zinc-600 text-xs pt-2">
                Unsubscribe anytime. We respect your inbox.
              </p>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default ExitIntentPopup;
