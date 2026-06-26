import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, ExternalLink, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  href?: string;
}

interface ToastApi {
  push: (t: { type: ToastType; message: string; href?: string }) => void;
}

const ToastContext = createContext<ToastApi>({ push: () => {} });
export const useToast = () => useContext(ToastContext);

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = (id: number) => setToasts((cur) => cur.filter((t) => t.id !== id));

  const push = useCallback((t: { type: ToastType; message: string; href?: string }) => {
    const id = ++seq;
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => remove(id), 6000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[340px] max-w-[calc(100vw-2rem)]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="glass-panel border border-border-subtle rounded-xl p-4 shadow-xl flex items-start gap-3"
            >
              <span className={t.type === 'success' ? 'text-secondary' : t.type === 'error' ? 'text-red-400' : 'text-primary'}>
                {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : t.type === 'error' ? <XCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-on-background text-sm leading-snug">{t.message}</p>
                {t.href && (
                  <a href={t.href} target="_blank" rel="noreferrer" className="text-[12px] text-secondary hover:text-on-surface flex items-center gap-1 mt-1">
                    View on explorer <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <button onClick={() => remove(t.id)} className="text-on-surface-variant hover:text-on-surface shrink-0">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
