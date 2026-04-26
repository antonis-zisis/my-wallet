import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      error,
      id,
      label,
      options,
      placeholder,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className={
              required
                ? "text-text-secondary mb-1 block text-sm font-medium after:ml-0.5 after:text-red-500 after:content-['*']"
                : 'text-text-secondary mb-1 block text-sm font-medium'
            }
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={id}
          required={required}
          className={`focus:border-brand-500 focus:ring-brand-500 border-border-strong text-text-primary bg-bg-surface dark:bg-bg-muted w-full rounded border px-3 py-2 focus:ring-1 focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : ''
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
