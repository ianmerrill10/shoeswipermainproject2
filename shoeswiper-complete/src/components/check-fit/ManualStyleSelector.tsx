import React from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaRunning, FaUserTie, FaTree, FaGem, FaHistory } from 'react-icons/fa';

interface Props {
  onSelect: (style: string) => void;
}

const STYLES = [
  { id: 'streetwear', label: 'Streetwear', icon: FaFire, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'athletic', label: 'Athletic', icon: FaRunning, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'casual', label: 'Casual', icon: FaTree, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { id: 'hype', label: 'Hype / Grail', icon: FaGem, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'retro', label: 'Vintage', icon: FaHistory, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'formal', label: 'Formal', icon: FaUserTie, color: 'text-zinc-300', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
];

export const ManualStyleSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800"
    >
      <h3 className="text-white font-bold mb-4 text-center" id="style-selector-heading">Select Your Vibe</h3>
      <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="style-selector-heading">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            aria-label={`Select ${style.label} style`}
            className={`p-4 rounded-xl border ${style.border} ${style.bg} hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2`}
          >
            <style.icon className={`text-2xl ${style.color}`} aria-hidden="true" />
            <span className="text-sm font-bold text-zinc-300">{style.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
