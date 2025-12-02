import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShare, FaBookmark, FaAmazon } from 'react-icons/fa';
import { useSneakers } from '../hooks/useSneakers';
import { getAffiliateUrl } from '../lib/supabaseClient';
import { Shoe } from '../lib/types';

const FeedPage: React.FC = () => {
  const { getInfiniteFeed, trackView, trackClick, loading } = useSneakers();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(0);

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

  const handleBuyClick = (shoe: Shoe) => {
    trackClick(shoe.id);
    window.open(getAffiliateUrl(shoe.amazon_url), '_blank');
  };

  const currentShoe = shoes[currentIndex];

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

  if (!currentShoe) {
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
    <div className="h-screen bg-black overflow-hidden snap-mandatory snap-y hide-scrollbar">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentShoe.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative h-screen w-full feed-card snap-start"
        >
          {/* Background Image */}
          <img
            src={currentShoe.image_url}
            alt={currentShoe.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />

          {/* Content */}
          <div className="absolute bottom-32 left-0 right-0 p-6">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                {/* Brand & Tags */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {currentShoe.brand}
                  </span>
                  {currentShoe.is_featured && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      🔥 HOT
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-3xl font-black text-white leading-tight mb-2">
                  {currentShoe.name}
                </h1>

                {/* Style Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentShoe.style_tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="bg-zinc-800/70 text-zinc-300 text-xs px-2 py-1 rounded backdrop-blur-sm">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-orange-400">${currentShoe.price}</span>
                  {currentShoe.sale_price && currentShoe.sale_price < currentShoe.price && (
                    <span className="text-lg text-zinc-500 line-through">${currentShoe.retail_price}</span>
                  )}
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyClick(currentShoe)}
                  className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 text-lg hover:bg-zinc-100 active:scale-95 transition-all shadow-lg"
                >
                  <FaAmazon className="text-2xl" />
                  BUY NOW ON AMAZON
                </button>
              </div>
            </div>
          </div>

          {/* Side Actions */}
          <div className="absolute right-4 bottom-48 flex flex-col gap-6">
            <button className="flex flex-col items-center gap-1">
              <div className="p-3 bg-zinc-800/60 backdrop-blur-sm rounded-full">
                <FaHeart className="text-2xl text-white" />
              </div>
              <span className="text-xs font-bold text-white">{currentShoe.favorite_count}</span>
            </button>
            
            <button className="flex flex-col items-center gap-1">
              <div className="p-3 bg-zinc-800/60 backdrop-blur-sm rounded-full">
                <FaBookmark className="text-2xl text-white" />
              </div>
              <span className="text-xs font-bold text-white">Save</span>
            </button>
            
            <button className="flex flex-col items-center gap-1">
              <div className="p-3 bg-zinc-800/60 backdrop-blur-sm rounded-full">
                <FaShare className="text-2xl text-white" />
              </div>
              <span className="text-xs font-bold text-white">Share</span>
            </button>
          </div>

          {/* Navigation Hint */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
            <div className="flex gap-1">
              {shoes.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 rounded-full ${idx === 2 ? 'bg-white' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Swipe Navigation */}
      <div className="absolute inset-0 flex">
        <button
          className="w-1/2 h-full"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
        />
        <button
          className="w-1/2 h-full"
          onClick={() => setCurrentIndex(currentIndex + 1)}
        />
      </div>
    </div>
  );
};

export default FeedPage;
