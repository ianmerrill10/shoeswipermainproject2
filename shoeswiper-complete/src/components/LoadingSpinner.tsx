import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center" role="status" aria-busy="true" aria-live="polite">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
        <p className="text-zinc-400">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
