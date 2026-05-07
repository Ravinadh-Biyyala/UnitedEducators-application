import { CheckCircle2, ChevronRight } from 'lucide-react';
import { colors } from '@/theme/tokens';
import type { Task, TaskFilter } from '@/shared/types';
import { SegmentedTabs } from '@/components/common';
import { CardShell, CardFooter } from '@/components/domain/CardShell';
import { CountBadge } from '@/components/domain/CountBadge';
import { TaskRow } from '@/components/domain/TaskRow';

interface Props {
  tasks: Task[];
  totalCount: number;
  overdueCount: number;
  activeFilter: TaskFilter;
  onFilterChange: (f: TaskFilter) => void;
  onTaskClick?: (task: Task) => void;
  onViewAll?: () => void;
}

const CARD_WIDTH = 380;

export function OpenTasksPanel({
  tasks,
  totalCount,
  overdueCount,
  activeFilter,
  onFilterChange,
  onTaskClick,
  onViewAll,
}: Props) {
  return (
    <CardShell
      title="OPEN TASKS"
      width={CARD_WIDTH}
      icon={<CheckCircle2 size={13} style={{ color: colors.brandBlue }} aria-hidden />}
      headerRight={
        <SegmentedTabs<TaskFilter>
          size="sm"
          activeValue={activeFilter}
          onChange={onFilterChange}
          tabs={[
            { value: 'All',     label: 'All' },
            { value: 'Mine',    label: 'Mine' },
            {
              value: 'Overdue',
              label: 'Overdue',
              rightSlot: <CountBadge count={overdueCount} />,
            },
          ]}
        />
      }
      footer={
        <CardFooter
          left={`${totalCount} total tasks`}
          right={
            <button
              onClick={onViewAll}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        2,
                fontSize:   11,
                fontWeight: 600,
                color:      colors.brandBlueDeep,
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                padding:    0,
              }}
            >
              View all →
              <ChevronRight size={10} style={{ color: colors.brandBlueDeep }} aria-hidden />
            </button>
          }
        />
      }
    >
      {tasks.length === 0 ? (
        <div
          style={{
            padding:   20,
            fontSize:  11,
            fontWeight:400,
            color:     colors.textMuted,
            textAlign: 'center',
          }}
        >
          No tasks to show.
        </div>
      ) : (
        tasks.map((task) => (
          <TaskRow key={task.id} task={task} onClick={onTaskClick} />
        ))
      )}
    </CardShell>
  );
}
