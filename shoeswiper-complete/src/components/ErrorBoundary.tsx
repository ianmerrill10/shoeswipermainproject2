import React, { Component, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showHomeButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the whole application.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-zinc-950">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-zinc-400 text-center mb-6 max-w-sm">
            We encountered an unexpected error. Please try again.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <div className="mb-4 p-3 bg-zinc-900 rounded-lg max-w-md overflow-auto">
              <p className="text-red-400 text-xs font-mono break-all">
                {this.state.error.message}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 bg-orange-500 text-white font-bold py-3 px-6 rounded-xl active:scale-95 transition-transform"
            >
              <FaRedo className="text-sm" />
              Try Again
            </button>
            {this.props.showHomeButton && (
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 bg-zinc-800 text-white font-bold py-3 px-6 rounded-xl active:scale-95 transition-transform"
              >
                <FaHome className="text-sm" />
                Go Home
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
