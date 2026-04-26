import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, id, label, required, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className={
              required
                ? "mb-1 block text-sm font-medium text-gray-700 after:ml-0.5 after:text-red-500 after:content-['*'] dark:text-gray-300"
                : 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
            }
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          className={`focus:border-brand-500 focus:ring-brand-500 border-border-strong text-text-primary w-full rounded border bg-white px-3 py-2 placeholder-gray-400 focus:ring-1 focus:outline-none dark:bg-gray-700 dark:placeholder-gray-400 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
