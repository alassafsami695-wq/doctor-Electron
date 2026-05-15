import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const typeStyles = {
  danger: {
    icon: '🗑️',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmBtn: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    icon: '⚠️',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600',
  },
  info: {
    icon: 'ℹ️',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    confirmBtn: 'bg-cyan-500 hover:bg-cyan-600',
  },
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center text-3xl mx-auto mb-4`}>
            <span className={styles.iconColor}>{styles.icon}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-white rounded-xl font-medium transition-all ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for using confirm dialog
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'danger'
  ) => {
    setDialog({ isOpen: true, title, message, type, onConfirm });
  };

  const close = () => setDialog(null);

  const handleConfirm = () => {
    dialog?.onConfirm();
    close();
  };

  return {
    dialog,
    confirm,
    close,
    handleConfirm,
    ConfirmDialogComponent: dialog ? (
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={handleConfirm}
        onCancel={close}
      />
    ) : null,
  };
}

import { useState } from 'react';