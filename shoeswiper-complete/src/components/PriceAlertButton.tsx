import React, { useState } from 'react';
import { FaBell, FaBellSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useEmailCapture } from '../hooks/useEmailCapture';
import { Shoe } from '../lib/types';
import EmailCaptureModal from './EmailCaptureModal';

interface PriceAlertButtonProps {
  shoe: Shoe;
  variant?: 'button' | 'icon';
  onAlertSet?: (targetPrice: number) => void;
}

const PriceAlertButton: React.FC<PriceAlertButtonProps> = ({
  shoe,
  variant = 'button',
  onAlertSet,
}) => {
  const { hasAlert, getAlert, addAlert, removeAlert } = usePriceAlerts();
  const { isSubscribed } = useEmailCapture();
  const [showModal, setShowModal] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const existingAlert = getAlert(shoe.id);
  const isAlertActive = hasAlert(shoe.id);

  const suggestedPrices = shoe.price
    ? [
        { label: '10% off', value: Math.floor(shoe.price * 0.9) },
        { label: '20% off', value: Math.floor(shoe.price * 0.8) },
        { label: '30% off', value: Math.floor(shoe.price * 0.7) },
      ]
    : [
        { label: '$100', value: 100 },
        { label: '$150', value: 150 },
        { label: '$200', value: 200 },
      ];

  const handleSetAlert = async () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    setSaving(true);
    const success = await addAlert(shoe, price);
    setSaving(false);

    if (success) {
      setShowSuccess(true);
      onAlertSet?.(price);

      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);

        // Show email capture if not already subscribed
        if (!isSubscribed) {
          setTimeout(() => setShowEmailCapture(true), 300);
        }
      }, 1500);
    }
  };

  const handleRemoveAlert = async () => {
    await removeAlert(shoe.id);
  };

  const handleSuggestedPrice = (price: number) => {
    setTargetPrice(price.toString());
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => isAlertActive ? handleRemoveAlert() : setShowModal(true)}
          className={`w-11 h-11 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-all ${
            isAlertActive ? 'bg-yellow-500' : 'bg-black/30'
          }`}
        >
          {isAlertActive ? (
            <FaBell className="text-xl text-white" />
          ) : (
            <FaBell className="text-xl text-white" />
          )}
        </button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="w-full max-w-md bg-zinc-900 rounded-t-2xl p-6 animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Set Price Alert</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Shoe Preview */}
              <div className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3 mb-4">
                <img
                  src={shoe.image_url}
                  alt={shoe.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-xs text-orange-500 font-bold uppercase">{shoe.brand}</p>
                  <p className="text-white font-bold text-sm line-clamp-1">{shoe.name}</p>
                  {shoe.price && (
                    <p className="text-zinc-400 text-sm">Current: ${shoe.price}</p>
                  )}
                </div>
              </div>

              {/* Price Input */}
              <div className="mb-4">
                <label className="text-zinc-400 text-sm mb-2 block">
                  Alert me when price drops to:
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">$</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="Enter target price"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white text-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Suggested Prices */}
              <div className="mb-6">
                <p className="text-zinc-500 text-xs mb-2">Quick select:</p>
                <div className="flex gap-2">
                  {suggestedPrices.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => handleSuggestedPrice(suggestion.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        targetPrice === suggestion.value.toString()
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set Alert Button */}
              <button
                onClick={handleSetAlert}
                disabled={saving || !targetPrice}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  showSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white active:scale-95'
                } ${(!targetPrice || saving) && 'opacity-50 cursor-not-allowed'}`}
              >
                {showSuccess ? (
                  <>
                    <FaCheck /> Alert Set!
                  </>
                ) : saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting...
                  </>
                ) : (
                  <>
                    <FaBell /> Set Price Alert
                  </>
                )}
              </button>

              <p className="text-center text-zinc-500 text-xs mt-3">
                We'll notify you when the price drops
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Button variant
  return (
    <>
      {isAlertActive ? (
        <button
          onClick={handleRemoveAlert}
          className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 font-medium py-2 px-4 rounded-lg hover:bg-yellow-500/30 transition-colors"
        >
          <FaBell />
          <span className="text-sm">Alert: ${existingAlert?.targetPrice}</span>
          <FaBellSlash className="text-xs opacity-70" />
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <FaBell />
          <span className="text-sm">Set Price Alert</span>
        </button>
      )}

      {/* Modal - same as icon variant */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="w-full max-w-md bg-zinc-900 rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Set Price Alert</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400"
              >
                <FaTimes />
              </button>
            </div>

            {/* Shoe Preview */}
            <div className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3 mb-4">
              <img
                src={shoe.image_url}
                alt={shoe.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-xs text-orange-500 font-bold uppercase">{shoe.brand}</p>
                <p className="text-white font-bold text-sm line-clamp-1">{shoe.name}</p>
                {shoe.price && (
                  <p className="text-zinc-400 text-sm">Current: ${shoe.price}</p>
                )}
              </div>
            </div>

            {/* Price Input */}
            <div className="mb-4">
              <label className="text-zinc-400 text-sm mb-2 block">
                Alert me when price drops to:
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">$</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Enter target price"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white text-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Suggested Prices */}
            <div className="mb-6">
              <p className="text-zinc-500 text-xs mb-2">Quick select:</p>
              <div className="flex gap-2">
                {suggestedPrices.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    onClick={() => handleSuggestedPrice(suggestion.value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      targetPrice === suggestion.value.toString()
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Set Alert Button */}
            <button
              onClick={handleSetAlert}
              disabled={saving || !targetPrice}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                showSuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white active:scale-95'
              } ${(!targetPrice || saving) && 'opacity-50 cursor-not-allowed'}`}
            >
              {showSuccess ? (
                <>
                  <FaCheck /> Alert Set!
                </>
              ) : saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting...
                </>
              ) : (
                <>
                  <FaBell /> Set Price Alert
                </>
              )}
            </button>

            <p className="text-center text-zinc-500 text-xs mt-3">
              We'll notify you when the price drops
            </p>
          </div>
        </div>
      )}

      {/* Email Capture Modal - shows after setting alert if not subscribed */}
      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        source="price_alert"
        shoeData={{ id: shoe.id, name: shoe.name }}
        title="Get Price Alerts via Email"
        subtitle="Never miss a deal - we'll email you when prices drop"
      />
    </>
  );
};

export default PriceAlertButton;
