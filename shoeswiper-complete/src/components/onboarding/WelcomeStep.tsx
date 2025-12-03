import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center"
    >
      {/* Logo/Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: 'spring' }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span className="text-5xl">👟</span>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-3xl font-black text-white mb-4"
      >
        Discover Your Next{' '}
        <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
          Grail
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-zinc-400 text-lg leading-relaxed max-w-sm mb-12"
      >
        Swipe through 1000s of sneakers, get AI outfit matching, and never miss a drop
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="grid grid-cols-3 gap-4 mb-12 w-full max-w-sm"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
          <span className="text-xs text-zinc-500">Hot Drops</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <span className="text-xs text-zinc-500">AI Matching</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
          <span className="text-xs text-zinc-500">Price Alerts</span>
        </div>
      </motion.div>

      {/* Get Started Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="w-full max-w-sm bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-purple-500/30"
      >
        Get Started
      </motion.button>

      {/* Skip Link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        onClick={onSkip}
        className="mt-6 text-zinc-500 text-sm hover:text-zinc-400 transition-colors"
      >
        Skip for now
      </motion.button>
    </motion.div>
  );
};

export default WelcomeStep;
