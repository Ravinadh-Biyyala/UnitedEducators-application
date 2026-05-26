import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from '@/components/common/Spinner';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  /** When true, the button shows a spinner and is disabled. aria-busy is set so AT announces the busy state. */
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  leftIcon,
  loading = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  // min-h-11 = 44px (WCAG 2.5.5 touch target). focus-visible ring is brand-vivid.
  const base =
    'inline-flex items-center justify-center px-4 py-2 min-h-11 rounded-md text-sm font-medium transition-colors ring-custom ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: 'bg-brand text-white hover:bg-brand/90',
    secondary: 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50',
    ghost: 'text-brand hover:bg-brand/10',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700',
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${leftIcon || loading ? 'gap-2' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size={14} label="" /> : leftIcon}
      {children}
    </button>
  );
}
