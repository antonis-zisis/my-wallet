import { ButtonHTMLAttributes, forwardRef } from 'react';

import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-400 dark:disabled:bg-brand-700',
  secondary:
    'bg-bg-muted text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-600',
  success:
    'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300 dark:disabled:bg-green-800',
  danger:
    'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 dark:disabled:bg-red-800',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-muted',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      disabled,
      isLoading = false,
      size = 'md',
      variant = 'primary',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`relative cursor-pointer rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="invisible">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
