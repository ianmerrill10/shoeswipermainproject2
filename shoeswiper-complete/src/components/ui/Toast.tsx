import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { animationVariants, transitions, zIndex } from '../../lib/theme';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-500',
    icon: <FaCheckCircle className="text-green-400" size={20} />,
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-500',
    icon: <FaExclamationCircle className="text-red-400" size={20} />,
  },
  warning: {
    bg: 'bg-amber-900/90',
    border: 'border-amber-500',
    icon: <FaExclamationTriangle className="text-amber-400" size={20} />,
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-500',
    icon: <FaInfoCircle className="text-blue-400" size={20} />,
  },
};

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const style = variantStyles[toast.variant];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      layout
      initial={animationVariants.slideInRight.initial}
      animate={animationVariants.slideInRight.animate}
      exit={animationVariants.slideInRight.exit}
      transition={transitions.spring}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm
        shadow-lg min-w-[300px] max-w-[400px]
        ${style.bg} ${style.border}
      `}
      role="alert"
    >
      {style.icon}
      <p className="flex-1 text-white text-sm">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-zinc-400 hover:text-white transition-colors p-1"
        aria-label="Dismiss notification"
      >
        <FaTimes size={14} />
      </button>
    </motion.div>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, message, variant, duration };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Keep only the last maxToasts
        return updated.slice(-maxToasts);
      });
    },
    [maxToasts]
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, 'success', duration),
    [addToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => addToast(message, 'error', duration),
    [addToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, 'warning', duration),
    [addToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => addToast(message, 'info', duration),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <div
        className={`fixed ${positionStyles[position]} flex flex-col gap-2`}
        style={{ zIndex: zIndex.toast }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
