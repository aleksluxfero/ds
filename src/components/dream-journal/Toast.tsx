import React from 'react';
import { CheckIcon, XIcon, SpinnerIcon } from './icons';

type ToastType = 'loading' | 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; }> = {
  loading: {
    bg: 'bg-gray-700/80',
    border: 'border-gray-500/50',
    icon: <SpinnerIcon className="w-5 h-5 animate-spin" />,
  },
  success: {
    bg: 'bg-green-600/80',
    border: 'border-green-400/50',
    icon: <CheckIcon className="w-5 h-5" />,
  },
  error: {
    bg: 'bg-red-600/80',
    border: 'border-red-400/50',
    icon: <XIcon className="w-5 h-5" />,
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, visible }) => {
  const styles = typeStyles[type];

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-4 py-3 min-w-[250px] max-w-sm
        text-white text-sm font-medium
        rounded-lg shadow-2xl border backdrop-blur-md
        transition-all duration-300 ease-out
        ${styles.bg} ${styles.border}
        ${visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
        }
      `}
      role="alert"
      aria-live="assertive"
    >
      {styles.icon}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
