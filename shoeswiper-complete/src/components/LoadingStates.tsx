import React, { memo } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Base skeleton loader component with pulse animation
 */
const Skeleton: React.FC<SkeletonProps> = memo(({
  className = '',
  width,
  height,
  rounded = 'md',
}) => {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded];

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-zinc-800 animate-pulse ${roundedClass} ${className}`}
      style={style}
    />
  );
});

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton loader for sneaker cards in grid view
 */
const SneakerCardSkeleton: React.FC = memo(() => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
    <Skeleton className="aspect-square w-full" rounded="none" />
    <div className="p-3 space-y-2">
      <Skeleton height={12} width="40%" />
      <Skeleton height={16} width="80%" />
      <div className="flex items-center justify-between mt-3">
        <Skeleton height={20} width="30%" />
        <Skeleton height={32} width={70} rounded="lg" />
      </div>
    </div>
  </div>
));

SneakerCardSkeleton.displayName = 'SneakerCardSkeleton';

/**
 * Skeleton grid for search results
 */
interface SneakerGridSkeletonProps {
  count?: number;
}

const SneakerGridSkeleton: React.FC<SneakerGridSkeletonProps> = memo(({ count = 6 }) => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: count }, (_, i) => (
      <SneakerCardSkeleton key={i} />
    ))}
  </div>
));

SneakerGridSkeleton.displayName = 'SneakerGridSkeleton';

/**
 * Full screen loading spinner
 */
interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeClasses} border-orange-500 border-t-transparent rounded-full animate-spin mb-4`}
      />
      {message && <p className="text-zinc-400 text-sm">{message}</p>}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Full page loading state
 */
interface FullPageLoaderProps {
  message?: string;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = memo(({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
    <LoadingSpinner message={message} size="md" />
  </div>
));

FullPageLoader.displayName = 'FullPageLoader';

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = memo(({
  icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && (
      <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
    {description && (
      <p className="text-zinc-400 mb-6 max-w-xs">{description}</p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl active:scale-95 transition-transform"
      >
        {action.label}
      </button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

export {
  Skeleton,
  SneakerCardSkeleton,
  SneakerGridSkeleton,
  LoadingSpinner,
  FullPageLoader,
  EmptyState,
};
