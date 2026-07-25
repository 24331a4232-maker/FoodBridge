import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30',
  error: 'text-red-600 bg-red-50 dark:bg-red-900/30',
  info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
  warning: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="glass-card flex items-start gap-3 p-4 pr-3 shadow-2xl"
              >
                <div className={`shrink-0 rounded-xl p-1.5 ${colors[t.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 pt-0.5">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
