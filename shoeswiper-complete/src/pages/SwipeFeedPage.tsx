import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FaBell, FaCheck } from 'react-icons/fa';
import { useSneakers } from '../hooks/useSneakers';
import { useAnalytics } from '../hooks/useAnalytics';
import { useFavorites } from '../hooks/useFavorites';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useUIStore } from '../store';
import { getAffiliateUrl, trackAffiliateClick, extractAsinFromUrl } from '../lib/supabaseClient';
import { createAffiliateShareData } from '../lib/deepLinks';
import { Shoe } from '../lib/types';
import ShoePanel from '../components/ShoePanel';
import MusicPanel from '../components/MusicPanel';
import NotificationsPanel from '../components/NotificationsPanel';
import SwipeableCard from '../components/SwipeableCard';

const SwipeFeedPage: React.FC = () => {
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
  const [exitingShoeId, setExitingShoeId] = useState<string | null>(null);
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
      if (shoes.length === 0) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(shoes.length - 1, prev + 1));
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

  const handleBuyClick = (shoe: Shoe) => {
    trackClick(shoe.id);
    trackShoeClick(shoe.id);
    
    // Track affiliate click for revenue attribution
    const asin = extractAsinFromUrl(shoe.amazon_url);
    trackAffiliateClick(shoe.id, asin || undefined, 'swipe_feed');
    
    window.open(getAffiliateUrl(shoe.amazon_url), '_blank');
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

  const handleSwipeRight = useCallback(async (shoe: Shoe) => {
    // Like/favorite the shoe
    const wasAlreadyFavorite = isFavorite(shoe.id);
    const success = await toggleFavorite(shoe.id);
    if (success) {
      trackFavorite(shoe.id, wasAlreadyFavorite ? 'remove' : 'add');
    }
    
    // Move to next shoe after animation
    setExitingShoeId(shoe.id);
    setTimeout(() => {
      setExitingShoeId(null);
      setCurrentIndex(prev => Math.min(shoes.length - 1, prev + 1));
    }, 500);
  }, [isFavorite, toggleFavorite, trackFavorite, shoes.length]);

  const handleSwipeLeft = useCallback((shoe: Shoe) => {
    // Skip/dislike the shoe - debug log for development only
    // eslint-disable-next-line no-console
    if (import.meta.env.DEV) console.log('Swiped left on', shoe.name);
    
    // Move to next shoe after animation
    setExitingShoeId(shoe.id);
    setTimeout(() => {
      setExitingShoeId(null);
      setCurrentIndex(prev => Math.min(shoes.length - 1, prev + 1));
    }, 300);
  }, [shoes.length]);

  const currentShoe = shoes[currentIndex];
  const nextShoe = shoes[currentIndex + 1];

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
      className="h-screen bg-zinc-950 relative overflow-hidden"
    >
      {/* Notification Bell - Fixed Position */}
      <button
        onClick={openNotificationsPanel}
        className="fixed top-4 right-4 z-30 w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform"
      >
        <FaBell className="text-white text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Swipe Counter */}
      <div className="fixed top-4 left-4 z-30 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
        <span className="text-white text-sm font-bold">
          {currentIndex + 1} / {shoes.length}
        </span>
      </div>

      {/* Card Stack */}
      <div className="absolute inset-0">
        {/* Next card (behind) */}
        {nextShoe && (
          <div className="absolute inset-0 scale-95 opacity-50">
            <img
              src={nextShoe.image_url}
              alt={nextShoe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95" />
          </div>
        )}

        {/* Current swipeable card */}
        <AnimatePresence mode="wait">
          {currentShoe && exitingShoeId !== currentShoe.id && (
            <SwipeableCard
              key={currentShoe.id}
              shoe={currentShoe}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onCardClick={handleOpenShoePanel}
              onBuyClick={handleBuyClick}
              onShareClick={handleShare}
              onMusicClick={handleOpenMusicPanel}
              isFavorite={isFavorite(currentShoe.id)}
              isInCloset={isFavorite(currentShoe.id)}
              showMusicBar={!!currentShoe.music}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Shoe Panel - Opens on Left Arrow */}
      {currentShoe && (
        <ShoePanel
          shoe={currentShoe}
          isOpen={isShoePanelOpen}
          onClose={closeShoePanel}
        />
      )}

      {/* Music Panel - Opens on Right Arrow */}
      {currentShoe && (
        <MusicPanel
          shoe={currentShoe}
          isOpen={isMusicPanelOpen}
          onClose={closeMusicPanel}
        />
      )}

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsPanelOpen}
        onClose={closeNotificationsPanel}
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

export default SwipeFeedPage;
