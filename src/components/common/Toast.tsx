import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgStyles = {
          success: 'bg-emerald-950/95 border-emerald-700/80 text-emerald-200',
          warning: 'bg-amber-950/95 border-amber-700/80 text-amber-200',
          danger: 'bg-rose-950/95 border-rose-700/80 text-rose-200',
          info: 'bg-indigo-950/95 border-indigo-700/80 text-indigo-200'
        }[toast.type];

        const Icon = {
          success: CheckCircle2,
          warning: AlertTriangle,
          danger: AlertTriangle,
          info: Info
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-200 ${bgStyles}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-snug">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
