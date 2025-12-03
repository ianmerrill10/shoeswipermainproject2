import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { animationVariants, transitions } from '../../lib/theme';

export type CardVariant = 'elevated' | 'flat' | 'bordered';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animated?: boolean;
  children: React.ReactNode;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-zinc-900 shadow-xl shadow-black/20',
  flat: 'bg-zinc-900',
  bordered: 'bg-zinc-900 border border-zinc-700',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-b border-zinc-800 ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-t border-zinc-800 ${className}`}>
    {children}
  </div>
);

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'none',
  animated = false,
  children,
  className = '',
  ...props
}) => {
  const Component = animated ? motion.div : 'div';
  const animationProps = animated
    ? {
        initial: animationVariants.scale.initial,
        animate: animationVariants.scale.animate,
        exit: animationVariants.scale.exit,
        transition: transitions.normal,
      }
    : {};

  return (
    <Component
      className={`
        rounded-xl overflow-hidden
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
};

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export default Card;
