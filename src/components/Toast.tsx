import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start justify-between gap-3 p-3 rounded-lg bg-surface border border-border-glass-dark shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-start gap-2.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            )}
            {toast.type === 'warning' && (
              <AlertCircle className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">
                {toast.title}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                {toast.message}
              </span>
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-outline hover:text-on-surface p-0.5 rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
