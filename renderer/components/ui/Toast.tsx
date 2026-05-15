import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-cyan-500',
};

const toastIcons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export default function Toast({ id, message, type, duration = 3000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm
        transform transition-all duration-300
        ${toastStyles[type]}
        ${isExiting ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'}
      `}
      dir="rtl"
    >
      <span className="text-lg">{toastIcons[type]}</span>
      <span>{message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(id), 300);
        }}
        className="mr-2 text-white/70 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

// Toast Container Component
export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2" dir="rtl">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook for using toasts
export function useToast() {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = (message: string, type: ToastProps['type'] = 'info', duration?: number) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}