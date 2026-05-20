/**
 * Minimal `cn` — joins truthy class strings with a single space.
 * Falsy values (undefined, null, false, '') are skipped.
 *
 * Intentionally tiny: no clsx / tailwind-merge dependency. If we later
 * adopt shadcn or need conflict-resolving merge semantics, swap this
 * for `import { cn } from '@/lib/cn'` callers automatically.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
