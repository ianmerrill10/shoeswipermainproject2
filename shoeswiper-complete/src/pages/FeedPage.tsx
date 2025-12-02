import React, { useEffect, useState, useRef } from 'react';
import { FaHeart, FaShare, FaBookmark, FaAmazon } from 'react-icons/fa';
import { useSneakers } from '../hooks/useSneakers';
import { getAffiliateUrl, shouldShowPrice, formatPrice } from '../lib/supabaseClient';
import { Shoe } from '../lib/types';

const FeedPage: React.FC = () => {
  const { getInfiniteFeed, trackView, trackClick, loading } = useSneakers();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(0);
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
    window.open(getAffiliateUrl(shoe.amazon_url), '_blank');
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
      className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
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
            <button className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <FaHeart className="text-xl text-white" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow">{shoe.favorite_count}</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <FaBookmark className="text-xl text-white" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow">Save</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <FaShare className="text-xl text-white" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow">Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedPage;
