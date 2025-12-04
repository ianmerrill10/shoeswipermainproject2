import React from 'react';
import { motion } from 'framer-motion';
import { FaShareAlt, FaAmazon } from 'react-icons/fa';
import { Shoe } from '../../lib/types';
import { OutfitAnalysis } from '../../hooks/useOutfitAnalysis';
import { getAffiliateUrl } from '../../lib/supabaseClient';

interface Props {
  outfitImage: string;
  analysis: OutfitAnalysis;
  recommendations: Shoe[];
}

export const ShareResults: React.FC<Props> = ({ analysis, recommendations }) => {
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My fit is a ${analysis.rating}/10 on ShoeSwiper!`,
          text: `Check out my outfit rating. AI says: "${analysis.feedback}"`,
          url: 'https://shoeswiper.com',
        });
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Share canceled');
      }
    }
  };

  return (
    <section className="space-y-6" aria-label="Shoe recommendations based on your outfit">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">Shoe Upgrades</h3>
        <button 
          onClick={handleShare}
          aria-label="Share your outfit analysis results"
          className="text-orange-500 text-sm flex items-center gap-2 hover:text-orange-400"
        >
          <FaShareAlt aria-hidden="true" /> Share Result
        </button>
      </div>

      <div className="grid gap-4" role="list" aria-label="Recommended sneakers">
        {recommendations.map((shoe, idx) => (
          <motion.article
            key={shoe.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex h-32"
          >
            {/* Shoe Image */}
            <div className="w-32 h-full bg-zinc-800 relative">
              <img src={shoe.image_url} alt={`${shoe.brand} ${shoe.name}`} className="w-full h-full object-cover" />
            </div>

            {/* Info & Action */}
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-white line-clamp-1">{shoe.name}</h4>
                <p className="text-xs text-zinc-400">{shoe.brand}</p>
              </div>
              
              <div className="flex items-end justify-between mt-2">
                <div>
                   <span className="text-orange-500 font-bold">${shoe.price}</span>
                   <div className="text-[10px] text-green-500 flex items-center gap-1 mt-0.5">
                     Match for {analysis.style_tags[0]}
                   </div>
                </div>

                <a 
                  href={getAffiliateUrl(shoe.amazon_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Buy ${shoe.name} on Amazon`}
                  className="bg-white text-black px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow hover:scale-105 transition-transform"
                >
                  <FaAmazon aria-hidden="true" /> Buy Now
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {recommendations.length === 0 && (
         <div className="text-center p-8 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-700" role="status">
           <p className="text-zinc-500">No perfect matches found right now.</p>
         </div>
      )}
    </section>
  );
};
