import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaHeart, FaShare, FaBookmark, FaAmazon, FaMusic, FaCheck, FaBell } from 'react-icons/fa';
import { useSneakers } from '../hooks/useSneakers';
import { useAnalytics } from '../hooks/useAnalytics';
import { useFavorites } from '../hooks/useFavorites';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useUIStore } from '../store';
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
  const {
    isShoePanelOpen,
    isMusicPanelOpen,
    isNotificationsPanelOpen,
    openShoePanel,
    closeShoePanel,
    openMusicPanel,
    closeMusicPanel,
    openNotificationsPanel,
    closeNotificationsPanel,
  } = useUIStore();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadShoes = useCallback(async () => {
    const data = await getInfiniteFeed(page, 10);
    setShoes(prev => [...prev, ...data]);
    setPage(prev => prev + 1);
  }, [page, getInfiniteFeed]);

  const handleOpenShoePanel = useCallback(() => {
    if (shoes[currentIndex]) {
      trackPanelOpen('shoe', shoes[currentIndex].id);
      openShoePanel(shoes[currentIndex].id);
    }
  }, [shoes, currentIndex, trackPanelOpen, openShoePanel]);

  const handleOpenMusicPanel = useCallback(() => {
    if (shoes[currentIndex]) {
      trackPanelOpen('music', shoes[currentIndex].id);
      openMusicPanel();
    }
  }, [shoes, currentIndex, trackPanelOpen, openMusicPanel]);

  useEffect(() => {
    loadShoes();
  }, [loadShoes]);

  useEffect(() => {
    if (shoes[currentIndex]) {
      trackView(shoes[currentIndex].id);
    }
  }, [currentIndex, shoes, trackView]);

  // Load more when near end
  useEffect(() => {
    if (currentIndex >= shoes.length - 3 && !loading) {
      loadShoes();
    }
  }, [currentIndex, shoes.length, loading, loadShoes]);

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
        closeShoePanel();
        closeMusicPanel();
        closeNotificationsPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, shoes.length, handleOpenShoePanel, handleOpenMusicPanel, closeShoePanel, closeMusicPanel, closeNotificationsPanel]);

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
  }, [handleOpenShoePanel, handleOpenMusicPanel]);

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

  const handleBuyClick = useCallback((shoe: Shoe) => {
    trackClick(shoe.id);
    trackShoeClick(shoe.id);
    // Validate URL before opening
    const url = getAffiliateUrl(shoe.amazon_url);
    if (url && url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [trackClick, trackShoeClick]);

  const handleShare = useCallback(async (shoe: Shoe) => {
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
  }, [trackShare]);

  const handleFavorite = useCallback(async (shoe: Shoe) => {
    const wasAlreadyFavorite = isFavorite(shoe.id);
    const success = await toggleFavorite(shoe.id);
    if (success) {
      trackFavorite(shoe.id, wasAlreadyFavorite ? 'remove' : 'add');
    }
  }, [isFavorite, toggleFavorite, trackFavorite]);

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
    <div className="desktop-feed-wrapper">
      <div
        ref={containerRef}
        className="feed-desktop-container h-screen full-height-mobile overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative feed-container snap-scroll-optimized"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        role="feed"
        aria-label="Sneaker feed"
      >
        {/* Notification Bell - Responsive */}
        <button
          onClick={openNotificationsPanel}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          className="fixed top-3 sm:top-4 right-3 sm:right-4 z-30 w-10 h-10 sm:w-11 sm:h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform touch-target notch-aware-top"
        >
          <FaBell className="text-white text-base sm:text-lg" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-1" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

      {shoes.map((shoe, index) => (
        <article
          key={shoe.id}
          data-index={index}
          className="feed-card swipe-gesture-container h-screen min-h-screen snap-start snap-always relative"
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          aria-label={`${shoe.brand} ${shoe.name}`}
          aria-setsize={shoes.length}
          aria-posinset={index + 1}
        >
          {/* Background Image - GPU optimized with lazy loading */}
          <img
            src={shoe.image_url}
            alt={`${shoe.brand} ${shoe.name}${shoe.colorway ? ` in ${shoe.colorway}` : ''}`}
            className="swipeable-card-image absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority={index === currentIndex ? 'high' : 'low'}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95 pointer-events-none" aria-hidden="true" />

          {/* Content - Responsive positioning */}
          <div className="absolute bottom-28 sm:bottom-32 md:bottom-36 left-0 right-14 sm:right-16 md:right-20 p-4 sm:p-6 z-10 pb-safe">
            {/* Brand & Tags - Responsive */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="bg-orange-500 text-white text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase">
                {shoe.brand}
              </span>
              {shoe.is_featured && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full">
                  🔥 HOT
                </span>
              )}
            </div>

            {/* Name - Responsive */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-1.5 sm:mb-2 drop-shadow-lg">
              {shoe.name}
            </h1>

            {/* Style Tags - Responsive */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              {shoe.style_tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-zinc-800/80 backdrop-blur-sm text-zinc-300 text-xs px-2 py-0.5 sm:py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Price - Responsive */}
            {shouldShowPrice(shoe.price) && (
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400">
                  {formatPrice(shoe.price)}
                </span>
              </div>
            )}

            {/* Buy Button - Responsive */}
            <button
              onClick={() => handleBuyClick(shoe)}
              aria-label={`Buy ${shoe.name} on Amazon`}
              className="w-full bg-white text-black font-black py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base active:scale-95 transition-transform shadow-lg touch-target hover-lift"
            >
              <FaAmazon className="text-xl sm:text-2xl" aria-hidden="true" />
              BUY ON AMAZON
            </button>
          </div>

          {/* Side Actions - Responsive sizing */}
          <div className="absolute right-2 sm:right-3 md:right-4 bottom-36 sm:bottom-44 md:bottom-48 flex flex-col gap-3 sm:gap-4 md:gap-5 z-10" role="group" aria-label="Sneaker actions">
            <button
              onClick={() => handleFavorite(shoe)}
              aria-label={isFavorite(shoe.id) ? `Remove ${shoe.name} from favorites` : `Add ${shoe.name} to favorites`}
              aria-pressed={isFavorite(shoe.id)}
              className="flex flex-col items-center gap-0.5 sm:gap-1 touch-target"
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-all ${
                isFavorite(shoe.id) ? 'bg-red-500' : 'bg-black/30'
              }`}>
                <FaHeart className="text-lg sm:text-xl text-white" aria-hidden="true" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow" aria-hidden="true">
                {isFavorite(shoe.id) ? 'Liked' : shoe.favorite_count}
              </span>
            </button>

            <button
              onClick={() => handleFavorite(shoe)}
              aria-label={isFavorite(shoe.id) ? `${shoe.name} saved to closet` : `Save ${shoe.name} to closet`}
              aria-pressed={isFavorite(shoe.id)}
              className="flex flex-col items-center gap-0.5 sm:gap-1 touch-target"
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-all ${
                isFavorite(shoe.id) ? 'bg-orange-500' : 'bg-black/30'
              }`}>
                <FaBookmark className="text-lg sm:text-xl text-white" aria-hidden="true" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow" aria-hidden="true">
                {isFavorite(shoe.id) ? 'Saved' : 'Save'}
              </span>
            </button>

            <button
              onClick={() => handleShare(shoe)}
              aria-label={`Share ${shoe.name}`}
              className="flex flex-col items-center gap-0.5 sm:gap-1 touch-target"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform">
                <FaShare className="text-lg sm:text-xl text-white" aria-hidden="true" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow" aria-hidden="true">Share</span>
            </button>
          </div>

          {/* Music Bar - Responsive */}
          {shoe.music && (
            <button
              onClick={handleOpenMusicPanel}
              aria-label={`Now playing: ${shoe.music.song} by ${shoe.music.artist}. Tap for music links`}
              className="absolute bottom-16 sm:bottom-20 left-3 sm:left-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-sm rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 z-10 mb-safe"
            >
              {/* Spinning Disc - Responsive */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center animate-spin-slow flex-shrink-0 border border-zinc-600" aria-hidden="true">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black" />
                </div>
              </div>

              {/* Song Info with Marquee */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <FaMusic className="text-orange-500 text-[10px] sm:text-xs flex-shrink-0" aria-hidden="true" />
                  <div className="overflow-hidden whitespace-nowrap">
                    <span className="inline-block animate-marquee text-white text-xs sm:text-sm font-medium">
                      {shoe.music.song} • {shoe.music.artist}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tap hint - Hidden on very small screens */}
              <span className="text-zinc-400 text-[10px] sm:text-xs flex-shrink-0 hidden xs:inline" aria-hidden="true">Tap for links</span>
            </button>
          )}
        </article>
      ))}

      {/* Shoe Panel - Opens on Left Arrow */}
      {shoes[currentIndex] && (
        <ShoePanel
          shoe={shoes[currentIndex]}
          isOpen={isShoePanelOpen}
          onClose={closeShoePanel}
        />
      )}

      {/* Music Panel - Opens on Right Arrow */}
      {shoes[currentIndex] && (
        <MusicPanel
          shoe={shoes[currentIndex]}
          isOpen={isMusicPanelOpen}
          onClose={closeMusicPanel}
        />
      )}

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsPanelOpen}
        onClose={closeNotificationsPanel}
      />

        {/* Share Success Toast - Responsive */}
        <div
          role="status"
          aria-live="polite"
          className={`absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl flex items-center gap-2 shadow-lg z-50 transition-all duration-300 mb-safe ${
            showShareToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
            <FaCheck className="text-[10px] sm:text-xs text-white" aria-hidden="true" />
          </div>
          <span className="font-medium text-sm sm:text-base">Link copied!</span>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
