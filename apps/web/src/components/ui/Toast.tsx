import {
  type Toast as ToastType,
  ToastVariant,
  useToast,
} from '../../contexts/ToastContext';

const variantStyles: Record<ToastVariant, string> = {
  error:
    'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  info: 'bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-800/30 dark:text-brand-300 dark:border-brand-700',
  success:
    'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
};

const iconPaths: Record<ToastVariant, string> = {
  error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
};

function ToastItem({ id, message, variant }: ToastType) {
  const { dismiss } = useToast();

  return (
    <div
      className={`flex items-start gap-3 rounded border px-4 py-3 shadow-md ${variantStyles[variant]}`}
      role="alert"
    >
      <svg
        className="mt-0.5 size-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d={iconPaths[variant]}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <p className="flex-1 text-sm font-medium">{message}</p>

      <button
        aria-label="Dismiss notification"
        className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
        onClick={() => dismiss(id)}
      >
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            d="M6 18L18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
