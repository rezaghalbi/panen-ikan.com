'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  CheckCircle,
  WarningCircle,
  XCircle,
  Info,
  X,
} from '@phosphor-icons/react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  toastWarning: (msg: string) => void;
  toastInfo: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const toastSuccess = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const toastError = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const toastWarning = useCallback((msg: string) => addToast('warning', msg), [addToast]);
  const toastInfo = useCallback((msg: string) => addToast('info', msg), [addToast]);

  const styles: Record<ToastType, { bg: string; border: string; text: string; icon: ReactNode }> = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: <CheckCircle size={20} weight="fill" className="text-emerald-500 shrink-0" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle size={20} weight="fill" className="text-red-500 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <WarningCircle size={20} weight="fill" className="text-amber-500 shrink-0" />,
    },
    info: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-800',
      icon: <Info size={20} weight="fill" className="text-sky-500 shrink-0" />,
    },
  };

  return (
    <ToastContext.Provider value={{ toastSuccess, toastError, toastWarning, toastInfo }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const s = styles[toast.type];
          return (
            <div
              key={toast.id}
              className={`${s.bg} ${s.border} border rounded-2xl shadow-xl px-4 py-3.5 flex items-start gap-3 pointer-events-auto animate-in slide-in-from-right-5 fade-in duration-300`}
            >
              {s.icon}
              <p className={`flex-1 text-sm font-semibold ${s.text} leading-snug`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition shrink-0 mt-0.5"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
