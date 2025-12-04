import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaBell, FaRocket, FaNewspaper, FaPercent, FaCheck, FaSpinner } from 'react-icons/fa';
import { useEmailCapture, CapturedEmail } from '../hooks/useEmailCapture';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: CapturedEmail['source'];
  shoeData?: { id: string; name: string };
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({
  isOpen,
  onClose,
  source,
  shoeData,
  onSuccess,
  title = 'Get Price Drop Alerts',
  subtitle = "We'll email you when prices drop on shoes you're watching",
}) => {
  const { captureEmail, isValidEmail, email: savedEmail, isSubscribed } = useEmailCapture();
  const [email, setEmail] = useState(savedEmail || '');
  const [preferences, setPreferences] = useState({
    priceAlerts: true,
    newReleases: true,
    weeklyDigest: false,
    promotions: false,
  });
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
    const result = await captureEmail(email, source, shoeData, preferences);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  // Already subscribed state
  if (isSubscribed && savedEmail) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          onClick={onClose}
          aria-hidden="true"
        />
        <div 
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-zinc-900 rounded-2xl z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="subscribed-title"
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-green-500 text-2xl" aria-hidden="true" />
            </div>
            <h2 id="subscribed-title" className="text-xl font-bold text-white mb-2">You're Already Subscribed!</h2>
            <p className="text-zinc-400 text-sm mb-4">
              We'll send alerts to <span className="text-orange-400">{savedEmail}</span>
            </p>
            <button
              onClick={onClose}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl"
            >
              Got it!
            </button>
          </div>
        </div>
      </>
    );
  }

  // Success state
  if (success) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" aria-hidden="true" />
        <div 
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-zinc-900 rounded-2xl z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FaCheck className="text-green-500 text-2xl" aria-hidden="true" />
            </div>
            <h2 id="success-title" className="text-xl font-bold text-white mb-2">You're All Set!</h2>
            <p className="text-zinc-400 text-sm">
              We'll notify you when prices drop
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div 
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-zinc-900 rounded-2xl z-50 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-capture-title"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white/80 hover:text-white"
          >
            <FaTimes aria-hidden="true" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaEnvelope className="text-white text-2xl" aria-hidden="true" />
          </div>
          <h2 id="email-capture-title" className="text-xl font-bold text-white">{title}</h2>
          <p className="text-white/80 text-sm mt-1">{subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Shoe Preview */}
          {shoeData && (
            <div className="bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-2xl">👟</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{shoeData.name}</p>
                <p className="text-zinc-500 text-xs">Watching for price drops</p>
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="email-capture-input" className="block text-zinc-400 text-sm mb-2">Email Address</label>
            <input
              id="email-capture-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-xs mt-2" role="alert">{error}</p>
            )}
          </div>

          {/* Preferences */}
          <fieldset className="space-y-2">
            <legend className="text-zinc-400 text-sm">What would you like to receive?</legend>

            <button
              type="button"
              onClick={() => togglePreference('priceAlerts')}
              aria-pressed={preferences.priceAlerts}
              className="w-full bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                preferences.priceAlerts ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-700 text-zinc-500'
              }`}>
                <FaBell className="text-sm" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Price Drop Alerts</p>
                <p className="text-zinc-500 text-xs">Instant notifications when prices drop</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                preferences.priceAlerts ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'
              }`}>
                {preferences.priceAlerts && <FaCheck className="text-white text-xs" aria-hidden="true" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => togglePreference('newReleases')}
              aria-pressed={preferences.newReleases}
              className="w-full bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                preferences.newReleases ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-700 text-zinc-500'
              }`}>
                <FaRocket className="text-sm" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">New Releases</p>
                <p className="text-zinc-500 text-xs">Be first to know about new drops</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                preferences.newReleases ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'
              }`}>
                {preferences.newReleases && <FaCheck className="text-white text-xs" aria-hidden="true" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => togglePreference('weeklyDigest')}
              aria-pressed={preferences.weeklyDigest}
              className="w-full bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                preferences.weeklyDigest ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-700 text-zinc-500'
              }`}>
                <FaNewspaper className="text-sm" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Weekly Digest</p>
                <p className="text-zinc-500 text-xs">Top deals and trending sneakers</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                preferences.weeklyDigest ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'
              }`}>
                {preferences.weeklyDigest && <FaCheck className="text-white text-xs" aria-hidden="true" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => togglePreference('promotions')}
              aria-pressed={preferences.promotions}
              className="w-full bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                preferences.promotions ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-700 text-zinc-500'
              }`}>
                <FaPercent className="text-sm" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Exclusive Deals</p>
                <p className="text-zinc-500 text-xs">Special offers & discounts</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                preferences.promotions ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'
              }`}>
                {preferences.promotions && <FaCheck className="text-white text-xs" aria-hidden="true" />}
              </div>
            </button>
          </fieldset>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" aria-hidden="true" />
                Subscribing...
              </>
            ) : (
              <>
                <FaBell aria-hidden="true" />
                Get Notified
              </>
            )}
          </button>

          {/* Privacy Note */}
          <p className="text-center text-zinc-600 text-xs">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </>
  );
};

export default EmailCaptureModal;
