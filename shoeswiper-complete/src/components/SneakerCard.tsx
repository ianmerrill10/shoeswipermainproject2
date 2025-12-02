import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaAmazon, FaTag } from 'react-icons/fa';
import { Shoe } from '../lib/types';
import { useSneakers } from '../hooks/useSneakers';

interface Props {
  shoe: Shoe;
  variant?: 'feed' | 'grid';
}

export const SneakerCard: React.FC<Props> = ({ shoe, variant = 'grid' }) => {
  const { trackClick, trackView } = useSneakers();
  const [isLiked, setIsLiked] = useState(false);

  const getAffiliateLink = (url: string) => {
    if (url.includes('tag=shoeswiper-20')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tag=shoeswiper-20`;
  };

  const handleBuyClick = () => {
    trackClick(shoe.id);
    window.open(getAffiliateLink(shoe.amazon_url), '_blank');
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const isOnSale = shoe.sale_price && shoe.sale_price < shoe.price;
  const discount = isOnSale 
    ? Math.round(((shoe.price - shoe.sale_price!) / shoe.price) * 100) 
    : 0;

  // Render Grid Version (Search Results/Profile)
  if (variant === 'grid') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-orange-500/50 transition-all">
        <div className="relative aspect-square bg-zinc-800">
          <img 
            src={shoe.image_url} 
            alt={shoe.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <FaTag /> -{discount}%
            </div>
          )}
          <button 
            onClick={toggleLike}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:text-red-500 transition-colors"
          >
            {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
        </div>
        
        <div className="p-3">
          <p className="text-xs text-zinc-500 font-bold uppercase">{shoe.brand}</p>
          <h3 className="text-sm font-medium text-white line-clamp-1">{shoe.name}</h3>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-col">
              {isOnSale && <span className="text-[10px] text-zinc-500 line-through">${shoe.price}</span>}
              <span className={`font-bold ${isOnSale ? 'text-red-400' : 'text-orange-500'}`}>
                ${isOnSale ? shoe.sale_price : shoe.price}
              </span>
            </div>
            
            <button 
              onClick={handleBuyClick}
              className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-zinc-200"
            >
              <FaAmazon /> Buy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Feed Version (Full Screen TikTok Style)
  return (
    <div className="relative w-full h-full bg-black">
      <img 
        src={shoe.image_url} 
        alt={shoe.name}
        className="w-full h-full object-cover opacity-80"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-24 left-0 w-full p-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                {shoe.brand}
              </span>
              {shoe.style_tags.slice(0, 2).map(tag => (
                <span key={tag} className="bg-zinc-800/80 text-zinc-300 text-xs px-2 py-1 rounded backdrop-blur-md">
                  #{tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-black text-white leading-tight mb-2 shadow-sm">{shoe.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-orange-400">${shoe.price}</span>
              <span className="text-zinc-400 text-sm">Free Shipping via Amazon</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleBuyClick}
          className="mt-6 w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-white/10"
        >
          <FaAmazon className="text-xl" /> BUY NOW ON AMAZON
        </button>
      </div>

      {/* Side Actions (Like, Share) */}
      <div className="absolute bottom-32 right-4 flex flex-col gap-6 items-center">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1">
          <div className="p-3 bg-zinc-800/60 backdrop-blur-md rounded-full">
            {isLiked ? <FaHeart className="text-2xl text-red-500" /> : <FaRegHeart className="text-2xl text-white" />}
          </div>
          <span className="text-xs font-bold text-white">{shoe.favorite_count + (isLiked ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  );
};
