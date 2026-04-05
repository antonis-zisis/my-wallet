import { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded bg-white p-4 shadow-md dark:bg-gray-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
