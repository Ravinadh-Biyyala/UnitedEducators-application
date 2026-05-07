import { Badge } from '@/components/common';
import { colors } from '@/theme';
import type { Priority } from '@/shared/types';

const COLOR_MAP: Record<Priority, string> = {
  Critical: colors.priority.critical,
  High: colors.priority.high,
  Medium: colors.priority.medium,
  Low: colors.priority.low,
};

interface Props {
  priority: Priority;
}

export function PriorityBadge({ priority }: Props) {
  return <Badge color={COLOR_MAP[priority]}>{priority}</Badge>;
}
