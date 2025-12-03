import { useState, useCallback, useRef } from 'react';

interface ToastOptions {
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

interface ToastState {
  message: string | null;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
}

interface UseToastResult {
  toast: ToastState;
  showToast: (message: string, options?: ToastOptions) => void;
  hideToast: () => void;
}

const DEFAULT_DURATION = 2500;

/**
 * Custom hook for managing toast notifications.
 * Provides a simple API to show/hide toast messages with auto-dismiss.
 */
export const useToast = (): UseToastResult => {
  const [toast, setToast] = useState<ToastState>({
    message: null,
    type: 'info',
    isVisible: false,
  });
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
    // Clear message after animation
    setTimeout(() => {
      setToast(prev => ({ ...prev, message: null }));
    }, 300);
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const { duration = DEFAULT_DURATION, type = 'info' } = options;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Show the toast
    setToast({
      message,
      type,
      isVisible: true,
    });
    
    // Auto-dismiss after duration
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  }, [hideToast]);

  return {
    toast,
    showToast,
    hideToast,
  };
};

export default useToast;
