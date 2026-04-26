import { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-bg-surface rounded p-4 shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
