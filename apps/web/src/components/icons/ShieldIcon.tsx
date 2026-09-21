import { SVGProps } from 'react';

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 1.8 3.6 5.4v5.4c0 5.1 3.6 9.8 8.4 11 4.8-1.2 8.4-5.9 8.4-11V5.4L12 1.8Zm-1.2 15-3.6-3.6 1.7-1.7 1.9 1.9 4.9-4.9 1.7 1.7-6.6 6.6Z" />
    </svg>
  );
}
