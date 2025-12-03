import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface CompleteStepProps {
  onComplete: () => void;
}

// Confetti particle component
const ConfettiParticle: React.FC<{
  color: string;
  delay: number;
  duration: number;
  x: number;
}> = ({ color, delay, duration, x }) => (
  <motion.div
    initial={{ y: -20, x, opacity: 1, rotate: 0 }}
    animate={{
      y: '100vh',
      opacity: [1, 1, 0],
      rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
    }}
    transition={{
      duration,
      delay,
      ease: 'linear',
    }}
    className={`absolute top-0 w-3 h-3 ${color}`}
    style={{
      left: `${x}%`,
      borderRadius: Math.random() > 0.5 ? '50%' : '0%',
    }}
  />
);

const CompleteStep: React.FC<CompleteStepProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [confettiParticles, setConfettiParticles] = useState<React.ReactNode[]>([]);

  // Generate confetti particles on mount
  useEffect(() => {
    const colors = [
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-yellow-400',
      'bg-green-400',
      'bg-blue-500',
      'bg-red-500',
    ];

    const particles: React.ReactNode[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push(
        <ConfettiParticle
          key={i}
          color={colors[Math.floor(Math.random() * colors.length)]}
          delay={Math.random() * 0.5}
          duration={2 + Math.random() * 2}
          x={Math.random() * 100}
        />
      );
    }
    setConfettiParticles(particles);
  }, []);

  const handleStartSwiping = () => {
    onComplete();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col items-center justify-center min-h-full px-6 py-12 text-center overflow-hidden"
    >
      {/* Confetti Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiParticles}
      </div>

      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
        className="relative mb-8"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-xl opacity-50" />
        
        {/* Icon Container */}
        <div className="relative w-28 h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4, stiffness: 300 }}
            className="text-5xl"
          >
            🎉
          </motion.span>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-black text-white mb-3"
      >
        You're All Set! 🎉
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-zinc-400 text-lg mb-8"
      >
        Your personalized feed is ready
      </motion.p>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm bg-zinc-800/50 rounded-2xl p-4 mb-8"
      >
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🎨</span>
            </div>
            <p className="text-zinc-400 text-xs">Styles</p>
            <p className="text-white font-bold">Saved</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-zinc-400 text-xs">Brands</p>
            <p className="text-white font-bold">Saved</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-zinc-400 text-xs">Ready</p>
            <p className="text-white font-bold">To Go</p>
          </div>
        </div>
      </motion.div>

      {/* Start Swiping Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStartSwiping}
        className="w-full max-w-sm bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
      >
        <span>Start Swiping</span>
        <span className="text-xl">👟</span>
      </motion.button>
    </motion.div>
  );
};

export default CompleteStep;
