import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaAmazon, FaShare, FaTrash, FaArrowLeft, FaBoxOpen } from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import { useSneakers } from '../hooks/useSneakers';
import { useAnalytics } from '../hooks/useAnalytics';
import { getAffiliateUrl } from '../lib/supabaseClient';
import { createAffiliateShareData } from '../lib/deepLinks';
import { Shoe } from '../lib/types';

const ClosetPage: React.FC = () => {
  const navigate = useNavigate();
  const { getFavoriteIds, removeFavorite, loading: favoritesLoading } = useFavorites();
  const { getSneakerById, trackClick } = useSneakers();
  const { trackShoeClick, trackShare, trackFavorite } = useAnalytics();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState<string | null>(null);

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

  const handleBuyClick = (shoe: Shoe) => {
    trackClick(shoe.id);
    trackShoeClick(shoe.id);
    window.open(getAffiliateUrl(shoe.amazon_url), '_blank');
  };

  const handleShare = async (shoe: Shoe) => {
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
      showToastMessage('Link copied!');
    }
  };

  const handleRemove = async (shoe: Shoe) => {
    const success = await removeFavorite(shoe.id);
    if (success) {
      trackFavorite(shoe.id, 'remove');
      setShoes(prev => prev.filter(s => s.id !== shoe.id));
      showToastMessage('Removed from closet');
    }
  };

  const showToastMessage = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 2000);
  };

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-4 pb-24 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white"
          >
            <FaArrowLeft aria-hidden="true" />
          </button>
          <h1 className="text-xl font-bold text-white">My Closet</h1>
        </div>
        <div className="flex items-center justify-center h-64" role="status" aria-label="Loading closet">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (shoes.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-4 pb-24 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white"
          >
            <FaArrowLeft aria-hidden="true" />
          </button>
          <h1 className="text-xl font-bold text-white">My Closet</h1>
        </div>

        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <FaBoxOpen className="text-3xl text-zinc-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your closet is empty</h2>
          <p className="text-zinc-400 mb-6 max-w-xs">
            Start swiping and tap the heart to save sneakers you love
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl active:scale-95 transition-transform"
          >
            Browse Sneakers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-4 pb-24 px-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white"
          >
            <FaArrowLeft aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">My Closet</h1>
            <p className="text-zinc-500 text-sm">{shoes.length} saved sneakers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full" aria-label={`${shoes.length} favorites`}>
          <FaHeart className="text-sm" aria-hidden="true" />
          <span className="text-sm font-medium">{shoes.length}</span>
        </div>
      </header>

      {/* Shoe Grid */}
      <section className="grid grid-cols-2 gap-3" role="list" aria-label="Saved sneakers">
        {shoes.map((shoe) => (
          <article
            key={shoe.id}
            className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gradient-to-b from-zinc-800 to-zinc-900">
              <img
                src={shoe.image_url}
                alt={`${shoe.brand} ${shoe.name}`}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(shoe)}
                aria-label={`Remove ${shoe.name} from closet`}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <FaTrash className="text-xs" aria-hidden="true" />
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
                  aria-label={`Buy ${shoe.name} on Amazon`}
                  className="flex-1 bg-white text-black font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs active:scale-95 transition-transform"
                >
                  <FaAmazon aria-hidden="true" />
                  Buy
                </button>
                <button
                  onClick={() => handleShare(shoe)}
                  aria-label={`Share ${shoe.name}`}
                  className="w-10 bg-zinc-800 text-white rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <FaShare className="text-xs" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 transition-all duration-300 ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="text-sm font-medium">{showToast}</span>
      </div>
    </div>
  );
};

export default ClosetPage;
