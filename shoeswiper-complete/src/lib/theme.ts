// ============================================
// SHOESWIPER DESIGN SYSTEM THEME
// ============================================

/**
 * Semantic color palette for the design system
 * All colors are Tailwind CSS classes
 */
export const colors = {
  // Primary colors - Purple theme
  primary: {
    50: 'purple-50',
    100: 'purple-100',
    200: 'purple-200',
    300: 'purple-300',
    400: 'purple-400',
    500: 'purple-500',
    600: 'purple-600',
    700: 'purple-700',
    800: 'purple-800',
    900: 'purple-900',
    DEFAULT: 'purple-500',
  },
  // Secondary colors - Pink/Magenta
  secondary: {
    50: 'pink-50',
    100: 'pink-100',
    200: 'pink-200',
    300: 'pink-300',
    400: 'pink-400',
    500: 'pink-500',
    600: 'pink-600',
    700: 'pink-700',
    800: 'pink-800',
    900: 'pink-900',
    DEFAULT: 'pink-500',
  },
  // Semantic colors
  success: {
    light: 'green-400',
    DEFAULT: 'green-500',
    dark: 'green-600',
  },
  warning: {
    light: 'amber-400',
    DEFAULT: 'amber-500',
    dark: 'amber-600',
  },
  error: {
    light: 'red-400',
    DEFAULT: 'red-500',
    dark: 'red-600',
  },
  info: {
    light: 'blue-400',
    DEFAULT: 'blue-500',
    dark: 'blue-600',
  },
  // Neutral/Surface colors (dark theme)
  surface: {
    background: 'zinc-950',
    card: 'zinc-900',
    elevated: 'zinc-800',
    border: 'zinc-700',
    hover: 'zinc-800',
  },
  // Text colors
  text: {
    primary: 'white',
    secondary: 'zinc-400',
    muted: 'zinc-500',
    disabled: 'zinc-600',
  },
} as const;

/**
 * Spacing scale in pixels
 * Maps to Tailwind spacing utilities
 */
export const spacing = {
  0: '0',
  1: '4px',   // p-1, m-1
  2: '8px',   // p-2, m-2
  3: '12px',  // p-3, m-3
  4: '16px',  // p-4, m-4
  6: '24px',  // p-6, m-6
  8: '32px',  // p-8, m-8
  12: '48px', // p-12, m-12
  16: '64px', // p-16, m-16
} as const;

/**
 * Typography scale
 * Maps to Tailwind text utilities
 */
export const typography = {
  size: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
    '3xl': 'text-3xl',  // 30px
    '4xl': 'text-4xl',  // 36px
  },
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  },
  leading: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  },
} as const;

/**
 * Border radius scale
 */
export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  DEFAULT: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const;

/**
 * Shadow scale
 */
export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  DEFAULT: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  // Custom glow shadows
  glow: {
    purple: 'shadow-lg shadow-purple-500/25',
    pink: 'shadow-lg shadow-pink-500/25',
    white: 'shadow-lg shadow-white/10',
  },
} as const;

/**
 * Transition configurations for Framer Motion
 */
export const transitions = {
  fast: { duration: 0.15 },
  normal: { duration: 0.2 },
  slow: { duration: 0.3 },
  spring: { type: 'spring', stiffness: 500, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 10 },
  easeOut: { duration: 0.2, ease: 'easeOut' },
  easeInOut: { duration: 0.3, ease: 'easeInOut' },
} as const;

/**
 * Common animation variants for Framer Motion
 */
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  scaleSpring: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
} as const;

/**
 * Z-index scale for layering
 */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Touch target minimum sizes for accessibility
 */
export const touchTargets = {
  minimum: '44px', // WCAG 2.1 minimum
  comfortable: '48px',
} as const;
