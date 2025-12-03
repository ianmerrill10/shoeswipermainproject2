import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaAmazon, FaShare, FaTrash, FaArrowLeft, FaBoxOpen } from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import { useSneakers } from '../hooks/useSneakers';
import { useAnalytics } from '../hooks/useAnalytics';
import { getAffiliateUrl } from '../lib/supabaseClient';
import { createAffiliateShareData } from '../lib/deepLinks';
import { Shoe } from '../lib/types';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner, EmptyState } from '../components/LoadingStates';

const ClosetPage: React.FC = memo(() => {
  const navigate = useNavigate();
  const { getFavoriteIds, removeFavorite, loading: favoritesLoading } = useFavorites();
  const { getSneakerById, trackClick } = useSneakers();
  const { trackShoeClick, trackShare, trackFavorite } = useAnalytics();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();

  // Load favorited shoes
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      const favoriteIds = getFavoriteIds();

      if (favoriteIds.length === 0) {
        setShoes([]);
        setLoading(false);
        return;
      }

      const shoePromises = favoriteIds.map(id => getSneakerById(id));
      const results = await Promise.all(shoePromises);
      const validShoes = results.filter((shoe): shoe is Shoe => shoe !== null);
      setShoes(validShoes);
      setLoading(false);
    };

    if (!favoritesLoading) {
      loadFavorites();
    }
  }, [favoritesLoading, getFavoriteIds, getSneakerById]);

  const handleBuyClick = useCallback((shoe: Shoe) => {
    trackClick(shoe.id);
    trackShoeClick(shoe.id);
    window.open(getAffiliateUrl(shoe.amazon_url), '_blank');
  }, [trackClick, trackShoeClick]);

  const handleShare = useCallback(async (shoe: Shoe) => {
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
      showToast('Link copied!', { type: 'success' });
    }
  }, [trackShare, showToast]);

  const handleRemove = useCallback(async (shoe: Shoe) => {
    const success = await removeFavorite(shoe.id);
    if (success) {
      trackFavorite(shoe.id, 'remove');
      setShoes(prev => prev.filter(s => s.id !== shoe.id));
      showToast('Removed from closet', { type: 'info' });
    }
  }, [removeFavorite, trackFavorite, showToast]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleBrowse = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-4 pb-24 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleGoBack}
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-white">My Closet</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message="Loading your closet..." />
        </div>
      </div>
    );
  }

  if (shoes.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-4 pb-24 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleGoBack}
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-white">My Closet</h1>
        </div>

        <EmptyState
          icon={<FaBoxOpen className="text-3xl text-zinc-500" />}
          title="Your closet is empty"
          description="Start swiping and tap the heart to save sneakers you love"
          action={{
            label: 'Browse Sneakers',
            onClick: handleBrowse,
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">My Closet</h1>
            <p className="text-zinc-500 text-sm">{shoes.length} saved sneakers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full">
          <FaHeart className="text-sm" />
          <span className="text-sm font-medium">{shoes.length}</span>
        </div>
      </div>

      {/* Shoe Grid */}
      <div className="grid grid-cols-2 gap-3">
        {shoes.map((shoe) => (
          <div
            key={shoe.id}
            className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gradient-to-b from-zinc-800 to-zinc-900">
              <img
                src={shoe.image_url}
                alt={shoe.name}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(shoe)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <FaTrash className="text-xs" />
              </button>

              {/* Brand Badge */}
              <div className="absolute bottom-2 left-2">
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {shoe.brand}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-white font-bold text-sm line-clamp-1 mb-2">
                {shoe.name}
              </h3>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleBuyClick(shoe)}
                  className="flex-1 bg-white text-black font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs active:scale-95 transition-transform"
                >
                  <FaAmazon />
                  Buy
                </button>
                <button
                  onClick={() => handleShare(shoe)}
                  className="w-10 bg-zinc-800 text-white rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <FaShare className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
      />
    </div>
  );
});

ClosetPage.displayName = 'ClosetPage';

export default ClosetPage;
