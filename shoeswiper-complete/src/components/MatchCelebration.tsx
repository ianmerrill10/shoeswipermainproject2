import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaCheck } from 'react-icons/fa';
import { useReducedMotion } from '../hooks/useAnimations';
import { SPRING_CONFIGS, DURATIONS } from '../lib/animationConfig';

interface MatchCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
  shoeName?: string;
  message?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

// Colors for confetti particles
const CONFETTI_COLORS = [
  '#f97316', // orange-500
  '#22c55e', // green-500
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#eab308', // yellow-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
];

const MatchCelebration: React.FC<MatchCelebrationProps> = ({
  isVisible,
  onComplete,
  shoeName,
  message = 'Added to Wishlist!',
}) => {
  const { prefersReducedMotion } = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate confetti particles
  const generateParticles = useCallback((): Particle[] => {
    if (prefersReducedMotion) return [];
    
    const particleCount = 30;
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20, // Center with some spread
      y: 50,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 100,
      velocityY: -80 - Math.random() * 60,
    }));
  }, [prefersReducedMotion]);

  // Initialize particles when celebration becomes visible
  useEffect(() => {
    if (isVisible) {
      setParticles(generateParticles());
    }
  }, [isVisible, generateParticles]);

  // Auto-dismiss after animation
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onComplete?.();
    }, prefersReducedMotion ? 500 : 2000);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete, prefersReducedMotion]);

  // Calculate message based on shoeName
  const displayMessage = useMemo(() => {
    if (shoeName) {
      return shoeName.length > 20 ? message : `${shoeName} ${message}`;
    }
    return message;
  }, [shoeName, message]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : DURATIONS.normal }}
        >
          {/* Semi-transparent overlay */}
          <motion.div
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti Particles */}
          {!prefersReducedMotion && particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-sm"
              style={{
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{
                x: 0,
                y: 0,
                rotate: particle.rotation,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: particle.velocityX * 5,
                y: [0, particle.velocityY * 2, particle.velocityY * 4 + 200],
                rotate: particle.rotation + Math.random() * 720,
                scale: [0, 1.5, 1, 0.8],
                opacity: [1, 1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
                times: [0, 0.2, 0.6, 1],
              }}
            />
          ))}

          {/* Heart burst effect */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2.5, 3],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500/50 to-orange-500/50 blur-xl" />
            </motion.div>
          )}

          {/* Main celebration content */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : {
              type: 'spring',
              ...SPRING_CONFIGS.bouncy,
            }}
          >
            {/* Animated heart icon */}
            <motion.div
              className="relative"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 2,
                repeatType: 'reverse',
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <FaHeart className="text-4xl text-white" />
              </div>
              
              {/* Pulsing ring */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-red-400"
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.8, 0.4, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: 2,
                    repeatDelay: 0.2,
                  }}
                />
              )}
            </motion.div>

            {/* Message */}
            <motion.div
              className="bg-zinc-900/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <FaCheck className="text-xs text-white" />
                </div>
                <span className="text-white font-bold text-base">{displayMessage}</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchCelebration;
