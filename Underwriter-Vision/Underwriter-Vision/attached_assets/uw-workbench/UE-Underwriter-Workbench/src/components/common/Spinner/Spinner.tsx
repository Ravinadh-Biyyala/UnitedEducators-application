export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-brand"
      style={{ width: size, height: size }}
      role="status"
      aria-label="loading"
    />
  );
}
