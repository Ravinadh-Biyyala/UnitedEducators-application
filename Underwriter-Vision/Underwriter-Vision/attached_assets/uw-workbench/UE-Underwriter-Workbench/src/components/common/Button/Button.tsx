import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  leftIcon,
  className = '',
  children,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary: 'bg-brand text-white hover:bg-brand/90',
    secondary: 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50',
    ghost: 'text-brand hover:bg-brand/10',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${leftIcon ? 'gap-2' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {leftIcon}
      {children}
    </button>
  );
}
