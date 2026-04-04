import { HTMLAttributes } from 'react';

type PageLayoutProps = HTMLAttributes<HTMLDivElement>;

export function PageLayout({
  children,
  className = '',
  ...props
}: PageLayoutProps) {
  return (
    <div className="py-8">
      <div className={`mx-auto max-w-5xl px-4 ${className}`} {...props}>
        {children}
      </div>
    </div>
  );
}
