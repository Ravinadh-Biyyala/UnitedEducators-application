interface SpinnerProps {
  size?: number;
  /** Accessible label announced to screen readers (default: "Loading"). */
  label?: string;
}

export function Spinner({ size = 20, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <span
        aria-hidden
        className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-brand"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
