import React, { useEffect, useState, useRef } from 'react';
import { FaHeart, FaShare, FaBookmark, FaAmazon, FaMusic, FaCheck, FaBell } from 'react-icons/fa';
import { useSneakers } from '../hooks/useSneakers';
import { useAnalytics } from '../hooks/useAnalytics';
import { useFavorites } from '../hooks/useFavorites';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { getAffiliateUrl, shouldShowPrice, formatPrice } from '../lib/supabaseClient';
import { createAffiliateShareData } from '../lib/deepLinks';
import { Shoe } from '../lib/types';
import ShoePanel from '../components/ShoePanel';
import MusicPanel from '../components/MusicPanel';
import NotificationsPanel from '../components/NotificationsPanel';

const FeedPage: React.FC = () => {
  const { getInfiniteFeed, trackView, trackClick, loading } = useSneakers();
  const { trackPanelOpen, trackShare, trackFavorite, trackShoeClick } = useAnalytics();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { unreadCount } = usePriceAlerts();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [showShoePanel, setShowShoePanel] = useState(false);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadShoes();
  }, []);

  const loadShoes = async () => {
    const data = await getInfiniteFeed(page, 10);
    setShoes(prev => [...prev, ...data]);
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (shoes[currentIndex]) {
      trackView(shoes[currentIndex].id);
    }
  }, [currentIndex, shoes]);

  // Load more when near end
  useEffect(() => {
    if (currentIndex >= shoes.length - 3 && !loading) {
      loadShoes();
    }
  }, [currentIndex, shoes.length, loading]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container || shoes.length === 0) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = Math.max(0, currentIndex - 1);
        const card = container.querySelector(`[data-index="${prevIndex}"]`);
        card?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = Math.min(shoes.length - 1, currentIndex + 1);
        const card = container.querySelector(`[data-index="${nextIndex}"]`);
        card?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleOpenShoePanel();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleOpenMusicPanel();
      } else if (e.key === 'Escape') {
        setShowShoePanel(false);
        setShowMusicPanel(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, shoes.length]);

  // Touch swipe gestures for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Only trigger if horizontal swipe is greater than vertical (to not interfere with scroll)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swiped right - open ShoePanel
          handleOpenShoePanel();
        } else {
          // Swiped left - open MusicPanel
          handleOpenMusicPanel();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Intersection Observer for tracking visible card
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setCurrentIndex(index);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    container.querySelectorAll('.feed-card').forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [shoes]);

  const handleBuyClick = (shoe: Shoe) => {
    trackClick(shoe.id);
    trackShoeClick(shoe.id);
    window.open(getAffiliateUrl(shoe.amazon_url), '_blank');
  };

  const handleOpenShoePanel = () => {
    if (shoes[currentIndex]) {
      trackPanelOpen('shoe', shoes[currentIndex].id);
    }
    setShowShoePanel(true);
  };

  const handleOpenMusicPanel = () => {
    if (shoes[currentIndex]) {
      trackPanelOpen('music', shoes[currentIndex].id);
    }
    setShowMusicPanel(true);
  };

  const handleShare = async (shoe: Shoe) => {
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
        if (import.meta.env.DEV) console.warn('Share cancelled');
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

  const handleFavorite = async (shoe: Shoe) => {
    const wasAlreadyFavorite = isFavorite(shoe.id);
    const success = await toggleFavorite(shoe.id);
    if (success) {
      trackFavorite(shoe.id, wasAlreadyFavorite ? 'remove' : 'add');
    }
  };

  if (loading && shoes.length === 0) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading sneakers...</p>
        </div>
      </div>
    );
  }

  if (shoes.length === 0) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">👟</p>
          <p className="text-zinc-400">No sneakers found</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {/* Notification Bell - Fixed Position */}
      <button
        onClick={() => setShowNotifications(true)}
        className="fixed top-4 right-4 z-30 w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform"
      >
        <FaBell className="text-white text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {shoes.map((shoe, index) => (
        <div
          key={shoe.id}
          data-index={index}
          className="feed-card h-screen min-h-screen snap-start snap-always relative"
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
          {/* Background Image */}
          <img
            src={shoe.image_url}
            alt={shoe.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95 pointer-events-none" />

          {/* Content */}
          <div className="absolute bottom-32 left-0 right-16 p-6 z-10">
            {/* Brand & Tags */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                {shoe.brand}
              </span>
              {shoe.is_featured && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  🔥 HOT
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-lg">
              {shoe.name}
            </h1>

            {/* Style Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {shoe.style_tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-zinc-800/80 backdrop-blur-sm text-zinc-300 text-xs px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Price - Only shown when Amazon API is connected */}
            {shouldShowPrice(shoe.price) && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-orange-400">
                  {formatPrice(shoe.price)}
                </span>
              </div>
            )}

            {/* Buy Button */}
            <button
              onClick={() => handleBuyClick(shoe)}
              className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 text-base active:scale-95 transition-transform shadow-lg"
            >
              <FaAmazon className="text-2xl" />
              BUY ON AMAZON
            </button>
          </div>

          {/* Side Actions */}
          <div className="absolute right-3 bottom-44 flex flex-col gap-5 z-10">
            <button
              onClick={() => handleFavorite(shoe)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-11 h-11 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-all ${
                isFavorite(shoe.id) ? 'bg-red-500' : 'bg-black/30'
              }`}>
                <FaHeart className={`text-xl ${isFavorite(shoe.id) ? 'text-white' : 'text-white'}`} />
              </div>
              <span className="text-xs font-bold text-white drop-shadow">
                {isFavorite(shoe.id) ? 'Liked' : shoe.favorite_count}
              </span>
            </button>

            <button
              onClick={() => handleFavorite(shoe)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-11 h-11 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-all ${
                isFavorite(shoe.id) ? 'bg-orange-500' : 'bg-black/30'
              }`}>
                <FaBookmark className="text-xl text-white" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow">
                {isFavorite(shoe.id) ? 'Saved' : 'Save'}
              </span>
            </button>

            <button
              onClick={() => handleShare(shoe)}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-11 h-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform">
                <FaShare className="text-xl text-white" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow">Share</span>
            </button>
          </div>

          {/* Music Bar - Bottom of card */}
          {shoe.music && (
            <button
              onClick={handleOpenMusicPanel}
              className="absolute bottom-20 left-4 right-4 flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2 z-10"
            >
              {/* Spinning Disc */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center animate-spin-slow flex-shrink-0 border border-zinc-600">
                <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
              </div>

              {/* Song Info with Marquee */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <FaMusic className="text-orange-500 text-xs flex-shrink-0" />
                  <div className="overflow-hidden whitespace-nowrap">
                    <span className="inline-block animate-marquee text-white text-sm font-medium">
                      {shoe.music.song} • {shoe.music.artist}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tap hint */}
              <span className="text-zinc-400 text-xs flex-shrink-0">Tap for links</span>
            </button>
          )}
        </div>
      ))}

      {/* Shoe Panel - Opens on Left Arrow */}
      {shoes[currentIndex] && (
        <ShoePanel
          shoe={shoes[currentIndex]}
          isOpen={showShoePanel}
          onClose={() => setShowShoePanel(false)}
        />
      )}

      {/* Music Panel - Opens on Right Arrow */}
      {shoes[currentIndex] && (
        <MusicPanel
          shoe={shoes[currentIndex]}
          isOpen={showMusicPanel}
          onClose={() => setShowMusicPanel(false)}
        />
      )}

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Share Success Toast */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50 transition-all duration-300 ${
          showShareToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <FaCheck className="text-xs text-white" />
        </div>
        <span className="font-medium">Link copied with affiliate tracking!</span>
      </div>
    </div>
  );
};

export default FeedPage;
