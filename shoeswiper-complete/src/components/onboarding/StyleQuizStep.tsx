import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

interface StyleQuizStepProps {
  selectedStyles: string[];
  onStylesChange: (styles: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const STYLE_OPTIONS = [
  { id: 'streetwear', label: 'Streetwear', emoji: '🔥', color: 'from-orange-500 to-red-500' },
  { id: 'classic', label: 'Classic/Retro', emoji: '🕰️', color: 'from-amber-500 to-orange-500' },
  { id: 'high-fashion', label: 'High Fashion', emoji: '✨', color: 'from-purple-500 to-pink-500' },
  { id: 'athletic', label: 'Athletic', emoji: '🏃', color: 'from-green-500 to-emerald-500' },
  { id: 'casual', label: 'Casual/Everyday', emoji: '😎', color: 'from-blue-500 to-cyan-500' },
  { id: 'luxury', label: 'Luxury/Designer', emoji: '💎', color: 'from-violet-500 to-purple-500' },
  { id: 'skate', label: 'Skate', emoji: '🛹', color: 'from-rose-500 to-pink-500' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀', color: 'from-orange-600 to-red-600' },
];

const StyleQuizStep: React.FC<StyleQuizStepProps> = ({
  selectedStyles,
  onStylesChange,
  onNext,
  onBack,
}) => {
  const [styles, setStyles] = useState<string[]>(selectedStyles);

  const toggleStyle = (styleId: string) => {
    const newStyles = styles.includes(styleId)
      ? styles.filter(s => s !== styleId)
      : styles.length < 3 ? [...styles, styleId] : styles;
    setStyles(newStyles);
    onStylesChange(newStyles);
  };

  const canContinue = styles.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-full px-6 py-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-black text-white mb-2"
        >
          What's Your{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Style
          </span>
          ?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-sm"
        >
          Pick 2-3 styles that match your vibe
        </motion.p>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-8">
        {STYLE_OPTIONS.map((style, index) => {
          const isSelected = styles.includes(style.id);
          return (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleStyle(style.id)}
              className={`relative rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                isSelected
                  ? `bg-gradient-to-br ${style.color} shadow-lg`
                  : 'bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600'
              }`}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                >
                  <FaCheck className="text-xs text-zinc-900" />
                </motion.div>
              )}

              {/* Emoji */}
              <span className="text-3xl">{style.emoji}</span>

              {/* Label */}
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                {style.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selection Counter */}
      <div className="text-center mb-4">
        <span className={`text-sm ${canContinue ? 'text-green-400' : 'text-zinc-500'}`}>
          {styles.length} of 2-3 selected
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-xl"
        >
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: canContinue ? 1.02 : 1 }}
          whileTap={{ scale: canContinue ? 0.98 : 1 }}
          onClick={onNext}
          disabled={!canContinue}
          className={`flex-1 font-bold py-4 rounded-xl transition-all ${
            canContinue
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StyleQuizStep;
