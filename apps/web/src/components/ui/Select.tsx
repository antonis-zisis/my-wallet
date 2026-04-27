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
                ? "mb-1 block text-sm font-medium text-gray-700 after:ml-0.5 after:text-red-500 after:content-['*'] dark:text-gray-300"
                : 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
            }
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={id}
          required={required}
          className={`focus:border-brand-500 focus:ring-brand-500 w-full rounded border border-gray-300 bg-white px-3 py-2 focus:ring-1 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${
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
