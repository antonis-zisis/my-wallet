import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toasts: Array<Toast>;
  dismiss: (id: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<Toast>>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = crypto.randomUUID();
      setToasts((previous) => [...previous, { id, message, variant }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  const showSuccess = useCallback(
    (message: string) => addToast(message, 'success'),
    [addToast]
  );

  const showError = useCallback(
    (message: string) => addToast(message, 'error'),
    [addToast]
  );

  const showInfo = useCallback(
    (message: string) => addToast(message, 'info'),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ dismiss, showError, showInfo, showSuccess, toasts }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
