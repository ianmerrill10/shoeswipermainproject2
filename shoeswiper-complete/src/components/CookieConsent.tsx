import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCookieBite, FaTimes, FaCog } from 'react-icons/fa';

const CONSENT_KEY = 'shoeswiper_cookie_consent';
const CONSENT_VERSION = '1.0'; // Increment to re-show banner when policy changes

interface ConsentState {
  version: string;
  necessary: boolean;    // Always true - required for app to function
  analytics: boolean;    // Google Analytics, usage tracking
  marketing: boolean;    // Affiliate tracking, personalization
  timestamp: string;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    // Check if user has already consented
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const consent: ConsentState = JSON.parse(stored);
        // Show banner again if consent version changed
        if (consent.version !== CONSENT_VERSION) {
          setShowBanner(true);
        }
      } catch {
        setShowBanner(true);
      }
    } else {
      // First visit - show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const consent: ConsentState = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
    setShowSettings(false);

    // Dispatch event for analytics scripts to check
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consent }));
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectAll = () => {
    saveConsent(false, false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences.analytics, preferences.marketing);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
      >
        <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
          {!showSettings ? (
            // Main Banner
            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCookieBite className="text-orange-500 text-lg" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">We Value Your Privacy</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    We use cookies to improve your experience, analyze site traffic, and personalize content.
                    By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                    <Link to="/privacy" className="text-orange-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <FaCog className="text-xs" /> Customize
                </button>
              </div>
            </div>
          ) : (
            // Settings Panel
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Cookie Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"
                  aria-label="Close settings"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                {/* Necessary Cookies - Always On */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div>
                    <p className="text-white text-sm font-medium">Necessary Cookies</p>
                    <p className="text-zinc-500 text-xs">Required for the app to function</p>
                  </div>
                  <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
                    Always On
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div>
                    <p className="text-white text-sm font-medium">Analytics Cookies</p>
                    <p className="text-zinc-500 text-xs">Help us understand how you use the app</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.analytics ? 'bg-orange-500' : 'bg-zinc-700'
                    }`}
                    role="switch"
                    aria-checked={preferences.analytics}
                    aria-label="Toggle analytics cookies"
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.analytics ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div>
                    <p className="text-white text-sm font-medium">Marketing Cookies</p>
                    <p className="text-zinc-500 text-xs">Personalized recommendations & affiliate tracking</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.marketing ? 'bg-orange-500' : 'bg-zinc-700'
                    }`}
                    role="switch"
                    aria-checked={preferences.marketing}
                    aria-label="Toggle marketing cookies"
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.marketing ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* CCPA Notice */}
              <p className="text-zinc-500 text-[10px] mb-4">
                California residents: Disabling &quot;Marketing Cookies&quot; opts you out of the sale/sharing of your
                personal information under the CCPA.{' '}
                <Link to="/privacy" className="text-orange-400 hover:underline">
                  Learn more
                </Link>
              </p>

              <button
                onClick={handleSavePreferences}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-sm transition-colors"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
