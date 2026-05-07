import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color = '#6b7280', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {children}
    </span>
  );
}
