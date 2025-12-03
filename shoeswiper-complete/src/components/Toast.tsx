import React, { memo } from 'react';
import { FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';

interface ToastProps {
  message: string | null;
  isVisible: boolean;
  type?: 'success' | 'error' | 'info';
  position?: 'top' | 'bottom';
  className?: string;
}

/**
 * Reusable Toast notification component.
 * Works with the useToast hook for state management.
 */
const Toast: React.FC<ToastProps> = memo(({
  message,
  isVisible,
  type = 'info',
  position = 'bottom',
  className = '',
}) => {
  if (!message) return null;

  const positionClasses = position === 'top'
    ? 'top-8'
    : 'bottom-24';

  const typeConfig = {
    success: {
      icon: FaCheck,
      iconBg: 'bg-green-500',
      iconColor: 'text-white',
    },
    error: {
      icon: FaTimes,
      iconBg: 'bg-red-500',
      iconColor: 'text-white',
    },
    info: {
      icon: FaInfoCircle,
      iconBg: 'bg-blue-500',
      iconColor: 'text-white',
    },
  }[type];

  const Icon = typeConfig.icon;

  return (
    <div
      className={`fixed ${positionClasses} left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      } ${className}`}
    >
      <div className={`w-6 h-6 ${typeConfig.iconBg} rounded-full flex items-center justify-center`}>
        <Icon className={`text-xs ${typeConfig.iconColor}`} />
      </div>
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;
