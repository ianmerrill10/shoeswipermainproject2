import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaRocket, FaNewspaper, FaPercent, FaCheck, FaSpinner, FaEnvelope } from 'react-icons/fa';
import { useEmailCapture } from '../../hooks/useEmailCapture';

interface EmailStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onEmailCaptured: (captured: boolean) => void;
}

const EmailStep: React.FC<EmailStepProps> = ({
  onNext,
  onBack,
  onSkip,
  onEmailCaptured,
}) => {
  const { captureEmail, isValidEmail, isSubscribed, email: savedEmail } = useEmailCapture();
  const [email, setEmail] = useState(savedEmail || '');
  const [preferences, setPreferences] = useState({
    priceAlerts: true,
    newReleases: true,
    weeklyDigest: false,
    promotions: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
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
    const result = await captureEmail(email, 'newsletter', undefined, preferences);
    setLoading(false);

    if (result.success) {
      onEmailCaptured(true);
      onNext();
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  // If already subscribed, show success and allow to continue
  if (isSubscribed && savedEmail) {
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
            <FaCheck className="text-green-500 text-3xl" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">You're Already Subscribed!</h2>
          <p className="text-zinc-400 text-sm">
            We'll send alerts to <span className="text-purple-400">{savedEmail}</span>
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
              onEmailCaptured(true);
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
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30"
        >
          <FaEnvelope className="text-white text-2xl" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-black text-white mb-2"
        >
          Never Miss a{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Drop
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-400 text-sm"
        >
          Get alerts for new releases, price drops, and exclusive deals
        </motion.p>
      </div>

      {/* Email Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors"
        />
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </motion.div>

      {/* Preference Options */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2 flex-1 mb-6"
      >
        <button
          type="button"
          onClick={() => togglePreference('priceAlerts')}
          className="w-full bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            preferences.priceAlerts ? 'bg-purple-500/20 text-purple-500' : 'bg-zinc-700 text-zinc-500'
          }`}>
            <FaBell className="text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Price Drop Alerts</p>
            <p className="text-zinc-500 text-xs">Instant notifications when prices drop</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            preferences.priceAlerts ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'
          }`}>
            {preferences.priceAlerts && <FaCheck className="text-white text-xs" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => togglePreference('newReleases')}
          className="w-full bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            preferences.newReleases ? 'bg-purple-500/20 text-purple-500' : 'bg-zinc-700 text-zinc-500'
          }`}>
            <FaRocket className="text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">New Releases</p>
            <p className="text-zinc-500 text-xs">Be first to know about new drops</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            preferences.newReleases ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'
          }`}>
            {preferences.newReleases && <FaCheck className="text-white text-xs" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => togglePreference('weeklyDigest')}
          className="w-full bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            preferences.weeklyDigest ? 'bg-purple-500/20 text-purple-500' : 'bg-zinc-700 text-zinc-500'
          }`}>
            <FaNewspaper className="text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Weekly Digest</p>
            <p className="text-zinc-500 text-xs">Top deals and trending sneakers</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            preferences.weeklyDigest ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'
          }`}>
            {preferences.weeklyDigest && <FaCheck className="text-white text-xs" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => togglePreference('promotions')}
          className="w-full bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            preferences.promotions ? 'bg-purple-500/20 text-purple-500' : 'bg-zinc-700 text-zinc-500'
          }`}>
            <FaPercent className="text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Promotional Offers</p>
            <p className="text-zinc-500 text-xs">Exclusive deals and discounts</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            preferences.promotions ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'
          }`}>
            {preferences.promotions && <FaCheck className="text-white text-xs" />}
          </div>
        </button>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mb-4">
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
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </motion.button>
      </div>

      {/* Skip Link */}
      <button
        onClick={onSkip}
        className="text-zinc-500 text-sm hover:text-zinc-400 transition-colors text-center"
      >
        Skip for now
      </button>
    </motion.div>
  );
};

export default EmailStep;
