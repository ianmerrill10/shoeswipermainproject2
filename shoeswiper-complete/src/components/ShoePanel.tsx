// ============================================
// ShoePanel.tsx - 3D View / 360° Viewer Component
// ============================================
// Now with full 3D model support and AI generation!
// ============================================

import React, { useState, Suspense, lazy } from 'react';
import { FaTimes, FaAmazon, FaBookmark, FaShare, FaCheck, FaCube, FaSpinner } from 'react-icons/fa';
import { Shoe } from '../lib/types';
import { getAffiliateUrl, shouldShowPrice, formatPrice } from '../lib/supabaseClient';
import { createAffiliateShareData } from '../lib/deepLinks';
import { useFavorites } from '../hooks/useFavorites';
import { useAnalytics } from '../hooks/useAnalytics';
import { useShoe3D } from '../hooks/useShoe3D';
import PriceAlertButton from './PriceAlertButton';
import { MultiAngleViewer, generateViewAngles } from './3d/MultiAngleViewer';

// Lazy load the 3D viewer to reduce initial bundle size
const ShoeModel3D = lazy(() => import('./3d/ShoeModel3D').then(m => ({ default: m.ShoeModel3D })));

interface ShoePanelProps {
  shoe: Shoe;
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = '3d' | 'photos';

const ShoePanel: React.FC<ShoePanelProps> = ({ shoe, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('photos');
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackFavorite, trackShare } = useAnalytics();

  // 3D model state
  const {
    status: model3DStatus,
    isGenerating,
    generate3DModel,
    hasModel,
    modelUrl,
  } = useShoe3D(shoe.id, shoe.image_url, shoe.name);

  // Generate view angles from shoe data or create from single image
  const viewAngles = shoe.media?.thumbnail_angles?.length
    ? shoe.media.thumbnail_angles.map((url, i) => ({
        label: ['Side', 'Front', 'Back', 'Top', 'Sole'][i] || `Angle ${i + 1}`,
        url,
      }))
    : generateViewAngles(shoe.image_url, shoe.name);

  // Default sizes if none provided
  const sizes = shoe.sizes_available || ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'];

  // Check if shoe has 3D model available
  const has3DModel = hasModel || (shoe.media?.has_3d_model && shoe.media?.model_url);
  const activeModelUrl = modelUrl || shoe.media?.model_url;

  const handleBuyClick = () => {
    window.open(getAffiliateUrl(shoe.amazon_url), '_blank');
  };

  const handleShare = async () => {
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
        if (import.meta.env.DEV) console.warn('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      trackShare(shoe.id, 'clipboard');
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

  const handleGenerate3D = async () => {
    await generate3DModel();
    if (!model3DStatus.error) {
      setViewMode('3d');
    }
  };

  const isInCloset = isFavorite(shoe.id);

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
          <h2 className="text-lg font-bold text-white">
            {viewMode === '3d' ? '3D Model' : '360° View'}
          </h2>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            {has3DModel && (
              <div className="flex bg-zinc-800 rounded-full p-1">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    viewMode === '3d'
                      ? 'bg-orange-500 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  3D
                </button>
                <button
                  onClick={() => setViewMode('photos')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    viewMode === 'photos'
                      ? 'bg-orange-500 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Photos
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* ============================================
            3D MODEL / MULTI-ANGLE VIEWER
            ============================================ */}
        <div className="relative aspect-square">
          {viewMode === '3d' && has3DModel && activeModelUrl ? (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <div className="flex flex-col items-center gap-2">
                    <FaSpinner className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-zinc-400 text-sm">Loading 3D model...</p>
                  </div>
                </div>
              }
            >
              <ShoeModel3D
                modelUrl={activeModelUrl}
                autoRotate={true}
                enableZoom={true}
                showShadow={true}
              />
            </Suspense>
          ) : (
            <MultiAngleViewer
              angles={viewAngles}
              shoeName={shoe.name}
              autoPlay={false}
              showThumbnails={true}
            />
          )}

          {/* Generate 3D Button (when no model exists) */}
          {!has3DModel && viewMode === 'photos' && (
            <button
              onClick={handleGenerate3D}
              disabled={isGenerating}
              className="absolute bottom-20 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Generating... {model3DStatus.progress}%
                </>
              ) : (
                <>
                  <FaCube />
                  Generate 3D Model
                </>
              )}
            </button>
          )}

          {/* Generation Error */}
          {model3DStatus.error && (
            <div className="absolute bottom-20 left-4 right-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{model3DStatus.error}</p>
            </div>
          )}
        </div>

        {/* Shoe Details */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                {shoe.brand}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{shoe.name}</h3>
              {shoe.colorway && (
                <p className="text-zinc-500 text-sm mt-1">{shoe.colorway}</p>
              )}
            </div>
            {shouldShowPrice(shoe.price) && (
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-400">{formatPrice(shoe.price)}</p>
                {shoe.retail_price && shoe.price && shoe.price < shoe.retail_price && (
                  <p className="text-sm text-zinc-500 line-through">{formatPrice(shoe.retail_price)}</p>
                )}
              </div>
            )}
          </div>

          {/* Style Tags */}
          {shoe.style_tags && shoe.style_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {shoe.style_tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
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
            {has3DModel && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">3D Model</span>
                <span className="text-green-400 flex items-center gap-1">
                  <FaCube className="text-xs" /> Available
                </span>
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
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 text-base active:scale-95 hover:scale-[1.02] transition-transform"
          >
            <FaAmazon className="text-2xl" />
            BUY ON AMAZON
          </button>
          <div className="flex items-center justify-center gap-1 mt-2">
            <FaCheck className="text-xs text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Prime eligible</span>
          </div>

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
