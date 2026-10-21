import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />,
          warning: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
          info: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />,
        };

        const borderMap = {
          success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
          error: 'border-rose-200 bg-rose-50/90 text-rose-900',
          warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
          info: 'border-blue-200 bg-blue-50/90 text-blue-900',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold">{toast.title}</h4>
              {toast.message && (
                <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
