/**
 * Animation configuration for SwipeableCard and related components
 * Uses Framer Motion spring-based physics for natural movement
 */

export interface SwipeConfig {
  /** Minimum velocity to trigger a swipe action (px/s) */
  velocityThreshold: number;
  /** Minimum distance to trigger a swipe action (px) */
  swipeThreshold: number;
  /** Maximum rotation angle during swipe (degrees) */
  maxRotation: number;
  /** Rotation multiplier based on drag distance */
  rotationMultiplier: number;
}

export interface SpringConfig {
  /** Stiffness of the spring (higher = faster) */
  stiffness: number;
  /** Damping of the spring (higher = less oscillation) */
  damping: number;
  /** Mass of the animated object */
  mass: number;
}

// Default swipe configuration
export const DEFAULT_SWIPE_CONFIG: SwipeConfig = {
  velocityThreshold: 500,
  swipeThreshold: 100,
  maxRotation: 15,
  rotationMultiplier: 0.05,
};

// Spring configurations for different animation types
export const SPRING_CONFIGS = {
  /** Snappy spring for quick interactions */
  snappy: {
    stiffness: 300,
    damping: 25,
    mass: 1,
  } as SpringConfig,
  /** Bouncy spring for celebration effects */
  bouncy: {
    stiffness: 400,
    damping: 10,
    mass: 0.8,
  } as SpringConfig,
  /** Smooth spring for gentle transitions */
  smooth: {
    stiffness: 150,
    damping: 20,
    mass: 1,
  } as SpringConfig,
  /** Stiff spring for return-to-center */
  returnToCenter: {
    stiffness: 500,
    damping: 30,
    mass: 1,
  } as SpringConfig,
};

// Shadow configurations for drag states
export const SHADOW_CONFIGS = {
  idle: '0 4px 20px rgba(0, 0, 0, 0.3)',
  dragging: '0 20px 60px rgba(0, 0, 0, 0.4)',
  likeHover: '0 10px 40px rgba(34, 197, 94, 0.3)',
  dislikeHover: '0 10px 40px rgba(239, 68, 68, 0.3)',
};

// Animation duration presets (in seconds)
export const DURATIONS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  celebration: 0.8,
};

// Haptic feedback patterns (duration in ms)
export const HAPTIC_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 20],
  error: [30, 50, 30],
  swipe: [10, 30, 10],
};

/**
 * Utility to trigger haptic feedback if supported
 */
export const triggerHaptic = (pattern: keyof typeof HAPTIC_PATTERNS): void => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
    } catch {
      // Haptic feedback not supported or blocked
    }
  }
};
