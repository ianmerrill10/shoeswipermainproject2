import React, { useState } from 'react';
import { FaTimes, FaAmazon, FaBookmark, FaShare, FaChevronLeft, FaChevronRight, FaCheck, FaBell } from 'react-icons/fa';
import { Shoe } from '../lib/types';
import { getAffiliateUrl, shouldShowPrice, formatPrice } from '../lib/supabaseClient';
import { createAffiliateShareData } from '../lib/deepLinks';
import { useFavorites } from '../hooks/useFavorites';
import { useAnalytics } from '../hooks/useAnalytics';
import PriceAlertButton from './PriceAlertButton';

interface ShoePanelProps {
  shoe: Shoe;
  isOpen: boolean;
  onClose: () => void;
}

const ShoePanel: React.FC<ShoePanelProps> = ({ shoe, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackFavorite, trackShare } = useAnalytics();

  // Generate view angles (in production these would be real image URLs)
  const viewAngles = [
    { label: 'Side', url: shoe.image_url },
    { label: 'Front', url: shoe.image_url },
    { label: 'Back', url: shoe.image_url },
    { label: 'Top', url: shoe.image_url },
    { label: 'Sole', url: shoe.image_url },
  ];

  // Default sizes if none provided
  const sizes = shoe.sizes_available || ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'];

  const handleBuyClick = () => {
    window.open(getAffiliateUrl(shoe.amazon_url), '_blank');
  };

  const handleShare = async () => {
    // Generate smart share data with deep links and affiliate tracking
    const shareData = createAffiliateShareData(shoe, 'share_native');

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
        trackShare(shoe.id, 'native');
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Copy rich share text to clipboard
      navigator.clipboard.writeText(shareData.text);
      trackShare(shoe.id, 'clipboard');
      // Show toast instead of alert
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const handleAddToCloset = async () => {
    const wasAlreadyFavorite = isFavorite(shoe.id);
    const success = await toggleFavorite(shoe.id);
    if (success) {
      trackFavorite(shoe.id, wasAlreadyFavorite ? 'remove' : 'add');
    }
  };

  const isInCloset = isFavorite(shoe.id);

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? viewAngles.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === viewAngles.length - 1 ? 0 : prev + 1));
  };

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
        className={`fixed top-0 left-0 h-full w-full max-w-md bg-zinc-950 z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">3D View</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Model Viewer / Main Image */}
        <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 aspect-square flex items-center justify-center">
          <img
            src={viewAngles[currentImageIndex].url}
            alt={`${shoe.name} - ${viewAngles[currentImageIndex].label}`}
            className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl"
          />

          {/* Navigation arrows */}
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <FaChevronRight />
          </button>

          {/* 3D badge placeholder */}
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            360° VIEW
          </div>
        </div>

        {/* View Angles Gallery */}
        <div className="p-4 border-b border-zinc-800">
          <p className="text-zinc-400 text-sm mb-3">View Angles</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {viewAngles.map((angle, index) => (
              <button
                key={angle.label}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  currentImageIndex === index
                    ? 'border-orange-500'
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <img
                  src={angle.url}
                  alt={angle.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Shoe Details */}
        <div className="p-4 border-b border-zinc-800">
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
            {shoe.brand}
          </span>
          <h3 className="text-xl font-bold text-white mt-2">{shoe.name}</h3>
          {shouldShowPrice(shoe.price) && (
            <p className="text-2xl font-bold text-orange-400 mt-1">{formatPrice(shoe.price)}</p>
          )}
        </div>

        {/* Size Selector */}
        <div className="p-4 border-b border-zinc-800">
          <p className="text-zinc-400 text-sm mb-3">Select Size (US)</p>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-3 rounded-lg font-bold text-sm transition-colors ${
                  selectedSize === size
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="p-4 border-b border-zinc-800">
          <p className="text-zinc-400 text-sm mb-3">Specifications</p>
          <div className="space-y-2">
            {shoe.colorway && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Colorway</span>
                <span className="text-white">{shoe.colorway}</span>
              </div>
            )}
            {shoe.style_code && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Style Code</span>
                <span className="text-white">{shoe.style_code}</span>
              </div>
            )}
            {shoe.release_date && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Release Date</span>
                <span className="text-white">{shoe.release_date}</span>
              </div>
            )}
            {shouldShowPrice(shoe.retail_price) && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Retail</span>
                <span className="text-white">{formatPrice(shoe.retail_price)}</span>
              </div>
            )}
            {shoe.amazon_asin && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">ASIN</span>
                <span className="text-zinc-400 font-mono">{shoe.amazon_asin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {shoe.description && (
          <div className="p-4 border-b border-zinc-800">
            <p className="text-zinc-400 text-sm mb-2">Description</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{shoe.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 space-y-3 pb-8">
          <button
            onClick={handleBuyClick}
            className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 text-base active:scale-95 transition-transform"
          >
            <FaAmazon className="text-2xl" />
            BUY ON AMAZON
          </button>

          {/* Price Alert */}
          <div className="flex justify-center">
            <PriceAlertButton shoe={shoe} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCloset}
              className={`flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                isInCloset
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }`}
            >
              {isInCloset ? <FaCheck /> : <FaBookmark />}
              {isInCloset ? 'In Closet' : 'Add to Closet'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
            >
              <FaShare />
              Share
            </button>
          </div>
        </div>

        {/* Share Success Toast */}
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg z-[60] transition-all duration-300 ${
            showShareToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <FaCheck className="text-xs text-white" />
          </div>
          <span className="font-medium text-sm">Copied with affiliate link!</span>
        </div>
      </div>
    </>
  );
};

export default ShoePanel;
