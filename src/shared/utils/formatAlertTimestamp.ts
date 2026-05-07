export function formatAlertTimestamp(iso: string, now: Date = new Date()): string {
  const date   = new Date(iso);
  const diffMs = now.getTime() - date.getTime();

  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays  = Math.floor(diffMs / 86_400_000);

  if (diffMins  < 60) return `${Math.max(diffMins, 1)}m ago`;
  if (diffHours <  4) return `${diffHours}h ago`;

  if (date.toDateString() === now.toDateString()) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
